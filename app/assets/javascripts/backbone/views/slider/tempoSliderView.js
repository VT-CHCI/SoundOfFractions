// Filename: views/slider/tempoSliderView.js
/*
  This is the TempoSliderView.

  It's responsible for handling the tempo slider.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/slider',
  'text!backbone/templates/slider/tempoSlider.html',
  'app/dispatch',
  'app/state',
  'app/log'
], function($, _, Backbone, SliderModel, sliderTemplate, dispatch, state, log){
  var sliderModel = new SliderModel;

  var TempoSliderView = Backbone.View.extend({
    el : $("#beat-palette #tempo-slider"), // Specifies the DOM element which this view handles

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
      var tempo = val * state.get('baseTempo');
      $('#tempo-val').text(val);

      //triggering an event to notify everyone of a tempo change.
      dispatch.trigger('tempoChange.event', tempo);

      //setting the tempo in the global state.
      state.set({tempo : tempo});

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