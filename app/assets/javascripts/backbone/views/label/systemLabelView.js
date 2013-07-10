// Filename: views/label/systemLabelView.js
/*
  This is the SystemLabelView.
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'text!backbone/templates/label/systemLabel.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, SystemLabelTemplate, dispatch, log){

  var SystemLabelView = Backbone.View.extend({
    //simply creates the model.
    initialize: function(options) {
      if(options){
        this.label = options.label;
        this.clazz = options.clazz;
        this.id = options.id;
        this.el = $('#system-label-'+options.id);
      }
      this.parentEl = $('#system-label-group');
      this.render();
    },

    render: function() {
      var params = {
        label : this.label,
        clazz : this.clazz,
        id : this.id
      }
      var compiledTemplate = _.template( SystemLabelTemplate, params );
      $(this.parentEl).append( compiledTemplate );

      // JQuery-UI draggable
      $('.system-label').draggable();

      return this;
    }
  });
  return SystemLabelView;
});