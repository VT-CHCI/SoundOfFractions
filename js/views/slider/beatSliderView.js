// Filename: views/slider/beatSliderView
define([
  'jquery',
  'underscore',
  'backbone',
  'models/slider',
  'text!templates/slider/slider.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, SliderModel, sliderTemplate, dispatch, state){
  var sliderModel = new SliderModel;

  var SliderView = Backbone.View.extend({
    el : $("#beat-pallet #slider"), // Specifies the DOM element which this view handles

    events : {
      "change" : "updateVal"
    },

    updateVal : function() {
      var val = $(this.el).find($("input")).val();

      sliderModel.set({slidervalue : val});
      $('#sig_val').text(val);

      dispatch.trigger('signatureChange.event', val);
      state.set({signature : val});
    },

    render: function() {
      $(this.el).html(sliderTemplate);
      return this;
    }
  });
  return new SliderView();
});