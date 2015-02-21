//filename: models/conductor.js
/*
  This is the conductor model.
  This represents the play/stop button
  in the bottom right of the main screen.
  This maintains a boolean field showing
  the state of the global playback.
*/
define([
  'underscore',
  'bbone',
  'backbone/collections/stage' //Singleton
], function(_, Backbone, StageCollection) {
  var conductorModel = Backbone.Model.extend({
    defaults: {
      isPlaying: false,
      setIntervalArray: new Array(),
      maxDuration: null,
      startedPlayingTime: null
    },
    initialize: function(){
      this.stage = StageCollection;
    },
    play: function(){
      console.log('in the conductor model play');
      // Set the model to playing
      this.set('isPlaying', true);
      // Calculate the longest instrument playing time
      this.calculateMaxDuration();
      // Trigger all instruments to start
      this.trigger('conductorStart', this.maxDuration);
      var time = Date.now();
      this.set('startedPlayingTime', time);
      // TODO SEND LOG playing, and include how long the song is (maxDuration)
    },
    stop: function() {
      console.log('in the conductor model stop');
      // Set the model to not playing
      this.set('isPlaying', false);
      // Trigger all instruments to stop
      this.trigger('conductorStop', 'Stop');
      // Calculate how long they played the song
      var totalTimePlayed = Date.now() - this.startedPlayingTime;
      // TODO SEND LOG stopped, how long they played, and how many times they played the full meaure (ie .8x or 3.2x)
    },
    calculateMaxDuration: function() {
      var maxDuration = 0;
      // For each instrument
      _.each(this.stage.models, function(hTrack) {
          // Get their Tempo
          var tempo = hTrack.get('tempo');
          // Get each measure, currently limited to 1
          // TODO Multiple Measures
          var measures = hTrack.get('measures');
          //  Get the signature - how many beats (denominator)
          var beats = hTrack.get('signature');
          // Determine the amount of time this instrument would play at its tempo with how many beats in the measure and how many measures
          var currentInstrumentDuration = measures.length*beats/tempo*60.0*1000.0 ;
          // Set it to maxDuration if it is longer than maxDuration
          if (currentInstrumentDuration > maxDuration) {
            maxDuration = currentInstrumentDuration;
          }
      }, this);
      // Set the max Duration on this model
      this.maxDuration = maxDuration;
    }
  });
  
  // This is a Singleton
  return new conductorModel();
});
