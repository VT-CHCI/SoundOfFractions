// Filename: views/beatBars/beatBarsView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beats',
  'collections/measures',
  'collections/components',
  'views/components/componentView',
  'text!templates/components/components.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, componentsCollection, ComponentView, componentsTemplate, dispatch, state){
  var componentsView = Backbone.View.extend({
    el: $('#drum-kit'),

    events : {

    },

    initialize: function(){
      this.context = new webkitAudioContext();
      this.bufferList = new Array();
      this.masterGainNode = this.context.createGainNode();

      ///////Create Gain Nodes      /////////////
      this.gainNodeList = new Array();

      for (var i = 0; i < 4; i++) {
        this.gainNodeList[i] = this.context.createGainNode();
      };
      //////////////////////////////////////////

      this.measure = new BeatsCollection;

      for (var i = 0; i < 4; i++) {
        this.measure.add();
      }

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection;

      this.drumkit = componentsCollection.add({
        label: 'Snare',
        img: 'img/snare.png',
        mute: false,
        sample: 'samples/808_sd.m4a',
        //sample: 'samples/square.wav',
        measures: this.component,
        active: true
      });

      this.measure = new BeatsCollection;

      for (var i = 0; i < 4; i++) {
        this.measure.add();
      }

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection.add({
        label: 'Hi Hat',
        img: 'img/hihat.png',
        mute: true,
        sample: 'samples/808_chh.m4a',
        measures: this.component,
        active: true
      });

      this.measure = new BeatsCollection;

      for (var i = 0; i < 4; i++) {
        this.measure.add();
      }

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection.add({
        label: 'Kick Drum',
        img: 'img/kick.png',
        mute: true,
        sample: 'samples/808_bd.m4a',
        measures: this.component,
        active: false
      });

      this.measure = new BeatsCollection;

      for (var i = 0; i < 4; i++) {
        this.measure.add();
      }

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection.add({
        label: 'Synth',
        img: 'img/synth.png',
        mute: true,
        sample: 'samples/ambass.mp3',
        measures: this.component,
        active: true
      });

      this.intervalID = null; //time is a function of measures and tempo (4 * 60/tempo * measures)

      dispatch.on('togglePlay.event', this.togglePlay, this);

    },

    render: function(){
      $(this.el).html('');

      var counter = 0;
      _.each(this.drumkit.models, function(component) {
        this.loadAudio(this.context, component.get('sample'), this.bufferList, counter );
        var compiledTemplate = _.template( componentsTemplate, {component: component} );
        $(this.el).append( compiledTemplate );

        new ComponentView({collection:component, el:'#component-container'+component.cid, gainNode:this.gainNodeList[counter]});
        counter++;
      }, this);


      return this;
    },


    playLoop: function(){
      var tempo = state.get('tempo');
      // console.log(tempo);
      var numBeats = 0;
      var i = 0;

      var deadSpace = 0;

      var componentDurations = new Array();
      _.each(this.drumkit.models, function(component) {
        componentDurations[i] = new Array();

        _.each(component.get('measures').models, function(measure) {
          numBeats = measure.get('beats').length;
          var beatDuration = 60 / tempo * 4 / numBeats;
          _.each(measure.get('beats').models, function(beat) {
            // console.log(beatDuration);

            if (beat.get('selected')) {
              componentDurations[i].push(deadSpace);
              deadSpace = deadSpace + beatDuration;
              //console.log(deadSpace);
            } else {
              deadSpace = deadSpace + beatDuration;
            }

          }, this);
        }, this);
        i++;
        deadSpace = 0;
      }, this);

      this.playSound(componentDurations);
    },

    playSound: function(durations){
      console.log('Playing sound!');
      var componentToPlay = 0;
      var startTime = this.context.currentTime; //this is important (check docs for explination)
      _.each(durations, function(duration) {
        _.each(duration, function(time) {
          play(this, this.context, this.drumkit.at(componentToPlay),
            this.bufferList[componentToPlay], startTime+time, this.masterGainNode, this.gainNodeList[componentToPlay]);
        }, this);
        componentToPlay++;
      }, this);

      function play(self, context, component, buffer, time, gainNode, specGainNode) {
        //console.log(startTime);
        //console.log(this.audioSources);
        source = context.createBufferSource();
        source.buffer = buffer;
        //source.connect(context.destination);
        // console.log(specGainNode.gain.value);
        source.connect(specGainNode);
        specGainNode.connect(gainNode);
        gainNode.connect(context.destination);
        specGainNode.gain.value = 1;
        console.log(component.get('signature'));
        var duration =  (4 * 60 / state.get('tempo')) / component.get('signature');
        console.log(duration);  
        source.noteOn(time);
        specGainNode.gain.linearRampToValueAtTime(0, time);
        specGainNode.gain.linearRampToValueAtTime(1, time + 0.005);
        specGainNode.gain.linearRampToValueAtTime(1, time + (duration - 0.005));
        specGainNode.gain.linearRampToValueAtTime(0, time + duration);
        source.noteOff(time + duration);
      }

    },

    loadAudio: function(context, url, bufferList, index){
      console.log("Loading...", url);
      // Load buffer asynchronously
      var request = new XMLHttpRequest();
      request.open("GET", url, true);
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

    

    togglePlay: function(val){
      // if (e.keyCode == 32) {
      // }
      var maxMeasures = 0;
      _.each(this.drumkit.models, function(component) {
        // console.log('maxMeasures = ' , component.get('measures').length);
        if(maxMeasures < component.get('measures').length) {
          maxMeasures = component.get('measures').length;
        }
      }, this);

      var duration = 4 * 60 / state.get('tempo') * maxMeasures * 1000;
      // console.log('duration: ', duration);
      if (this.intervalID) {
        console.log('togglePlay: off');
        dispatch.trigger('toggleAnimation.event', 'off');

        clearInterval(this.intervalID);
        this.intervalID = null;
        this.masterGainNode.gain.value = 0;
        // console.log(this.sources);
      } else {
        console.log('togglePlay: on');

        this.intervalID = setInterval((function(self) {
        return function() {self.playLoop(); } } )(this),
        duration);
        this.masterGainNode.gain.value = 1;
        
        dispatch.trigger('toggleAnimation.event', 'on', duration, state.get('signature'), maxMeasures);

      }
    }
  });
  return new componentsView();
});
