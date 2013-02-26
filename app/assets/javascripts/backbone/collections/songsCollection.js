//This is a collection of song s
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/song'
], function($, _, Backbone, song){
  return Backbone.Collection.extend({
    model: song,
    url: '/songs',
    initialize: function(){

    }
  });

  // return new songsCollection();
});
