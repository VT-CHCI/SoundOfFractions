// Filename: views/conductor/conductorView.js
/*
    This is the ConductorView.
    It is in charge of the Transport or play/stop button.
*/
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/models/conductor',
  'text!backbone/templates/conductor/play.html',
  'text!backbone/templates/conductor/stop.html',
  'log'
], function($, _, Backbone, ConductorModel, conductorPlayTemplate, conductorStopTemplate, log){

  var ConductorView = Backbone.View.extend({
    el : $('#conductor'), // Specifies the DOM element which this view handles

    //registering our instruct() method for backbone click events.
    events : {
      "click" : "instruct"
    },

    initialize: function() {
      console.log('ConductorView initing...')
      this.conductorModel = ConductorModel;

      //registering our stopPlay() method on stopRequest events.

      // TODO Replace these events
      // dispatch.on('measureRepresentation.event', this.stopPlay, this);
      // dispatch.on('stopRequest.event', this.stopPlay, this);

      // allow the letter p to click the first plus sign
      _.bindAll(this, 'manuallPress');
      $(document).bind('keypress', this.manuallPress);

      this.render();
    },

    /*
      This toggles the imaage of the Transport button
      and triggers togglePlay events.

      Also, this creates a string representation of
      the entire song and sends it to the logging system.
    */
    instruct: function() {
      // If stoppped
      if(!this.conductorModel.get('isPlaying')) {
        
        this.conductorModel.play();
        console.log('now playing conductor view');

        var compiledTemplate = _.template( conductorStopTemplate );
        $(this.el).html( compiledTemplate() );

        log.sendLog([[3, "Started playing music: "]]);
      // If playing
      } else {
        this.conductorModel.stop();
        console.log('now stopping conductor view');

        var compiledTemplate = _.template( conductorPlayTemplate );
        $(this.el).html( compiledTemplate );

        console.log('now stopped conductor view');

        log.sendLog([[3, "Stop playing music"]]);
      }

    },
    manuallPress: function(e) {
      if(window.modalOpen){
        return;
      }
      // p = 112
      if (e.keyCode == 112) {
        this.el.click();
      } 
    },
    render: function() {
      console.log('ConductorView render');
      $(this.el).html(conductorPlayTemplate);
      //$(this.el).draggable({ axis: "y", containment: "#body-container"/*"#middle-right-column"*/ });
      return this;
    },
    close: function(){
      console.log('closing Conductor View');
      this.remove();
      this.unbind();
    }
  });
  // This is a Singleton
  return new ConductorView();
});