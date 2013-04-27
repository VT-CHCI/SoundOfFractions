// Filename: views/slider/beatsPerMeasureSliderView.js
/*
  This is the beatSliderView

  this handles the operation of the beats per measure slider.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/slider',
  'text!backbone/templates/slider/bPMSlider.html',
  'app/dispatch',
  'app/state',
  'app/log'
], function($, _, Backbone, SliderModel, sliderTemplate, dispatch, state, log){
  var sliderModel = new SliderModel;

  var SliderView = Backbone.View.extend({
    el : $("#bpm-slider"), // Specifies the DOM element which this view handles

    //register backbone's change event to call our updateVal() function.
    events : {
      "change" : "updateVal"
    },

    initialize: function() {
      //register a handler for sliderChange events.
      dispatch.on('bPMSlider.event', this.setVal, this);
    },

    //this is called when the slider is changed
    //by the user.
    updateVal : function() {
      //get our current value.
      var val = $(this.el).find($("input")).val();
      //set the change in the model.
      sliderModel.set({slidervalue : val});
      $('#sig_val').text(val);
      //$('#sig_val').text(this.formatVal(val/4));

      //trigger an event that the beats per measure has changed.
      dispatch.trigger('signatureChange.event', val);

      //set the signature in the global state.
      state.set({signature : val});

      //sending a log to the logging system of the change.
      log.sendLog([[2, "signature changed to: "+val]]);
    },

    render: function(values) {
      $(this.el).html();
      var compiledTemplate = _.template(sliderTemplate, {name:values.name, signature: values.signature} );
      $(this.el).html(compiledTemplate);
      return this;
    },

    //This is called when a sliderChange event occurs.
    setVal: function(values) {
      console.warn(values);
      sliderModel.set({slidervalue : values.signature});
      $('#sig_val').text(values.signature);

      //state.set({signature : values.signature});
      $('#slider input').val(values.signature);
      this.render(values);
    },

    //This formats the label of the value to be displayed
    //as the label for the slider value.
    //We need different formatting for whole numbers and fractions.
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