// Filename: views/label/systemLabelView.js
/*
  This is the SystemLabelView.
*/  
define([
  'jquery',
  'underscore',
  'bbone',
  'text!backbone/templates/label/systemLabel.html'
], function($, _, Backbone, SystemLabelTemplate){

  var SystemLabelView = Backbone.View.extend({
    initialize: function(options) {
      if(options){
        this.label = options.label;
        this.clazz = options.clazz;
        this.identifier = options.identifier;
        this.el = $('#system-label-'+options.identifier);
      }
      this.parentEl = $('#system-label-group');
      this.render();
    },

    render: function() {
      var µthis = this;
      var params = {
        label : this.label,
        clazz : this.clazz,
        identifier : this.identifier
      }
      var compiledTemplate = _.template(SystemLabelTemplate);
      $(this.parentEl).append( compiledTemplate(params));

      // JQuery-UI draggable
      $('.stamp').draggable({
        revert: 'invalid',
        helper: 'clone'
      });

      return this;
    }
  });
  return SystemLabelView;
});
