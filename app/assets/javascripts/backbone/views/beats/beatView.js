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
  'text!backbone/templates/measures/audioMeasures.html',
  'text!backbone/templates/beats/linearBarBeats.html',
  'text!backbone/templates/beats/linearBarSVGBeats.html',
  'text!backbone/templates/beats/circularPieBeats.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, audioMeasuresTemplate, linearBarBeatsTemplate, linearBarSVGBeatsTemplate, circularPieBeatsTemplate, dispatch, log){
  return Backbone.View.extend({
    el: $('.beat'),

    //registering backbone's click event to our toggle() function.
    events : {
      'click' : 'toggle'
    },

    that: this;
    // The different representations
    representations: {
      "audio": audioMeasuresTemplate,
      "linear-bar": linearBarBeatsTemplate,
      "linear-bar-svg": linearBarSVGBeatsTemplate,
      "circular-pie": circularPieBeatsTemplate
    },
    currentBeatRepresentation: 'linear-bar',
    beatAngle: 90,


    //The constructor takes options because these views are created
    //by measuresView objects.
    initialize: function(options){
      console.log('options :');
      console.log(options);
      if (options) {
        this.model = options.model;
        this.el = options.el;
      } else {
        this.model = new BeatModel;
      }

      this.render();
    },

    //We use css classes to control the color of the beat.
    //A beat is essentially an empty div.
    render: function(){
      // if (this.model.get("selected")){
      //   $(this.el).html('<div class="ON"><div class="animated-beat"></div></div>');
      // } else {
      //   $(this.el).html('<div class="OFF"><div class="animated-beat"></div></div>');
      // }


      
      // var beatState = $(that);
      // window.csf = beatState;
      var state = this.bool();
      // window.csf = $(this.el).children(0).attr('class');
      // console.log(beatState);

      var compiledTemplate = _.template(this.representations[this.currentBeatRepresentation], {beat: this.model, beatAngle: this.beatAngle});
      console.log(compiledTemplate)
      $(this.el).append(compiledTemplate);


      return this;
    },

    bool: function(){
      if (that.model.get("selected")) {
        return "ON";
      } else {
        return "OFF";
      }
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
      var newBool = this.model.get("selected");
      console.log("beat toggled! : " + newBool);

      this.render();

      log.sendLog([[1, "beat" + this.model.cid + " toggled: "+!bool]]);

      dispatch.trigger('beatClicked.event');
    }
  });
});