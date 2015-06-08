//filename: models/user.js
/*
  This is the user model.
  It keeps track of the user's logged in status
*/
define([
  'underscore',
  'bbone'
], function(_, Backbone) {
  var BeatModel = Backbone.Model.extend({
    defaults: {
      silly_name: undefined,
      loggedIn: false,
      songs: undefined
    },
    initialize: function(options){
      if(options){
        console.info(options);
        this.set('silly_name', options.silly_name);
        this.set('songs', options.songs);
        this.logIn();
      }
    },
    setSongs: function(songs) {
      this.set('songs', songs);
    },
    logIn: function(){
      console.log('user logged in');
      this.set('loggedIn', true);
    },
    logOff: function(){
      this.set('loggedIn', false);
    }
  });
  return BeatModel;
});