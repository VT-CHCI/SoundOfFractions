//filename: views/factory/beadFactoryView.js
/*
  This is the view for a bead factory, which
  is contained in a measure view.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/beat',
  'text!backbone/templates/beat/audioBeats.html',
  'text!backbone/templates/beat/linearBarBeats.html',
  'text!backbone/templates/beat/circularPieBeats.html',
  'text!backbone/templates/beat/circularBeadBeats.html',
  'text!backbone/templates/beat/numberLineBeats.html',
  'colors',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, audioBeatsTemplate, linearBarBeatsTemplate, circularPieBeatsTemplate,
  circularBeadBeatsTemplate, numberLineBeatsTemplate, COLORS, dispatch, log){
  var BeadFactory = Backbone.View.extend({

     events : {
     },

    // The different representations
    representations: {
      "audio": audioBeatsTemplate,
      "linear-bar": linearBarBeatsTemplate,
      "circular-pie": circularPieBeatsTemplate,
      "circular-bead": circularBeadBeatsTemplate,
      "number-line": numberLineBeatsTemplate
    },
    //The constructor takes options because these views are created
    //by measuresView objects.
    initialize: function(options){
      if (options) {
      // beat, number of beats, each beat's color, location, path
        this.beatFactoryHolderEl = options.beatFactoryHolder;
        this.beatColor = COLORS.hexColors[options.colorIndex];
        this.remainingNumberOfBeats = options.remainingNumberOfBeats;
        this.currentBeatRepresentation = options.currentMeasureRepresentation;
        this.x = options.x;
        this.y = options.y;
        this.beadRadius = options.beadRadius;
      } else {
        console.error('should not be in here!');
        this.model = new BeatModel;
      }
      this.render();
    },

    //We use css classes to control the color of the beat.
    render: function(){
      var ƒthis = this;
      var beatFactoryParameters = {
        beat: this.model,
        color: this.beatColor
      };

      //Linear
        // var beatBBX = this.beatBBX;
        // beatFactoryParameters.beatBBX = beatBBX;
        // var beatBBY = this.beatBBY;
        // beatFactoryParameters.beatBBY = beatBBY;
        // var beatWidth = this.beatWidth;
        // beatFactoryParameters.beatWidth = beatWidth;
        // var beatHeight = this.beatHeight;
        // beatFactoryParameters.beatHeight = beatHeight;

      //Circlular Pie
        // var centerX = this.cx;
        // beatFactoryParameters.cx = centerX;
        // var centerY = this.cy;
        // beatFactoryParameters.cy = centerY;
        // var measureStartAngle = -90;
        // beatFactoryParameters.measureStartAngle = measureStartAngle;
        // var beatStartAngle = this.beatStartAngle;
        // beatFactoryParameters.beatStartAngle = beatStartAngle;
        // var beatEndAngle = beatStartAngle+this.beatAngle;
        // beatFactoryParameters.beatEndAngle = beatEndAngle;
        // var measureR = this.measureR;
        // beatFactoryParameters.measureR = measureR;

      // x center of a bead or first x of pie piece
      if (this.currentBeatRepresentation == 'circular-pie') {
        // var x1 = centerX + measureR * Math.cos(Math.PI * beatStartAngle/180); 
        // beatFactoryParameters.x1 = x1;
      } else if (this.currentBeatRepresentation == 'circular-bead') {
        beatFactoryParameters.x1 = this.x;
      }
      // y center of a bead
      if (this.currentBeatRepresentation == 'circular-pie') {
        // var y1 = centerY + measureR * Math.sin(Math.PI * beatStartAngle/180);     
        // beatFactoryParameters.y1 = y1;
      } else if (this.currentBeatRepresentation == 'circular-bead') {
        beatFactoryParameters.y1 = this.y;
      }
        // the second x point of a pie piece
        // var x2 = centerX + measureR * Math.cos(Math.PI * beatEndAngle/180);
        // beatFactoryParameters.x2 = x2;
        // the second y point of a pie piece
        // var y2 = centerY + measureR * Math.sin(Math.PI * beatEndAngle/180);
        // beatFactoryParameters.y2 = y2;

      // this.beatCenterPosition = {
      //   x: beatFactoryParameters.x1,
      //   y: beatFactoryParameters.y1
      // };

      //Circular Bead
      var beatR = this.beatR;
      beatFactoryParameters.beatR = beatR;
      //console.log(x1 + ',' + y1);

      // // compile the template for this beat (respect the current representation)
      // var compiledTemplate = _.template(this.representations[this.currentBeatRepresentation], beatFactoryParameters );

      var lineData = $.map(Array(this.measureNumberOfPoints), function (d, i) {
        var y = 0;
        var x = i * this.lineLength / (this.measureNumberOfPoints - 1)
        return {x: x, y: y}
      });
      var pathFunction = d3.svg.line()
          .x(function (d) {return d.x;})
          .y(function (d) {return d.y;})
          .interpolate('basis'); // bundle | basis | linear | cardinal are also options

      var drag = d3.behavior.drag();
      drag.on('drag', function(d) {
        d3.select(this).attr("cx", +d3.select(this).attr("cx") + d3.event.dx);
        d3.select(this).attr("cy", +d3.select(this).attr("cy") + d3.event.dy);

        // // add the 'selected' class when a beat is dragged
        // $('#factory-beat'+ƒthis.cid).closest($('.component')).addClass('selected');
        // var transformString = $('#factory-beat'+ƒthis.cid).attr('transform').substring(10, $('#factory-beat'+ƒthis.cid).attr('transform').length-1);
        // var comma = transformString.indexOf(',');
        // d.x = parseInt(transformString.substr(0,comma));
        // d.y = parseInt(transformString.substr(comma+1));
        // d.x += d3.event.dx;
        // d.y += d3.event.dy;
        // if (d.x > 100 || d.x < -100) {
        //   d3.select(this).remove();
        //   dispatch.trigger('signatureChange.event', ƒthis.parent.attributes.beats.length-1);
        // }
        // d3.select(this).attr("transform", function(d){
        //     return "translate(" + [ d.x,d.y ] + ")";
        // })
      });


      if (this.currentBeatRepresentation == 'circular-bead') {
        //The Circle SVG Path we draw MUST BE AFTER THE COMPILED TEMPLATE
        var beatContainer = d3.select(this.beatFactoryHolderEl);
        var beatPath = beatContainer
            // .append('path')
            .append('circle')
            .attr('cx', this.x)
            .attr('cy', this.y)
            .attr('r', this.beadRadius)
            // Calling the click handler here doesn't work for some reason
            // .on('click', function(){console.log('beat container click handler')})
            .attr('class', 'beat factory-beat d3')
            .attr('transform', 'translate(0,0)')
            .attr('id', 'factory-beat'+this.cid)
            // This is the path that the beat will follow when un/roll is clicked
            // .attr('d', pathFunction)
            .attr('fill', this.beatColor)
            .attr('stroke', 'black')
            .attr('opacity', .2)
            .call(drag);
      }
      return this;
    },

    changeBeatRepresentation: function(representation) {
      this.previousBeatRepresentation = this.currentBeatRepresentation;
      this.currentBeatRepresentation = representation;
    }
  });
  return BeadFactory;
});