// Filename: views/slider/beatSliderView
define([
  'jquery',
  'underscore',
  'backbone',
  'models/slider',
  'text!templates/slider/tempoSlider.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, SliderModel, sliderTemplate, dispatch, state){
  var sliderModel = new SliderModel;

  var TempoSliderView = Backbone.View.extend({
    el : $("#beat-pallet #tempo-slider"), // Specifies the DOM element which this view handles

    events : {
      "change" : "updateVal"  
    },

    updateVal : function() {
      var val = $(this.el).find($("input")).val();

      sliderModel.set({slidervalue : val});
      $('#tempo_val').text(val);

      dispatch.trigger('tempoChange.event', val);
      state.set({tempo : val});
    }, 

    render: function() {
      $(this.el).html(sliderTemplate);
      return this;
    }
  });
  return new TempoSliderView();
});