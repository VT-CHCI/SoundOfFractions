define([
  'underscore',
  'backbone',
], function(_, Backbone) {
  var RepButtonModel = Backbone.Model.extend({
    defaults: {
      buttonState: 0,
      text:'Representation' 
    },
    initialize: function(){

      
    },
  });
  
  return RepButtonModel;
});