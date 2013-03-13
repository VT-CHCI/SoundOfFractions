// Filename: views/songs/index_view
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/songsCollection',
  'backbone/collections/components',
  'backbone/models/song',
  'text!backbone/templates/songs/index.html',
  'text!backbone/templates/tiny/navSave.html',
  'text!backbone/templates/tiny/navLoad.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, SongsCollection, Components, song, songsBodyTemplate, songNavSaveTemplate, songsNavLoadTemplate, dispatch, state){
  return Backbone.View.extend({
    navLoadEl: $('#nav-songs-load'),
    // navEl: $('#nav-songs-save'),
    showBodyEl: $('#show-song'),
    sofComposerEl: $('#sof-composer'),

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
      var compiledBodyTemplate = _.template ( songsBodyTemplate, this.collection.toJSON());

      // load the songs into the load button
      $(this.navLoadEl).html(compiledNavLoadTemplate);
      // remove the sof-composer 
      $(this.sofComposerEl).html('');
      // change the body to show the title
      $(this.showBodyEl).html(compiledBodyTemplate);

      console.log("Index View rendered");
      return this;
    },
  });
});


// SoundOfFractions.Views.Songs ||= {}

// class SoundOfFractions.Views.Songs.IndexView extends Backbone.View
//   template: JST["backbone/templates/songs/index"]

//   initialize: () ->
//     @options.songs.bind('reset', @addAll)

//   addAll: () =>
//     @options.songs.each(@addOne)

//   addOne: (song) =>
//     view = new SoundOfFractions.Views.Songs.SongView({model : song})
//     @$("tbody").append(view.render().el)

//   render: =>
//     $(@el).html(@template(songs: @options.songs.toJSON() ))
//     @addAll()

//     return this
