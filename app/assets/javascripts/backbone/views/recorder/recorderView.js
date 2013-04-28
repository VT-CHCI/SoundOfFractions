// Filename: views/transport/transportView.js
/*
    This is the TransportView.
    It is in charge of the Transport or play/stop button.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'text!backbone/templates/recorder/recorder.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, recorderTemplate, dispatch, log){

  var RecorderView = Backbone.View.extend({
    el : $('#record'), // Specifies the DOM element which this view handles

    //registering our toggle() method for backbone click events.
    events : {
      "click" : "triggerRecord"
    },

    initialize: function() {

    },

    triggerRecord: function() {
      dispatch.trigger('recordClicked.event');
    },

    render: function() {
      console.warn("RECORD RENDERED");
      //console.log(recorderTemplate);
      $(this.el).html(recorderTemplate);

      return this;
    }
  });
  return new RecorderView();
});