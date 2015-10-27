//filename: views/beats/beatView.js
/*
  This is the view for a single beat, which
  is contained in a measure view.
*/
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/models/beat',
  'colors',
  'logging'
], function($, _, Backbone, BeatModel, COLORS, Logging){
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
        this.pathFunction = d3.svg.line()
            .x(function (d) {return d.x;})
            .y(function (d) {return d.y;})
            .interpolate('basis'); // bundle | basis | linear | cardinal are also options

        this.beatContainer = d3.select(this.beatContainer);

        this.opacity = this.getOpacityNumber(options.opacity);
        // this.beatCenterPosition = {};

        // _.bindAll(this, 'toggleModel');
        this.listenTo(this.model, 'change', _.bind(this.toggleProperties, this));

        this.listenTo(this.parentMeasureRepView, 'beatTransition', this.transition, this);
      } else {
        console.error('beatView(init): should not be in here!');
      }

      // this.listenTo(this.parentMeasureRepModel, 'change:transitions', this.transition, this);

      this.render();
    },
    // the function that handles unrolling of beads
    unRoll: function() {
      for (i=0 ; i<this.parentMeasureRepModel.get('transitionNumberOfPoints') ; i++){
        this.BEAT.data([this.beatBeadToLinePaths[i]])
            .transition()
            .delay(this.parentMeasureRepModel.get('transitionDuration')*i)
            .duration(this.parentMeasureRepModel.get('transitionDuration'))
            .ease('linear')
            .attr('cx', this.beatBeadToLinePaths[i].cx)
            .attr('cy', this.beatBeadToLinePaths[i].cy)
      }
    },
    // the function that handles rolling up of beads
    rollUp: function() {
      var currentBeat = d3.select('.secondaryBeat');
      for(i=0; i<this.parentMeasureRepModel.get('transitionNumberOfPoints'); i++){
          this.BEAT.data([this.beatLineToBeadPaths[i]])
              .transition()
              .delay(this.parentMeasureRepModel.get('transitionDuration')*i)
              .duration(this.parentMeasureRepModel.get('transitionDuration'))
              .ease('linear')
              .attr('cx', this.beatLineToBeadPaths[i].cx)
              .attr('cy', this.beatLineToBeadPaths[i].cy)
      }
    },
    // the function that handles unrolling of colored lines
    unrollLines: function() {
      // var currentBeat = d3.select('.secondaryBeat');
      for(i=0; i<this.parentMeasureModel.get('transitionNumberOfPoints'); i++){
          var x = this.parentMeasureModel.get('transitionNumberOfPoints')-i;
          this.BEAT.data([this.lineStatesUnrolling[i]])
              .transition()
              .delay(this.parentMeasureModel.get('transitionDuration')*i)
              .duration(this.parentMeasureModel.get('transitionDuration'))
              .ease('linear')
              .attr('d', this.pathFunction);
      }
    },
    // the function that handles rolling up of colored lines
    rollUpLines: function() {
      // var currentBeat = d3.select('.secondaryBeat');
      for(i=0; i<this.parentMeasureRepModel.get('transitionNumberOfPoints'); i++){
          var x = this.parentMeasureRepModel.get('transitionNumberOfPoints')-i;
          this.BEAT.data([this.lineStatesRollup[i]])
              .transition()
              .delay(this.parentMeasureRepModel.get('transitionDuration')*i)
              .duration(this.parentMeasureRepModel.get('transitionDuration'))
              .ease('linear')
              .attr('d', this.pathFunction);
      }
    },

    //We use css classes to control the color of the beat.
    render: function(){
      var µthis = this;
      // x center of a bead or first x of pie piece
      if (this.parentMeasureRepModel.get('currentRepresentationType') == 'pie') {
        this.x1 = this.circularMeasureCx + this.circularMeasureR * Math.cos(Math.PI * this.beatStartAngle/180); 
      } else if (this.parentMeasureRepModel.get('currentRepresentationType') == 'bead') {
        if (this.reverse == true) {
          this.x1 = this.parentMeasureRepModel.get('circleStates')[(this.parentMeasureRepModel.get('transitionNumberOfPoints')-1)][Math.floor((this.beatIndex/this.parentMeasureModel.get('beats').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].x;
        } else {
          this.x1 = this.parentMeasureRepModel.get('circleStates')[0][Math.floor((this.beatIndex/this.parentMeasureModel.get('beatsCollection').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].x;
        }
      }
      // y center of a bead or first y of a pie piece
      if (this.parentMeasureRepModel.get('currentRepresentationType') == 'pie') {
        this.y1 = this.circularMeasureCy + this.circularMeasureR * Math.sin(Math.PI * this.beatStartAngle/180);     
      } else if (this.parentMeasureRepModel.get('currentRepresentationType') == 'bead') {
        if (this.reverse == true) {
          this.y1 = this.parentMeasureRepModel.get('circleStates')[this.parentMeasureRepModel.get('transitionNumberOfPoints')-1][Math.floor((this.beatIndex/this.parentMeasureModel.get('beats').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].y;
        } else {
          this.y1 = this.parentMeasureRepModel.get('circleStates')[0][Math.floor((this.beatIndex/this.parentMeasureModel.get('beatsCollection').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].y;
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
      for (i=0; i<this.parentMeasureRepModel.get('circleStates').length; i++){
        var circleState = $.map(Array(this.parentMeasureRepModel.get('transitionNumberOfPoints')), function (d, j) {
          var cx = (µthis.parentMeasureRepModel.get('circleStates')[i][Math.floor((µthis.beatIndex/µthis.parentMeasureModel.get('beatsCollection').models.length)*(µthis.parentMeasureRepModel.get('transitionNumberOfPoints')))].x) + µthis.parentMeasureRepModel.get('circularBeadBeatRadius') * Math.sin(2 * j * Math.PI / (µthis.parentMeasureRepModel.get('transitionNumberOfPoints') - 1));
          var cy = µthis.parentMeasureRepModel.get('circularMeasureCy') - µthis.parentMeasureRepModel.get('circularMeasureR') * Math.cos(2 * j * Math.PI / (µthis.parentMeasureRepModel.get('transitionNumberOfPoints') - 1));
          return { cx: cx, cy: cy };
        });
        circleState.splice(this.parentMeasureRepModel.get('transitionNumberOfPoints')-i);
        //line portion
        var lineState = $.map(Array(this.parentMeasureRepModel.get('transitionNumberOfPoints')), function (d, j) {
          var cx = µthis.parentMeasureRepModel.get('circularMeasureCx') + µthis.parentMeasureRepModel.get('lineDivision')*j;
          var cy =  µthis.parentMeasureRepModel.get('circularMeasureCy') - µthis.parentMeasureRepModel.get('circularMeasureR');
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
      var beatBeadToLinePaths = [];
      var beatLineToBeadPaths = [];
      for (i=0; i<this.parentMeasureRepModel.get('circleStates').length; i++){
        var beatCoordinatesAlongTransition = [];
          beatCoordinatesAlongTransition.cx = (this.beatUnwindingPaths[i][Math.floor((this.beatIndex/this.parentMeasureModel.get('beatsCollection').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].cx);
          beatCoordinatesAlongTransition.cy = (this.beatUnwindingPaths[i][Math.floor((this.beatIndex/this.parentMeasureModel.get('beatsCollection').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].cy);
        beatBeadToLinePaths.push(beatCoordinatesAlongTransition);
        beatLineToBeadPaths.unshift(beatCoordinatesAlongTransition);
      };
      this.beatBeadToLinePaths = beatBeadToLinePaths;
      this.beatLineToBeadPaths = beatLineToBeadPaths;

      var lineData = $.map(Array(this.parentMeasureRepModel.get('transitionNumberOfPoints')), function (d, i) {
          var y = µthis.parentMeasureRepModel.get('marginTop');
          var x = µthis.parentMeasureRepModel.get('marginLeft') + i * µthis.parentMeasureRepModel.get('linearLineLength') / (µthis.parentMeasureRepModel.get('transitionNumberOfPoints') - 1)
          return {x: x, y: y}
      });

      // Allow a beat to be dragged
      var dragBead = d3.behavior.drag();
      var dragLine = d3.behavior.drag();
      var dragBar = d3.behavior.drag();
      var dragSlice = d3.behavior.drag();
      // to prevent the dragging of a one beat measure
      if (this.parentMeasureModel.get('beatsCollection').models.length > 1) {
        µthis = this;
        dragBead.on("dragstart", function(d) {
          µthis.originalBeadX = +d3.select(this).attr("cx");
          µthis.originalBeadY = +d3.select(this).attr("cy");
        })
        .on("drag", function(d) {
          // debugger;
          // Formula for circle beats, utilizing cx and cy
          //                        |-----Current Value--------|   |-----Delta value----|
          var newSettingX = parseInt(d3.select(this).attr("cx")) + parseInt(d3.event.dx);
          var newSettingY = parseInt(d3.select(this).attr("cy")) + parseInt(d3.event.dy);
          d3.select(this).attr("cx", newSettingX);
          d3.select(this).attr("cy", newSettingY);
          var newComputedValX = d3.select(this).attr('cx');
          var newComputedValY = d3.select(this).attr('cy');
          // Inside: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 < radius^2
          // Outside: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 > radius^2
          // On: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 == radius^2
          if ( Math.pow(newComputedValX - µthis.parentMeasureRepModel.get('circularMeasureCx'), 2) + Math.pow(newComputedValY - µthis.parentMeasureRepModel.get('circularMeasureCy'), 2) > Math.pow(µthis.parentMeasureRepModel.get('circularMeasureR')+15,2) ) {
            // d3.select(this).remove();
            µthis.parentMeasureModel.get('beatsCollection').remove(µthis.model);
            dragBead.on('dragend', null);
            // return;
          }
        })
        .on("dragend", function(d) {
          if (+d3.select(this).attr("cx") == µthis.originalBeadX ){
            µthis.dragged = false;
          } else {
            µthis.dragged = true;
            d3.select(this).attr("cx", µthis.originalBeadX)
            d3.select(this).attr("cy", µthis.originalBeadY)
            d3.event.sourceEvent.stopPropagation();
          }
        });
        dragLine.on('drag', function(d) {
          µthis = µthis;
          var newSettingX1 = parseInt(d3.select(this).attr("x1")) + parseInt(d3.event.dx);
          var newSettingY1 = parseInt(d3.select(this).attr("y1")) + parseInt(d3.event.dy);
          var newSettingX2 = parseInt(d3.select(this).attr("x2")) + parseInt(d3.event.dx);
          var newSettingY2 = parseInt(d3.select(this).attr("y2")) + parseInt(d3.event.dy);
          d3.select(this).attr("x1", newSettingX1);
          d3.select(this).attr("y1", newSettingY1);
          d3.select(this).attr("x2", newSettingX2);
          d3.select(this).attr("y2", newSettingY2);
          var newCenterX1 = d3.select(this).attr('x1');
          var newCenterY1 = parseInt(d3.select(this).attr('y1')) + parseInt(µthis.parentMeasureRepModel.get('lineHashHeight')/2);
          // Above: newCenterY1 < µthis.numberLineY
          // AboveByN: newCenterY1 < µthis.numberLineY - N
          // On : newCenterY1 = µthis.numberLineY
          // Below: newCenterY1 > µthis.numberLineY
          // BelowByN: newCenterY1 > µthis.numberLineY + N
          if ((newCenterY1 < µthis.parentMeasureRepModel.get('numberLineY') - µthis.parentMeasureRepModel.get('lineHashHeight')*1.1) || (newCenterY1 > µthis.parentMeasureRepModel.get('numberLineY') + µthis.parentMeasureRepModel.get('lineHashHeight')*1.1 )) {
            // make an array to find out where the new beat should be added in the beatsCollection of the measure
            d3.select(this).remove();
            µthis.parentMeasureModel.get('beatsCollection').remove(µthis.model);
          }
        });
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
          if ((newComputedValY < µthis.parentMeasureRepModel.get('lbbMeasureLocationY') - µthis.parentMeasureRepModel.get('beatHeight')*1.3) || (newComputedValY > µthis.parentMeasureRepModel.get('lbbMeasureLocationY') + µthis.parentMeasureRepModel.get('beatHeight')*1.4)) {
          // make an array to find out where the new beat should be added in the beatsCollection of the measure
            d3.select(this).remove();
            console.warn('removed beat on measure');
            µthis.parentMeasureModel.get('beatsCollection').remove(µthis.model);
          }
        });
        dragSlice.on("drag", function(d) {
          var beatToChange = $('#beat'+µthis.cid);
          var transformString = beatToChange.attr('transform').substring(10, beatToChange.attr('transform').length-1);
          var comma = transformString.indexOf(',');
          var newX = parseInt(transformString.substr(0,comma));
          var newY = parseInt(transformString.substr(comma+1));
          newX += d3.event.dx;
          newY += d3.event.dy;
          var relativeSVGX = newX + µthis.parentMeasureRepModel.get('circularMeasureCx');
          var relativeSVGY = newX + µthis.parentMeasureRepModel.get('circularMeasureCy');
          d3.select(this).attr('transform', 'translate(' + [ newX, newY ] + ')');
          // x and y must satisfy (x - center_x)^2 + (y - center_y)^2 >= radius^2
          if ( Math.pow(relativeSVGX - µthis.parentMeasureRepModel.get('circularMeasureCx'), 2) + Math.pow(relativeSVGY - µthis.parentMeasureRepModel.get('circularMeasureCy'), 2) >= Math.pow(µthis.parentMeasureRepModel.get('circularMeasureR'), 2) ) {
            d3.select(this).remove();
            µthis.parentMeasureModel.get('beatsCollection').remove(µthis.model);
          }
        });
      }
      // Make the bead beat
      if (this.parentMeasureRepModel.get('currentRepresentationType') == 'bead') {
        this.BEAT = this.beatContainer
            .append('circle')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'beat d3 bead-beat')
            .attr('cx', this.x1)
            .attr('cy', this.y1)
            .attr('r', this.parentMeasureRepModel.get('circularBeadBeatRadius'))
            .attr('transform', 'translate(0,0)')
            // This is the path that the beat will follow when un/roll is clicked
            .data([this.beatUnwindingPaths[0]])
            .attr('fill', this.getColor())
            .attr('stroke', 'black')
            .style('opacity', this.getOpacityNumber(this.model.get('selected')))
            .call(dragBead);
      // Draw the line beat
      } else if (this.parentMeasureRepModel.get('currentRepresentationType') == 'line'){
        this.BEAT = this.beatContainer
            .append('line')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'beat d3 line-beat')
            .attr('x1', this.X1)
            .attr('y1', this.lineBeatY1)
            .attr('x2', this.X2)
            .attr('y2', this.lineBeatY2)
            .attr('transform', 'translate(0,0)')
            .attr('stroke', this.getColor())
            .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
            .attr('stroke-width', 4)
            .call(dragLine);
      // Draw the pie slice beats
      } else if (this.parentMeasureRepModel.get('currentRepresentationType') == 'pie'){
        var arc = d3.svg.arc()
          .innerRadius(0)
          .outerRadius(this.parentMeasureRepModel.get('circularMeasureR'))
          .startAngle(this.parentMeasureRepModel.get('beatStartAngle')*(Math.PI/180))
          .endAngle((this.parentMeasureRepModel.get('beatStartAngle') + this.parentMeasureRepModel.get('beatAngle'))*(Math.PI/180))
        this.beatContainer
          .attr('transform', 'translate('+this.parentMeasureRepModel.get('circularMeasureCx')+','+this.parentMeasureRepModel.get('circularMeasureCy')+')')
        this.BEAT = this.beatContainer
          .append('path', ':first-child')
        // BEAT
          .attr('id', 'beat'+this.cid)
          .attr('class', 'beat d3 pie-beat')
          .attr('d', arc)
          .attr('stroke', 'black')
          .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
          .attr('fill', this.getColor())
          .attr('transform', 'translate(0,0)')
          .call(dragSlice);
      // Draw the audio beat
      } else if (this.parentMeasureRepModel.get('currentRepresentationType') == 'audio'){
        this.BEAT = this.beatContainer
            .insert('circle', ':first-child')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'beat d3 audio-beat')
            .attr('cx', this.parentMeasureRepModel.get('audioMeasureCx'))
            .attr('cy', this.parentMeasureRepModel.get('audioMeasureCy'))
            .attr('r', this.parentMeasureRepModel.get('audioMeasureR'))
            // .attr('fill', this.parentMeasureRepModel.get('initialColorForAudio'))
            .attr('fill', COLORS.hexColors[5])
            .attr('fill-opacity', 0);
            // .attr('transform', 'translate(0,0)')
      // Draw the bar beats
      } else if (this.parentMeasureRepModel.get('currentRepresentationType') == 'bar'){
        this.BEAT = this.beatContainer
            .append('rect')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'beat d3 bar-beat')
            .attr('x', this.beatBBX)
            .attr('y', this.parentMeasureRepModel.get('beatBBY'))
            .attr('width', this.parentMeasureRepModel.get('beatWidth'))
            .attr('height', this.parentMeasureRepModel.get('beatHeight'))
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
            .attr('fill', this.getColor())
            .call(dragBar);
      }
      // This is so Backbone knows what element it is so when we call close, it removes the appropriate DOM element
      this.setElement($('#beat'+this.cid));
      return this;
    },
    // change the reps, and keep track of the old one
    changeBeatRepresentation: function(representation) {
      this.previousRepresentationType = this.currentRepresentationType;
      this.currentRepresentationType = representation;
    },

    // sets the opacity between selected and not-selected
    getOpacityNumber : function(bool) {
      if(this.currentRepresentationType == 'audio'){
        return 0.2/this.parentMeasureModel.get('beats').models.length;
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
    // sets the opacity between selected and not-selected
    getColor : function() {
      if(this.beatColorStyle === 'colors'){
        return COLORS.hexColors[this.color];
      } else if (this.beatColorStyle === 'greyscale') {
        return COLORS.hexColors[19];
      } else if (this.beatColorStyle === 'greyOff') {
        if(this.model.get('selected')){
          return COLORS.hexColors[this.color];
        } else {
          return COLORS.hexColors[19];
        }
      } else {
        console.error('shouldn\'t be in here');
        return COLORS.hexColors[17];
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
      if(!this.dragged){
        if(this.parentMeasureRepModel.get('currentRepresentationType') !== 'audio'){      
          console.log('Toggling the beat view model');
          //switch the selected boolean value on the model
          this.model.set('selected', !this.model.get('selected'));
          var state = this.model.get('selected') ? 'ON' : 'OFF';
          Logging.logStorage('Toggling the beat view model. Turning: ' + state + ' . Beat index (0-based): ' +this.beatIndex + ' on the index (0-based) representation: ' + $(this.parentMeasureRepView.$el).index() + ' of type: ' + this.parentMeasureRepView.measureRepModel.get('currentRepresentationType') + ' on this instrument: ' + this.parentMeasureRepView.parentHTrackModel.get('label') );
          // log.sendLog([[1, "beat" + this.model.cid + " toggled: "+!bool]]);
        }
      }
    },
    toggleProperties: function() {
      // We only want to toggle opacities of non-audio beats.   Audio beats deal with fill-opacity for animating
      if(this.parentMeasureRepModel.get('currentRepresentationType') !== 'audio') {
        var beat = d3.select('#beat'+this.cid);
        beat.style('opacity', this.getOpacityNumber(this.model.get('selected')))
        if(this.parentMeasureRepModel.get('currentRepresentationType') !== 'line') {
          beat.style('fill', this.getColor());
        } else {
          beat.style('stroke', this.getColor());
        }
      }
    },
    // manage the transitions from one rep to another
    transition: function(){
      var PRT = this.parentMeasureRepModel.get('previousRepresentationType');
      var CRT = this.parentMeasureRepModel.get('currentRepresentationType');
      console.log(PRT, CRT);
      if (PRT == 'audio'){
        if (CRT == 'audio'){
        } else if(CRT == 'bead'){
        } else if(CRT == 'line'){
        } else if(CRT == 'pie'){
        } else if(CRT == 'bar'){
        }
      } else if(PRT == 'bead'){
        if (CRT == 'audio'){
        } else if(CRT == 'bead'){
        } else if(CRT == 'line'){
          this.unRoll();
        } else if(CRT == 'pie'){
        } else if(CRT == 'bar'){
          this.unRoll();
        }
      } else if(PRT == 'line'){
        if (CRT == 'audio'){
        } else if(CRT == 'bead'){
          this.rollUp();
        } else if(CRT == 'line'){
        } else if(CRT == 'pie'){
          this.rollUpLines();
        } else if(CRT == 'bar'){
        }
      } else if(PRT == 'pie'){
        if (CRT == 'audio'){
        } else if(CRT == 'bead'){
        } else if(CRT == 'line'){
          this.unrollLines();
        } else if(CRT == 'pie'){
        } else if(CRT == 'bar'){
          this.unrollLines();
        }
      } else if(PRT == 'bar'){
        if (CRT == 'audio'){
        } else if(CRT == 'bead'){
          this.rollUp();
        } else if(CRT == 'line'){
        } else if(CRT == 'pie'){
          this.rollUpLines();
        } else if(CRT == 'bar'){
        }
      }
    },
    close: function(){
      this.remove();
      this.unbind();
      // handle other unbinding needs, here
      if(this.onClose){
        this.onClose();
      }
    },
    onClose: function(){
      this.model.unbind('change', this.toggleProperties);
    }
  });
});

