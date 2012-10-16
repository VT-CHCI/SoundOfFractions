// Filename: views/slider/SliderView
define([
  'jquery',
  'underscore',
  'backbone',
  'models/slider',
  'text!templates/slider/slider.html',
  'app/dispatch'
], function($, _, Backbone, SliderModel, sliderTemplate, dispatch){
  var sliderModel = new SliderModel;

  var SliderView = Backbone.View.extend({
    el : $("#beat-pallet"), // Specifies the DOM element which this view handles

    events : {
      "change input" : "updateVal"  
    },

    updateVal : function() {
      var val = $(this.el).find($("input")).val();

      sliderModel.set({slidervalue : val});
      $('#sig_val').text(val);

      dispatch.trigger('app.event');
    }, 

    render: function() {
      $(this.el).append(sliderTemplate);
      return this;
    }
  });
  return new SliderView();
});