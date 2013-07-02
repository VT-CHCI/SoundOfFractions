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
    },

    /*
      This is called when a click event occurs.

      a log message is sent reflecting the instrument change.
    */
    remove: function(e) {
      // Update the model that the instrument is not available
      this.remainingInstrumentGeneratorModel.removeInstrument($(e.currentTarget)[0].id.slice(15));



      // //Grab the data-state from the clicked button
      // var newState = $(e.currentTarget).data('state');
      // this.repButtonModel.set('buttonState', newState);
      // //trigger the Measure representation change
      // dispatch.trigger('measureRepresentation.event', newState);
      // //trigger the Beat representation change
      // dispatch.trigger('beatRepresentation.event', newState);

      // log.sendLog([[2, "representation changed to: "+newState]]);
    },

    //no need to compile the template for this one.
    render: function() {

      //compiling our template.
      var compiledTemplate = _.template( instrumentDropDownTemplate, { 
        unusedInstruments: this.remainingInstrumentGeneratorModel.get('unusedInstruments'),
        cid: this.parentCID
      } );
      $(this.el).html( compiledTemplate );

      // $(this.el).html(remainingInstrumentGeneratorTemplate);

      // JQuery-UI draggable
      $(this.el).draggable({ axis: "y", containment: "#middle-left-column" });

      return this;
    }
  });
});