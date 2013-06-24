// Filename: views/button/doallView.js
/*
  This is the DoallView button
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, dispatch, log){

  var DoallView = Backbone.View.extend({
    el : $('#doall'), // Specifies the DOM element which this view handles

    events : {
      'click' : 'buttonClicked'
    },

    //simply creates the model.
    initialize: function() {
      this.isDoing = false;
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
      console.log('Doall clicked');
      if(!this.isTapping) {
        dispatch.trigger('doall.event');
        this.isTapping = true;
      }
      else {
        dispatch.trigger('doall.event');
        this.isTapping = false;
      }
    },
  });
  return new DoallView();
});