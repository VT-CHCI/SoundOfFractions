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
      'click img' : 'playSound'
    },

    initialize: function(){
      this.context = new webkitAudioContext();
      this.bufferList = new Array();

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

     return this;
    },

    playSound: function(){
      console.log('play sound');

      for (var i = 0; i < 100; i++) {
        var source1 = this.context.createBufferSource();
        source1.buffer = this.bufferList[1];

        source1.connect(this.context.destination);
        source1.noteOn(.0625*i);
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
    }

  });
  return new componentsView();
});
