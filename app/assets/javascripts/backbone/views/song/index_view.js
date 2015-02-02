// Filename: views/songs/index_view
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/songsCollection',
  'backbone/collections/stage',
  'backbone/models/song',
  'text!backbone/templates/song/index.html',
  'text!backbone/templates/tiny/navSave.html',
  'text!backbone/templates/tiny/navLoad.html',
  'text!backbone/templates/tiny/navNew.html',
  'backbone/models/state'
], function($, _, Backbone, SongsCollection, StageCollection, song, songsBodyTemplate, songNavSaveTemplate, songsNavLoadTemplate, songsNavNewTemplate, state){
  return Backbone.View.extend({
    navLoadEl: $('#nav-songs-load'),
    navNewEl: $('#nav-songs-new'),
    navUpdateEl: $('#nav-songs-update'),
    navInfoEl: $('#nav-songs-info'),
    navSaveEl: $('#nav-songs-save'),
    showBodyEl: $('#show-song'),
    sofCompositionAreaEl: $('#sof-stage-area'),

    initialize: function(options){
      console.log("Index View initializing...");
      this.model = options;

      this.render();
      console.log("Index View initialized");
    },

    // events: { 
    // },

    render: function(){
      console.log("Index View Rendering...");
      $(this.showBodyEl).html('');

      // var compiledNavTemplate = _.template ( songNavSaveTemplate, this.collection.toJSON());
      var compiledNavLoadTemplate = _.template ( songsNavLoadTemplate, this.collection.toJSON());
      var compiledNavNewTemplate = _.template ( songsNavNewTemplate, this.collection.toJSON());
      var compiledBodyTemplate = _.template ( songsBodyTemplate, this.collection.toJSON());

      // load the songs into the load button
      $(this.navLoadEl).html(compiledNavLoadTemplate);
      //show the new song button
      $(this.navNewEl).html(compiledNavNewTemplate);
      //clear the song info
      $(this.navInfoEl).html('');
      //clear the save song input and button
      $(this.navSaveEl).html('');
      //Clear the update button
      $(this.navUpdateEl).html('');
      // remove the sof-stage-area 
      $(this.sofCompositionAreaEl).html('');
      // change the body to show the title
      $(this.showBodyEl).html(compiledBodyTemplate);

      console.log("Index View rendered");
      return this;
    },
  });
});