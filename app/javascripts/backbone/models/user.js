//filename: models/user.js
/*
  This is the user model.
  It keeps track of the user's logged in status
*/
define([
  'underscore',
  'bbone',
  'js-cookie',
], function(_, Backbone, JQCookie) {
  var BeatModel = Backbone.Model.extend({
    defaults: {
      silly_name: undefined,
      loggedIn: false,
      songs: undefined
    },
    initialize: function(options){
      if(options){
        console.info('User model init options: ', + options);
        this.logIn(options.silly_name);
      }
    },
    getSongs: function() {
      var µthis = this;
      // JQ AJAX method to send the data to the approriate url with appropriate HTTP method
      var UID = localStorage.getItem('UID');
      var uname = JQCookie.get('silly_name');
      $.ajax({
        url: '/api/getSongs/',
        // method: get/post/etc...
        type: 'POST',
        data: {    
          // uname ie: specialorange
          uname: uname,
          uid: UID
          }
      })
        .done(function(data){
          console.log('Successful getting songs! Returned `data`: ', data);
          // Update the user model
          µthis.set('songs', data.songs);
        })
        .fail(function(data){
          console.error('!Failed getting songs! Returned `data`: ', data);
        })

    },
    setSongs: function(songs) {
      console.log('setting songs in the user model');
      this.set('songs', songs);
      console.log(this.get('songs'));
    },
    logIn: function(sillyname){
      console.info('user logged in');
      this.set('silly_name', sillyname);
      this.set('loggedIn', true);
      this.getSongs();
    },
    logOff: function(){
      this.set('loggedIn', false);
    }
  });
  return BeatModel;
});