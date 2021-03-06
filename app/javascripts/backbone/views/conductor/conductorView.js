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
  'text!backbone/templates/conductor/stop.html'
], function($, _, Backbone, ConductorModel, conductorPlayTemplate, conductorStopTemplate){

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
    instruct: function() {
      // If stopped
      if(!this.model.get('isPlaying')) {
        console.info('now playing conductor view');
        var compiledTemplate = _.template( conductorStopTemplate );
        $(this.el).html( compiledTemplate() );

        this.model.play();
      // If playing
      } else {
        console.log('now stopping conductor view');
        var compiledTemplate = _.template( conductorPlayTemplate );
        $(this.el).html( compiledTemplate );

        this.model.stop();
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