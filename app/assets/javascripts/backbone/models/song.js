//filename: song.js
define([
  'underscore',
  'backbone',
], function(_, Backbone) {
  var songModel = Backbone.Model.extend({
    paramRoot: 'song',
    defaults: {
      content: '',
      user: '',
      title: '',
      currentFractionRepresentation: '',
      currentMeasureRepresentation: '',
      tempo: ''
    },
    initialize: function(){
    }
  });
  
  return songModel;
});