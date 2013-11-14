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
  'backbone',
  'backbone/collections/stage',
  'app/dispatch'
], function(_, Backbone, StageCollection, dispatch) {
  var conductorModel = Backbone.Model.extend({
    defaults: {
      isPlaying: false,
      setIntervalArray: new Array(),
      maxDuration: null
    },
    initialize: function(){
      this.stage = StageCollection;
    },
    play: function(){
      // console.log('in the conductor model play');
      this.set('isPlaying', true);
      this.calculateMaxDuration();
      dispatch.trigger('conductor.event', this.maxDuration);
    },
    stop: function() {
      // console.log('in the conductor model stop');
      this.set('isPlaying', false);
      dispatch.trigger('conductor.event');
      // This stops the animations 
      dispatch.trigger('toggleAnimation.event', 'off');
    },
    addInterval: function(setInterval, hTrackLabel){
      console.warn(hTrackLabel);
      this.get('setIntervalArray').push(setInterval);
    },
    clearAllIntervals: function() {
      console.warn('Clearing All Intervals in the Conductor');
      _.each(this.get('setIntervalArray'), function(intervalID, index){
        clearInterval(intervalID);
        intervalID = null;
        this.get('setIntervalArray').splice(index, 1);
      }, this);
    },
    calculateMaxDuration: function() {
      var maxDuration = 0;

      _.each(this.stage.models, function(hTrack) {
          var tempo = hTrack.get('tempo');
          var measures = hTrack.get('measures');
          var beats = hTrack.get('signature');
          var currentInstrumentDuration = measures.length*beats/tempo*60.0*1000.0 ;
          if (currentInstrumentDuration > maxDuration) {
            maxDuration = currentInstrumentDuration;
          }
      }, this);
      this.maxDuration = maxDuration;
    }
  });
  
  return new conductorModel();
});