// Filename: views/slider/beatSliderView
define([
  'jquery',
  'underscore',
  'backbone',
  'models/slider',
  'text!templates/slider/tempoSlider.html',
  'app/dispatch',
  'app/state',
  'app/log'
], function($, _, Backbone, SliderModel, sliderTemplate, dispatch, state, log){
  var sliderModel = new SliderModel;

  var TempoSliderView = Backbone.View.extend({
    el : $("#beat-pallet #tempo-slider"), // Specifies the DOM element which this view handles

    events : {
      "change" : "updateVal"
    },

    updateVal : function() {
      var val = $(this.el).find($("input")).val();

      sliderModel.set({slidervalue : val});
      var asMultiplier = val / 120;
      if(asMultiplier == 1) {
        $('#tempo_val').text(asMultiplier);
      }
      else if(asMultiplier == 0.5) {
        $('#tempo_val').text('1/2');
      }
      else if(asMultiplier == 0.75) {
        $('#tempo_val').text('3/4');
      }
      else if(asMultiplier == 1.25) {
        $('#tempo_val').text('5/4');
      }
      else if(asMultiplier == 1.5) {
        $('#tempo_val').text('3/2');
      }
      else if(asMultiplier == 1.75) {
        $('#tempo_val').text('7/4');
      }
      else if(asMultiplier == 2) {
        $('#tempo_val').text(2);
      }

      dispatch.trigger('tempoChange.event', val);
      state.set({tempo : val});
      dispatch.trigger('stopRequest.event', 'off');

      log.sendLog([[2, "Changed temo slider: "+val]]);
    },

    render: function() {
      $(this.el).html(sliderTemplate);
      return this;
    }
  });
  return new TempoSliderView();
});