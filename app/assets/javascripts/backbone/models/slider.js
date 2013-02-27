//filename: models/slider.js
/*
  This is the model for a slider.
  Used in the tempo and beats per measure sliders.
*/
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