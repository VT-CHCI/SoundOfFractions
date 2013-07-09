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

  return Backbone.View.extend({
    el : $("#instrument-generator-holder"), // Specifies the DOM element which this view handles

    //registering backbone's click event to our addInstrumentToCompositionArea() method.
    events : {
      "click .new-instrument-btn" : "addInstrumentToCompositionArea"
    },

    //simply creates the model.
    initialize: function(options) {
      console.log(options);
      if(options) {
        this.remainingInstrumentGeneratorModel = options.unusedInstrumentsModel;
      } else {
        // this.remainingInstrumentGeneratorModel = new RemainingInstrumentGeneratorModel;
      }

      dispatch.on('instrumentChanged.event', this.render, this);
      dispatch.on('reRenderInstrumentGenerator.event', this.render, this);

      this.render();
    },

    /*
      This is called when a click event occurs.

      a log message is sent reflecting the representation change.
    */
    addInstrumentToCompositionArea: function(e) {
      console.warn(e);
      console.log('in remainingInstrumentGeneratorView addInstrumentToCompositionArea()');
      // Instrument type   'sn'|'hh'|'kd'
      var instrument = $(e.currentTarget)[0].id.slice(15);
      // update model
      dispatch.trigger('removeInstrumentFromGeneratorModel.event', instrument);
      // update the dropdown menus in each htrack
      dispatch.trigger('reRenderInstrumentDropDown.event', instrument);
      //add the instrument to the Composition-Area and re-render
      dispatch.trigger('instrumentAddedToCompositionArea.event', instrument);
      // this.render();

      log.sendLog([[2, "instrument added: "+instrument]]);
    },

    //no need to compile the template for this one.
    render: function() {
      var uI = this.remainingInstrumentGeneratorModel.get('unusedInstruments');

      //compiling our template.
      var compiledTemplate = _.template( remainingInstrumentGeneratorTemplate, {reps: uI, len: uI.length} );
      $(this.el).html( compiledTemplate );

      // $(this.el).html(remainingInstrumentGeneratorTemplate);

      // JQuery-UI draggable
      $(this.el).draggable({ axis: "y", containment: "#middle-left-column" });

      return this;
    }
  });
  // return new RemainingInstrumentGeneratorView();
});