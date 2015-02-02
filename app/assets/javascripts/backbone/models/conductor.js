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





// // OLD
// //filename: models/conductor.js
// /*
//   This is the conductor model.
//   This represents the play/stop button
//   in the bottom right of the main screen.
//   This maintains a boolean field showing
//   the state of the global playback.
// */
// define([
//   'underscore',
//   'backbone',
//   'backbone/collections/stage',
//   'app/dispatch'
// ], function(_, Backbone, StageCollection, dispatch) {
//   var conductorModel = Backbone.Model.extend({
//     defaults: {
//       isPlaying: false,
//       setIntervalArray: new Array(),
//       maxDuration: null
//     },
//     initialize: function(){
//       this.stage = StageCollection;
//     },
//     play: function(){
//       // console.log('in the conductor model play');
//       this.set('isPlaying', true);
//       this.calculateMaxDuration();

//       // dispatch.trigger('conductor.event', this.maxDuration);
//       this.trigger('conductor.event', this.maxDuration, 'hello');
//     },
//     stop: function() {
//       console.log('in the conductor model stop');
//       this.set('isPlaying', false);

//       // dispatch.trigger('conductor.event');
//       this.trigger('conductor.event',['stop', this]);

//       // This stops the animations 
//       dispatch.trigger('toggleAnimation.event', 'off');
//     },
//     addInterval: function(setInterval, hTrackLabel){
//       console.warn(hTrackLabel);
//       this.get('setIntervalArray').push(setInterval);
//     },
//     clearAllIntervals: function() {
//       console.warn('Clearing All Intervals in the Conductor');
//       _.each(this.get('setIntervalArray'), function(intervalID, index){
//         clearInterval(intervalID);
//         intervalID = null;
//         this.get('setIntervalArray').splice(index, 1);
//       }, this);
//     },
//     calculateMaxDuration: function() {
//       var maxDuration = 0;

//       _.each(this.stage.models, function(hTrack) {
//           var tempo = hTrack.get('tempo');
//           var measures = hTrack.get('measures');
//           var beats = hTrack.get('signature');
//           var currentInstrumentDuration = measures.length*beats/tempo*60.0*1000.0 ;
//           if (currentInstrumentDuration > maxDuration) {
//             maxDuration = currentInstrumentDuration;
//           }
//       }, this);
//       this.maxDuration = maxDuration;
//     }
//   });
  
//   return new conductorModel();
// });