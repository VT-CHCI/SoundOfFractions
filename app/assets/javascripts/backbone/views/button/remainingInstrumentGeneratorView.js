// Filename: views/button/remainingInstrumentGeneratorView.js
/*
  This is the remainingInstrumentGeneratorView.
  This renders the buttons to select a new instrument to allow for a new line
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/remainingInstrumentGenerator',
  'text!backbone/templates/button/remainingInstrumentGenerator.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, RemainingInstrumentGeneratorModel, remainingInstrumentGeneratorTemplate, dispatch, log){

  var RemainingInstrumentGeneratorView = Backbone.View.extend({
    el : $("#remaining-instrument-generator"), // Specifies the DOM element which this view handles

    //registering backbone's click event to our cycle() method.
    // events : {
    //   "click .btn" : "cycle"
    // },

    //simply creates the model.
    initialize: function() {
      this.remainingInstrumentGeneratorModel = new RemainingInstrumentGeneratorModel;
      this.render();
    },

    /*
      This is called when a click event occurs.

      a log message is sent reflecting the representation change.
    */
    cycle: function(e) {
      // //Grab the data-state from the clicked button
      // var newState = $(e.currentTarget).data('state');
      // this.repButtonModel.set('buttonState', newState);
      // //trigger the Measure representation change
      // dispatch.trigger('measureRepresentation.event', newState);
      // //trigger the Beat representation change
      // dispatch.trigger('beatRepresentation.event', newState);

      log.sendLog([[2, "representation changed to: "+newState]]);
    },

    //no need to compile the template for this one.
    render: function() {
      $(this.el).html(remainingInstrumentGeneratorTemplate);

      // JQuery-UI draggable
      $(this.el).draggable({ axis: "y",containment: "#middle-left-column" });

      return this;
    }
  });
  return new RemainingInstrumentGeneratorView();
});