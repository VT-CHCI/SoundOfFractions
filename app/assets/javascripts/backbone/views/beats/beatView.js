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

    /* TODO still issues with this
      el: '.beat',
      registering backbone's click event to our toggle() function.
       events : {
         'click' : 'toggle'
       },
    */

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
      if (options) {
        // TODO: need to take in an option about currentBeatRep
        // TODO: maybe need to respond to a representation changed event (change this.currentBeatRepresentation and rerender)

        console.log('options :');
        console.warn(options);
        this.model = options.model;

        // this is the html element into which this class should render its template
        this.measureBeatHolder = options.parentElHolder;
        this.el = options.singleBeat;
        this.parent = options.parent;
      } else {
        console.error('should not be in here!');
        this.model = new BeatModel;
      }
      this.render();
    },

    //We use css classes to control the color of the beat.
    //A beat is essentially an empty div.
    render: function(toggle){
      // the current state of the beat (is it ON or OFF?)
      var state = this.getSelectionBooleanCSS();

      // if render is being called from the toggle function, we may want to do something different
      if (toggle) {
        $('#beat'+toggle).toggleClass("ON");
        $('#beat'+toggle).toggleClass("OFF");
      } else {
        // this is reached during the initial rendering of the page

        // compile the template for this beat (respect the current representation)
        var compiledTemplate = _.template(this.representations[this.currentBeatRepresentation], {beat: this.model, beatAngle: this.beatAngle, state: state});
        // append the compiled template to the measureBeatHolder
        $(this.measureBeatHolder).append( compiledTemplate );
        // add click handler to this beat
        $("#beat"+this.model.cid).click($.proxy(this.toggle, this));
        // $(this.parentEl).append(compiledTemplate);
        return this;
      }
    },

    getSelectionBooleanCSS: function(){
      if (this.model.get("selected")) {
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
      //switch the selected boolean value on the model
      this.model.set('selected', !this.model.get('selected'));
      //re-render it, passing the clicked beat to render()
      this.render(this.model.cid);
      // log.sendLog([[1, "beat" + this.model.cid + " toggled: "+!bool]]);
      dispatch.trigger('beatClicked.event');
    }
  });
});