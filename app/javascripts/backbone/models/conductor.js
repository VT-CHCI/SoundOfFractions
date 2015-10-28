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
  'backbone/collections/stage', //Singleton
  'logging'
], function(_, Backbone, StageCollection, Logging) {
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
      // Trigger all instruments to start

      var time = Date.now();
      this.set('startedPlayingTime', time);
      var songDuration = this.calculateMaxDuration();

      this.trigger('conductorStart', songDuration);
      Logging.logStorage('Started playing music and the song lasts ' + songDuration/1000 + ' seconds.');
    },
    stop: function() {
      console.log('in the conductor model stop');

      // Set the model to not playing
      this.set('isPlaying', false);
      // Trigger all instruments to stop
      this.trigger('conductorStop', 'Stop');

      var time = Date.now();
      this.set('endTime', time);
      this.set('previousPlayedElapsedTime', (this.get('endTime') - this.get('startedPlayingTime'))/1000 );
      var songDuration = this.calculateMaxDuration()/1000;
      Logging.logStorage('Stopped playing music.  Duration of playback in seconds: ' + this.get('previousPlayedElapsedTime') + ' and the song lasts ' + songDuration + ' seconds for a total playback number of ' + this.get('previousPlayedElapsedTime')/songDuration + ' times.');
    },
    calculateMaxDuration: function() {
      var maxDuration = 0;
      // For each instrument
      _.each(this.stage.models, function(hTrack) {
        // Get each measure, currently limited to 1
        _.each(hTrack.get('measures').models, function(measureModel) {
          // Check how long it plays against the current maximum
          var currentInstrumentDuration = measureModel.get('totalTimeMeasurePlaysInMilliseconds');
          if (currentInstrumentDuration > maxDuration) {
            maxDuration = currentInstrumentDuration;
          }
        });        

      }, this);
      // Set the max Duration on this model
      this.maxDuration = maxDuration;
      return this.maxDuration;
    }
  });
  
  // This is a Singleton
  return new conductorModel();
});
