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
  'logging'
], function($, _, Backbone, ConductorModel, conductorPlayTemplate, conductorStopTemplate, Logging){

  var ConductorView = Backbone.View.extend({
    el : $('#conductor'), // Specifies the DOM element which this view handles

    //registering our instruct() method for backbone click events.
    events : {
      "click" : "instruct"
    },

    initialize: function() {
      console.info('ConductorView initing...')
      this.model = ConductorModel;

      //registering our stopPlay() method on stopRequest events.

      // TODO Replace these events
      // dispatch.on('measureRepresentation.event', this.stopPlay, this);
      this.listenTo(this.model, 'conductorStop', this.changeButtonToStop);

      // allow the letter p to click the first plus sign
      _.bindAll(this, 'manuallPress');
      $(document).bind('keypress', this.manuallPress);

      this.render();
    },
    changeButtonToStop: function(){
      var compiledTemplate = _.template( conductorPlayTemplate );
      $(this.el).html( compiledTemplate );
    },
    /*
      This toggles the imaage of the Transport button
      and triggers togglePlay events.

      Also, this creates a string representation of
      the entire song and sends it to the logging system.
    */
    instruct: function() {
      // If stopped
      if(!this.model.get('isPlaying')) {
        
        this.model.play();
        console.info('now playing conductor view');

        var compiledTemplate = _.template( conductorStopTemplate );
        $(this.el).html( compiledTemplate() );

        this.startTime = new Date();

        Logging.logStorage('Started playing music');
      // If playing
      } else {
        this.model.stop();
        console.log('now stopping conductor view');

        var compiledTemplate = _.template( conductorPlayTemplate );
        $(this.el).html( compiledTemplate );

        console.info('now stopped conductor view');

        this.endTime = new Date();
        this.previousPlayedElapsedTime = (this.endTime - this.startTime)/1000;
        var songDuration = this.model.calculateMaxDuration()/1000;
        Logging.logStorage('Stopped playing music.  Duration of playback in seconds: ' + this.previousPlayedElapsedTime + ' and the song lasts ' + songDuration + ' seconds for a total playback number of ' + this.previousPlayedElapsedTime/songDuration + ' times.');
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
      console.info('ConductorView render');
      $(this.el).html(conductorPlayTemplate);
      //$(this.el).draggable({ axis: "y", containment: "#body-container"/*"#middle-right-column"*/ });
      return this;
    },
    close: function(){
      console.info('closing Conductor View');
      this.remove();
      this.unbind();
    }
  });
  // This is a Singleton
  return new ConductorView();
});