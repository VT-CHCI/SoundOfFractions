//filename: song.js
define([
  'underscore',
  'backbone',
  'backbone/collections/components'
], function(_, Backbone, componentCollection) {
  var songModel = Backbone.Model.extend({
    paramRoot: 'song',
    defaults: {
      title: '',
      content: '',
      user: '',
      components: componentCollection
    },
    initialize: function(){
    }
  });
  
  return songModel;
});