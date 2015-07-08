// Filename: views/label/systemLabelView.js
/*
  This is the SystemLabelView.
*/  
define([
  'jquery',
  'underscore',
  'bbone',
  'text!backbone/templates/label/systemLabel.html',
  'logging'
], function($, _, Backbone, SystemLabelTemplate, Logging){

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
        start: function( event, ui ) {
          // console.log('oX: ' + event.offsetX);
          // console.log('oY: ' + event.offsetY);
        },
        drag: function(event, ui){
          // console.log('ui.offset.top : ' + ui.offset.top);
          // console.log('ui.offset.left: ' + ui.offset.left);
        },
        stop: function(event, ui){
          // console.log('stopping');
          // console.log('ui.offset.top : ' + ui.offset.top);
          // console.log('ui.offset.left: ' + ui.offset.left);
        },
        revert: 'invalid',
        helper: 'clone'
      });

      return this;
    }
  });
  return SystemLabelView;
});
