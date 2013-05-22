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
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, dispatch, log){

  var TapTempoView = Backbone.View.extend({
    el : $("#tap-tempo"), // Specifies the DOM element which this view handles

    //registering backbone's click event to our cycle() method.
    events : {
      "click" : "buttonClicked"
    },

    //simply creates the model.
    initialize: function() {
      this.isTapping = false;
      console.log(this.el);
    },

    render: function() {
      return this;
    },

    /*
      This is called when a click event occurs.

      It sets the state to the state the user selected.
      It then triggers a representationChange event.

      a log message is sent reflecting the representation change.
    */
    buttonClicked: function(button) {
      console.log('clicked');
      if(!this.isTapping) {
        dispatch.trigger('tappingTempo.event');
        this.isTapping = true;
      }
      else {
        this.isTapping = false;
      }
    },
  });
  return new TapTempoView();
});