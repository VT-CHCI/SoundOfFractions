// Filename: views/conductor/conductorView.js
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
      // dispatch.on('togglePlay.event', this.playToggled, this);
      this.listenTo(dispatch, 'togglePlay.event', this.playToggled);

    },

    triggerRecord: function() {
      if($(this.el).hasClass('record')) {
        $(this.el).removeClass('record');
        $(this.el).addClass('recordPause');
        dispatch.trigger('recordClicked.event');
      }
      else {
        $(this.el).removeClass('recordPause');
        $(this.el).addClass('record');
        dispatch.trigger('stopRecording.event');
      }
      this.render();
    },

    playToggled: function(val) {
      if(val == 'off' && (!$(this.el).hasClass('record'))) {
        $(this.el).removeClass('recordPause');
        $(this.el).addClass('record');
        dispatch.trigger('stopRecording.event');
      }
    },

    render: function() {
      //console.log(recorderTemplate);

      $(this.el).html(recorderTemplate);
      return this;
    }
  });
  return new RecorderView();
});