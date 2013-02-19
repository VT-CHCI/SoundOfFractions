// Filename: views/transport/transportView
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/transport',
  'text!backbone/templates/transport/transport.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, TransportModel, transportTemplate, dispatch, log){

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

        name = '';
        $('.component').each(function(index) {
          name = name + index + ':';
          $(this).children('.measure').children('.beat').children().each(function() {
            if ($(this).attr('class') == 'ON')
              name = name + 1;
            else
              name = name + 0;
          });
          name = name + ','
        });

        log.sendLog([[3, "Started playing music: "+name]]);
      }
      else {
        dispatch.trigger('togglePlay.event', 'off');
        this.transportModel.set('isPlaying', false);
        $(this.el).removeClass();
        $(this.el).addClass('play');
        console.log('now paused');

        log.sendLog([[3, "Stop playing music"]]);
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