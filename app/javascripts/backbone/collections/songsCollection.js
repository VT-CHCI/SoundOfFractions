//This is a collection of song s
define([
  'underscore',
  'bbone',
  'backbone/models/song'
], function(_, Backbone, song){
  return Backbone.Collection.extend({
    model: song,
    url: '/songs',
    initialize: function(){
    }
  });
});
