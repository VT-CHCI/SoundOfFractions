//filename: unsavedSong.js  //BB version of an unsaved song 'template'
define([
  'underscore',
  'backbone',
  'backbone/collections/stage'
], function(_, Backbone, StageCollection) {
  var UnsavedSongModel = Backbone.Model.extend({
    // paramRoot: 'song',
    defaults: {
      // title: '',                        //move to unsavedSongTemplate.js
      stage: StageCollection,   //move to unsavedSongTemplate.js
      // TODO : add current representation
      currentFractionRepresentation: '',
      currentMeasureRepresentation: '',
      tempo: ''
    },
    initialize: function(){
    }
  });
  
  return UnsavedSongModel;
});