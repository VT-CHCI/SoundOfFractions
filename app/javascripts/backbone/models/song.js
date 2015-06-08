//filename: song.js
define([
  'underscore',
  'bbone',
], function(_, Backbone) {
  var songModel = Backbone.Model.extend({
    paramRoot: 'song',
    defaults: {
      content: '',
      user: '',
      title: ''
    },
    initialize: function(){
    }
  });
  
  return songModel;
});