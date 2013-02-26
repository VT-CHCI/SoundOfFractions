//This is a collection of song s
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/unsavedSong'
], function($, _, Backbone, unsavedSong){
  return Backbone.Collection.extend({
    model: unsavedSong,
    url: '/songs',
    initialize: function(){

    }
  });

  // return new songsCollection();
});
