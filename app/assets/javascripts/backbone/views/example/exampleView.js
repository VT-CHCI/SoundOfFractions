// Filename: views/example/exampleView.js
/*
    This is the ConductorView.
    It is in charge of the Transport or play/stop button.
*/

// The define function is part of Require.js.  File extensions arent needed.
// It pairs file paths with variable names passed into the BackBone.View.extend({})
define([                                           // These are file paths 
  'jquery',                                        // We reference JQuery
  'underscore',                                    // We reference Underscore
  'backbone',                                      // We must reference Backbone 
  'backbone/models/conductor',                     // We reference a model to use in this View
  'text!backbone/templates/conductor/play.html',   // This is a template. It must have the text! precursor
  'text!backbone/templates/conductor/stop.html',   // This is a template. It must have the text! precursor
  'app/dispatch',                                  // This handles event dispatching
  'app/log'                                        // This is a logger, for gathering the data we need
            // We give names to the above mentioned files, as variable names.  Declaration orders much match
], function($, _, Backbone, ConductorModel, conductorPlayTemplate, conductorStopTemplate, dispatch, log){
  // We call the View the name of the View, and extend it from the Backbone View Class
  var ConductorView = Backbone.View.extend({
    // Specifies the DOM element which this view handles
    //  It is unique, hence the '#' for an '#id'.  If it were all types of an item, it would be a '.class'.
    el : $("#conductor"),

    //registering our conductor() method for click events from the Web page
    events : {
      "click" : "conductor"
    },

    initialize: function() {
      // We attache a model to the view as a variable for reference
      this.conductorModel = ConductorModel;

      //registering our stopPlay() method on stopRequest events.
      // dispatch.on('measureRepresentation.event', this.stopPlay, this);
      // dispatch.on('stopRequest.event', this.stopPlay, this);
      dispatch.listenTo(this, 'measureRepresentation.event', this.stopPlay);
      dispatch.listenTo(this, 'stopRequest.event', this.stopPlay);

      // This binds all keypresses on teh webpage to this View, allow the letter p to click the first plus sign
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
    // In a render func(), we usually, but not always, populate and attach a template to somewhere on the page.
    render: function() {
      // This directly uses a static template (no customization) and attaches it to the element, we assigned above on line 24
      $(this.el).html(conductorPlayTemplate);
      $(this.el).draggable({ axis: "y",containment: "#middle-right-column" });
      return this;
    }
  });
  // We return the view so it can be used
  return new ConductorView();
});