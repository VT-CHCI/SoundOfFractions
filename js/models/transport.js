//filename: models/transport.js
/*
  This is the transport model.
  This represents the play/stop button
  in the bottom right of the main screen.
  This maintains a boolean field showing
  the state of the global playback.
*/
define([
  'underscore',
  'backbone',
], function(_, Backbone) {
  var TransportModel = Backbone.Model.extend({
    defaults: {
      isPlaying: false,
      img:'./img/play.png' 
    },
    initialize: function(){

      
    },
  });
  
  return TransportModel;
});