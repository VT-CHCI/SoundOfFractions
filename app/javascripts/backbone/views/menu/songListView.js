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
    el : $('.login'), // Specifies the DOM element which this view handles

    events : {
    },
    initialize: function(options) {
      // Options should be the user model
      console.log('SongListView initing...')
      if (options){
        this.model = options;
      } else {
        console.error('no model in the init of SongListView');
      }
      // this.render();
    },
    render: function() {
      console.log('SongListView render');
      if(this.model.get('songs')){
        $(this.el).html(songListTemplate);
      }
    },
    close: function(){
      console.log('closing Login View');
      this.remove();
      this.unbind();
    }
  });
  // This is a Singleton
  return new SongListView();
});