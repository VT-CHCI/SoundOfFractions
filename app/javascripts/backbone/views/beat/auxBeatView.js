//filename: views/beats/auxBeatView.js
/*
  This is the view for a single beat during a transition
*/
define([
  'jquery',
  'underscore',
  'bbone',
  'colors'
], function($, _, Backbone, COLORS){
  return Backbone.View.extend({
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

        this.listenTo(this.parentMeasureRepView, 'secondaryBeatTransition', this.transition, this);

        this.beatContainer = d3.select(this.beatContainer);
        // this.measureBeatHolder = options.parentElHolder;
        this.el = options.singleBeat;
        this.opacity = this.getOpacityNumber(options.opacity);

        this.listenTo(this.parentMeasureRepView, 'beatTransition', this.transition, this);
      } else {
        console.error('auxBeatView(init): should not be in here!');
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
      for(i=0; i<this.parentMeasureRepModel.get('transitionNumberOfPoints'); i++){
          var x = this.parentMeasureRepModel.get('transitionNumberOfPoints')-i;
          this.BEAT.data([this.lineStatesUnrolling[i]])
              .transition()
              .delay(this.parentMeasureRepModel.get('transitionDuration')*i)
              .duration(this.parentMeasureRepModel.get('transitionDuration'))
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
      if (this.drawType == 'pie') {
        this.x1 = this.circularMeasureCx + this.circularMeasureR * Math.cos(Math.PI * this.beatStartAngle/180); 
      } else if (this.drawType == 'bead') {
        this.x1 = this.parentMeasureRepModel.get('circleStates')[(this.parentMeasureRepModel.get('transitionNumberOfPoints')-1)][Math.floor((this.beatIndex/this.parentMeasureModel.get('beatsCollection').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].x;
      } else if (this.drawType == 'beadCircle') {
        this.x1 = this.parentMeasureRepModel.get('circleStates')[0][Math.floor((this.beatIndex/this.parentMeasureModel.get('beatsCollection').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].x;
      }
      // y center of a bead or first y of a pie piece
      if (this.drawType == 'pie') {
        this.y1 = this.circularMeasureCy + this.circularMeasureR * Math.sin(Math.PI * this.beatStartAngle/180);     
      } else if (this.drawType == 'bead') {
        this.y1 = this.parentMeasureRepModel.get('circleStates')[this.parentMeasureRepModel.get('transitionNumberOfPoints')-1][Math.floor((this.beatIndex/this.parentMeasureModel.get('beatsCollection').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].y;
      } else if (this.drawType == 'beadCircle') {
        this.y1 = this.parentMeasureRepModel.get('circleStates')[0][Math.floor((this.beatIndex/this.parentMeasureModel.get('beatsCollection').models.length)*(this.parentMeasureRepModel.get('transitionNumberOfPoints')))].y;
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

      // Make the bead beat
      if (this.drawType == 'bead' || this.drawType == 'beadCircle') {
        this.BEAT = this.beatContainer
            .append('circle')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'secondaryBeat beat d3 bead-beat')
            .attr('cx', this.x1)
            .attr('cy', this.y1)
            .attr('r', this.parentMeasureRepModel.get('circularBeadBeatRadius'))
            .attr('transform', 'translate(0,0)')
            // This is the path that the beat will follow when un/roll is clicked
            .data([this.beatUnwindingPaths[0]])
            .attr('fill', COLORS.hexColors[this.color])
            .attr('stroke', 'black')
            .style('opacity', this.getOpacityNumber(this.opacity));
      // Draw the line beat
      } else if (this.drawType == 'line'){
        this.BEAT = this.beatContainer
            .append('line')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'secondaryBeat beat d3 line-beat')
            .attr('x1', this.X1)
            .attr('y1', this.Y1)
            .attr('x2', this.X2)
            .attr('y2', this.Y2)
            .attr('stroke', COLORS.hexColors[this.color])
            .attr('opacity', this.getOpacityNumber(this.opacity))
            .attr('stroke-width', 4);
      // Draw the lines for rolling
      } else if (this.drawType == 'lineRolling'){
        // console.error(this.lineStatesUnrolling);
        // this.beatContainer
          // .attr('transform', 'translate('+this.circularMeasureCx+','+this.circularMeasureCy+')')
        this.BEAT = this.beatContainer
          .append('path', ':first-child')
        // BEAT
          .attr('id', 'beat'+this.cid)
          .attr('class', 'secondaryBeat beat d3 lineRolling')
          .data([this.lineStatesUnrolling[this.lineStatesUnrolling.length-1]])
          .attr('d', this.pathFunction)
          // .attr('d', this.lineStatesUnrolling[this.lineStatesUnrolling.length])
          .attr('stroke', COLORS.hexColors[this.color])
          .attr('opacity', this.getOpacityNumber(this.opacity))
          .attr('stroke-width', 4)
          // .attr('fill', COLORS.hexColors[this.color])
          .attr('transform', 'translate(0,0)') ;
      // draw the lines for unrolling
      } else if (this.drawType == 'lineUnrolling'){
        // console.error(this.lineStatesUnrolling);
        // this.beatContainer
          // .attr('transform', 'translate('+this.circularMeasureCx+','+this.circularMeasureCy+')')

        this.BEAT = this.beatContainer
          .append('path', ':first-child')
        // BEAT
          .attr('id', 'beat'+this.cid)
          .attr('class', 'secondaryBeat beat d3 lineRolling')
          .data([this.lineStatesRollup[this.lineStatesUnrolling.length-1]])
          .attr('d', this.pathFunction)
          // .attr('d', this.lineStatesUnrolling[this.lineStatesUnrolling.length])
          .attr('stroke', COLORS.hexColors[this.color])
          .attr('opacity', this.getOpacityNumber(this.opacity))
          .attr('stroke-width', 4)
          // .attr('fill', COLORS.hexColors[this.color])
          .attr('transform', 'translate(0,0)') ;
      // Draw the pie slice beats
      } else if (this.drawType == 'pie'){
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
          .attr('class', 'secondaryBeat beat d3 pie-beat')
          .attr('d', arc)
          .attr('stroke', 'black')
          .attr('opacity', this.getOpacityNumber(this.opacity))
          .attr('fill', COLORS.hexColors[this.color])
          .attr('transform', 'translate(0,0)');
      // Draw the audio beat
      } else if (this.drawType == 'audio'){
        this.BEAT = this.beatContainer
            .insert('circle', ':first-child')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'secondaryBeat beat d3 audio-beat')
            .attr('cx', this.parentMeasureRepModel.get('audioMeasureCx'))
            .attr('cy', this.parentMeasureRepModel.get('audioMeasureCy'))
            .attr('r', this.parentMeasureRepModel.get('audioMeasureR'))
            .attr('fill', this.parentMeasureRepModel.get('initialColorForAudio'));
            // .attr('opacity', this.opacityForAudio);
            // .attr('transform', 'translate(0,0)')
            // NO click handler to prevent the user from editing in the audio Rep
      // Draw the bar beats
      } else if (this.drawType == 'bar'){
        console.warn(this.beatBBX);
        this.BEAT = this.beatContainer
            .append('rect')
            .attr('id', 'beat'+this.cid)
            .attr('class', 'secondaryBeat beat d3 bar-beat')
            .attr('x', this.beatBBX)
            .attr('y', this.parentMeasureRepModel.get('beatBBY'))
            .attr('width', this.parentMeasureRepModel.get('beatWidth'))
            .attr('height', this.parentMeasureRepModel.get('beatHeight'))
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('opacity', this.getOpacityNumber(this.opacity))
            .attr('fill', COLORS.hexColors[this.color]);
      }
      this.setElement($('#beat'+this.cid));
      return this;
    },
    // sets the opacity between selected and not-selected
    getOpacityNumber: function(bool){
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
    // manage the transitions from one rep to another
    transition: function(){
      var PRT = this.parentMeasureRepModel.get('previousRepresentationType');
      var CRT = this.parentMeasureRepModel.get('currentRepresentationType');
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
      this.model.unbind('change', this.toggleOpacity);
    }
  });
});

