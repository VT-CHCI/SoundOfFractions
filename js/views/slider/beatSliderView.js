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

    initialize: function() {
      dispatch.on('sliderChange.event', this.setVal, this);
    },

    updateVal : function() {
      var val = $(this.el).find($("input")).val();

      sliderModel.set({slidervalue : val});
      $('#sig_val').text(val);
      //$('#sig_val').text(this.formatVal(val/4));

      dispatch.trigger('signatureChange.event', val);
      state.set({signature : val});
    },

    render: function() {
      $(this.el).html(sliderTemplate);
      return this;
    },

    setVal: function(val) {
      sliderModel.set({slidervalue : val});
      $('#sig_val').text(val);
      //$('#sig_val').text(this.formatVal(val/4));

      state.set({signature : val});
      $('#slider input').val(val);
    },

    formatVal: function(decimal) {
      wholeNumber = Math.floor(decimal);

      decimal = (decimal - wholeNumber)/.25;

      if (decimal != 0) {
        fraction = ' ' + decimal.toString() + '/4';
      } else {
        fraction = '';
      }

      if (wholeNumber == 0)
        wholeNumber = '';

      return wholeNumber.toString() + fraction;
    }
  });
  return new SliderView();
});