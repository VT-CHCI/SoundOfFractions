//filename: unsavedSong.js  //BB version of an unsaved song 'template'
define([
  'underscore',
  'backbone',
  'backbone/collections/components'
], function(_, Backbone, componentCollection) {
  var unsavedSongModel = Backbone.Model.extend({
    // paramRoot: 'song',
    defaults: {
      // title: '',                        //move to unsavedSongTemplate.js
      components: componentCollection   //move to unsavedSongTemplate.js
      // TODO : add current representation
    },
    initialize: function(){
    }
  });
  
  return unsavedSongModel;
});