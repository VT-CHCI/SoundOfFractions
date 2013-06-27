// Filename: views/button/wholeMeasureRepresentationView.js
/*
  This is the RepButtonView.
  This renders the four-state radio button
  that controls which representation is displayed
  on the side of each component.  
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'backbone/models/repButton',
  'text!backbone/templates/button/wholeMeasureRepresentation.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, RepButtonModel, wholeMeasureRepresentationTemplate, dispatch, log){

  var WholeMeasureRepresentationView = Backbone.View.extend({
    el : $("#measure-representation"), // Specifies the DOM element which this view handles

    //registering backbone's click event to our cycle() method.
    events : {
      "click .btn" : "cycle",
      "click .svg" : "cycle"
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
      var newState;
      if($(e.target).is('button')) {
        newState = $(e.target).data('state');
      } else {
        newState = $(e.target).closest('button').data('state'); 
      }
      console.log(newState);
      // var buttonNewState = $(button.target).data('state');
      // var svgNewState = 
      this.repButtonModel.set('buttonState', newState);
      //trigger the Measure representation change
      dispatch.trigger('measureRepresentation.event', newState);
      //trigger the Beat representation change
      dispatch.trigger('beatRepresentation.event', newState);

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
  return new WholeMeasureRepresentationView();
});