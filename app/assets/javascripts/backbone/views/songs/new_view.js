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
  'app/state'
], function($, _, Backbone, SongsCollection, Components, songsNewTemplate, unsavedSong, dispatch, state){
  return Backbone.View.extend({
    //WORKING
    el: $('#nav-songs-save'),
    // Want to change to
    // navEl: $('#nav-songs-info'),
    
    navLoadEl: $('#nav-songs-load'),
    navNewEl: $('#nav-songs-new'),
    bodyInfoEl: $('#show-song'),
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
      // this.calcBeatWidth(state.get('signature'));
    },

    events: { 
      "submit #new-song": "save"
    },

    save: function(e){
      e.preventDefault();
      e.stopPropagation();
      var toBeSavedSong = new window.router.songs.model(); 
      toBeSavedSong.set({
        // this.model is a unsavedSong.js model which contains 'title', and 'components'
        content : JSON.stringify(this.model.toJSON()),
        title : $('#title').val()
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
          console.log(window.router.songs.get(window.router.songs.length));
          
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
      $(this.el).html('');

      // console.log(this.collection);      
      // console.log(this.model);
      console.log(this.model.toJSON());

      //Working
      var compiledTemplate = _.template ( songsNewTemplate, this.model.toJSON());
      $(this.el).html(compiledTemplate);
      //Want to change to
      // var compiledTemplate = _.template ( songsNewTemplate, this.model.toJSON());
      // $(this.navEl).html(compiledTemplate);
      
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
