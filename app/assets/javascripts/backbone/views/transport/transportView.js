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
  'text!backbone/templates/transport/play.html',
  'text!backbone/templates/transport/stop.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, TransportModel, transportPlayTemplate, transportStopTemplate, dispatch, log){

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

        var compiledTemplate = _.template( transportStopTemplate );
        $(this.el).html( compiledTemplate );

        $(this.el).removeClass('play');
        $(this.el).addClass('pause');
        console.log('now playing');

        name = '';
        $('.hTrack').each(function(index) {
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

        var compiledTemplate = _.template( transportPlayTemplate );
        $(this.el).html( compiledTemplate );

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
        $(this.el).
        $(this.el).addClass('play');
        console.log('now paused');
      }
    },

    render: function() {
      $(this.el).html(transportPlayTemplate);
      $(this.el).draggable({ axis: "y",containment: "#middle-right-column" });
      return this;
    }
  });
  return new TransportView();
});