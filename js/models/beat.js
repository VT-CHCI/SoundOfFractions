define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var beatModel = Backbone.Model.extend({
    defaults: {
      selected: false
    },
    initialize: function(){
    }
  });
  
  return beatModel;
});