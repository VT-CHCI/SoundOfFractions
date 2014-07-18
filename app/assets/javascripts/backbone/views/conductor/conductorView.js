// Filename: views/conductor/conductorView.js
/*
    This is the ConductorView.
    It is in charge of the Transport or play/stop button.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/conductor',
  'text!backbone/templates/conductor/play.html',
  'text!backbone/templates/conductor/stop.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, ConductorModel, conductorPlayTemplate, conductorStopTemplate, dispatch, log){

  var ConductorView = Backbone.View.extend({
    el : $("#conductor"), // Specifies the DOM element which this view handles

    //registering our conductor() method for backbone click events.
    events : {
      "click" : "conductor"
    },

    initialize: function() {
      this.conductorModel = ConductorModel;

      //registering our stopPlay() method on stopRequest events.
      dispatch.on('measureRepresentation.event', this.stopPlay, this);
      dispatch.on('stopRequest.event', this.stopPlay, this);
      // dispatch.listenTo(this, 'measureRepresentation.event', this.stopPlay);
      // dispatch.listenTo(this, 'stopRequest.event', this.stopPlay);

      // allow the letter p to click the first plus sign
      _.bindAll(this, 'manuallPress');
      $(document).bind('keypress', this.manuallPress);
    },

    /*
      This toggles the imaage of the Transport button
      and triggers togglePlay events.

      Also, this creates a string representation of
      the entire song and sends it to the logging system.
    */
    conductor: function() {
      if(!this.conductorModel.get('isPlaying')) {
        
        this.conductorModel.play();

        var compiledTemplate = _.template( conductorStopTemplate );
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
        this.conductorModel.stop();
        // dispatch.trigger('togglePlay.event', 'off');
        // this.conductorModel.set('isPlaying', false);

        var compiledTemplate = _.template( conductorPlayTemplate );
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
      if(this.conductorModel.get('isPlaying')) {
        dispatch.trigger('togglePlay.event', 'off');
        this.conductorModel.set('isPlaying', false);
        $(this.el).
        $(this.el).addClass('play');
        console.log('now paused');
      }
    },
    manuallPress: function(e) {
      // p = 112
      if (e.keyCode == 112) {
        this.el.click();
      } 
    },
    render: function() {
      $(this.el).html(conductorPlayTemplate);
      //$(this.el).draggable({ axis: "y", containment: "#body-container"/*"#middle-right-column"*/ });
      return this;
    }
  });
  return new ConductorView();
});