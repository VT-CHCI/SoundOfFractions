//filename: song.js
define([
  'underscore',
  'bbone',
], function(_, Backbone) {
  var songModel = Backbone.Model.extend({
    paramRoot: 'song',
    defaults: {
      content: '',
      user: '',
      title: '',
      currentFractionRepresentation: '',
      currentMeasureRepresentation: ''
    },
    initialize: function(){
    }
  });
  
  return songModel;
});