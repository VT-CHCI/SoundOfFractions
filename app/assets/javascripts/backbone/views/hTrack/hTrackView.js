// Filename: views/hTrack/hTrackView.js
/*
  This is the view for one hTrack of the drum kit.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/hTrack',
  'backbone/models/state',
  'backbone/models/conductor',
  'backbone/models/remainingInstrumentGenerator',
  'backbone/collections/representations',
  'backbone/views/measure/measureView',
  'backbone/views/menu/instrumentDropDownView',
  'text!backbone/templates/hTrack/hTrack.html',
  'app/log'
], function($, _, Backbone, HTrackModel, StateModel, ConductorModel, RemainingInstrumentGeneratorModel, RepresentationsCollection, MeasureView,  InstrumentDropDownView, HTrackTemplate, log){
  return Backbone.View.extend({
    events : {
      // for toggling the hTrack's muted state.
      'click .control' : 'toggleMuteDisplay',
      // for setting this hTrack in focus (or selected).
      'click .addMeasureRep' : 'addRepresentationToHTrack',
      // when the delete instrument button is clicked, remove this hTrack
      'click .delete-instrument' : 'close',
      'change #instruemnt-selector' : 'instrumentChanged'
    },
    /*
      We are receiving options from stageView, where this view is
      being instantiated.
    */
    initialize: function(options){
      console.log('hTrackView init options: ', options);
      // Many variables get passed in.  We attach those variable with this function, so for each variable:
      // this.something = options.something; 
      // model: hTrack,
      // el: this.$('#instruments-collection'), 
      // masterAudioContext: this.masterAudioContext
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
      } else {
        console.error('hTrackView: shouldn\'t be in here!');
        // this.model = new HTrackModel;
      }

      // Per SO? http://stackoverflow.com/questions/9522845/backbone-js-remove-all-sub-views
      this.childViews = [];

      // allow the letter a to click the first plus sign
      _.bindAll(this, 'manuallPress');
      $(document).bind('keypress', this.manuallPress);

      // TODO Replace these events
      // dispatch.on('deleteAudioContext.event', this.deleteAudioContext, this);

      // dispatch.on('conductor.event', this.togglePlay, this);
      this.listenTo(ConductorModel, 'conductorStart', this.togglePlaying);
      this.listenTo(ConductorModel, 'conductorStop', this.togglePlaying);

      //creating two arrays to hold our gain nodes.
      // for sustained-note sounds,
      this.gainNode = new Array();
      // for the muting of individual 'hTrack's.
      this.muteGainNodeList = new Array();
      // this.context = new webkitAudioContext();
      // this.masterAudioContext = this.masterStageAudioContext;
      this.bufferList = new Array();
      this.masterGainNode = this.masterAudioContext.createGain();

      //use our webaudio context to create two gain nodes for the hTrack.
      this.gainNode = this.masterAudioContext.createGain();
      this.muteGainNodeList = this.masterAudioContext.createGain();
      if (options.type =='sn'){
        // Trying to reduce the snare instrument's volume
        console.log('adjusted the snare gain to .2');
        this.gainNode.gain.value = 1;
      }

      //time is a function of measures and tempo (4 * 60/tempo * measures)
      this.intervalID = null; 

      this.render();

      // Create an instrument selector

      var µthis = this;
      // for each of the measures (V1 should only have 1 Measure)
      _.each(this.model.get('measures').models, function(measure, index) {
        console.log('got the measures model');
        var childView = new MeasureView({
          parentHTrackModel: µthis.model,
          el: '#measure-container-'+µthis.model.cid,
          model: measure,
          collectionOfMeasures: µthis.model.get('measures'),
          measureRepresentations: measure.get('measureRepresentations'),
          measureModel: measure,
          hTrackView: µthis,
          defaultMeasureRepresentation: µthis.defaultMeasureRepresentation,
          measureIndex: index,
          measureCount: µthis.model.get('measures').models.length
        });
        µthis.childViews.push(childView);
      });
    },

    /*
      This View does not have its own html rendering, but instead creates
      a new MeasureView which gets rendered instead.
    */
    render: function(options){
      console.log('hTrackView render start');
      
      var compiledTemplate = _.template( HTrackTemplate, {model: this.model} );
      this.$el.append( compiledTemplate );

      // For a song from scratch
      if(!options) {
        console.log('hTrackView render from scratch');
      // If we are loading a song
      } else {
        var µthis = this;
        // for each of the measures (V1 should only have 1 Measure)
        _.each(this.model.get('measures').models, function(measure, index) {
          new MeasureView({
            collectionOfMeasures: µthis.model.get('measures'),
            parent: µthis.model,
            parentEl: '#hTrack-'+µthis.model.cid,
            model: µthis.model.get('measures').models[index],
            currentMeasureRepresentation: options.representation
          });
        });

      }

      // Bind the Webkit Audio stuff to where it needs to go
      this.loadAudio(this.model.get('sample'), this.bufferList );

      // If we want to drag it
      // $(this.el).draggable({ axis: "y", containment: "#middle-left-column" });
      
      return this;
    },
    togglePlaying: function(message){
      // PLaying
      if(message === "Stop"){
        this.stopPlaying();
      // Stopping
      } else {
        this.startPlaying(message);
      }
    },
    changeInstrument: function(e){
      console.log('selector changed: ', e);
      var oldInstrument = $(this.el).closest('.hTrack-container').data().state;
      var newInstrument = $(this.el).find(':selected').val();
      console.log('oI: '+ oldInstrument + ' | nI: '+ newInstrument);
    },

    /*
      This is called when the user clicks on the icon of this hTrack
      which has the css class 'control'
      
      This toggles the appearance of the [X] on the hTrack as well
      as the volume of the gainNode associated with this hTrack's muting state.

      gainNode volumes are stored in the value attribute and range from 0 to 1.

      This also sends a log message.
    */
    toggleMuteDisplay: function(){
      this.model.set('active', !this.model.get('active'));
      // it is NOT muted
      if (this.gainNode.gain.value == 1) {
        // Mute it
        this.gainNode.gain.value = 0;
        // Show it
        $(this.el).find('.control').removeClass('unmute').addClass('mute');
        $(this.el+ ' .control').html('<i class="icon-volume-off"></i>');
        // Log it
        log.sendLog([[2, "hTrack muted: "+"hTrack"+this.model.cid]]);
      // it is muted
      } else {
        // Unmute it
        this.gainNode.gain.value = 1;
        // Show it
        $(this.el).find('.control').removeClass('mute').addClass('unmute');
        $(this.el+ ' .control').html('<i class="icon-volume-up"></i>');
        // log it
        log.sendLog([[2, "hTrack unmuted: "+"hTrack"+this.model.cid]]);
      }
    },
    // To add a representation to a measure, we first add the class '.cs' to the htrack to know which measure of which HTrack to add it to
    addRepresentationToHTrack: function(e) {
      e.srcElement.parentElement.classList.add('cs');
      console.log('clicked the plus sign');
    },
    // Shortcuts a for 'add'
    manuallPress: function(e) {
      // a = 97
      if (e.keyCode == 97) {
        $('.icon-plus')[1].parentElement.classList.add('cs');
      } 
    },
    // When the conductor tells us to play
    startPlaying: function(maxDurationOfAllInstruments){
      console.log('hTrack startPlaying');
      var tempo = this.model.get('tempo');
      var measures = this.model.get('measures');
      var selectedBeats = 0;
      // Find out how many beats are selected
      _.each(measures.models, function(measure) {
          _.each(measure.get('beats').models, function(beat) {
            if (beat.get('selected')) {
              selectedBeats ++;
            }
          }, this);
      }, this);
      var beats = this.model.get('signature');
      // How long this instrument plays for
      var currentInstrumentDuration = measures.length*beats/tempo*60.0*1000.0 ;

      // we start the playback of audio
      //and trigger an event to start the animation.
      console.log(this.model.get('label'), ' music: on');
      console.warn('Tempo:', tempo, '|', 'Measures:', measures.length, '|', selectedBeats, 'beats selected of ', beats, '|', 'instrument duration:', currentInstrumentDuration);

      // Play the sound and the animation
      this.playSoundAndAnimation();
      
      //TODO Potentially put playLoop and playSoundAndAnimation up here until the setInterval starts
      // after each loop duration of maxDurationOfAllInstruments, play itself again
      this.intervalID = setInterval((function(self) {
      // ConductorModel.addInterval( setInterval((function(self) {
        return function() {
          self.playSoundAndAnimation();
        }
      })(this), maxDurationOfAllInstruments);
      // TODO We could potentially call set interval on the hTrack beat length, so that as a user clicks a yet to be played beat that is also unselected, it could be played instead of waiting for the next go around like it is currently

      //we set the masterGainNode to 1, turning on master output.
      this.masterGainNode.gain.value = 1;
    },
    // When the conductor tells us to stop
    stopPlaying: function(){
      console.log('hTrack stopPlaying');
      //we set the masterGainNode to zero, which mutes all remaining output.
      this.masterGainNode.gain.value = 0;
      //This stops the Audio interval from recurring
      clearInterval(this.intervalID);
      this.intervalID = null;
      // Trigger the animation to stop.
      this.trigger('toggleAnimation', 'Off');
    },

    playSoundAndAnimation: function(){
      this.playSoundLoop();
      this.trigger('toggleAnimation', 'On');
    },

    // WARNING!!!!
    // BELOW THIS INVOLVES THE SUNCHRONIZATION, TIMING, AND PLAYING OF AUDIO AND ANIMATIONS
    // CAREFUL!!!!

    /*
      This function generates an array
      of time durations that determine when the playback
      of each beat on this hTrack should occur.
    */
    playSoundLoop: function(){
      var deadSpace = 0;

      //create an array to hold durations.
      var beatTimes = new Array();

      _.each(this.model.get('measures').models, function(measure) {
        //determining the duration for each beat.
        var beatDuration = 60 / this.model.get('tempo');
        _.each(measure.get('beats').models, function(beat) {
          /* if we need to trigger a sound at this beat
            we push a duration onto the duration array.
            if not, increment our deadSpace variable,
            by the beat duration,
            which will make subsequent durations longer.
          */
          if (beat.get('selected')) {
            //deadspace is a beat that is not getting played
            beatTimes.push(deadSpace);
          }
          deadSpace += beatDuration;
        }, this);
      }, this);
      //Lastly, we call playSound() with our completed beatTimes array.
      this.playSound(beatTimes);
    },

    /*
      This triggers the playback of sounds at the appropriate
      intervals for each hTrack.
    */
    playSound: function(beatTimes){
      //this is important (check docs for explanation)
      var startTime = this.masterAudioContext.currentTime; 

      _.each(beatTimes, function(beatTime) { // beats or deadspace start times
        //we call play on each hTrack, passing in a lot of information.
        //which is every activated beat and its associated duration between
        //it and the next activated beat.

        //calulating the duration of one beat. Should be in s, not ms
        var hTrackTempo = this.model.get('tempo');
        var beatDuration =  (60 / hTrackTempo);

        play(
          this,
          this.masterAudioContext,
          this.bufferList,
          //startTime is time you clicked 'play' | beatTime is the elapsed time to from the startTime
          startTime+beatTime, 
          this.masterGainNode,
          this.gainNode,
          this.muteGainNodeList,
          hTrackTempo,
          beatDuration
        );
      }, this);


      /*
        This is where all the magic happens for the audio.

        Parameters are:
          self -> a reference to this StageView instance.
          context -> a reference to the webaudio context.
          buffer -> the buffer that has been loaded with the appropriate audio file.
          time -> the duration that this playback is to last.
          gainNode -> this is the masterGainNode of this StageView
          specGainNode -> this gain node controls envelope generation for sustained instruments.
          muteGainNode -> this gain node controls the muting of `hTrack`s.
      */

      function play(self, context, buffer, time, gainNode, specGainNode, muteGainNode, hTrackTempo, beatDuration) {
        //a buffer source is what can actually generate audio.
        source = context.createBufferSource();
        source.buffer = buffer;
        /* here we make a series of connections to set up the signal flow
           of the audio through each of the three gain nodes.
           the final result looks like:

           source->specGainNode->muteGainNode->masterGainNode->your ears
        */
        source.connect(specGainNode);
        specGainNode.connect(muteGainNode);
        muteGainNode.connect(gainNode);
        gainNode.connect(context.destination);
        // specGainNode.gain.value = 1;

        //start causes the playback to start.
        source.start(time, 0, beatDuration);

        //we call stop to stop the sound after the beatDuration of one beat.
        source.stop(time + beatDuration);
      }

    },
    // We can load the audio using the Webkit audio
    loadAudio: function(url, bufferList){
      var µthis = this;
      console.log("Loading...", url);
      // Load buffer asynchronously
      var request = new XMLHttpRequest();
      request.open("GET", App.assets.path(url), true);
      request.responseType = "arraybuffer";

      request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        µthis.masterAudioContext.decodeAudioData(
          request.response,
          function(buffer) {
            if (!buffer) {
              alert('error decoding file data: ' + url);
              return;
            }
            //place the decoded buffer into the bufferList
            µthis.bufferList = buffer;
          },
          function(error) {
            console.error('decodeAudioData error', error);
          }
        );
      }
      request.onerror = function() {
        alert('BufferLoader: XHR error');
      }
      request.send();
    },
    close: function(e) {
      // TODO Replace these events
      // dispatch.trigger('addInstrumentToGeneratorModel.event', instrument);
      // dispatch.trigger('instrumentDeletedFromCompositionArea.event', { instrument:instrument, model:this.parentCID });
      // dispatch.trigger('reRenderInstrumentGenerator.event', instrument);

      var instrument = $(e.currentTarget).closest('.hTrack').data().state;
      console.log(instrument);
      RemainingInstrumentGeneratorModel.addInstrument({type: instrument});
      console.log('in removeHTrack deleteInstrumentFromCompositionArea() of ' + instrument);

      // Maybe redundant
      this.model.destroy();
      this.remove();

      this.unbind();
      _.each(this.childViews, function(childView){
        console.log('in hTrackView close function, CLOSING CHILDREN');
        if (childView.close){
          childView.close();
        }
      })
    }
  });
});



// // Old

// // Filename: views/hTrack/hTrackView.js
// /*
//   This is the view for one hTrack of the drum kit.
// */
// define([
//   'jquery',
//   'underscore',
//   'backbone',
//   'backbone/models/hTrack',
//   'backbone/models/state',
//   'backbone/models/conductor',
//   'backbone/collections/representations',
//   'backbone/views/measure/measureView',
//   'backbone/views/menu/instrumentDropDownView',
//   'text!backbone/templates/hTrack/hTrack.html',
//   'app/log'
// ], function($, _, Backbone, HTrackModel, StateModel, ConductorModel, RepresentationsCollection, MeasureView,  InstrumentDropDownView, HTrackTemplate, log){
//   return Backbone.View.extend({
//     events : {
//       // for toggling the hTrack's muted state.
//       'click .control' : 'toggleMuteDisplay',
//       // for setting this hTrack in focus (or selected).
//       'click .addMeasureRep' : 'addRepresentationToHTrack',
//       // when the delete instrument button is clicked, remove this hTrack
//       'click .delete-instrument' : 'removeHTrack'
//     },

//     /*
//       We are receiving options from stageView, where this view is
//       being instantiated.
//         model: hTrack,
//         el: this.$('#instruments-collection'), 
//         masterAudioContext: this.masterAudioContext
//     */
//     initialize: function(options){
//       console.log('here it is:');
//       console.log(options);
//       // Many variables get passed in.  We attach those variable with this function, so for each variable:
//       // this.something = options.something; 
//       if (options) {
//         for (var key in options) {
//           this[key] = options[key];
//         }
//       } else {
//         this.hTrack = new HTrackModel;
//       }

//       // Per SO? http://stackoverflow.com/questions/9522845/backbone-js-remove-all-sub-views
//       this.childViews = [];

//       // allow the letter a to click the first plus sign
//       _.bindAll(this, 'manuallPress');
//       $(document).bind('keypress', this.manuallPress);

//       // TODO Replace these events
//       // dispatch.on('instrumentChanged.event', this.changeInstrument, this);
//       // dispatch.on('deleteAudioContext.event', this.deleteAudioContext, this);

//       // dispatch.on('conductor.event', this.togglePlay, this);
//       this.listenTo(ConductorModel, 'conductor.event', this.togglePlay);

//       //creating two arrays to hold our gain nodes.
//       // for sustained-note sounds,
//       this.gainNode = new Array();
//       // for the muting of individual 'hTrack's.
//       this.muteGainNodeList = new Array();
//       // this.context = new webkitAudioContext();
//       // this.masterAudioContext = this.masterStageAudioContext;
//       this.bufferList = new Array();

//       this.masterGainNode = this.masterAudioContext.createGain();

//       //use our webaudio context to create two gain nodes for the hTrack.
//       this.gainNode = this.masterAudioContext.createGain();
//       this.muteGainNodeList = this.masterAudioContext.createGain();
//       if (options.type =='sn'){
//         // Trying to reduce the snare instrument's volume
//         console.log('adjusted the snare gain to .2');
//         this.gainNode.gain.value = 1;
//       }

//       //time is a function of measures and tempo (4 * 60/tempo * measures)
//       this.intervalID = null; 

//       this.render();
//     },

//     /*
//       This View does not have its own html rendering, but instead creates
//       a new MeasureView which gets rendered instead.
//     */
//     render: function(options){
//       var compiledTemplate = _.template( HTrackTemplate, {hTrackModel: this.model} );
//       this.$el.append( compiledTemplate );

//       // For a song from scratch
//       if(!options) {
//         console.log('hTrackView render from scratch');
//         console.log(this);
//         console.log(this.model);
//         var µthis = this;
//         // for each of the measures (V1 should only have 1 Measure)
//         _.each(this.model.get('measures').models, function(measure, index) {
//           console.log('got the measures model');
//           var childView = new MeasureView({
//             collectionOfMeasures: µthis.model.get('measures'),
//             measureRepresentations: measure.get('measureRepresentations'),
//             parent: µthis.model,
//             parentEl: '#measure-container-'+µthis.model.cid,
//             hTrackEl: '#hTrack-'+µthis.model.cid,
//             model: µthis.model.get('measures').models[index],
//             measureModel: measure,
//             defaultMeasureRepresentation: µthis.defaultMeasureRepresentation,
//             measureIndex: index,
//             measureCount: µthis.model.get('measures').models.length
//           });
//           µthis.childViews.push(childView);
//         });

//         // Create an instrument selector
//         new InstrumentDropDownView({
//           unusedInstrumentsModel: this.unusedInstrumentsModel,
//           collection: this.model.get('measures'),
//           parent: this.model,
//           el: '#instrument-selector-'+this.model.cid,
//           parentCID: this.model.cid,
//           unusedInstrumentsModel: this.unusedInstrumentsModel
//         });
//       // If we are loading a song
//       } else {
//         var µthis = this;
//         // for each of the measures (V1 should only have 1 Measure)
//         _.each(this.model.get('measures').models, function(measure, index) {
//           new MeasureView({
//             collectionOfMeasures: µthis.model.get('measures'),
//             parent: µthis.model,
//             parentEl: '#hTrack-'+µthis.model.cid,
//             model: µthis.model.get('measures').models[index],
//             currentMeasureRepresentation: options.representation
//           });
//         });

//       }

//       // Bind the Webkit Audio stuff to where it needs to go
//       this.loadAudio(this.model.get('sample'), this.bufferList );

//       // If we want to drag it
//       // $(this.el).draggable({ axis: "y", containment: "#middle-left-column" });
      
//       return this;
//     },

//     /*
//       This is called when the user clicks on the icon of this hTrack
//       which has the css class 'control'
      
//       This toggles the appearance of the [X] on the hTrack as well
//       as the volume of the gainNode associated with this hTrack's muting state.

//       gainNode volumes are stored in the value attribute and range from 0 to 1.

//       This also sends a log message.
//     */
//     toggleMuteDisplay: function(){
//       this.hTrack.set('active', !this.hTrack.get('active'));
//       // it is NOT muted
//       if (this.gainNode.gain.value == 1) {
//         // Mute it
//         this.gainNode.gain.value = 0;
//         // Show it
//         $(this.el).find('.control').removeClass('unmute').addClass('mute');
//         $(this.el+ ' .control').html('<i class="icon-volume-off"></i>');
//         // Log it
//         log.sendLog([[2, "hTrack muted: "+"hTrack"+this.hTrack.cid]]);
//       // it is muted
//       } else {
//         // Unmute it
//         this.gainNode.gain.value = 1;
//         // Show it
//         $(this.el).find('.control').removeClass('mute').addClass('unmute');
//         $(this.el+ ' .control').html('<i class="icon-volume-up"></i>');
//         // log it
//         log.sendLog([[2, "hTrack unmuted: "+"hTrack"+this.hTrack.cid]]);
//       }
//     },
//     // To add a representation to a measure, we first add the class '.cs' to the htrack to know which measure of which HTrack to add it to
//     addRepresentationToHTrack: function(e) {
//       e.srcElement.parentElement.classList.add('cs');
//       console.log('clicked the plus sign');
//     },
//     // Shortcuts a for 'add'
//     manuallPress: function(e) {
//       // a = 97
//       if (e.keyCode == 97) {
//         $('.icon-plus')[1].parentElement.classList.add('cs');
//       } 
//     },
//     // When the conductor tells us to stop or play
//     togglePlay: function(maxDuration, cheese){

//       var tempo = this.hTrack.get('tempo');
//       var measures = this.hTrack.get('measures');
//       var selectedBeats = 0;

//       // We calculate the longest instrument time length, based on tempo and number of beats, and use this to calculate the loop parameter maxDuration
//       _.each(measures.models, function(measure) {
//           _.each(measure.get('beats').models, function(beat) {
//             if (beat.get('selected')) {
//               selectedBeats ++;
//             }
//           }, this);
//       }, this);
//       var beats = this.hTrack.get('signature');
//       var currentInstrumentDuration = measures.length*beats/tempo*60.0*1000.0 ;

//       //we use the maximum number of measures, and the global tempo
//       //to determine the duration (in ms) of one loop of the sequencer.
//       var duration = currentInstrumentDuration;

//       //if we are already playing
//       if (this.intervalID) {
//         // we stop and trigger the animation to stop.
//         console.log('togglePlay: off');
//         // Moved this to the conductor
//         // This stops the animations 
//         // dispatch.trigger('toggleAnimation.event', 'off');
//         //This stops the Audio
//         clearInterval(this.intervalID);
//         this.intervalID = null;

//         // ConductorModel.clearAllIntervals();
//         //we set the masterGainNode to zero, which mutes all output.
//         this.masterGainNode.gain.value = 0;
//       // if we are not playing
//       } else {
//         // we start the playback of audio
//         //and trigger an event to start the animation.
//         console.log('togglePlay: on');
//         console.warn('Tempo:', tempo, '|', 'Measures:', measures.length, '|', selectedBeats, 'beats selected of ', beats, '|', 'instrument duration:', currentInstrumentDuration);

//         // We call the beginAnimation for the playLoop && the dispatch trigger
//         this.beginAnimation();
// //TODO Potentially put playLoop and beginAnimation up here until the setInterval starts
//         // after each loop duration of maxDuration, play itself again
//         this.intervalID = setInterval((function(self) {
//         // ConductorModel.addInterval( setInterval((function(self) {
//           return function() {
//             // self.playLoop();
//             self.beginAnimation();
//           }
//         })(this), maxDuration);
//         // TODO We could potentially call set interval on the hTrack beat length, so that as a user clicks a yet to be played beat that is also unselected, it could be played instead of waiting for the next go around like it is currently

//         //we set the masterGainNode to 1, turning on master output.
//         this.masterGainNode.gain.value = 1;
//       }
//     },

//     beginAnimation: function(){
//       this.playLoop();

//       // TODO Replace these events
//       // dispatch.trigger('toggleAnimation.event', 'on');
//     },

//     // WARNING!!!!
//     // BELOW THIS INVOLVES THE SUNCHRONIZATION, TIMING, AND PLAYING OF AUDIO AND ANIMATIONS
//     // CAREFUL!!!!

//     /*
//       This function generates an array
//       of time durations that determine when the playback
//       of each beat on this hTrack should occur.
//     */
//     playLoop: function(){
//       var deadSpace = 0;

//       //create an array to hold durations.
//       var beatTimes = new Array();

//       _.each(this.hTrack.get('measures').models, function(measure) {
//         //determining the duration for each beat.
//         var beatDuration = 60 / this.hTrack.get('tempo');
//         _.each(measure.get('beats').models, function(beat) {
//           /* if we need to trigger a sound at this beat
//             we push a duration onto the duration array.
//             if not, increment our deadSpace variable,
//             by the beat duration,
//             which will make subsequent durations longer.
//           */
//           if (beat.get('selected')) {
//             //deadspace is a beat that is not getting played
//             beatTimes.push(deadSpace);
//           }
//           deadSpace += beatDuration;
//         }, this);
//       }, this);
//       //Lastly, we call playSound() with our completed beatTimes array.
//       this.playSound(beatTimes);
//     },

//     /*
//       This triggers the playback of sounds at the appropriate
//       intervals for each hTrack.
//     */
//     playSound: function(beatTimes){
//       // console.log('Playing sound!');

//       //this is important (check docs for explanation)
//       var startTime = this.masterAudioContext.currentTime; 

//       _.each(beatTimes, function(beatTime) { // beats or deadspace start times
//         //we call play on each hTrack, passing in a lot of information.
//         //which is every activated beat and its associated duration between
//         //it and the next activated beat.

//         //calulating the duration of one beat. Should be in s, not ms
//         var hTrackTempo = this.hTrack.get('tempo');
//         var beatDuration =  (60 / hTrackTempo);

//         play(
//           this,
//           this.masterAudioContext,
//           this.bufferList,
//           //startTime is time you clicked 'play' | beatTime is the elapsed time to from the startTime
//           startTime+beatTime, 
//           this.masterGainNode,
//           this.gainNode,
//           this.muteGainNodeList,
//           hTrackTempo,
//           beatDuration
//         );
//       }, this);


//       /*
//         This is where all the magic happens for the audio.

//         Parameters are:
//           self -> a reference to this StageView instance.
//           context -> a reference to the webaudio context.
//           buffer -> the buffer that has been loaded with the appropriate audio file.
//           time -> the duration that this playback is to last.
//           gainNode -> this is the masterGainNode of this StageView
//           specGainNode -> this gain node controls envelope generation for sustained instruments.
//           muteGainNode -> this gain node controls the muting of `hTrack`s.
//       */

//       function play(self, context, buffer, time, gainNode, specGainNode, muteGainNode, hTrackTempo, beatDuration) {
//         //a buffer source is what can actually generate audio.
//         source = context.createBufferSource();
//         source.buffer = buffer;
//         /* here we make a series of connections to set up the signal flow
//            of the audio through each of the three gain nodes.
//            the final result looks like:

//            source->specGainNode->muteGainNode->masterGainNode->your ears
//         */
//         source.connect(specGainNode);
//         specGainNode.connect(muteGainNode);
//         muteGainNode.connect(gainNode);
//         gainNode.connect(context.destination);
//         // specGainNode.gain.value = 1;

//         //start causes the playback to start.
//         source.start(time, 0, beatDuration);
//         // console.error(time, beatDuration, hTrackTempo);

//         //these calls are used to generate an envelope that
//         //makes sustained instruments play for only the beatDuration of one beat.
//         //this reduces pops and clicks from the signal being abruptly
//         //stopped and started.
//         // specGainNode.gain.linearRampToValueAtTime(0, time);
//         // specGainNode.gain.linearRampToValueAtTime(1, time + 0.005);
//         // specGainNode.gain.linearRampToValueAtTime(1, time + (beatDuration - 0.005));
//         // specGainNode.gain.linearRampToValueAtTime(0, time + beatDuration);

//         //we call stop to stop the sound after the beatDuration of one beat.
//         source.stop(time + beatDuration);
//       }

//     },
//     // We can load the audio using the Webkit audio
//     loadAudio: function(url, bufferList){
//       var µthis = this;
//       console.log("Loading...", url);
//       // Load buffer asynchronously
//       var request = new XMLHttpRequest();
//       request.open("GET", App.assets.path(url), true);
//       request.responseType = "arraybuffer";

//       request.onload = function() {
//         // Asynchronously decode the audio file data in request.response
//         µthis.masterAudioContext.decodeAudioData(
//           request.response,
//           function(buffer) {
//             if (!buffer) {
//               alert('error decoding file data: ' + url);
//               return;
//             }
//             //place the decoded buffer into the bufferList
//             µthis.bufferList = buffer;
//           },
//           function(error) {
//             console.error('decodeAudioData error', error);
//           }
//         );
//       }

//       request.onerror = function() {
//         alert('BufferLoader: XHR error');
//       }

//       request.send();
//     },
//     removeHTrack: function(e) {
//       var instrument = $(e.currentTarget).closest('.hTrack').data().state;
//       console.log('in removeHTrack deleteInstrumentFromCompositionArea() of ' + instrument);

//       // TODO Replace these events
//       // dispatch.trigger('addInstrumentToGeneratorModel.event', instrument);
//       // dispatch.trigger('instrumentDeletedFromCompositionArea.event', { instrument:instrument, model:this.parentCID });
//       // dispatch.trigger('reRenderInstrumentGenerator.event', instrument);
      
//       console.log("Removing hTrack" + this);
//       this.hTrack.destroy();
//       this.remove();
//       this.unbind();
//       // handle other unbinding needs, here
//       _.each(this.childViews, function(childView){
//         console.log('in hTrackView close function, CLOSING CHILDREN');
//         childView.remove();
//         if (childView.close){
//           childView.close();
//         }
//       })
//     }

//   });
// });