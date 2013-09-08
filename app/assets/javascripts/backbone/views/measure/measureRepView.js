// Filename: views/measure/measureRepView.js
/*
  This is the MeasureRepView.
  This is contained in a MeasureView.
*/
define([
  'jquery', 'underscore', 'backbone',
  'backbone/collections/beats',
  'backbone/models/measure', 'backbone/models/representation', 'backbone/models/state',
  'backbone/views/beat/beatView',
  'backbone/views/factory/beadFactoryView',
  'text!backbone/templates/measure/measureRep.html',
  'colors',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatsCollection, MeasureModel, RepresentationModel, StateModel, BeatView, BeadFactoryView, MeasureRepTemplate, COLORS, dispatch, log){
  return Backbone.View.extend({
    //registering click events to add and remove measures.
    events : {
      'click .remove-measure-rep' : 'removeRepresentation',
      'click .delta' : 'transitionRepresentation'
    },
    initialize: function(options){
      //if we're being created by a MeasureView, we are
      //passed in options. Otherwise we create a single
      //measure and add it to our collection.
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }

        this.repContainerEl = options.measureRepContainer;
        this.currentRepresentationType = options.representationType;
        this.beatFactoryHolder = 'beat-factory-holder-'+this.measureRepModel.cid;
      } else {
        console.error('Should not be in here: NO MeasureRep!');
      }
      //Dispatch listeners
      dispatch.on('signatureChange.event', this.reconfigure, this);
      dispatch.on('measureRepresentation.event', this.changeMeasureRepresentation, this);
      dispatch.on('unroll.event', this.unroll, this);
      dispatch.on('tempoChange.event', this.adjustRadius, this);
      dispatch.on('toggleAnimation.event', this.toggleAnimation, this);

  //     this.model.bind('change', _.bind(this.transition, this));
      this.listenTo(this.model, 'change', _.bind(this.transition, this));

      this.render();
    },
    circleStart: function(e, ui) {
      console.log('circle start');
      console.log(this.oldW)
      if(this.oldW === undefined){
        console.log('this.oldW is undefined');
        this.oldW = ui.originalSize.width;
        this.oldH = ui.originalSize.height;
      }
      // because I don't know how to compute the arc from a point, I generate the pie slices and then move them as a group.  Thus we have to get the group's transform translate, and store the number, so that when we scale the slices in the next func(), we also translate them the origianl amount, otherwise when we are scaling it, the slices are not translated, and the origin is 0,0
      if (this.pieTranslate == undefined){
        this.pieTranslate = d3.select('#svg-'+this.measureRepModel.cid).select('g').attr('transform')
      }
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
    },
    circleResizeCallback: function( e, ui ) {
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      // console.log(e, ui)
      var newW = ui.size.width;
      var newH = ui.size.height;
      var deltaWidth = newW - this.oldW;
      var deltaHeight = newH - this.oldH;
      var deltaRatio = deltaWidth/this.oldW;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid);
      svgContainer.attr('width', parseInt(svgContainer.attr('width'))+deltaWidth );
      svgContainer.attr('height', parseInt(svgContainer.attr('height'))+deltaHeight );
      if(this.currentRepresentationType == 'bead'){
        var circlePath = svgContainer.select('path');
        var scale = circlePath.attr('transform').slice(6, circlePath.attr('transform').length-1);
        this.scale = (this.originalScale+deltaRatio);
        // aspect ratio scale the measure circle, and the beats
        circlePath
            .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')');
        // svgContainer.selectAll('g')
              // .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')');
      } else if (this.currentRepresentationType == 'pie'){
        var circlePath = svgContainer.select('path');
        var beatSlices = svgContainer.select('g');
        var scale = circlePath.attr('transform').slice(6, circlePath.attr('transform').length-1);
        this.scale = (this.originalScale+deltaRatio);
        // aspect ratio scale the measure circle, and the beats
        circlePath
            .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')');
        beatSlices
              .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')' + this.pieTranslate);
      }
    },
    circleStop: function(e, ui) {
      console.log('circle: adjusted scale by : ' + this.scale);
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      this.oldW = ui.size.width;
      this.oldH = ui.size.height;
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      this.parentMeasureModel.set('scale', this.scale);
    },
    linearStart: function(e, ui) {
      console.log('linear start');
      console.log(this.oldW)
      if(this.oldW === undefined){
        console.log('this.oldW is undefined');
        this.oldW = ui.originalSize.width;
        this.oldH = ui.originalSize.height;
      }
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
    },
    linearResizeCallback: function( e, ui ) {
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      // console.log(e, ui)
      var newW = ui.size.width;
      var newH = ui.size.height;
      var deltaWidth = newW - this.oldW;
      var deltaHeight = newH - this.oldH;
      var deltaRatio = deltaWidth/this.oldW;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid);
      svgContainer.attr('width', parseInt(svgContainer.attr('width'))+deltaWidth );
      // svgContainer.attr('height', parseInt(svgContainer.attr('height'))+deltaHeight );
      if(this.currentRepresentationType == 'line'){
        var linePath = svgContainer.select('line');
        var beatLines = svgContainer.select('g');
        var scale = linePath.attr('transform').slice(6, linePath.attr('transform').length-1);
        // var linePathCurrentScale = parseInt(scale.slice(0, scale.indexOf(',')));
        this.scale = (this.originalScale+deltaRatio);
        // linearly scale the Line, and the beats
        linePath
            .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
        beatLines
              .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
      } else if (this.currentRepresentationType == 'bar'){
        var barPath = svgContainer.select('rect');
        var beatBars = svgContainer.select('g');
        var scale = barPath.attr('transform').slice(6, barPath.attr('transform').length-1);
        // var barPathCurrentScale = parseInt(scale.slice(0, scale.indexOf(',')));
        this.scale = (this.originalScale+deltaRatio);
        // linearly scale the Line, and the beats
        barPath
            .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
        beatBars
              .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
      }
    },
    linearStop: function(e, ui) {
      console.log('linear adjusted scale by : ' + this.scale);
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      this.oldW = ui.size.width;
      this.oldH = ui.size.height;
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      this.parentMeasureModel.set('scale', this.scale);
    },
    d3AudioAnimate: function(target, dur, selected) {
      var target = d3.select(target);
      var originalOpacity = parseInt(target.attr('opacity'));
      if(selected == true){
        var newOpacity = 1;
      } else {
        var newOpacity = originalOpacity;
      }
      target.transition()
        .attr('opacity', newOpacity )
        .duration(1)
        .each('end',function() {                   // as seen above
          d3.select(this).                         // this is the object 
            transition()                           // a new transition!
              .attr('opacity', originalOpacity )   // we could have had another
              .delay(dur-1)
              .duration(1);                      // .each("end" construct here.
         });
    },
    d3BeadAnimate: function(target, dur) {
      var target = d3.select(target);
      var originalCX = parseInt(target.attr('cx'));
      var newCX = originalCX + 10;
      target.transition()
        .attr('cx', newCX )
        .duration(dur)
        .each('end',function() {                   // as seen above
          d3.select(this).                         // this is the object 
            transition()                           // a new transition!
              .attr('cx', originalCX )    // we could have had another
              .duration(dur);                  // .each("end" construct here.
         });
    },
    d3LineAnimate: function(target, dur) {
      var target = d3.select(target);
      var originalX = parseInt(target.attr('x1'));
      var newX = originalX + 10;
      target.transition()
        .attr('x1', newX )
        .attr('x2', newX )
        .duration(dur)
        .each('end',function() {                   // as seen above
          d3.select(this).                         // this is the object 
            transition()                           // a new transition!
              .attr('x1', originalX )    // we could have had another
              .attr('x2', originalX )    // we could have had another
              .duration(dur);                  // .each("end" construct here.
         });
    },
    d3PieAnimate: function(target, dur) {
      var target = d3.select(target);
      target.transition()
        .attr('transform', 'translate(10,0)' )
        .duration(dur)
        .each('end',function() {                               // as seen above
          d3.select(this).                                     // this is the object 
            transition()                                       // a new transition!
              .attr('transform', 'translate(0,0)' )
              .duration(dur);                  // .each("end" construct here.
         });
    },
    d3BarAnimate: function(target, dur) {
      var target = d3.select(target);
      var originalX = parseInt(target.attr('x'));
      var newX = originalX + 10;
      target.transition()
        .attr('x', newX )
        .duration(dur)
        .each('end',function() {                   // as seen above
          d3.select(this).                         // this is the object 
            transition()                           // a new transition!
              .attr('x', originalX )    // we could have had another
              .duration(dur);                  // .each("end" construct here.
         });
    },
    toggleAnimation: function(state, duration, signature, maxMeasures){
      var ƒthis = this;
      // TODO why bring in signature to have it reset
      //signature = $(this.el).find('.measure').eq(0).find('.beat').length;
      signature = this.hTrack.get('signature');

      //dur is time of one beat.
      var dur = duration/signature/maxMeasures;

      var totalNumberOfBeats = signature*maxMeasures;
      // go through the measure(s) first without animation
      var counter = 0-(signature*maxMeasures-1);

      //when playing is stoped we stop the animation.
      if (state == 'off') {
        clearInterval(this.animationIntervalID);
        this.animationIntervalID = null;

        console.log('stopped animation');
      }
      else {
        console.log('starting animation', dur);

        // this sets the time interval that each animation should take,
        // and then calls animate on each beat with the appropriate
        // timing interval.
        // Self is the parent hTrack
        this.animationIntervalID = setInterval((function(self) {
          return function() {
            if (counter >= 0 && counter < totalNumberOfBeats) {
              if (self.currentRepresentationType == 'audio'){
                var beats = $('#measure-rep-'+self.measureRepModel.cid).find('.audio-beat');
                var selected = self.parentMeasureModel.get('beats').models[counter].get('selected');
                self.d3AudioAnimate(beats.eq(counter)[0], dur/2, selected);
              } else if (self.currentRepresentationType == 'bead'){
                var beats = $('#measure-rep-'+self.measureRepModel.cid).find('.bead-beat');
                self.d3BeadAnimate(beats.eq(counter)[0], dur/2);
              } else if (self.currentRepresentationType == 'line'){
                var beats = $('#measure-rep-'+self.measureRepModel.cid).find('.line-beat');
                self.d3LineAnimate(beats.eq(counter)[0], dur/2);
              } else if (self.currentRepresentationType == 'pie'){
                var beats = $('#measure-rep-'+self.measureRepModel.cid).find('.pie-beat');
                self.d3PieAnimate(beats.eq(counter)[0], dur/2);
              } else if (self.currentRepresentationType == 'bar'){
                var beats = $('#measure-rep-'+self.measureRepModel.cid).find('.bar-beat');
                self.d3BarAnimate(beats.eq(counter)[0], dur/2);
              }
            }
            if (counter < (signature*maxMeasures-1)) {
              counter ++;
            } else {
              counter = 0;
            }
          }
        })(this), dur); //duration should be set to something else
        //this.animationWrapper(counter, beats, signature, maxMeasures, duration);
      }
    },
    changeMeasureRepresentation: function(representation) {
      this.previousRepresentationType = this.currentRepresentationType;
      this.currentRepresentationType = representation;
      this.render();
    },
    unrollPie: function(options) {
      for(i=0; i<this.measureNumberOfPoints; i++){
        this.circlePath.data([this.circleStates[i]])
            .transition()
            .delay(this.animationDuration*i)
            .duration(this.animationDuration)
            .ease('linear')
            .attr('d', this.pathFunction);
      }
    },
    rollupPie: function() {
      for(i=0; i<this.measureNumberOfPoints; i++){
        this.circlePath.data([this.circleStates[this.measureNumberOfPoints-1-i]])
            .transition()
            .delay(this.animationDuration*i)
            .duration(this.animationDuration)
            .ease('linear')
            .attr('d', this.pathFunction);
      }
    },
    render: function(){
      var ƒthis = this;

      // this.$el.attr('id', 'merasure-rep-' + this.measureRepModel.cid);

      // compile the template for a representation
      var measureRepTemplateParamaters = {
        measureRepID: 'measure-rep-'+this.measureRepModel.cid,
        measureClasses: 'measureRep measure-'+this.currentRepresentationType,
        measureRepDeltaID: 'delta-'+this.measureRepModel.cid,
        measureRepSVGID: 'svg-'+this.measureRepModel.cid,
        svgClasses: this.currentRepresentationType,
        measureRepType: this.currentRepresentationType,
        beatHolderID: 'beat-holder-'+this.measureRepModel.cid,
        beatFactoryHolderID: this.beatFactoryHolder,
        measureCount: this.measureCount,
        measureRep: this.currentRepresentationType,
        measureRepRecordID: 'record-'+this.measureRepModel.cid
      };
      var compiledTemplate = _.template( MeasureRepTemplate, measureRepTemplateParamaters );
      // put in the rendered template in the measure-rep-container of the measure
      $(this.repContainerEl).append( compiledTemplate );
      this.setElement($('#measure-rep-'+this.measureRepModel.cid));

      if (this.currentRepresentationType == 'bead') {
        var margin = this.margin;
        var lineData = $.map(Array(this.measureNumberOfPoints), function (d, i) {
            var y = margin.top;
            var x = margin.left + i * this.linearLineLength / (this.measureNumberOfPoints - 1);
            return {x: x, y: y};
        });
        var pathFunction = d3.svg.line()
            .x(function (d) {return d.x;})
            .y(function (d) {return d.y;})
            .interpolate('basis'); // bundle | basis | linear | cardinal are also options
        this.pathFunction = pathFunction;

        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.circularDivWidth)
            .attr('height', this.circularDivHeight);
        var circlePath = svgContainer
            .insert('path', ':first-child')
            .data([this.circleStates[0]])
            .attr('d', pathFunction)
            .attr('stroke', 'black')
            .attr('opacity', 1)
            .attr('class', 'circle')
            .attr('class', 'circle-path')
            .attr('transform', 'scale('+this.originalScale+','+this.originalScale+')');
            this.circlePath = circlePath;

        function transitionRoll() {
          if (this.unrolled == false) {
            for(i=0; i<this.measureNumberOfPoints; i++){
                options.circlePath.data([this.circleStates[this.measureNumberOfPoints-1-i]])
                    .transition()
                    .delay(this.animationDuration*i)
                    .duration(this.animationDuration)
                    .ease('linear')
                    .attr('d', this.pathFunction);
            }
          } else {
            console.log('unroll clicked');
            console.warn(options);
            for(i=0; i<this.measureNumberOfPoints; i++){
                options.circlePath.data([this.circleStates[i]])
                    .transition()
                    .delay(this.animationDuration*i)
                    .duration(this.animationDuration)
                    .ease('linear')
                    .attr('d', this.pathFunction);
            }
          }
          this.unrolled = !this.unrolled;
        }
        function unroll() {
          for(i=0; i<measureNumberOfPoints; i++){
              circlePath.data([circleStates[i]])
                  .transition()
                  .delay(animationDuration*i)
                  .duration(animationDuration)
                  .ease('linear')
                  .attr('d', pathFunction);
          }
        };
        function reverse() {
          for(i=0; i<measureNumberOfPoints; i++){
              circlePath.data([circleStates[measureNumberOfPoints-1-i]])
                  .transition()
                  .delay(animationDuration*i)
                  .duration(animationDuration)
                  .ease('linear')
                  .attr('d', pathFunction);
          }
        };

        // $('#a'+measure.cid).on('click', dispatch.trigger('unroll.event'), circlePath);
        $('#a'+this.measureRepModel.cid).on('click', unroll);
        $('#b'+this.measureRepModel.cid).on('click', reverse);

        // JQ-UI resizable
        this.$el.resizable({ 
          aspectRatio: true,
          ghost:true,
          // animate: true,
          start: function(e, ui) {
            ƒthis.circleStart(e, ui);
          },
          resize: function( e, ui ) {
            ƒthis.circleResizeCallback(e, ui);
          },
          stop: function(e, ui) {
            ƒthis.circleStop(e, ui);
          }  
        });

      } else if (this.currentRepresentationType == 'line'){
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.linearDivWidth)
            .attr('height', this.linearDivHeight);
        var infiniteLine = svgContainer
            .insert('line', ':first-child')
            .attr('x1', -200)
            .attr('y1', this.numberLineY)
            .attr('x2', 10000)
            .attr('y2', this.numberLineY)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('opacity', .5)
        var actualMeasureLinePath = svgContainer
            .insert('line', ':first-child')
            .attr('x1', this.lbbMeasureLocationX)
            .attr('y1', this.numberLineY)
            .attr('x2', this.lbbMeasureLocationX+this.linearLineLength)
            .attr('y2', this.numberLineY)
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('transform', 'scale('+this.originalScale+','+this.originalScale+')');

        // JQ-UI resizable
        $(this.el).resizable({ 
          maxHeight: 180, 
          minHeight: 180,
          start: function(e, ui) {
            ƒthis.linearStart(e, ui);
          },
          resize: function( e, ui ) {
            ƒthis.linearResizeCallback(e, ui);
          },
          stop: function(e, ui) {
            ƒthis.linearStop(e, ui);
          }  
        });

      } else if (this.currentRepresentationType == 'pie'){
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

        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.circularDivWidth)
            .attr('height', this.circularDivHeight);
        var circlePath = svgContainer
            .insert('path', ':first-child')
            .data([this.circleStates[0]])
            .attr('d', pathFunction)
            .attr('stroke', 'black')
            .attr('opacity', 1)
            .attr('class', 'circle')
            .attr('class', 'circle-path')
            .attr('transform', 'scale('+this.originalScale+','+this.originalScale+')');

        // JQ-UI resizable
        $(this.el).resizable({ 
          aspectRatio: true,
          start: function(e, ui) {
            ƒthis.circleStart(e, ui);
          },
          resize: function( e, ui ) {
            ƒthis.circleResizeCallback(e, ui);
          },
          stop: function(e, ui) {
            ƒthis.circleStop(e, ui);
          }  
        });

      } else if (this.currentRepresentationType == 'audio'){
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
        var circlePath = svgContainer
            .insert('circle', ':first-child')
            .attr('cx', this.audioMeasureCx)
            .attr('cy', this.audioMeasureCy)
            .attr('r', this.audioMeasureR)
            .attr('fill', 'none')
            .attr('stroke', 'black');

      } else if (this.currentRepresentationType == 'bar'){
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.linearDivWidth)
            .attr('height', this.linearDivHeight);
        var box = svgContainer
            .insert('rect', ':first-child')
            .attr('x', this.lbbMeasureLocationX)
            .attr('y', this.lbbMeasureLocationY)
            .attr('width', this.linearLineLength)
            .attr('height', this.measureHeight)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('fill', 'white')
            .attr('transform', 'scale('+this.originalScale+','+this.originalScale+')');

        // JQ-UI resizable
        $(this.el).resizable({ 
          // aspectRatio: true,
          maxHeight: 180, 
          minHeight: 180,
          start: function(e, ui) {
            ƒthis.linearStart(e, ui);
          },
          resize: function( e, ui ) {
            ƒthis.linearResizeCallback(e, ui);
          },
          stop: function(e, ui) {
            ƒthis.linearStop(e, ui);
          }  
        });
      }

      // for each beat in this measure
      _.each(this.parentMeasureModel.get('beats').models, function(beat, index) {
        // create a Beatview
        var measurePassingToBeatViewParamaters = {
          //General
          model: beat,
          parentMeasureModel: this.parentMeasureModel,
          parentElHolder: '#beatHolder'+this.measureRepModel.cid,
          parentMeasureRepModel: this.measureRepModel,
          parentCID: this.measureRepModel.cid,
          singleBeat: '#beat'+beat.cid,
          beatIndex: index,
          margin : this.margin,
          currentRepresentationType: this.currentRepresentationType,
          beatsInMeasure: this.beatsInMeasure,
          // To use the range of colors
          color: index,
          // To use one color
          // color: x,
          timeIncrement: this.timeIncrement,
          // Bar
          beatBBX: this.lbbMeasureLocationX +(this.beatWidth*(index)),
          beatBBY: this.beatBBY,
          beatHolderWidth: this.beatHolderWidth,
          linearBeatXPadding: this.linearBeatXPadding,
          lbbMeasureLocationY: this.lbbMeasureLocationY,
          beatWidth: this.beatWidth,
          beatHeight: this.beatHeight,
          // Line
          lineDivision: this.lineDivision,
          numberLineY: this.numberLineY,
          lineHashHeight: this.lineHashHeight,
          X1: this.lbbMeasureLocationX +(this.beatWidth*(index)),
          Y1: this.numberLineY - this.lineHashHeight/2,
          X2: this.lbbMeasureLocationX +(this.beatWidth*(index)),
          Y2: this.numberLineY + this.lineHashHeight/2,
          // Circular Pie
          circularMeasureCx: this.circularMeasureCx,
          circularMeasureCy: this.circularMeasureCy,
          circularMeasureR: this.circularMeasureR,
          beatAngle: 360 / this.beatsInMeasure,
          beatStartAngle: ((360 / this.beatsInMeasure)*index),
          beatStartTime: this.firstBeatStart+(index)*(this.timeIncrement/1000),
          
          // Circular Bead
          circularBeadBeatRadius: this.circularBeadBeatRadius,
          circleStates: this.circleStates,
          measureNumberOfPoints: this.measureNumberOfPoints,
          margin: this.margin, 
          // Transition
          animationDuration: this.animationDuration,

          //Audio
          audioMeasureCx: this.audioMeasureCx,
          audioMeasureCy: this.audioMeasureCy,
          audioMeasureR: this.audioMeasureR,
          audioBeatCx: this.audioBeatCx,
          audioBeatCy: this.audioBeatCy,
          audioBeatR: this.audioBeatR,
          colorForAudio: this.colorForAudio,
          opacityForAudio: .2/this.beatsInMeasure
        };
        new BeatView(measurePassingToBeatViewParamaters);
      }, this);

      // make a beat factory
      this.measurePassingToBeatFactoryParamaters = {
        // beat, number of beats, each beat's color, location, path
        measureModel: this.measureModel,
        beatFactoryHolder: this.beatFactoryHolder,
        beatsInMeasure: this.beatsInMeasure,
        remainingNumberOfBeats: 16-this.beatsInMeasure,
        currentRepresentationType: this.currentRepresentationType,
        beadRadius: this.circularBeadBeatRadius,
        colorIndex: '',
        measureRepModel: this.measureRepModel,
        parentMeasureModel: this.parentMeasureModel,
        circularMeasureR: this.circularMeasureR,
        circularMeasureCx: this.circularMeasureCx,
        circularMeasureCy: this.circularMeasureCy,
        numberLineY: this.numberLineY,
        beatWidth: this.beatWidth,
        beatFactoryR: this.beatFactoryR,
        beatFactoryWidth: this.beatFactoryWidth,
        linearLineLength: this.linearLineLength,
        lbbMeasureLocationY: this.lbbMeasureLocationY
      };
      if (this.currentRepresentationType == 'bead') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParamaters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParamaters.cX = this.horzDivPadding + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.cY = (this.circularDivHeight-this.vertDivPadding-this.beatFactoryR) + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.colorIndex = index;
          // this.measurePassingToBeatFactoryParamaters.colorIndex = 18;
          console.log()
          new BeadFactoryView(this.measurePassingToBeatFactoryParamaters);
        }
      } else if (this.currentRepresentationType == 'line') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParamaters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParamaters.x1 = this.horzDivPadding + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.y1 = this.numberLineY + 60 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.x2 = this.measurePassingToBeatFactoryParamaters.x1;
          this.measurePassingToBeatFactoryParamaters.y2 = this.measurePassingToBeatFactoryParamaters.y1 + this.lineHashHeight;
          this.measurePassingToBeatFactoryParamaters.colorIndex = index;
          new BeadFactoryView(this.measurePassingToBeatFactoryParamaters);
        }        
      } else if (this.currentRepresentationType == 'pie') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParamaters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParamaters.cX = this.horzDivPadding + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.cY = (this.circularDivHeight-this.vertDivPadding*3) + (Math.random() * (30) - 20);
          this.measurePassingToBeatFactoryParamaters.colorIndex = index;
          new BeadFactoryView(this.measurePassingToBeatFactoryParamaters);
        }        
      } else if (this.currentRepresentationType == 'bar') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParamaters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParamaters.x = this.horzDivPadding + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.y = this.numberLineY + 60 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.beatHeight = this.beatHeight;
          this.measurePassingToBeatFactoryParamaters.colorIndex = index;
          new BeadFactoryView(this.measurePassingToBeatFactoryParamaters);
        }        
      }

      return this;
    },

    addRepresentation: function(rep){
      console.log('adding another representation to the hTrack');
      this.hTrack.representations.add({
        model: new ({
          measureModel: this.hTrack.get('measures').model,
          beats: this.hTrack.get('measures').model.get('beats'),
          representation: rep
        })
      })
      this.render();
    },

    /*
      This is called when the user clicks on the minus to remove a measureRep.
    */
    removeRepresentation: function(ev){
      // if ($('#measure'+this.measuresCollection.models[0].cid).parent()) {
        //removing the last measure isn't allowed.
        if(this.measureRepresentationsCollection.length == 1) {
          console.log('Can\'t remove the last representation!');
          return;
        }
        console.log('removed representation');

        var measureModelCid = ev.srcElement.parentElement.parentElement.parentElement.id.slice(12);
        //we remove the measure and get its model.
        this.measureRepresentationsCollection.remove(measureModelCid);

        //send a log event showing the removal.
        log.sendLog([[3, 'Removed a measure representation: representation' + this.cid]]);
    },
    // This is triggered by signatureChange events.
    reconfigure: function(signature) {
      /* if the containing hTrack is selected, this
         triggers a request event to stop the sound.
         
         Then this destroys the beats and creates
         new beats with the number of beats specified
         by the signature parameter.
      */
      if ($(this.hTrackEl).hasClass('selected')) {
        dispatch.trigger('stopRequest.event', 'off');
        for (var i = 0; i < this.measuresCollection.models.length; i++) {
          while (this.measuresCollection.models[i].get('beats').length < signature) {
            this.measuresCollection.models[i].get('beats').add();
          }
          while (this.measuresCollection.models[i].get('beats').length > signature) {
            // silent:true means to not call another event
            this.measuresCollection.models[i].get('beats').pop({silent:true});
            // when selected beats equals the denominator, and we remove a beat, we need to recalculate
            // the fraction with the new selected beats
            dispatch.trigger('signatureChange.event', this.measuresCollection.models[i].get('beats').length)
          } 
        }
        //re-render the view.
        this.render();
      }
    },
    adjustRadius: function(tempo) {
      if ($(this.hTrackEl).hasClass('selected')) {
        console.log('here');
        this.circularMeasureR = (tempo/120)*40;
        //re-render the view
        this.render();
      }
    },
    transitionRepresentation: function(e){
      e.srcElement.classList.add('transition-rep');
      console.log('transitioning a rep');
    },
    transition: function(){
      if (this.model.get('previousRepresentationType') == 'audio'){
        if (this.model.get('representationType') == 'audio'){
        } else if(this.model.get('representationType') == 'bead'){
        } else if(this.model.get('representationType') == 'line'){
        } else if(this.model.get('representationType') == 'pie'){
        } else if(this.model.get('representationType') == 'bar'){
        }
      } else if(this.model.get('previousRepresentationType') == 'bead'){
        if (this.model.get('representationType') == 'audio'){
        } else if(this.model.get('representationType') == 'bead'){
        } else if(this.model.get('representationType') == 'line'){
          this.unrollPie();
        } else if(this.model.get('representationType') == 'pie'){
        } else if(this.model.get('representationType') == 'bar'){
        }
      } else if(this.model.get('previousRepresentationType') == 'line'){
        if (this.model.get('representationType') == 'audio'){
        } else if(this.model.get('representationType') == 'bead'){
        } else if(this.model.get('representationType') == 'line'){
        } else if(this.model.get('representationType') == 'pie'){
        } else if(this.model.get('representationType') == 'bar'){
        }
      } else if(this.model.get('previousRepresentationType') == 'pie'){
        if (this.model.get('representationType') == 'audio'){
        } else if(this.model.get('representationType') == 'bead'){
        } else if(this.model.get('representationType') == 'line'){
        } else if(this.model.get('representationType') == 'pie'){
        } else if(this.model.get('representationType') == 'bar'){
        }
      } else if(this.model.get('previousRepresentationType') == 'bar'){
        if (this.model.get('representationType') == 'audio'){
        } else if(this.model.get('representationType') == 'bead'){
        } else if(this.model.get('representationType') == 'line'){
        } else if(this.model.get('representationType') == 'pie'){
        } else if(this.model.get('representationType') == 'bar'){
        }
      }
    }
  });
});
