// Filename: views/button/systemLabelButtonView.js
/*
  This is the SystemLabelButtonView.
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'text!backbone/templates/button/systemLabel.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, SytemLabelTemplate, dispatch, log){

  var SytemLabelView = Backbone.View.extend({
    //simply creates the model.
    initialize: function(options) {
      this.label = options.label;
      this.classes = options.classes;
      this.id = options.id;
      this.el = $('#system-label-'+this.id);
    },

    render: function() {
      var params = {
        label : this.label,
        classes : this.classes,
        id : this.id
      }
      $(this.el).html(SytemLabelTemplate, params);

      // JQuery-UI draggable
      $(this.el).draggable();

      return this;
    }
  });
  return new SytemLabelView();
});