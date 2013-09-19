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
  'colors',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, COLORS, dispatch, log){
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

      var lineData = $.map(Array(this.transitionNumberOfPoints), function (d, i) {
        var y = 0;
        var x = i * this.linearLineLength / (this.transitionNumberOfPoints - 1)
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
            refArray.push((ƒthis.linearLineLength/ƒthis.beatsInMeasure)*i);
          }
          console.log(refArray)
          var newIndex = _.sortedIndex(refArray, newComputedValX1);
          ƒthis.parentMeasureModel.get('beats').add(new BeatModel({selected:true}), {at: newIndex})
          dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure+1);
        }
      });
      var dragBar = d3.behavior.drag();
      dragBar.on('drag', function(d) {
        var newSettingX = parseInt(d3.select(this).attr("x")) + parseInt(d3.event.dx);
        var newSettingY = parseInt(d3.select(this).attr("y")) + parseInt(d3.event.dy);
        d3.select(this).attr("x", newSettingX);
        d3.select(this).attr("y", newSettingY);
        var newComputedValX = d3.select(this).attr('x');
        var newComputedValY = d3.select(this).attr('y');
        // Above: newComputedValY1 must be above line y
        // On : newComputedValY1 must be on the line y
        // Below: newComputedValY1 must be below the line y
        if ( newComputedValY < ƒthis.lbbMeasureLocationY + ƒthis.beatHeight ) {
          // make an array to find out where the new beat should be added in the beatsCollection of the measure
          var refArray = [];
          for ( i=0 ; i < ƒthis.beatsInMeasure ; i++ ) {
            refArray.push((ƒthis.linearLineLength/ƒthis.beatsInMeasure)*i+ƒthis.beatWidth);
          }
          var newIndex = _.sortedIndex(refArray, parseInt(newComputedValX)+ƒthis.beatFactoryWidth/2);
          console.log(refArray)
          console.log(parseInt(newComputedValX)+ƒthis.beatFactoryWidth/2)
          ƒthis.parentMeasureModel.get('beats').add(new BeatModel({selected:true}), {at: newIndex})
          dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure+1);
        }
      });
      var dragPie = d3.behavior.drag();
      dragPie.on('drag', function() {
        var beatToChange = $('#factory-beat'+ƒthis.cid);
        if(beatToChange.length >= 1) {
          var transformString = beatToChange.attr('transform').substring(10, beatToChange.attr('transform').length-1);
          var comma = transformString.indexOf(',');
          var newX = parseInt(transformString.substr(0,comma));
          var newY = parseInt(transformString.substr(comma+1));
          newX += d3.event.dx;
          newY += d3.event.dy;
          d3.select(this).attr('transform', 'translate(' + [ newX, newY ] + ')');
        }
        
        if ( Math.pow(newX - ƒthis.circularMeasureCx, 2) + Math.pow(newY - ƒthis.circularMeasureCy, 2) <= Math.pow(ƒthis.circularMeasureR,2) ) {
          var center = {x: ƒthis.circularMeasureCx, y:ƒthis.circularMeasureCy};
          //give it two points, the center, and the new beat location, once it is on or inside the circle
          function angle(center, p1) {
            var p0 = {x: center.x, y: center.y - Math.sqrt(Math.abs(p1.x - center.x) * Math.abs(p1.x - center.x)
                    + Math.abs(p1.y - center.y) * Math.abs(p1.y - center.y))};
            return (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x)) * 180 / Math.PI;
          }
          var p1 = {x: newX, y: newY};
          var angleAtNewBeat = angle(center, p1);

          // make an array to find out where the new beat should be added in the beatsCollection of the measure
          var refArray = [];
          for ( i=0 ; i < ƒthis.beatsInMeasure ; i++ ) {
            refArray.push(((360/ƒthis.beatsInMeasure)*i)+((360/ƒthis.beatsInMeasure)/2));
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
            .attr('cx', this.cX)
            .attr('cy', this.cY)
            .attr('r', this.beadRadius)
            // Calling the click handler here doesn't work for some reason
            // .on('click', function(){console.log('beat container click handler')})
            .attr('class', 'factory-beat d3')
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
            .attr('class', 'factory-beat d3')
            .attr('id', 'factory-beat'+this.cid)
            // This is the path that the beat will follow when un/roll is clicked
            // .attr('d', pathFunction)
            .attr('stroke', this.beatColor)
            .attr('stroke-width', 4)
            .attr('opacity', .2)
            .call(dragLine);
      } else if(this.currentRepresentationType == 'pie') {
        var arc = d3.svg.arc()
          .innerRadius(0)
          .outerRadius(this.beatFactoryR)
          .startAngle(160*(Math.PI/180))
          .endAngle(200*(Math.PI/180));
        var beatContainer = d3.select(this.beatFactoryHolderEl);
        var beatPath = beatContainer
          .insert('path', ':first-child')
        // beatPath
          .attr('d', arc)
          .attr('stroke', 'black')
          .attr('opacity', .2)
          .attr('fill', this.beatColor)
          .attr('class', 'factory-beat d3')
          .attr('id', 'factory-beat'+this.cid)
          .attr('transform', 'translate('+this.cX+','+this.cY+')')
          .call(dragPie);
      } else if(this.currentRepresentationType == 'bar') {
        var beatContainer = d3.select(this.beatFactoryHolderEl);
        var beatPath = beatContainer
            .append('rect')
            .attr('x', this.x)
            .attr('y', this.y)
            .attr('width', this.beatFactoryWidth)
            .attr('height', this.beatHeight)
            // Calling the click handler here doesn't work for some reason
            // .on('click', function(){console.log('beat container click handler')})
            .attr('class', 'factory-beat d3')
            .attr('id', 'factory-beat'+this.cid)
            // This is the path that the beat will follow when un/roll is clicked
            // .attr('d', pathFunction)
            .attr('stroke', 'black')
            .attr('fill', this.beatColor)
            .attr('stroke-width', 1)
            .attr('opacity', .2)
            .call(dragBar);
      }
      return this;
    }
  });
  return BeadFactory;
});