//filename: song.js
define([
  'underscore',
  'backbone',
  'backbone/collections/components'
], function(_, Backbone, componentCollection) {
  var songModel = Backbone.Model.extend({
    paramRoot: 'song',
    defaults: {
      content: '',
      user: '',
      title: ''
      // components: componentCollection   //move to songTemplate.js
    },
    initialize: function(){
    }
  });
  
  return songModel;
});