// Filename: views/transport/transportView
define([
  'jquery',
  'underscore',
  'backbone',
  'models/transport',
  'text!templates/transport/transport.html',
  'app/dispatch',
], function($, _, Backbone, TransportModel, transportTemplate, dispatch){

  var TransportView = Backbone.View.extend({
    el : $("#transport"), // Specifies the DOM element which this view handles

    events : {
      "click" : "toggle"
    },

    initialize: function() {
      this.transportModel = new TransportModel;

      dispatch.on('stopRequest.event', this.stopPlay, this);
    },

    toggle: function() {
      if(!this.transportModel.get('isPlaying')) {
        dispatch.trigger('togglePlay.event', 'on');
        this.transportModel.set('isPlaying', true);
        $(this.el).removeClass();
        $(this.el).addClass('pause');
        console.log('now playing');
      }
      else {
        dispatch.trigger('togglePlay.event', 'off');
        this.transportModel.set('isPlaying', false);
        $(this.el).removeClass();
        $(this.el).addClass('play');
        console.log('now paused');
      }

    },

    stopPlay: function(val) {
      if(this.transportModel.get('isPlaying')) {
        dispatch.trigger('togglePlay.event', 'off');
        this.transportModel.set('isPlaying', false);
        $(this.el).removeClass();
        $(this.el).addClass('play');
        console.log('now paused');
      }
    },

    render: function() {
      $(this.el).html(transportTemplate);
      return this;
    }
  });
  return new TransportView();
});