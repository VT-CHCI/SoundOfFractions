// Filename: views/transport/transportView.js
/*
    This is the TransportView.
    It is in charge of the Transport or play/stop button.
*/
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

    //registering our toggle() method for backbone click events.
    events : {
      "click" : "toggle"
    },

    initialize: function() {
      this.transportModel = new TransportModel;

      //registering our stopPlay() method on stopRequest events.
      dispatch.on('measureRepresentation.event', this.stopPlay, this);
      dispatch.on('stopRequest.event', this.stopPlay, this);
    },

    /*
      This toggles the imaage of the Transport button
      and triggers togglePlay events.

      Also, this creates a string representation of
      the entire song and sends it to the logging system.
    */
    toggle: function() {
      if(!this.transportModel.get('isPlaying')) {
        dispatch.trigger('togglePlay.event', 'on');
        this.transportModel.set('isPlaying', true);
        $(this.el).removeClass('play');
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
        $(this.el).removeClass('pause');
        $(this.el).addClass('play');
        console.log('now paused');

        log.sendLog([[3, "Stop playing music"]]);
      }

    },

    /*
      This is triggered by stopRequest events.
      
      This is essentially the same as togglePlay, but
      it always causes stoppage, and does no logging.
    */
    stopPlay: function(val) {
      if(this.transportModel.get('isPlaying')) {
        dispatch.trigger('togglePlay.event', 'off');
        this.transportModel.set('isPlaying', false);
        $(this.el).removeClass('pause');
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