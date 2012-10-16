define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var SliderModel = Backbone.Model.extend({
    defaults: {
      val: 4
    },
    initialize: function(){
    }
  });
  
  return SliderModel;
});