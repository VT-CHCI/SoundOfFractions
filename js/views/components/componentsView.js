// Filename: views/beatBars/beatBarsView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beats',
  'collections/measures',
  'collections/components',
  'views/measures/measuresView',
  'text!templates/components/components.html',
  'app/dispatch'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, componentsCollection, MeasuresView, componentsTemplate, dispatch){
  var componentsView = Backbone.View.extend({
    el: $('#drum-kit'),

    events : {
      'click img' : 'togglePlay'
    },

    initialize: function(){
      this.context = new webkitAudioContext();
      this.bufferList = new Array();
      this.masterGainNode = this.context.createGainNode();

      this.measure = new BeatsCollection;

      for (var i = 0; i < 8; i++) {
        this.measure.add();
      }

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection;

      this.drumkit = componentsCollection.add({
        label: 'snare',
        img: 'ofAsnare',
        mute: false,
        sample: 'samples/808_sd.ogg',
        tempo: 120,
        measures: this.component,
        active: true
      });

      this.measure = new BeatsCollection;

      for (var i = 0; i < 8; i++) {
        this.measure.add();
      } 

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection.add({
        label: 'highHat',
        img: 'ofAhighHat',
        mute: true,
        sample: 'samples/808_chh.ogg',
        tempo: 120,
        measures: this.component,
        active: true
      });

      this.measure = new BeatsCollection;

      for (var i = 0; i < 8; i++) {
        this.measure.add();
      }

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection.add({
        label: 'kickDrum',
        img: 'ofAkickDrum',
        mute: true,
        sample: 'samples/808_bd.ogg',
        tempo: 120,
        measures: this.component,
        active: false
      });
      
      //dispatch.on('signatureChange.event', this.reconfigure, this);

      this.intervalID = setInterval((function(self) {
        return function() {self.playLoop(); } } )(this),
      1175); //time is a function of measures and tempo [(4 * 60/tempo * measures) - beat] (so there is no lag between last beat and first)

      dispatch.on('beatClicked.event', this.recalculateFraction, this)
      dispatch.on('signatureChange.event', this.recalculateFraction, this)
    },

    render: function(){
      $(this.el).html('');

      var counter = 0;
      _.each(this.drumkit.models, function(component) {
        this.loadAudio(this.context, component.get('sample'), this.bufferList, counter );
        var compiledTemplate = _.template( componentsTemplate, {component: component} );
        $(this.el).append( compiledTemplate );

        new MeasuresView({collection:component.get('measures'), el:'#component'+component.cid});
        counter++;
      }, this);

      this.recalculateFraction();

      return this;
    },


    playLoop: function(){
      var tempo = 0;
      var numBeats = 0;
      var i = 0;

      var deadSpace = 0;

      var componentDurations = new Array();
      _.each(this.drumkit.models, function(component) {
        componentDurations[i] = new Array();
        tempo = component.get('tempo');

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
      //console.log('play sound', durations);
      var componentToPlay = 0;
      var startTime = this.context.currentTime; //this is important (check docs for explination)

      _.each(durations, function(duration) {
        _.each(duration, function(time) {
          play(this.context, this.bufferList[componentToPlay], startTime+time, this.masterGainNode);
        }, this);
        componentToPlay++;
      }, this);

      function play(context, buffer, time, gainNode) {
        //console.log(startTime);
        //console.log(this.audioSources);

        var source = context.createBufferSource();
        source.buffer = buffer;
        //source.connect(context.destination);
        source.connect(gainNode);
        gainNode.connect(context.destination);

        source.noteOn(time);
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

    recalculateFraction: function(val){
      var numerator = 0;
      var denominator = 0;

      _.each(this.drumkit.models, function(component) {
        _.each(component.get('measures').models, function(measure) {
          _.each(measure.get('beats').models, function(beat) {
            if(beat.get('selected')) {
              numerator++;
            }
          }, this);

          if (val) {
            denominator = val*2;
          } else {
            denominator = measure.get('beats').models.length;
          }
        }, this);

        $('#component'+component.cid).next().find('.numerator').text(numerator);
        $('#component'+component.cid).next().find('.denominator').text(denominator);

        numerator = 0;
      }, this);
    },

    togglePlay: function(){
      if (this.intervalID) {
        clearInterval(this.intervalID);
        this.intervalID = null;
        this.masterGainNode.gain.value = 0;
      } else {
        this.intervalID = setInterval((function(self) {
        return function() {self.playLoop(); } } )(this),
        2000);
        this.masterGainNode.gain.value = 1;
      }
    }
  });
  return new componentsView();
});
