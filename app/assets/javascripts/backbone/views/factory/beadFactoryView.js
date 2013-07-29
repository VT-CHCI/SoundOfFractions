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
    events : {},
    //The constructor takes options because these views are created
    //by measureRepView objects.
    initialize: function(options){
      if (options) {
      // beat, number of beats, each beat's color, location, path
        for (var key in options) {
          this[key] = options[key];
        }
        this.beatFactoryHolderEl = '#' + options.beatFactoryHolder;
        this.beatColor = COLORS.hexColors[options.colorIndex];
      } else {
        console.error('should not be in here!');
        this.model = new BeatModel;
      }
      this.render();
    },

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
      if (this.currentRepresentationType == 'pie') {
        // var x1 = centerX + measureR * Math.cos(Math.PI * beatStartAngle/180); 
        // beatFactoryParameters.x1 = x1;
      } else if (this.currentRepresentationType == 'bead') {
        beatFactoryParameters.x1 = this.x;
      }
      // y center of a bead
      if (this.currentRepresentationType == 'pie') {
        // var y1 = centerY + measureR * Math.sin(Math.PI * beatStartAngle/180);     
        // beatFactoryParameters.y1 = y1;
      } else if (this.currentRepresentationType == 'bead') {
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
        var newSettingX = parseInt(d3.select(this).attr("cx")) + parseInt(d3.event.dx);
        var newSettingY = parseInt(d3.select(this).attr("cy")) + parseInt(d3.event.dy);
        d3.select(this).attr("cx", newSettingX);
        d3.select(this).attr("cy", newSettingY);
        var newComputedValX = d3.select(this).attr('cx');
        var newComputedValY = d3.select(this).attr('cy');
        // Inside: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 < radius^2
        // Outside: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 > radius^2
        // On: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 == radius^2
        if ( Math.pow(newComputedValX - ƒthis.circularMeasureCx, 2) + Math.pow(newComputedValY - ƒthis.circularMeasureCy, 2) <= Math.pow(ƒthis.circularMeasureR,2) ) {
          var center = {x: ƒthis.circularMeasureCx, y:ƒthis.circularMeasureCy};
          //give it two points, the center, and the new beat location, once it is on or inside the circle
          function angle(center, p1) {
            var p0 = {x: center.x, y: center.y - Math.sqrt(Math.abs(p1.x - center.x) * Math.abs(p1.x - center.x)
                    + Math.abs(p1.y - center.y) * Math.abs(p1.y - center.y))};
            return (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x)) * 180 / Math.PI;
          }
          var p1 = {x: newComputedValX, y: newComputedValY};
          var angleAtNewBeat = angle(center, p1);

          // make an array to find out where the new beat should be added in the beatsCollection of the measure
          var refArray = [];
          for ( i=0 ; i < ƒthis.beatsInMeasure ; i++ ) {
            refArray.push((360/ƒthis.beatsInMeasure)*i);
          }
          var newIndex = _.sortedIndex(refArray, angleAtNewBeat);
          ƒthis.parentMeasureModel.get('beats').add(new BeatModel({selected:true}), {at: newIndex})
          dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure+1);
        }
      });

      if (this.currentRepresentationType == 'bead') {
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
    }
  });
  return BeadFactory;
});