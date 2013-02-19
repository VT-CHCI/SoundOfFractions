define([
  'underscore',
  'backbone',
], function(_, Backbone) {
  var RepButtonModel = Backbone.Model.extend({
    defaults: {
      buttonState: 'fraction',
      text:'Representation' 
    },
    initialize: function(){

      
    },
  });
  
  return RepButtonModel;
});