// Filename: views/slider/tempoSliderView.js
/*
  This is the TempoSliderView.

  It's responsible for handling the tempo slider.
*/
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

    //registering updateVal() as the handler for backbone change events.
    events : {
      "change" : "updateVal"
    },

    /*
      This is called when the user changes the value of the slider.
    */
    updateVal : function() {
      var val = $(this.el).find($("input")).val();

      sliderModel.set({slidervalue : val});

      //we're currently treating the tempo as a multiplier.
      //120 BPM is what we're considering 1. and the range
      //of possible values is from 60 to 240.
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

      //triggering an event to notify everyone of a tempo change.
      dispatch.trigger('tempoChange.event', val);

      //setting the tempo in the global state.
      state.set({tempo : val});

      //triggering a request to stop playback.
      //tempo changes during playback cause odd timings to happen.
      dispatch.trigger('stopRequest.event', 'off');

      //logging the change.
      log.sendLog([[2, "Changed temo slider: "+val]]);
    },

    render: function() {
      $(this.el).html(sliderTemplate);
      return this;
    }
  });
  return new TempoSliderView();
});