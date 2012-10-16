define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var beatBarModel = Backbone.Model.extend({
    defaults: {
      width: 1
    },
    initialize: function(){
    }
  });
  
  return beatBarModel;
});