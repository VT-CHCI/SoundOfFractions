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
  'text!backbone/templates/label/systemLabel.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, systemLabelTemplate, dispatch, log){

  var SystemLabelView = Backbone.View.extend({
    el : $("#system-label"), // Specifies the DOM element which this view handles

    // events : {
    //   "click .btn" : "cycle"
    // },

    //simply creates the model.
    initialize: function() {
    },

    render: function() {
      $(this.el).html(systemLabelTemplate);

      // JQuery-UI draggable
      $(this.el).draggable({ axis: "y",containment: "#right-column" });

      return this;
    }
  });
  return new SystemLabelView();
});