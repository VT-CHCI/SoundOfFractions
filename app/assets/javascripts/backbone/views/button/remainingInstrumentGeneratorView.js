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
    el : $("#instrument-generator-holder"), // Specifies the DOM element which this view handles

    //registering backbone's click event to our addInstrument() method.
    events : {
      "click .btn" : "addInstrument"
    },

    //simply creates the model.
    initialize: function() {
      this.remainingInstrumentGeneratorModel = new RemainingInstrumentGeneratorModel;

      dispatch.on('instrumentChanged.event', this.render, this);
      dispatch.on('reRenderInstrumentGenerator.event', this.render, this);

      this.render();
    },

    /*
      This is called when a click event occurs.

      a log message is sent reflecting the representation change.
    */
    addInstrument: function(e) {
      // Instrument type
      var instrument = $(e.currentTarget)[0].id.slice(15);
      // Update the model that the instrument is not available
      this.remainingInstrumentGeneratorModel.removeInstrument(instrument);
      // Dispatch an event to add the new instrument in the sof-composition-area
      dispatch.trigger('instrumentAdded.event', instrument);
      this.render();

      log.sendLog([[2, "instrument added: "+instrument]]);
    },

    //no need to compile the template for this one.
    render: function() {

      var uI = this.remainingInstrumentGeneratorModel.get('unusedInstruments');
      console.log(uI.length);
      //compiling our template.
      var compiledTemplate = _.template( remainingInstrumentGeneratorTemplate, {reps: uI, len: uI.length} );
      $(this.el).html( compiledTemplate );

      // $(this.el).html(remainingInstrumentGeneratorTemplate);

      // JQuery-UI draggable
      $(this.el).draggable({ axis: "y", containment: "#middle-left-column" });

      return this;
    }
  });
  return new RemainingInstrumentGeneratorView();
});