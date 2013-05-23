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
  'text!backbone/templates/beats/numberLineBeats.html',
  'colors',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, audioBeatsTemplate, linearBarBeatsTemplate, linearBarSVGBeatsTemplate, circularPieBeatsTemplate, circularBeadBeatsTemplate, numberLineBeatsTemplate, COLORS, dispatch, log){
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
      "circular-bead": circularBeadBeatsTemplate,
      "number-line": numberLineBeatsTemplate
    },
    //grab the current measure representation's data-state
    currentBeatRepresentation: $('#measure-representation-buttons').children('.active').attr('data-state'),
    previousBeatRepresentation: $('#measure-representation-buttons').children('.active').attr('data-state'),

    //The constructor takes options because these views are created
    //by measuresView objects.
    initialize: function(options){
      if (options) {
        // TODO: need to take in an option about currentBeatRep
        // TODO: maybe need to respond to a representation changed event (change this.currentBeatRepresentation and rerender)
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
        this.color = options.color;                             //index number
        this.colorForAudio = options.colorForAudio;
        this.beatStartTime = options.beatStartTime;
        this.timeIncrement = options.timeIncrement;
        this.beatR = options.beatRadius;
        this.beatRForAudio = options.beatRForAudio;
        this.beatHolderWidth = options.beatHolderWidth;
        this.linearBeatXPadding = options.linearBeatXPadding;
        this.circleStates = options.circleStates;
        this.beatNumberOfPoints = 9;
        this.beatIndex = options.beatIndex;
        this.margin = options.margin;
        this.measureNumberOfPoints = options.measureNumberOfPoints;
        this.animationDuration = options.animationDuration;
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
      var ƒthis = this;

      // if render is being called from the toggle function, we may want to do something different
      if (toggledBeat) {
        //DIV
        $('#beat'+toggledBeat.cid).toggleClass('ON');
        $('#beat'+toggledBeat.cid).toggleClass('OFF');
        //SVG
        if(this.currentBeatRepresentation == 'number-line') {
          $('#beat'+toggledBeat.cid)[0].setAttribute('fill-opacity', this.getOpacityNumber(toggledBeat.get('selected')));
        }
        else {
          $('#beat'+toggledBeat.cid)[0].setAttribute('opacity', this.getOpacityNumber(toggledBeat.get('selected')));
        }
      } else {
        // this is reached during the initial rendering of the page or transition

        var beatTemplateParameters = {
          beat: this.model,
          beatAngle: this.beatAngle,
          state: state,
          color: COLORS.hexColors[this.color],
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

        // x center of a bead or first x of pie piece
        if (this.currentBeatRepresentation == 'circular-pie') {
          var x1 = centerX + measureR * Math.cos(Math.PI * beatStartAngle/180); 
          beatTemplateParameters.x1 = x1;
        } else if (this.currentBeatRepresentation == 'circular-bead') {
          beatTemplateParameters.x1 = this.circleStates[0][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.measureNumberOfPoints))].x;
        }
        // y center of a bead
        if (this.currentBeatRepresentation == 'circular-pie') {
          var y1 = centerY + measureR * Math.sin(Math.PI * beatStartAngle/180);     
          beatTemplateParameters.y1 = y1;
        } else if (this.currentBeatRepresentation == 'circular-bead') {
          beatTemplateParameters.y1 = this.circleStates[0][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.measureNumberOfPoints))].y;
        }
        // the second x point of a pie piece
        var x2 = centerX + measureR * Math.cos(Math.PI * beatEndAngle/180);
        beatTemplateParameters.x2 = x2;
        // the second y point of a pie piece
        var y2 = centerY + measureR * Math.sin(Math.PI * beatEndAngle/180);
        beatTemplateParameters.y2 = y2;

        //Circular Bead
        var beatR = this.beatR;
        beatTemplateParameters.beatR = beatR;
        //console.log(x1 + ',' + y1);

        var beatUnwindingPaths = [];
        for (i=0; i<ƒthis.circleStates.length; i++){
          // circle portion of unroll
          var computedBeatBeadPath = $.map(Array(this.beatNumberOfPoints), function (d, j) {
            var x = (ƒthis.circleStates[i][Math.floor((ƒthis.beatIndex/ƒthis.beatsInMeasure)*(ƒthis.measureNumberOfPoints))].x) + beatR * Math.sin(2 * j * Math.PI / (ƒthis.beatNumberOfPoints - 1));
            // margin.top + beatR
            var y = (ƒthis.circleStates[i][Math.floor((ƒthis.beatIndex/ƒthis.beatsInMeasure)*(ƒthis.measureNumberOfPoints))].y) - beatR * Math.cos(2 * j * Math.PI / (ƒthis.beatNumberOfPoints - 1));
            return { x: x, y: y };
          });
          beatUnwindingPaths.push(computedBeatBeadPath);
        };
        this.beatUnwindingPaths = beatUnwindingPaths;
        window.csf = beatUnwindingPaths;

        // var computedBeatBeadPath = $.map(Array(this.beatNumberOfPoints), function (d, j) {
        //   var x = beatTemplateParameters.x1 + beatR * Math.sin(2 * j * Math.PI / (ƒthis.beatNumberOfPoints - 1));
        //   // margin.top + beatR
        //   var y = beatTemplateParameters.y1 - beatR * Math.cos(2 * j * Math.PI / (ƒthis.beatNumberOfPoints - 1));
        //   return { x: x, y: y };
        // });
        // console.warn(computedBeatBeadPath);

        //Audio
        var beatRForAudio = this.beatRForAudio;
        beatTemplateParameters.beatRForAudio = beatRForAudio;
        var colorForAudio = this.colorForAudio;
        beatTemplateParameters.colorForAudio = colorForAudio;
        // compile the template for this beat (respect the current representation)
        var compiledTemplate = _.template(this.representations[this.currentBeatRepresentation], beatTemplateParameters );
          if (this.currentBeatRepresentation == 'circular-bead') {
          var margin = this.margin;
          var lineData = $.map(Array(this.measureNumberOfPoints), function (d, i) {
              var y = margin.top;
              var x = margin.left + i * this.lineLength / (this.measureNumberOfPoints - 1)
              return {x: x, y: y}
          });
          var pathFunction = d3.svg.line()
              .x(function (d) {return d.x;})
              .y(function (d) {return d.y;})
              .interpolate('basis'); // bundle | basis | linear | cardinal are also options

          //The Circle SVG Path we draw MUST BE AFTER THE COMPILED TEMPLATE
          var beatContainer = d3.select('#beatHolder'+this.parent.cid);
          var beatPath = beatContainer //.append('g')
              // .append('path')
              .insert('path', ':first-child')
              // .data([computedBeatBeadPath])
              .data([beatUnwindingPaths[0]])
              .attr('d', pathFunction)
              .attr('fill', COLORS.hexColors[this.color])
              .attr('stroke', 'black')
              // .attr('stroke-dasharray', '5, 10')
              .attr('opacity', 1)
              .attr('class', 'beat')
              .attr('class', 'd3')
              // .attr('class', 'circle-path')
              // .on('click', unroll);

          function unroll() {
            console.log('INNER UNROLL');
            for(i=0; i<ƒthis.measureNumberOfPoints; i++){
                beatPath.data([beatUnwindingPaths[i]])
                    .transition()
                    .delay(ƒthis.animationDuration*i)
                    .duration(ƒthis.animationDuration)
                    .ease('linear')
                    .attr('d', pathFunction);
            }
          };
          function reverse() {
            for(i=0; i<ƒthis.measureNumberOfPoints; i++){
                beatPath.data([beatUnwindingPaths[ƒthis.measureNumberOfPoints-1-i]])
                    .transition()
                    .delay(ƒthis.animationDuration*i)
                    .duration(ƒthis.animationDuration)
                    .ease('linear')
                    .attr('d', pathFunction);
            }
          };

          $('#a'+this.parent.cid).on('click', unroll);
          $('#b'+this.parent.cid).on('click', reverse);
        }
        else if (this.currentBeatRepresentation == 'linear-bar') {
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
        $('#beat'+this.model.cid).click($.proxy(this.toggle, this));
        return this;
      }
    },

    changeBeatRepresentation: function(representation) {
      this.previousBeatRepresentation = this.currentBeatRepresentation;
      this.currentBeatRepresentation = representation;
    },

    getSelectionBooleanCSS: function(){
      if (this.model.get('selected')) {
        return 'ON';
      } else {
        return 'OFF';
      }
    },

    getOpacityNumber : function(bool) {
      if (bool == true) {
        return 1;
      } else {
        return 0.2;
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