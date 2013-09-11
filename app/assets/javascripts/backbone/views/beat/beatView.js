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
  'colors',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, COLORS, dispatch, log){
  return Backbone.View.extend({
    // registering backbone's click event to our toggle() function.
     events : {
       'click' : 'toggleModel'
     },
    //The constructor takes options because these views are created
    //by measuresView objects.
    initialize: function(options){
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
        this.measureBeatHolder = options.parentElHolder;
        this.el = options.singleBeat;
        this.opacity = this.getOpacityNumber(options.opacity);
        this.beatCenterPosition = {};
        this.beatNumberOfPoints = this.measureNumberOfPoints;

        _.bindAll(this, 'toggleModel');
        this.listenTo(this.model, 'change', _.bind(this.toggleOpacity, this));
      } else {
        console.error('should not be in here!');
        this.model = new BeatModel;
      }

      this.listenTo(this.parentMeasureRepModel, 'change', _.bind(this.transition, this));

      this.render();
    },

    unroll: function() {
      console.log('INNER UNROLL');
      for (i=0 ; i<this.beatNumberOfPoints ; i++){
        this.beatPath.data([this.finalBeatUnwindingPaths[i]])
            .transition()
            .delay(this.transitionDuration*i)
            .duration(this.transitionDuration)
            .ease('linear')
            .attr('cx', this.finalBeatUnwindingPaths[i].cx)
            .attr('cy', this.finalBeatUnwindingPaths[i].cy)
      }
    },

    //We use css classes to control the color of the beat.
    render: function(){
      var ƒthis = this;

      // x center of a bead or first x of pie piece
      if (this.currentRepresentationType == 'pie') {
        this.x1 = this.circularMeasureCx + this.circularMeasureR * Math.cos(Math.PI * this.beatStartAngle/180); 
      } else if (this.currentRepresentationType == 'bead') {
        this.x1 = this.circleStates[0][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.measureNumberOfPoints))].x;
      }
      // y center of a bead or first y of a pie piece
      if (this.currentRepresentationType == 'pie') {
        this.y1 = this.circularMeasureCy + this.circularMeasureR * Math.sin(Math.PI * this.beatStartAngle/180);     
      } else if (this.currentRepresentationType == 'bead') {
        this.y1 = this.circleStates[0][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.measureNumberOfPoints))].y;
      }
      // the second x point of a pie piece
      this.x2 = this.circularMeasureCx + this.circularMeasureR * Math.cos(Math.PI * this.beatEndAngle/180);
      // the second y point of a pie piece
      this.y2 = this.circularMeasureCy + this.circularMeasureR * Math.sin(Math.PI * this.beatEndAngle/180);

      this.beatCenterPosition = {
        x: this.x1,
        y: this.y1
      };

      //Circular Bead

      this.beatUnwindingPaths = [];
      this.finalBeatUnwindingPaths = []
      for (i=0; i<this.circleStates.length; i++){
        var circleState = $.map(Array(ƒthis.beatNumberOfPoints), function (d, j) {
          var cx = (ƒthis.circleStates[i][Math.floor((ƒthis.beatIndex/ƒthis.beatsInMeasure)*(ƒthis.measureNumberOfPoints))].x) + ƒthis.circularBeadBeatRadius * Math.sin(2 * j * Math.PI / (ƒthis.beatNumberOfPoints - 1));

        //circle portion
        // var circleState = $.map(Array(ƒthis.beatNumberOfPoints), function (d, j) {
          // var cx = ƒthis.circularMeasureCx + ƒthis.lineDivision*i + ƒthis.circularMeasureR * Math.sin(2 * j * Math.PI / (ƒthis.beatNumberOfPoints - 1));
          var cy = ƒthis.circularMeasureCy - ƒthis.circularMeasureR * Math.cos(2 * j * Math.PI / (ƒthis.beatNumberOfPoints - 1));
          return { cx: cx, cy: cy};
        });
        circleState.splice(ƒthis.beatNumberOfPoints-i);
        //line portion
        var lineState = $.map(Array(ƒthis.beatNumberOfPoints), function (d, j) {
          var cx = ƒthis.circularMeasureCx + ƒthis.lineDivision*j;
          var cy =  ƒthis.circularMeasureCy - ƒthis.circularMeasureR;
          return { cx: cx, cy: cy};
        });
        lineState.splice(i);
        //together
        var individualState = lineState.concat(circleState);
        this.beatUnwindingPaths.push(individualState);
      };

      for (i=0; i<this.circleStates.length; i++){
        var computedBeatCoordinates = [];
          // var cx = (ƒthis.beatUnwindingPaths[i][Math.floor((ƒthis.beatIndex/ƒthis.beatsInMeasure)*(ƒthis.measureNumberOfPoints))].cx);
          computedBeatCoordinates.cx = (ƒthis.beatUnwindingPaths[i][Math.floor((ƒthis.beatIndex/ƒthis.beatsInMeasure)*(ƒthis.measureNumberOfPoints))].cx);
          // margin.top + beatR
          computedBeatCoordinates.cy = (ƒthis.beatUnwindingPaths[i][Math.floor((ƒthis.beatIndex/ƒthis.beatsInMeasure)*(ƒthis.measureNumberOfPoints))].cy);
        this.finalBeatUnwindingPaths.push(computedBeatCoordinates);
      };

      window.csf = this.finalBeatUnwindingPaths;

      var margin = this.margin;
      var lineData = $.map(Array(this.measureNumberOfPoints), function (d, i) {
          var y = margin.top;
          var x = margin.left + i * this.linearLineLength / (this.measureNumberOfPoints - 1)
          return {x: x, y: y}
      });
      var pathFunction = d3.svg.line()
          .x(function (d) {return d.x;})
          .y(function (d) {return d.y;})
          .interpolate('basis'); // bundle | basis | linear | cardinal are also options
      this.pathFunction = pathFunction;

      var dragBead = d3.behavior.drag();
      // to prevent the dragging of a one beat measure
      if (this.beatsInMeasure > 1) {
        ƒthis = this;
        dragBead.on("drag", function() {
          ƒthis = ƒthis;
            // console.log(parseInt(d3.select(this).attr("cx")) + ' <:> ' + parseInt(d3.select(this).attr("cy")));
            // console.log(d3.event.dx + ' : ' + d3.event.dy);
          // Formula for circle beats, utilizing cx and cy
            //                        |-----Current Value--------|   |-----Delta value----\
            var newSettingX = parseInt(d3.select(this).attr("cx")) + parseInt(d3.event.dx);
            var newSettingY = parseInt(d3.select(this).attr("cy")) + parseInt(d3.event.dy);
            d3.select(this).attr("cx", newSettingX);
            d3.select(this).attr("cy", newSettingY);
            var newComputedValX = d3.select(this).attr('cx');
            var newComputedValY = d3.select(this).attr('cy');
            // Inside: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 < radius^2
            // Outside: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 > radius^2
            // On: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 == radius^2
            if ( Math.pow(newComputedValX - ƒthis.circularMeasureCx, 2) + Math.pow(newComputedValY - ƒthis.circularMeasureCy, 2) > Math.pow(ƒthis.circularMeasureR+15,2) ) {
              d3.select(this).remove();
              console.warn('removed beat on measure');
              ƒthis.parentMeasureModel.get('beats').remove(ƒthis.model);
              dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure-1);
            }
        });
      }

      var dragLine = d3.behavior.drag();
      if (this.beatsInMeasure > 1) {
        ƒthis = this;
        dragLine.on('drag', function(d) {
          ƒthis = ƒthis;
          var newSettingX1 = parseInt(d3.select(this).attr("x1")) + parseInt(d3.event.dx);
          var newSettingY1 = parseInt(d3.select(this).attr("y1")) + parseInt(d3.event.dy);
          var newSettingX2 = parseInt(d3.select(this).attr("x2")) + parseInt(d3.event.dx);
          var newSettingY2 = parseInt(d3.select(this).attr("y2")) + parseInt(d3.event.dy);
          d3.select(this).attr("x1", newSettingX1);
          d3.select(this).attr("y1", newSettingY1);
          d3.select(this).attr("x2", newSettingX2);
          d3.select(this).attr("y2", newSettingY2);
          var newCenterX1 = d3.select(this).attr('x1');
          var newCenterY1 = parseInt(d3.select(this).attr('y1')) + parseInt(ƒthis.lineHashHeight/2);
          // Above: newCenterY1 < ƒthis.numberLineY
          // AboveByN: newCenterY1 < ƒthis.numberLineY - N
          // On : newCenterY1 = ƒthis.numberLineY
          // Below: newCenterY1 > ƒthis.numberLineY
          // BelowByN: newCenterY1 > ƒthis.numberLineY + N
          if ((newCenterY1 < ƒthis.numberLineY - 20) || (newCenterY1 > ƒthis.numberLineY + 20)) {
            // make an array to find out where the new beat should be added in the beatsCollection of the measure
            d3.select(this).remove();
            console.warn('removed beat on measure');
            ƒthis.parentMeasureModel.get('beats').remove(ƒthis.model);
            dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure-1);
          }
        });
      }
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
        if ((newComputedValY < ƒthis.lbbMeasureLocationY - ƒthis.beatHeight - 2) || (newComputedValY > ƒthis.lbbMeasureLocationY + ƒthis.beatHeight + 2)) {
        // make an array to find out where the new beat should be added in the beatsCollection of the measure
          d3.select(this).remove();
          console.warn('removed beat on measure');
          ƒthis.parentMeasureModel.get('beats').remove(ƒthis.model);
          dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure-1);
        }
      });
      var dragSlice = d3.behavior.drag();
      if (this.beatsInMeasure > 1) {
        ƒthis = this;
        dragSlice.on("drag", function() {
          var beatToChange = $('#beat'+ƒthis.cid);
          var transformString = beatToChange.attr('transform').substring(10, beatToChange.attr('transform').length-1);
          var comma = transformString.indexOf(',');
          var newX = parseInt(transformString.substr(0,comma));
          var newY = parseInt(transformString.substr(comma+1));
          newX += d3.event.dx;
          newY += d3.event.dy;
          var relativeSVGX = newX + ƒthis.circularMeasureCx;
          var relativeSVGY = newX + ƒthis.circularMeasureCy;
          d3.select(this).attr('transform', 'translate(' + [ newX, newY ] + ')');
          // x and y must satisfy (x - center_x)^2 + (y - center_y)^2 >= radius^2
          if ( Math.pow(relativeSVGX - ƒthis.circularMeasureCx, 2) + Math.pow(relativeSVGY - ƒthis.circularMeasureCy, 2) >= Math.pow(ƒthis.circularMeasureR, 2) ) {
            d3.select(this).remove();
            ƒthis.parentMeasureModel.get('beats').remove(ƒthis.model);
            dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure-2);
          }
        });
      }

      if (this.currentRepresentationType == 'bead') {
        var beatContainer = d3.select('#beat-holder-'+this.parentMeasureRepModel.cid);
        var beatPath = beatContainer
            .append('circle')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'beat d3 bead-beat')
            .attr('cx', this.x1)
            .attr('cy', this.y1)
            .attr('r', this.circularBeadBeatRadius)
            // Calling the click handler here doesn't work for some reason
            // .on('click', function(){console.log('beat container click handler')})
            .attr('transform', 'translate(0,0)')
            // This is the path that the beat will follow when un/roll is clicked
            .data([this.beatUnwindingPaths[0]])
            // .attr('d', pathFunction)
            .attr('fill', COLORS.hexColors[this.color])
            .attr('stroke', 'black')
            .style('opacity', this.getOpacityNumber(this.model.get('selected')))
            .call(dragBead);

        this.beatPath = beatPath;
        this.beatPath.on('click', this.toggleModel);

        function reverse() {
          for(i=0; i<ƒthis.measureNumberOfPoints; i++){
              beatPath.data([this.beatUnwindingPaths[ƒthis.measureNumberOfPoints-1-i]])
                  .transition()
                  .delay(ƒthis.transitionDuration*i)
                  .duration(ƒthis.transitionDuration)
                  .ease('linear')
                  .attr('d', pathFunction);
          }
        };

      } else if (this.currentRepresentationType == 'line'){
        var beatContainer = d3.select('#beat-holder-'+this.parentMeasureRepModel.cid);
        var beatPath = beatContainer
            .append('line')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'beat d3 line-beat')
            .attr('x1', this.X1)
            .attr('y1', this.Y1)
            .attr('x2', this.X2)
            .attr('y2', this.Y2)
            // This is the path that the beat will follow when un/roll is clicked
            // .attr('d', pathFunction)
            .attr('stroke', COLORS.hexColors[this.color])
            .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
            .attr('stroke-width', 4)
            .call(dragLine);
        this.beatPath = beatPath;
        this.beatPath.on('click', this.toggleModel);

      } else if (this.currentRepresentationType == 'pie'){
        var arc = d3.svg.arc()
          .innerRadius(0)
          .outerRadius(this.circularMeasureR)
          .startAngle(this.beatStartAngle*(Math.PI/180))
          .endAngle((this.beatStartAngle + this.beatAngle)*(Math.PI/180))
        var beatContainer = d3.select('#beat-holder-'+this.parentMeasureRepModel.cid)
          .attr('transform', 'translate('+this.circularMeasureCx+','+this.circularMeasureCy+')')
        var beatPath = beatContainer
          .append('path', ':first-child')
        // beatPath
          .attr('id', 'beat'+this.cid)
          .attr('class', 'beat d3 pie-beat')
          .attr('d', arc)
          .attr('stroke', 'black')
          .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
          .attr('fill', COLORS.hexColors[this.color])
          .attr('transform', 'translate(0,0)')
          .call(dragSlice);
          // .attr('class', 'pie-beat')
        this.beatPath = beatPath;
        this.beatPath.on('click', this.toggleModel);

      } else if (this.currentRepresentationType == 'audio'){
        var svgContainer = d3.select('#beat-holder-'+this.parentMeasureRepModel.cid)
        var circlePath = svgContainer
            .insert('circle', ':first-child')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'beat d3 audio-beat')
            .attr('cx', this.audioMeasureCx)
            .attr('cy', this.audioMeasureCy)
            .attr('r', this.audioMeasureR)
            .attr('fill', this.colorForAudio)
            .attr('opacity', this.opacityForAudio)
            .attr('transform', 'translate(0,0)')
            // NO click handler to prevent the user from editing in the audio Rep

      } else if (this.currentRepresentationType == 'bar'){
        var svgContainer = d3.select('#beat-holder-'+this.parentMeasureRepModel.cid)
        var beatPath = svgContainer
            .append('rect')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'beat d3 bar-beat')
            .attr('x', this.beatBBX)
            .attr('y', this.beatBBY)
            .attr('width', this.beatWidth)
            .attr('height', this.beatHeight)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
            .attr('fill', COLORS.hexColors[this.color])
            .call(dragBar);
        this.beatPath = beatPath;
        this.beatPath.on('click', this.toggleModel);
      }
      return this;
    },

    changeBeatRepresentation: function(representation) {
      this.previousRepresentationType = this.currentRepresentationType;
      this.currentRepresentationType = representation;
    },

    // Depricated
    // sets the Color based on CSS between selected and not-selected
    getSelectionBooleanCSS: function(){
      if (this.model.get('selected')) {
        return 'ON';
      } else {
        return 'OFF';
      }
    },

    // sets the opacity between selected and not-selected
    getOpacityNumber : function(bool) {
      if(this.currentRepresentationType == 'audio'){
        return 0.2/this.beatsInMeasure;
      } else {
        if (bool == true) {
          // Selected
          return 1;
        } else {
          // Not-Selected
          return 0.2;
        }
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
    toggleModel: function(){
      //switch the selected boolean value on the model
      this.model.set('selected', !this.model.get('selected'));
      // log.sendLog([[1, "beat" + this.model.cid + " toggled: "+!bool]]);
    },
    toggleOpacity: function() {
      // re-rendering all beats, think it should only rerender itself, but w/e
      d3.select('#beat'+this.cid).style('opacity', this.getOpacityNumber(this.model.get('selected')))
    },
    transition: function(){
      if (this.parentMeasureRepModel.get('previousRepresentationType') == 'audio'){
        if (this.parentMeasureRepModel.get('representationType') == 'audio'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bead'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'line'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'pie'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bar'){
        }
      } else if(this.parentMeasureRepModel.get('previousRepresentationType') == 'bead'){
        if (this.parentMeasureRepModel.get('representationType') == 'audio'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bead'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'line'){
          this.unroll();
        } else if(this.parentMeasureRepModel.get('representationType') == 'pie'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bar'){
        }
      } else if(this.parentMeasureRepModel.get('previousRepresentationType') == 'line'){
        if (this.parentMeasureRepModel.get('representationType') == 'audio'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bead'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'line'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'pie'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bar'){
        }
      } else if(this.parentMeasureRepModel.get('previousRepresentationType') == 'pie'){
        if (this.parentMeasureRepModel.get('representationType') == 'audio'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bead'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'line'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'pie'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bar'){
        }
      } else if(this.parentMeasureRepModel.get('previousRepresentationType') == 'bar'){
        if (this.parentMeasureRepModel.get('representationType') == 'audio'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bead'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'line'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'pie'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bar'){
        }
      }
    }
  });
});