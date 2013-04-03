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
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, audioBeatsTemplate, linearBarBeatsTemplate, linearBarSVGBeatsTemplate, circularPieBeatsTemplate, dispatch, log){
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
      "circular-pie": circularPieBeatsTemplate
    },
    currentBeatRepresentation: 'linear-bar',
    onColor: {
      1: "#FF0000",   //red
      2: "#802A2A",  //brown
      3: "#FFA500",   //orange
      4: "#FFD700",  //gold
      5: "#FFD700",   //yellow
      6: "#808000",  //olive
      7: "#80ff00",   //light green
      8: "#00ff00",   //bright green
      9: "#00ff80",   //Turquoise
      10: "#00ffff",   //light blue
      11: "#0080ff",   //med blue
      12: "#0000ff",   //blue
      13: "#8000ff",  //purple
      14: "#ff00ff",  //magenta
      15: "#ff0080",  //hot pink
      16: "#4B0082",  //indigo
    },

    //The constructor takes options because these views are created
    //by measuresView objects.
    initialize: function(options){
      if (options) {
        // TODO: need to take in an option about currentBeatRep
        // TODO: maybe need to respond to a representation changed event (change this.currentBeatRepresentation and rerender)

        console.log('beatView options :');
        console.warn(options);
        this.model = options.model;

        // this is the html element into which this class should render its template
        this.measureBeatHolder = options.parentElHolder;
        this.el = options.singleBeat;
        this.parent = options.parent;
        this.currentBeatRepresentation = options.measureRepresentation;
        this.cx = options.cx;
        this.cy = options.cy;
        this.r = options.r;
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
        // this is reached during the initial rendering of the pageor transition

        var beatTemplateParameters = {beat: this.model, beatAngle: this.beatAngle, state: state};

        var centerX = this.cx;
        beatTemplateParameters.cx = centerX;
        var centerY = this.cy;
        beatTemplateParameters.cy = centerY;
        var startAngle = 180;
        var endAngle = 210;
        var radius = this.r;
        beatTemplateParameters.r = radius;
        beatTemplateParameters.opacity = 1;

        var x1 = centerX + radius * Math.cos(Math.PI * startAngle/180); 
        beatTemplateParameters.x1 = x1;
        var y1 = centerY + radius * Math.sin(Math.PI * startAngle/180);     
        beatTemplateParameters.y1 = y1;
        var x2 = centerX + radius * Math.cos(Math.PI * endAngle/180);
        beatTemplateParameters.x2 = x2;
        var y2 = centerY + radius * Math.sin(Math.PI * endAngle/180);
        beatTemplateParameters.y2 = y2;
        beatTemplateParameters.color = this.onColor[16];

        console.log('M200,200 L' + x1 + ',' + y1 + ' A' + x1 + ',' + y1 + ' 0 0,1 ' + x2 + ',' + y2 + ' z');
        console.log(beatTemplateParameters);
        // compile the template for this beat (respect the current representation)
        var compiledTemplate = _.template(this.representations[this.currentBeatRepresentation], beatTemplateParameters);
        
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
          console.log($(this.measureBeatHolder));
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