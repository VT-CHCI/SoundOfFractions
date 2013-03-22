//filename: views/beats/beatView.js
/*
  This is the view for a single beat, which
  is contained in a measure view.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/beat',
  'text!backbone/templates/beats/linearBarBeats.html',
  'text!backbone/templates/beats/circularPieBeats.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, linearBarBeatsTemplate, circularPieBeatsTemplate, dispatch, log){
  return Backbone.View.extend({
    el: $('.beat'),

    // The different representations
    representations: {
      "linear-bar": linearBarBeatsTemplate,
      "circular-pie": circularPieBeatsTemplate
    },
    currentBeatRepresentation: 'linear-bar',

    //registering backbone's click event to our toggle() function.
    events : {
      'click' : 'toggle'
    },

    beatAngle: 90,


    //The constructor takes options because these views are created
    //by measuresView objects.
    initialize: function(options){
      if (options) {
        this.model = options.model;
        this.el = options.el;
      } else {
        this.model = new BeatModel;
      }

      // if (options['beatAngle']) {
      //   this.beatAngle = options['beatAngle'];
      // } 

      // if (options['template-key']) {
      //   this.currentBeatRepresentation = options['template-key'];
      // } 

      

      this.render();
    },

    //We use css classes to control the color of the beat.
    //A beat is essentially an empty div.
    render: function(){

      // var compiledTemplate = _.template( this.representations[this.currentBeatRepresentation], {beat: this, beatAngle:this.beatAngle} );

      // if (this.model.get("selected")) {
      //   $(this.el).html('<div class="ON"><div class="animated-beat"></div></div>');
      // }
      // else {
      //   $(this.el).html('<div class="OFF"><div class="animated-beat"></div></div>');
      // }
      var compiledTemplate = _.template(this.representations[this.currentBeatRepresentation], {beat: this.model});
      $(this.el).html(compiledTemplate);
      return this;
    },

    /*
      This is called when a beat is clicked.
      It does a number of things:
      1. toggles the model's selected field.
      2. re-renders the beat.
      3. prints a console message.
      4. tells log to send a log of the click event.
      5. triggers a beatClicked event.
    */
    toggle: function(){
      var bool = this.model.get("selected");
      this.model.set("selected", !bool);

      this.render()

      console.log("beat toggled!");
      log.sendLog([[1, "beat" + this.model.cid + " toggled: "+!bool]]);

      dispatch.trigger('beatClicked.event');
    }
  });
});