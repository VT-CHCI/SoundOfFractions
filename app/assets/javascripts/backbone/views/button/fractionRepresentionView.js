// Filename: views/button/fractionRepresentionView.js
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
  'text!backbone/templates/button/fractionRepresention.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, RepButtonModel, fractionRepresention, dispatch, log){

  var RepButtonView = Backbone.View.extend({
    el : $("#fraction-representation"), // Specifies the DOM element which this view handles

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
    cycle: function(button) {
      var newState = $(button.target).data('state');
      this.repButtonModel.set('buttonState', newState);
      dispatch.trigger('fractionRepresentation.event', newState);


      log.sendLog([[2, "representation changed to: "+newState]]);
    },

    //no need to compile the template for this one.
    render: function() {
      $(this.el).html(fractionRepresention);
      return this;
    }
  });
  return new RepButtonView();
});