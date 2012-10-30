define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var state = Backbone.Model.extend({
    defaults: {
      signature: 4, 
    },
    initialize: function(){
    }
  });
  
  return new state;
});