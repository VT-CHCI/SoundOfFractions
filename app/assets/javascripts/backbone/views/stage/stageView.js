// Filename: views/stage/stageView.js
/*
  This is the StageView.
  This is the view that represents the entire drum kit.

  This is where the audio is initialized and played.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/beats',
  'backbone/collections/measures',
  'backbone/collections/representations',
  'backbone/collections/stage',
  'backbone/models/beat',
  'backbone/models/measure',
  'backbone/models/hTrack',
  'backbone/models/representation',
  'backbone/models/remainingInstrumentGenerator',
  'backbone/models/state',
  'backbone/views/button/remainingInstrumentGeneratorView',
  'backbone/views/hTrack/hTrackView',
  'text!backbone/templates/hTrack/hTrack.html',
  'app/dispatch'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, RepresentationsCollection, StageCollection, BeatModel, MeasureModel, HTrackModel, RepresentationModel, RemainingInstrumentGeneratorModel, StateModel, RemainingInstrumentGeneratorView, HTrackView, HTrackTemplate, dispatch){
  var StageView = Backbone.View.extend({
    el: $('#sof-composition-area'),

    initialize: function(){
      //this context variable gives us access to all of the
      //web audio api methods/objects.
      this.context = new webkitAudioContext();
      this.bufferList = new Array();

      // set the songs unused instruments
      this.unusedInstrumentsModel = RemainingInstrumentGeneratorModel;

      //this gainNode controls the volume of the entire audio output.
      //we use it to toggle play/stop.
      this.masterGainNode = this.context.createGainNode();

      this.stage = StageCollection;

      //this is creating the snare hTrack.

      // this creates 1 measure, and addes beats and the representations to itself
      this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
      //for each beat - also change signature below
      for (var i = 0; i < 6; i++) {
        this.manuallyCreatedMeasureBeatsCollection.add();
      }
      // add an audio rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel;
      this.manuallyCreatedRepresentationModel.set('representationType', 'bead');
      this.manuallyCreatedMeasureRepresentationCollection = new RepresentationsCollection;
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);

      this.manuallyCreatedMeasuresCollection = new MeasuresCollection;
      this.manuallyCreatedMeasuresCollection.add({
        beats: this.manuallyCreatedMeasureBeatsCollection, measureRepresentations: this.manuallyCreatedMeasureRepresentationCollection});

      this.stage = StageCollection.add({
        label: 'Snare',
        type: 'sn',
        img: 'snare.png',
        mute: false,
        sample: '808_sn.m4a',
        measures: this.manuallyCreatedMeasuresCollection,
        signature: this.manuallyCreatedMeasuresCollection.models[0].get('beats').length,
        active: true,
        tempo: 120 //bpm
      });

      //creating two arrays to hold our gain nodes.
      //the first is for sustained-note sounds,
      //the second is for the muting of individual 'hTrack's.
      this.gainNodeList = new Array();
      this.muteGainNodeList = new Array();

      //use our webaudio context to creat two gain nodes
      //for each hTrack.
      for (var i = 0; i < this.stage.models.length; i++) {
        this.gainNodeList[i] = this.context.createGainNode();
        this.muteGainNodeList[i] = this.context.createGainNode();
      };

      this.intervalID = null; //time is a function of measures and tempo (4 * 60/tempo * measures)

      //register the handler for togglePlay events.
      dispatch.on('togglePlay.event', this.togglePlay, this);
      dispatch.on('tempoChange.event', this.updateTempo, this);

      dispatch.on('instrumentAddedToCompositionArea.event', this.addInstrument, this);
      dispatch.on('instrumentDeletedFromCompositionArea.event', this.deleteInstrument, this);
      dispatch.on('newInstrumentTempoRecorded', this.addInstrument, this);
      StateModel.set('stage', this.stage);
    },

    build: function(song) {
      console.log('starting building...');
      console.log('song');
      console.warn(song);
      song.set('content', JSON.parse(song.get('content')));
      this.stage.reset();
      // console.log('song.get('content').stage');
      var stage = song.get('content').stage;
      console.log('var stage');
      console.warn(stage);
      for(var i = 0; i < stage.length; i++) {
        var hTrack = new HTrackModel();
        hTrack.set('label', stage[i].label);
        hTrack.set('type', stage[i].type);
        hTrack.set('img', stage[i].img);
        hTrack.set('mute', stage[i].mute);
        hTrack.set('sample', stage[i].sample);
        hTrack.set('active', stage[i].active);
        hTrack.set('signature', stage[i].signature);
        hTrack.set('representation', stage[i].representation);
        var mC = new MeasuresCollection();
        for(var j = 0; j < stage[i].measures.length; j++) {
          var measureObj = stage[i].measures[j];
          var measure = new MeasureModel();
          measure.set('label', measureObj.label);
          measure.set('numberOfBeats', measureObj.numberOfBeats);
          measure.set('divisions', measureObj.divisions);
          var bC = new BeatsCollection();
          for(var k = 0; k < measureObj.beats.length; k++) {
            var beatObj = measureObj.beats[k];
            var beat = new BeatModel();
            beat.set('selected', beatObj.selected);
            bC.add(beat);
          }
          measure.set('beats', bC);
          mC.add(measure);
        }
        hTrack.set('measures', mC);
        console.log(hTrack);
        this.stage.add(hTrack);
      }
      this.render();
      console.log('done building');
      return this.stage;
    },

    render: function(options){
      console.log(this.stage.models);
      if(options) {
        console.log('render: stageView.js with options');
        var counter = $('.hTrack').size();
//        dispatch.stopListening('addMeasureRepresentation.event');
        //loading the audio files into the bufferList.
        this.loadAudio(this.context, options.sample, this.bufferList, counter );

        //compiling our template.
        var compiledTemplate = _.template( HTrackTemplate, {hTrack: this.stage.models[this.stage.models.length-1], type: this.stage.models[this.stage.models.length-1].get('type')} );
        $(this.el).append( compiledTemplate );

        //create a hTrack view.
        var hTrackView = new HTrackView({
          hTrack: this.stage.models[this.stage.models.length-1],
          el: '#hTrack-'+this.stage.models[this.stage.models.length-1].cid, 
          gainNode: this.muteGainNodeList[counter],
          unusedInstrumentsModel: this.unusedInstrumentsModel,
          type: this.stage.models[this.stage.models.length-1].get('type')
        });
      } else {
        console.log('render: stageView.js');
        $(this.el).html('');

        var counter = 0;

        //we have to render each one of our `hTrack`s.
        _.each(this.stage.models, function(hTrack) {
//          dispatch.stopListening('addMeasureRepresentation.event');
          //loading the audio files into the bufferList.
          this.loadAudio(this.context, hTrack.get('sample'), this.bufferList, counter );

          //compiling our template.
          var compiledTemplate = _.template( HTrackTemplate, {hTrack: hTrack, type: hTrack.get('type')} );
          $(this.el).append( compiledTemplate );

          //create a hTrack view.
          var hTrackView = new HTrackView({
            hTrack: hTrack,
            el: '#hTrack-'+hTrack.cid, 
            gainNode: this.muteGainNodeList[counter],
            unusedInstrumentsModel: this.unusedInstrumentsModel,
            type: hTrack.get('type')
          });
          if(!hTrack.get('active')) {
            console.log('found a muted one');
            hTrackView.toggleMute();
          }
          counter++;
        }, this);

        // Render the RemainingInstrumentGeneratorView
        var instrumentSelectorView = RemainingInstrumentGeneratorView;

        return this;
      }
    },

    /*
      This function generates a 2d array
      of time durations that determine when the playback
      of each beat on each hTrack should occur.
    */
    playLoop: function(){
      var tempo = StateModel.get('tempo');
      var numBeats = 0;
      var i = 0;

      var deadSpace = 0;

      //create an array to hold arrays of durations.
      var hTrackDurations = new Array();

      //looping over each hTrack in the stage.
      _.each(this.stage.models, function(hTrack) {

        //create a duration array for this hTrack.
        hTrackDurations[i] = new Array();

        _.each(hTrack.get('measures').models, function(measure) {
          numBeats = measure.get('beats').length;
          //determining the duration for each beat.
          var beatDuration = 60 / tempo * StateModel.get('signature') / (numBeats);
          _.each(measure.get('beats').models, function(beat) {

            /* if we need to trigger a sound at this beat
              we push a duration onto the duration array.
              if not, increment our deadSpace variable,
              by the beat duration,
              which will make subsequent durations longer.
            */
            if (beat.get('selected')) {
              //deadspace is a beat that is not getting played
              hTrackDurations[i].push(deadSpace);
              deadSpace = deadSpace + beatDuration;

            } else {
              deadSpace = deadSpace + beatDuration;
            }

          }, this);
        }, this);
        i++;
        // Reset the deadspace for the next hTrack
        deadSpace = 0;
      }, this);
      //Lastly, we call playSound() with our completed
      //hTrackDurations 2d array.
      this.playSound(hTrackDurations);
    },

    /*
      This triggers the playback of sounds at the appropriate
      intervals for each hTrack.
    */
    playSound: function(durations){
      console.log('Playing sound!');
      var hTrackToPlayIterator = 0;
      var startTime = this.context.currentTime; //this is important (check docs for explanation)
      _.each(durations, function(duration) { // hTrack array
        _.each(duration, function(time) { // beats or deadspace start times
          //we call play on each hTrack, passing in a lot of information.
          //this is called for each 'duration' in the duration array,
          //which is every activated beat and its associated duration between
          //it and the next activated beat.
          play(
            this,
            this.context,
            this.stage.at(hTrackToPlayIterator),
            this.bufferList[hTrackToPlayIterator],
            startTime+time, //startTime is the current time you request to play + the beat start time
            this.masterGainNode,
            this.gainNodeList[hTrackToPlayIterator],
            this.muteGainNodeList[hTrackToPlayIterator],
            this.stage.models[[hTrackToPlayIterator]].get('tempo')
          );
        }, this);
        hTrackToPlayIterator++;
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
      function play(self, context, hTrack, buffer, time, gainNode, specGainNode, muteGainNode, hTrackTempo) {

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
        specGainNode.gain.value = 1;

        //calulating the duration of one beat.
        var duration =  (60 / hTrackTempo);

        //note on causes the playback to start.
        source.noteOn(time, 0, duration);
        console.error(time);
        //these calls are used to generate an envelope that
        //makes sustained instruments play for only the duration of one beat.
        //this reduces pops and clicks from the signal being abruptly
        //stopped and started.
        specGainNode.gain.linearRampToValueAtTime(0, time);
        specGainNode.gain.linearRampToValueAtTime(1, time + 0.005);
        specGainNode.gain.linearRampToValueAtTime(1, time + (duration - 0.005));
        specGainNode.gain.linearRampToValueAtTime(0, time + duration);

        //we call noteOff to stop the sound after the duration of one beat.
        source.noteOff(time + duration);
      }

    },

    /*
      This function loads the audio files for each hTrack
      and loads them into the buffer list.
    */
    loadAudio: function(context, url, bufferList, index){
      console.log("Loading...", url);
      // Load buffer asynchronously
      var request = new XMLHttpRequest();
      request.open("GET", App.assets.path(url), true);
      request.responseType = "arraybuffer";

      request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        context.decodeAudioData(
          request.response,
          function(buffer) {
            if (!buffer) {
              alert('error decoding file data: ' + url);
              return;
            }
            //place the decoded buffer into the bufferList
            bufferList[index] = buffer;
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


    /*
      This is triggered by togglePlay events.
    */
    togglePlay: function(val){

      //first we determine the number of the measures in
      //the hTrack with the most measures.
      var maxMeasures = 0;
      _.each(this.stage.models, function(hTrack) {
        if(maxMeasures < hTrack.get('measures').length) {
          maxMeasures = hTrack.get('measures').length;
        }
      }, this);

      //we use the maximum number of measures, and the global tempo
      //to determine the duration (in ms) of one loop of the sequencer.
      var duration = StateModel.get('signature') * 60 / StateModel.get('tempo') * maxMeasures * 1000;
      console.warn(duration);
      if (this.intervalID) {
        //if we are already playing, we stop and trigger the
        //animation to stop.
        console.log('togglePlay: off');
        dispatch.trigger('toggleAnimation.event', 'off');

        clearInterval(this.intervalID);
        this.intervalID = null;
        //we set the masterGainNode to zero, which mutes all output.
        this.masterGainNode.gain.value = 0;
      } else {
        //if we are not playing, we start the playback of audio
        //and trigger an event to start the animation.
        console.log('togglePlay: on');

        //we call playLoop() with our calculated duration to initialize
        //and play the audio.
        //this.playLoop();
        this.intervalID = setInterval((function(self) {
          return function() {
            self.playLoop(); 
          } 
        })(this),
        duration);
        //we set the masterGainNode to 1, turning on master output.
        this.masterGainNode.gain.value = 1;

        dispatch.trigger('toggleAnimation.event', 'on', duration, StateModel.get('signature'), maxMeasures);
      }
    },

    // addInstrumentWithPattern
    addInstrument: function(options) {
      if (options.beatPattern){
        //this is creating the new instrument htrack.

        // this creates 1 measure, and addes beats and the representations to itself
        this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
        //for each beat - also change signature below
        for (var i = 0; i < options.beatPattern.length; i++) {
          console.log(options.beatPattern[i])
          var beat = new BeatModel();
          if (options.beatPattern[i] == 'ON') {
            beat.set('selected', true);
          }
          this.manuallyCreatedMeasureBeatsCollection.add(beat);            
        }

      } else {
        //this is creating the new instrument htrack.

        // this creates 1 measure, and addes beats and the representations to itself
        this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
        //for each beat - also change signature below
        for (var i = 0; i < 6; i++) {
          this.manuallyCreatedMeasureBeatsCollection.add();
        }
      }
      // add an instrument rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel;
      this.manuallyCreatedRepresentationModel.set('representationType', 'audio');
      this.manuallyCreatedMeasureRepresentationCollection = new RepresentationsCollection;
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);

      // Make a htrack
      this.manuallyCreatedMeasuresCollection = new MeasuresCollection;
      this.manuallyCreatedMeasuresCollection.add({
        beats: this.manuallyCreatedMeasureBeatsCollection, measureRepresentations: this.manuallyCreatedMeasureRepresentationCollection});

      var newInstrumentToAdd = {
        label: this.unusedInstrumentsModel.getDefault(options.instrument, 'label'),
        type: this.unusedInstrumentsModel.getDefault(options.instrument, 'type'),
        img: this.unusedInstrumentsModel.getDefault(options.instrument, 'image'),
        mute: false,
        sample: this.unusedInstrumentsModel.getDefault(options.instrument, 'sample'),
        measures: this.manuallyCreatedMeasuresCollection,
        signature: this.manuallyCreatedMeasuresCollection.models[0].get('beats').length,
        active: true,
        tempo: options.bpm //bpm
      };

      this.stage = StageCollection.add(newInstrumentToAdd);

      // Add the gain nodes for the music for the new instrument
      this.gainNodeList[this.stage.models.length-1] = this.context.createGainNode();
      this.muteGainNodeList[this.stage.models.length-1] = this.context.createGainNode();

      this.render(newInstrumentToAdd);
    },

    deleteInstrument: function(instrument) {
      console.warn('in StageView deleteInstrument');
      console.log('deleting : ' + instrument.instrument);
      console.log('deleting : ' + instrument.model);
      dispatch.trigger('removeInstrumentToGeneratorModel.event', instrument.instrument);
      console.warn(this.stage);
      this.stage.remove(instrument.model);
      console.warn(this.stage);

      this.render();
    }
  });
  return new StageView();
});
