//filename: unsavedSong.js
define([
  'underscore',
  'backbone',
  'backbone/collections/components'
], function(_, Backbone, componentCollection) {
  var unsavedSongModel = Backbone.Model.extend({
    // paramRoot: 'song',
    defaults: {
      title: '',                        //move to unsavedSongTemplate.js
      components: componentCollection   //move to unsavedSongTemplate.js
    },
    initialize: function(){
    }
  });
  
  return unsavedSongModel;
});