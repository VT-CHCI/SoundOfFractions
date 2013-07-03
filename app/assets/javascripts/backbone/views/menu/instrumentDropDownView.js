// Filename: views/button/instrumentDropDownView.js
/*
  This is the instrumentDropDownView.
  This renders the dropdown menu to change a line's instrument
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/remainingInstrumentGenerator',
  'text!backbone/templates/menu/instrumentDropDown.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, RemainingInstrumentGeneratorModel, instrumentDropDownTemplate, dispatch, log){
  return Backbone.View.extend({
    //registering backbone's click event to our remove() method.
    events : {
      "click .btn" : "remove"
    },

    //simply creates the model.
    initialize: function(options) {
      this.collection = options.collection;
      this.parent = options.parent;
      this.el = options.el; //'#instrument-selector-'+this.component.cid
      this.remainingInstrumentGeneratorModel = new RemainingInstrumentGeneratorModel;
      this.parentCID = options.parentCID;

      this.render();

      dispatch.on('instrumentAdded.event', this.updateRemove, this);

    },

    /*
      This is called when a click event occurs.

      a log message is sent reflecting the instrument change.
    */
    updateRemove: function(e) {

      // Update the model that the instrument is not available
      this.remainingInstrumentGeneratorModel.removeInstrument(e);
      this.render();
    },

    //no need to compile the template for this one.
    render: function() {

      //compiling our template.
      var compiledTemplate = _.template( instrumentDropDownTemplate, { 
        unusedInstruments: this.remainingInstrumentGeneratorModel.get('unusedInstruments'),
        cid: this.parentCID
      });
      $(this.el).html( compiledTemplate );

      // $(this.el).html(remainingInstrumentGeneratorTemplate);

      // JQuery-UI draggable
      $(this.el).draggable({ axis: "y", containment: "#middle-left-column" });

      return this;
    }
  });
});