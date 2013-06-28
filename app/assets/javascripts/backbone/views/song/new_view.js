// Filename: views/songs/new_view
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/songsCollection',
  'backbone/collections/components',
  'text!backbone/templates/tiny/navSave.html',
  'backbone/models/unsavedSong',
  'app/dispatch',
  'backbone/models/state'
], function($, _, Backbone, SongsCollection, Components, songsNewTemplate, unsavedSong, dispatch, state){
  return Backbone.View.extend({
    //WORKING
    el: $('#nav-songs-save'),
    // Want to change to
    // navEl: $('#nav-songs-info'),
    
    navLoadEl: $('#nav-songs-load'),
    navNewEl: $('#nav-songs-new'),
    bodyInfoEl: $('#show-song'),
    sofCompositionAreaEl: $('#sof-composition-area'),
    navUpdateEl: $('#nav-songs-update'),

    initialize: function(options){
      console.log("New View initializing...");
      console.warn(window.router);
      
      // console.log(this.collection);
      this.model = new unsavedSong();
      console.warn(this.model);

      this.model.bind("change:errors", function(){
        console.log("In change error func() for new view");
        return this.render()
      });

      // TODO
      // dispatch.on('signatureChange.event', this.reconfigure, this);
      this.render();
    },

    events: { 
      "submit #new-song": "save"
    },

    save: function(e){
      e.preventDefault();
      e.stopPropagation();
      var toBeSavedSong = new window.router.songs.model(); 
      toBeSavedSong.set({
        // this.model is a song.js model which contains the following
        content : JSON.stringify(this.model.toJSON()), //this.model is an unsavedSong.js model
        title : $('#title').val(),
        currentFractionRepresentation: $('#fraction-representation-buttons').children('.active').attr('data-state'),
        currentMeasureRepresentation: $('#measure-representation-buttons').children('.active').attr('data-state'),
        tempo: $('#tempo-slider input').val()
      });

      //To pass the variable safely in from BBone to Rails 3.2, you have to include the csrf param and token
      toBeSavedSong.set($("meta[name=csrf-param]").attr('content'), $("meta[name=csrf-token]").attr('content'));

      console.log('toBeSavedSong.toJSON() :');
      console.warn(toBeSavedSong.toJSON());
      
      return window.router.songs.create( toBeSavedSong.toJSON() , {
        success: function(song) {
          console.log('Song saved!');
          this.model = song;
          window.router.songs.add(song);
          
          return window.location.hash = "/" + this.model.id;
        },
        error: function(song, jqXHR) {
          console.error('ERROR SAVING SONG!!!!    ERROR SAVING SONG!!!!    ERROR SAVING SONG!!!!    ERROR SAVING SONG!!!!');
          return this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
        }
      });
    },

    render: function(){
      console.log("New View rendering...");
      console.log($(this.el));
      $(this.sofCompositionAreaEl).html('');
      $(this.el).html('');
      console.log(this.model.toJSON());

      //Working
      var compiledTemplate = _.template ( songsNewTemplate, this.model.toJSON() );
      $(this.el).html(compiledTemplate);
      //Want to change to
      // var compiledNavTemplate = _.template ( songsNewTemplate, this.model.toJSON());
      // $(this.navEl).html(compiledNavTemplate);
      
      //Clear the nav Load button
      $(this.navLoadEl).html('');
      //Clear the body info section if it is there
      $(this.bodyInfoEl).html('');
      //Clear the newSong nav button
      $(this.navNewEl).html('');
      //Clear the update nav button
      $(this.navUpdateEl).html('');


      console.log("New View rendered");
      return this;
    },
  });
});
