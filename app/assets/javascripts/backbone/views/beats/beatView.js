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
  'text!backbone/templates/beats/audioBeats.html',
  'text!backbone/templates/beats/linearBarBeats.html',
  'text!backbone/templates/beats/linearBarSVGBeats.html',
  'text!backbone/templates/beats/circularPieBeats.html',
  'text!backbone/templates/beats/circularBeadBeats.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, audioBeatsTemplate, linearBarBeatsTemplate, linearBarSVGBeatsTemplate, circularPieBeatsTemplate, circularBeadBeatsTemplate, dispatch, log){
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
      "audio": audioBeatsTemplate,
      "linear-bar": linearBarBeatsTemplate,
      "linear-bar-svg": linearBarSVGBeatsTemplate,
      "circular-pie": circularPieBeatsTemplate,
      "circular-bead": circularBeadBeatsTemplate
    },
    //grab the current measure representation's data-state
    currentBeatRepresentation: $('#measure-representation-buttons').children('.active').attr('data-state'),
    beatColors: {
      0: "#FF0000",   //red
      1: "#802A2A",   //brown
      2: "#EE4000",   //dark orange
      3: "#FF7722",   //light orange
      4: "#FFD700",   //yellow
      5: "#808000",   //olive
      6: "#80ff00",   //light green
      7: "#00ff00",   //bright green
      8: "#00ff80",   //Turquoise
      9: "#00ffff",   //light blue
      10: "#0080ff",  //med blue
      11: "#0000ff",  //blue
      12: "#8000ff",  //purple
      13: "#ff00ff",  //magenta
      14: "#ff0080",  //hot pink
      15: "#4B0082"   //indigo
    },

    //The constructor takes options because these views are created
    //by measuresView objects.
    initialize: function(options){
      if (options) {
        // TODO: need to take in an option about currentBeatRep
        // TODO: maybe need to respond to a representation changed event (change this.currentBeatRepresentation and rerender)

        console.log('beatView \'options\' passed in :');
        console.warn(options);
        this.model = options.model;

        // this is the html element into which this class should render its template
        this.measureBeatHolder = options.parentElHolder;
        this.el = options.singleBeat;
        this.parent = options.parent;
        this.currentBeatRepresentation = options.measureRepresentation;
        this.cx = options.cx;
        this.cy = options.cy;
        this.measureR = options.measureR;
        this.beatBBX = options.beatBBX;
        this.beatBBY = options.beatBBY;
        this.beatWidth = options.beatWidth;
        this.beatHeight = options.beatHeight;
        this.opacity = this.getOpacityNumber(options.opacity);
        this.beatsInMeasure = options.beatsInMeasure;
        this.beatAngle = options.beatAngle;
        this.beatStartAngle = options.beatStartAngle;
        this.color = options.color;
        this.beatStartTime = options.beatStartTime;
        this.timeIncrement = options.timeIncrement;
        this.beatR = options.beatR;
        this.beatHolderWidth = options.beatHolderWidth;
        this.linearBeatXPadding = options.linearBeatXPadding;
      } else {
        console.error('should not be in here!');
        this.model = new BeatModel;
      }

      this.render();
    },

    //We use css classes to control the color of the beat.
    //A beat is essentially an empty div.
    render: function(toggledBeat){
      // the current state of the beat (is it ON or OFF?)
      var state = this.getSelectionBooleanCSS();

      // if render is being called from the toggle function, we may want to do something different
      if (toggledBeat) {
        //DIV
        $('#beat'+toggledBeat.cid).toggleClass("ON");
        $('#beat'+toggledBeat.cid).toggleClass("OFF");
        //SVG
        $('#beat'+toggledBeat.cid)[0].setAttribute('opacity', this.getOpacityNumber(toggledBeat.get('selected')));
      } else {
        // this is reached during the initial rendering of the page or transition

        var beatTemplateParameters = {
          beat: this.model,
          beatAngle: this.beatAngle,
          state: state,
          color: this.beatColors[this.color],
          beatStartTime: this.beatStartTime,
          timeIncrement: this.timeIncrement,
          beatHolderWidth: this.beatHolderWidth
        };

        //Opacity
        beatTemplateParameters.opacity = this.opacity;        

        //Linear
        var beatBBX = this.beatBBX;
        beatTemplateParameters.beatBBX = beatBBX;
        var beatBBY = this.beatBBY;
        beatTemplateParameters.beatBBY = beatBBY;
        var beatWidth = this.beatWidth;
        beatTemplateParameters.beatWidth = beatWidth;
        var beatHeight = this.beatHeight;
        beatTemplateParameters.beatHeight = beatHeight;

        //Circlular Pie
        var centerX = this.cx;
        beatTemplateParameters.cx = centerX;
        var centerY = this.cy;
        beatTemplateParameters.cy = centerY;
        var measureStartAngle = -90;
        beatTemplateParameters.measureStartAngle = measureStartAngle;
        var beatStartAngle = this.beatStartAngle;
        beatTemplateParameters.beatStartAngle = beatStartAngle;
        var beatEndAngle = beatStartAngle+this.beatAngle;
        beatTemplateParameters.beatEndAngle = beatEndAngle;
        var measureR = this.measureR;
        beatTemplateParameters.measureR = measureR;

        var x1 = centerX + measureR * Math.cos(Math.PI * beatStartAngle/180); 
        beatTemplateParameters.x1 = x1;
        var y1 = centerY + measureR * Math.sin(Math.PI * beatStartAngle/180);     
        beatTemplateParameters.y1 = y1;
        var x2 = centerX + measureR * Math.cos(Math.PI * beatEndAngle/180);
        beatTemplateParameters.x2 = x2;
        var y2 = centerY + measureR * Math.sin(Math.PI * beatEndAngle/180);
        beatTemplateParameters.y2 = y2;

        //Circular Bead
        var beatR = this.beatR;
        beatTemplateParameters.beatR = beatR;

        console.log('beatTemplateParameters :');
        console.warn(beatTemplateParameters);
        // compile the template for this beat (respect the current representation)
        var compiledTemplate = _.template(this.representations[this.currentBeatRepresentation], beatTemplateParameters );
        
        if (this.currentBeatRepresentation == 'linear-bar') {
          // append the compiled template to the measureBeatHolder
          $(this.measureBeatHolder).append(compiledTemplate);          
        // SVG rendering
        } else {
          // Notes
          // Rather than appending to the beatHolder directly, we are going to append to a blank <svg>
          // in the $('body') directly, then move into the beatHolder, then add the click handler
          // Kind of hacky, but unaware of other way to do so.   Per SO?:
          // http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element/#13654655

          // make the fake svg using the appropriate svg template
          $('body').append('<svg id="dummy" style="display:none">'+ compiledTemplate +'</svg>');
          // append to beatHolder
          $(this.measureBeatHolder).append($('#dummy .beat'));
          $('#dummy').remove();
        }

        // add click handler to this beat
        $("#beat"+this.model.cid).click($.proxy(this.toggle, this));
        return this;
      }
    },

    changeBeatRepresentation: function(representation) {
      this.currentBeatRepresentation = representation;
    },

    getSelectionBooleanCSS: function(){
      if (this.model.get("selected")) {
        return "ON";
      } else {
        return "OFF";
      }
    },

    getOpacityNumber : function(bool) {
      if (bool == true) {
        return 1;
      } else {
        return 0.5;
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
      this.render(this.model);
      // log.sendLog([[1, "beat" + this.model.cid + " toggled: "+!bool]]);
      dispatch.trigger('beatClicked.event');
    }
  });
});