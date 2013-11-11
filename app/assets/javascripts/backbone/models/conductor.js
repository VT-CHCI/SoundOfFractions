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
  'app/dispatch'
], function(_, Backbone, dispatch) {
  var TransportModel = Backbone.Model.extend({
    defaults: {
      isPlaying: false,
      img:'play.png' 
    },
    initialize: function(){
    },
    play: function(){
      console.log('in the conductor model play');
      this.set('isPlaying', true);
      dispatch.trigger('conductor.event');
    },
    stop: function() {
      console.log('in the conductor model stop');
      this.set('isPlaying', false);
      dispatch.trigger('conductor.event');
    }
  });
  
  return TransportModel;
});