// Filename: views/button/measureTransformationView.js
/*
  This is the MeasureTransformationView.
  This renders the buttons for measure transformations
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'backbone/models/repButton',
  'text!backbone/templates/button/measureTransformation.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, RepButtonModel, wholeMeasureRepresentationTemplate, dispatch, log){

  var MeasureTransformationView = Backbone.View.extend({
    el : $("#measure-transformation"), // Specifies the DOM element which this view handles

    //registering backbone's click event to our cycle() method.
    events : {
      "click .btn" : "cycle"
    },

    //simply creates the model.
    initialize: function() {
      this.repButtonModel = new RepButtonModel;

    },

    /*
      This is called when a click event occurs.

      It sets the state to the state the user selected.
      It then triggers a representationChange event.

      a log message is sent reflecting the representation change.
    */
    cycle: function(e) {
      //Grab the data-state from the clicked button
      var newState = $(e.currentTarget).data('state');
      this.repButtonModel.set('buttonState', newState);
      //trigger the Measure representation change
      // dispatch.trigger('measureRepresentation.event', newState);
      //trigger the Beat representation change
      // dispatch.trigger('beatRepresentation.event', newState);

      log.sendLog([[2, "representation changed to: "+newState]]);
    },

    //no need to compile the template for this one.
    render: function() {
      $(this.el).html(wholeMeasureRepresentationTemplate);

      // JQuery-UI draggable
      $(this.el).draggable();

      return this;
    }
  });
  return new MeasureTransformationView();
});