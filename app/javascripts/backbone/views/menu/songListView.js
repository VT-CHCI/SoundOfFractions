// Filename: views/menu/login.js
/*
    This is the Login View.
    It is in charge of the login/logout button.
*/
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/models/user',
  'js-cookie',
  'text!backbone/templates/menu/songList.html',
  'logging'
], function($, _, Backbone, User, JQCookie, songListTemplate, Logging){

  var SongListView = Backbone.View.extend({
    el : $('.song-list'), // Specifies the DOM element which this view handles

    events : {
    },
    initialize: function(options) {
      // Options should be the user model
      console.info('SongListView initing...')
      // this.render();
    },
    setModel: function(model) {
      this.model = model;
      this.listenTo(this.model, 'change:songs', this.render);
    },
    render: function() {
      console.log('SongListView render');
      $(this.el).html(songListTemplate);
    },
    close: function(){
      console.log('closing Login View');
      this.remove();
      this.unbind();
    }
  });
  // This is a not a Singleton
  // return SongListView;
  // This is a Singleton
  return new SongListView();
});