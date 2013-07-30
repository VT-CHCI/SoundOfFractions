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

      var dragCircle = d3.behavior.drag();
      dragCircle.on('drag', function(d) {
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
      var dragLine = d3.behavior.drag();
      dragLine.on('drag', function(d) {
        var newSettingX1 = parseInt(d3.select(this).attr("x1")) + parseInt(d3.event.dx);
        var newSettingY1 = parseInt(d3.select(this).attr("y1")) + parseInt(d3.event.dy);
        var newSettingX2 = parseInt(d3.select(this).attr("x2")) + parseInt(d3.event.dx);
        var newSettingY2 = parseInt(d3.select(this).attr("y2")) + parseInt(d3.event.dy);
        d3.select(this).attr("x1", newSettingX1);
        d3.select(this).attr("y1", newSettingY1);
        d3.select(this).attr("x2", newSettingX2);
        d3.select(this).attr("y2", newSettingY2);
        var newComputedValX1 = d3.select(this).attr('x1');
        var newComputedValY1 = d3.select(this).attr('y1');
        // Above: newComputedValY1 must be above line y
        // On : newComputedValY1 must be on the line y
        // Below: newComputedValY1 must be below the line y
        if ( newComputedValY1 < ƒthis.numberLineY ) {
          // make an array to find out where the new beat should be added in the beatsCollection of the measure
          var refArray = [];
          for ( i=0 ; i < ƒthis.beatsInMeasure ; i++ ) {
            refArray.push((ƒthis.lineLength/ƒthis.beatsInMeasure)*i);
          }
          console.log(refArray)
          var newIndex = _.sortedIndex(refArray, newComputedValX1);
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
            .attr('cx', this.cX)
            .attr('cy', this.cY)
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
            .call(dragCircle);
      } else if(this.currentRepresentationType == 'line') {
        var beatContainer = d3.select(this.beatFactoryHolderEl);
        var beatPath = beatContainer
            .append('line')
            .attr('x1', this.x1)
            .attr('y1', this.y1)
            .attr('x2', this.x2)
            .attr('y2', this.y2)
            // Calling the click handler here doesn't work for some reason
            // .on('click', function(){console.log('beat container click handler')})
            .attr('class', 'beat factory-beat d3')
            .attr('id', 'factory-beat'+this.cid)
            // This is the path that the beat will follow when un/roll is clicked
            // .attr('d', pathFunction)
            .attr('stroke', this.beatColor)
            .attr('stroke-width', 4)
            .attr('opacity', .2)
            .call(dragLine);
      }
      return this;
    }
  });
  return BeadFactory;
});