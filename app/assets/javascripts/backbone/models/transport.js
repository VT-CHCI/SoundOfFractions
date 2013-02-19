define([
  'underscore',
  'backbone',
], function(_, Backbone) {
  var TransportModel = Backbone.Model.extend({
    defaults: {
      isPlaying: false,
      img:'play.png' 
    },
    initialize: function(){

      
    },
  });
  
  return TransportModel;
});