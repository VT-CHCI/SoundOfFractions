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
        if (options.secondary){
          this.secondaryClasses = 'secondaryBeat ';
          dispatch.on('beatTransition.event', this.transition, this);
        } else {
          this.secondaryClasses = '';
        }
        this.beatContainer = d3.select(this.beatContainer);
        this.measureBeatHolder = options.parentElHolder;
        this.el = options.singleBeat;
        this.opacity = this.getOpacityNumber(options.opacity);
        this.beatCenterPosition = {};
        this.BEAT;
        // var pathFunction = d3.svg.line()
        //     .x(function (d) {return d.x;})
        //     .y(function (d) {return d.y;})
        //     .interpolate('basis'); // bundle | basis | linear | cardinal are also options
        // this.pathFunction = pathFunction;

        _.bindAll(this, 'toggleModel');
        this.listenTo(this.model, 'change', _.bind(this.toggleOpacity, this));
      } else {
        console.error('should not be in here!');
        this.model = new BeatModel;
      }


      this.listenTo(this.parentMeasureRepModel, 'change:transitions', this.transition, this);

      this.render();
    },

    unRoll: function() {
      console.log('INNER unRoll');
      for (i=0 ; i<this.transitionNumberOfPoints ; i++){
        this.BEAT.data([this.beatBeadToLinePaths[i]])
            .transition()
            .delay(this.transitionDuration*i)
            .duration(this.transitionDuration)
            .ease('linear')
            .attr('cx', this.beatBeadToLinePaths[i].cx)
            .attr('cy', this.beatBeadToLinePaths[i].cy)
      }
    },

    rollUp: function() {
      console.log('rollup');
      var currentBeat = d3.select('.secondaryBeat');
      for(i=0; i<this.transitionNumberOfPoints; i++){
          this.BEAT.data([this.beatLineToBeadPaths[i]])
              .transition()
              .delay(this.transitionDuration*i)
              .duration(this.transitionDuration)
              .ease('linear')
              .attr('cx', this.beatLineToBeadPaths[i].cx)
              .attr('cy', this.beatLineToBeadPaths[i].cy)
      }
    },
    rollUpLines: function() {
      console.log('rollup');
      // var currentBeat = d3.select('.secondaryBeat');
      console.warn(this);
      for(i=0; i<this.transitionNumberOfPoints; i++){
          var x = this.transitionNumberOfPoints-i;
          this.BEAT.data([this.lineStatesRollup[i]])
              .transition()
              .delay(this.transitionDuration*i)
              .duration(this.transitionDuration)
              .ease('linear')
              .attr('d', this.pathFunction)
      }
    },
    unrollLines: function() {
      console.log('unroll');
      // var currentBeat = d3.select('.secondaryBeat');
      console.warn(this);
      for(i=0; i<this.transitionNumberOfPoints; i++){
          var x = this.transitionNumberOfPoints-i;
          this.BEAT.data([this.lineStatesUnrolling[i]])
              .transition()
              .delay(this.transitionDuration*i)
              .duration(this.transitionDuration)
              .ease('linear')
              .attr('d', this.pathFunction)
      }
    },

    //We use css classes to control the color of the beat.
    render: function(){
      var ¥this = this;

      // x center of a bead or first x of pie piece
      if (this.currentRepresentationType == 'pie') {
        this.x1 = this.circularMeasureCx + this.circularMeasureR * Math.cos(Math.PI * this.beatStartAngle/180); 
      } else if (this.currentRepresentationType == 'bead') {
        if (this.reverse == true) {
          this.x1 = this.circleStates[this.transitionNumberOfPoints-1][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.transitionNumberOfPoints))].x;
        } else {
          this.x1 = this.circleStates[0][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.transitionNumberOfPoints))].x;
        }
      }
      // y center of a bead or first y of a pie piece
      if (this.currentRepresentationType == 'pie') {
        this.y1 = this.circularMeasureCy + this.circularMeasureR * Math.sin(Math.PI * this.beatStartAngle/180);     
      } else if (this.currentRepresentationType == 'bead') {
        if (this.reverse == true) {
          this.y1 = this.circleStates[this.transitionNumberOfPoints-1][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.transitionNumberOfPoints))].y;
        } else {
          this.y1 = this.circleStates[0][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.transitionNumberOfPoints))].y;
        }
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
      for (i=0; i<this.circleStates.length; i++){
        var circleState = $.map(Array(¥this.transitionNumberOfPoints), function (d, j) {
          var cx = (¥this.circleStates[i][Math.floor((¥this.beatIndex/¥this.beatsInMeasure)*(¥this.transitionNumberOfPoints))].x) + ¥this.circularBeadBeatRadius * Math.sin(2 * j * Math.PI / (¥this.transitionNumberOfPoints - 1));

        //circle portion
        // var circleState = $.map(Array(¥this.transitionNumberOfPoints), function (d, j) {
          // var cx = ¥this.circularMeasureCx + ¥this.lineDivision*i + ¥this.circularMeasureR * Math.sin(2 * j * Math.PI / (¥this.transitionNumberOfPoints - 1));
          var cy = ¥this.circularMeasureCy - ¥this.circularMeasureR * Math.cos(2 * j * Math.PI / (¥this.transitionNumberOfPoints - 1));
          return { cx: cx, cy: cy};
        });
        circleState.splice(¥this.transitionNumberOfPoints-i);
        //line portion
        var lineState = $.map(Array(¥this.transitionNumberOfPoints), function (d, j) {
          var cx = ¥this.circularMeasureCx + ¥this.lineDivision*j;
          var cy =  ¥this.circularMeasureCy - ¥this.circularMeasureR;
          return { cx: cx, cy: cy};
        });
        lineState.splice(i);
        //together
        var individualState = lineState.concat(circleState);
        this.beatUnwindingPaths.push(individualState);
      };
      
      // Before transition
      //   to line                          to bead
      //   Bead Positions should be         Line Positions should be
      //   125       49                       125        49
      //   176.6110  75.2879                  178.4070   49
      //   175.0163  127.3026                 231.8141   49
      //   121.8598  150.9277                 285.2212   49
      //   71.9405   122.3026                 338.6283   49
      //   76.7201   70.685                   392.0353   49

      // Normal
      //   Bead Positions should be         Line Positions should be
      //      125       49                    15        50
      //      169.6129  75.2879               68.4070   50
      //      168.2344  127.0514              121.8141  50
      //      122.2856  150.9277              175.2212  50
      //      79.1350   122.3026              228.6283  50
      //      83.2665   70.6858               282.0353  50

      this.beatBeadToLinePaths = [];
      this.beatLineToBeadPaths = [];
      for (i=0; i<this.circleStates.length; i++){
        var beatCoordinatesAlongTransition = [];
          beatCoordinatesAlongTransition.cx = (¥this.beatUnwindingPaths[i][Math.floor((¥this.beatIndex/¥this.beatsInMeasure)*(¥this.transitionNumberOfPoints))].cx);
          beatCoordinatesAlongTransition.cy = (¥this.beatUnwindingPaths[i][Math.floor((¥this.beatIndex/¥this.beatsInMeasure)*(¥this.transitionNumberOfPoints))].cy);
        this.beatBeadToLinePaths.push(beatCoordinatesAlongTransition);
        this.beatLineToBeadPaths.unshift(beatCoordinatesAlongTransition);
      };

      var margin = this.margin;
      var lineData = $.map(Array(this.transitionNumberOfPoints), function (d, i) {
          var y = margin.top;
          var x = margin.left + i * this.linearLineLength / (this.transitionNumberOfPoints - 1)
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
        ¥this = this;
        dragBead.on("drag", function() {
          ¥this = ¥this;
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
            if ( Math.pow(newComputedValX - ¥this.circularMeasureCx, 2) + Math.pow(newComputedValY - ¥this.circularMeasureCy, 2) > Math.pow(¥this.circularMeasureR+15,2) ) {
              d3.select(this).remove();
              console.warn('removed beat on measure');
              ¥this.parentMeasureModel.get('beats').remove(¥this.model);
              dispatch.trigger('signatureChange.event', ¥this.beatsInMeasure-1);
            }
        });
      }
      var dragLine = d3.behavior.drag();
      if (this.beatsInMeasure > 1) {
        ¥this = this;
        dragLine.on('drag', function(d) {
          ¥this = ¥this;
          var newSettingX1 = parseInt(d3.select(this).attr("x1")) + parseInt(d3.event.dx);
          var newSettingY1 = parseInt(d3.select(this).attr("y1")) + parseInt(d3.event.dy);
          var newSettingX2 = parseInt(d3.select(this).attr("x2")) + parseInt(d3.event.dx);
          var newSettingY2 = parseInt(d3.select(this).attr("y2")) + parseInt(d3.event.dy);
          d3.select(this).attr("x1", newSettingX1);
          d3.select(this).attr("y1", newSettingY1);
          d3.select(this).attr("x2", newSettingX2);
          d3.select(this).attr("y2", newSettingY2);
          var newCenterX1 = d3.select(this).attr('x1');
          var newCenterY1 = parseInt(d3.select(this).attr('y1')) + parseInt(¥this.lineHashHeight/2);
          // Above: newCenterY1 < ¥this.numberLineY
          // AboveByN: newCenterY1 < ¥this.numberLineY - N
          // On : newCenterY1 = ¥this.numberLineY
          // Below: newCenterY1 > ¥this.numberLineY
          // BelowByN: newCenterY1 > ¥this.numberLineY + N
          if ((newCenterY1 < ¥this.numberLineY - 20) || (newCenterY1 > ¥this.numberLineY + 20)) {
            // make an array to find out where the new beat should be added in the beatsCollection of the measure
            d3.select(this).remove();
            console.warn('removed beat on measure');
            ¥this.parentMeasureModel.get('beats').remove(¥this.model);
            dispatch.trigger('signatureChange.event', ¥this.beatsInMeasure-1);
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
        if ((newComputedValY < ¥this.lbbMeasureLocationY - ¥this.beatHeight - 2) || (newComputedValY > ¥this.lbbMeasureLocationY + ¥this.beatHeight + 2)) {
        // make an array to find out where the new beat should be added in the beatsCollection of the measure
          d3.select(this).remove();
          console.warn('removed beat on measure');
          ¥this.parentMeasureModel.get('beats').remove(¥this.model);
          dispatch.trigger('signatureChange.event', ¥this.beatsInMeasure-1);
        }
      });
      var dragSlice = d3.behavior.drag();
      if (this.beatsInMeasure > 1) {
        ¥this = this;
        dragSlice.on("drag", function() {
          var beatToChange = $('#beat'+¥this.cid);
          var transformString = beatToChange.attr('transform').substring(10, beatToChange.attr('transform').length-1);
          var comma = transformString.indexOf(',');
          var newX = parseInt(transformString.substr(0,comma));
          var newY = parseInt(transformString.substr(comma+1));
          newX += d3.event.dx;
          newY += d3.event.dy;
          var relativeSVGX = newX + ¥this.circularMeasureCx;
          var relativeSVGY = newX + ¥this.circularMeasureCy;
          d3.select(this).attr('transform', 'translate(' + [ newX, newY ] + ')');
          // x and y must satisfy (x - center_x)^2 + (y - center_y)^2 >= radius^2
          if ( Math.pow(relativeSVGX - ¥this.circularMeasureCx, 2) + Math.pow(relativeSVGY - ¥this.circularMeasureCy, 2) >= Math.pow(¥this.circularMeasureR, 2) ) {
            d3.select(this).remove();
            ¥this.parentMeasureModel.get('beats').remove(¥this.model);
            dispatch.trigger('signatureChange.event', ¥this.beatsInMeasure-1);
          }
        });
      }
      
      if (this.currentRepresentationType == 'bead') {
        this.BEAT = this.beatContainer
            .append('circle')
            .attr('id', 'beat'+this.cid)
            .attr('class', this.secondaryClasses + 'beat d3 bead-beat')
            .attr('cx', this.x1)
            .attr('cy', this.y1)
            .attr('r', this.circularBeadBeatRadius)
            .attr('transform', 'translate(0,0)')
            // This is the path that the beat will follow when un/roll is clicked
            .data([this.beatUnwindingPaths[0]])
            .attr('fill', COLORS.hexColors[this.color])
            .attr('stroke', 'black')
            .style('opacity', this.getOpacityNumber(this.model.get('selected')))
            // Calling the click handler here doesn't work for some reason
            // .on('click', function(){console.log('beat container click handler')})
            .call(dragBead);

        this.BEAT.on('click', this.toggleModel);
      } else if (this.currentRepresentationType == 'line'){
        this.BEAT = this.beatContainer
            .append('line')
            .attr('id', 'beat'+this.cid)
            .attr('class', this.secondaryClasses + 'beat d3 line-beat')
            .attr('x1', this.X1)
            .attr('y1', this.Y1)
            .attr('x2', this.X2)
            .attr('y2', this.Y2)
            .attr('stroke', COLORS.hexColors[this.color])
            .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
            .attr('stroke-width', 4)
            .call(dragLine);

        this.BEAT.on('click', this.toggleModel);
      } else if (this.currentRepresentationType == 'lineRolling'){
        // console.error(this.lineStatesUnrolling);
        this.beatContainer
          // .attr('transform', 'translate('+this.circularMeasureCx+','+this.circularMeasureCy+')')

        this.BEAT = this.beatContainer
          .append('path', ':first-child')
        // BEAT
          .attr('id', 'beat'+this.cid)
          .attr('class', this.secondaryClasses + 'beat d3 lineRolling')
          .data([this.lineStatesUnrolling[this.lineStatesUnrolling.length-1]])
          .attr('d', this.pathFunction)
          // .attr('d', this.lineStatesUnrolling[this.lineStatesUnrolling.length])
          .attr('stroke', COLORS.hexColors[this.color])
          .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
          .attr('stroke-width', 4)
          // .attr('fill', COLORS.hexColors[this.color])
          .attr('transform', 'translate(0,0)') ;
      } else if (this.currentRepresentationType == 'lineUnrolling'){
        // console.error(this.lineStatesUnrolling);
        this.beatContainer
          // .attr('transform', 'translate('+this.circularMeasureCx+','+this.circularMeasureCy+')')

        this.BEAT = this.beatContainer
          .append('path', ':first-child')
        // BEAT
          .attr('id', 'beat'+this.cid)
          .attr('class', this.secondaryClasses + 'beat d3 lineRolling')
          .data([this.lineStatesRollup[this.lineStatesUnrolling.length-1]])
          .attr('d', this.pathFunction)
          // .attr('d', this.lineStatesUnrolling[this.lineStatesUnrolling.length])
          .attr('stroke', COLORS.hexColors[this.color])
          .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
          .attr('stroke-width', 4)
          // .attr('fill', COLORS.hexColors[this.color])
          .attr('transform', 'translate(0,0)') ;
      } else if (this.currentRepresentationType == 'pie'){
        var arc = d3.svg.arc()
          .innerRadius(0)
          .outerRadius(this.circularMeasureR)
          .startAngle(this.beatStartAngle*(Math.PI/180))
          .endAngle((this.beatStartAngle + this.beatAngle)*(Math.PI/180))
        this.beatContainer
          .attr('transform', 'translate('+this.circularMeasureCx+','+this.circularMeasureCy+')')
        this.BEAT = this.beatContainer
          .append('path', ':first-child')
        // BEAT
          .attr('id', 'beat'+this.cid)
          .attr('class', this.secondaryClasses + 'beat d3 pie-beat')
          .attr('d', arc)
          .attr('stroke', 'black')
          .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
          .attr('fill', COLORS.hexColors[this.color])
          .attr('transform', 'translate(0,0)')
          .call(dragSlice);
        this.BEAT.on('click', this.toggleModel);
      } else if (this.currentRepresentationType == 'audio'){
        this.BEAT = this.beatContainer
            .insert('circle', ':first-child')
            .attr('id', 'beat'+this.cid)
            .attr('class', this.secondaryClasses + 'beat d3 audio-beat')
            .attr('cx', this.audioMeasureCx)
            .attr('cy', this.audioMeasureCy)
            .attr('r', this.audioMeasureR)
            .attr('fill', this.colorForAudio)
            .attr('opacity', this.opacityForAudio)
            .attr('transform', 'translate(0,0)')
            // NO click handler to prevent the user from editing in the audio Rep
      } else if (this.currentRepresentationType == 'bar'){
        this.BEAT = this.beatContainer
            .append('rect')
            .attr('id', 'beat'+this.cid)
            .attr('class', this.secondaryClasses + 'beat d3 bar-beat')
            .attr('x', this.beatBBX)
            .attr('y', this.beatBBY)
            .attr('width', this.beatWidth)
            .attr('height', this.beatHeight)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
            .attr('fill', COLORS.hexColors[this.color])
            .call(dragBar);

        this.BEAT.on('click', this.toggleModel);
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
          this.unRoll();
        } else if(this.parentMeasureRepModel.get('representationType') == 'pie'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bar'){
          this.unRoll();
        }
      } else if(this.parentMeasureRepModel.get('previousRepresentationType') == 'line'){
        if (this.parentMeasureRepModel.get('representationType') == 'audio'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bead'){
          this.rollUp();
        } else if(this.parentMeasureRepModel.get('representationType') == 'line'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'pie'){
          this.rollUpLines();
        } else if(this.parentMeasureRepModel.get('representationType') == 'bar'){
        }
      } else if(this.parentMeasureRepModel.get('previousRepresentationType') == 'pie'){
        if (this.parentMeasureRepModel.get('representationType') == 'audio'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bead'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'line'){
          this.unrollLines();
        } else if(this.parentMeasureRepModel.get('representationType') == 'pie'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bar'){
        }
      } else if(this.parentMeasureRepModel.get('previousRepresentationType') == 'bar'){
        if (this.parentMeasureRepModel.get('representationType') == 'audio'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bead'){
          this.rollUp();
        } else if(this.parentMeasureRepModel.get('representationType') == 'line'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'pie'){
        } else if(this.parentMeasureRepModel.get('representationType') == 'bar'){
        }
      }
    }
  });
});