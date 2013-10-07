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
      'click .delta' : 'transitionRepresentation',
      'click .record-button' : 'recordMeasure'
    },
    initialize : function(options){
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
        this.measurePassingToBeatViewParameters = this.beatViewParameters(options);
        this.measureRepTemplateParameters = this.templateParameters(options);
        this.measurePassingToBeatFactoryParameters = this.beatFactoryParameters(options);
        var pathFunction = d3.svg.line()
            .x(function (d) {return d.x;})
            .y(function (d) {return d.y;})
            .interpolate('basis'); // bundle | basis | linear | cardinal are also options
        this.pathFunction = pathFunction;

        // allow the letter p to click the first plus sign
        _.bindAll(this, 'manuallPress');
        $(document).bind('keypress', this.manuallPress);

      } else {
        console.error('Should not be in here: NO MeasureRep!');
      }
      //Dispatch listeners
      dispatch.on('signatureChange.event', this.reconfigure, this);
      dispatch.on('unroll.event', this.unroll, this);
      dispatch.on('toggleAnimation.event', this.toggleAnimation, this);
      dispatch.on('resized.event', this.destroy, this);

      this.listenTo(this.model, 'change', this.transition, this);
      // this.listenTo(this.parentMeasureModel, 'change', _.bind(this.render, this));  

      this.render();
    },
    destroy: function(options){
      if (options.cid == this.parentMeasureModel.cid){
        console.log('destroying');
        this.remove();
      }
    },
    makeBeats: function(options){
      if (!options){
        this.measurePassingToBeatViewParameters.beatContainer = '#beat-holder-'+this.measureRepModel.cid;
      } else {
        if (options.secondary){
          this.measurePassingToBeatViewParameters.beatContainer = '#secondary-beat-holder-'+this.measureRepModel.cid;
          this.measurePassingToBeatViewParameters.secondary = options.secondary;
        }
      }
      // for each beat in this measure
      _.each(this.parentMeasureModel.get('beats').models, function(beat, index) {
        // create a Beatview
        this.measurePassingToBeatViewParameters.currentRepresentationType = this.model.get('representationType');
        if (options){
          if (options.type == 'line') {
            //Unsure of why horzDivPadding needs to be divided by 2, but w/e
            this.measurePassingToBeatViewParameters.X1 = this.lbbMeasureLocationX +(this.beatWidth*(index)+this.circularMeasureCx-this.horzDivPadding/2);
            this.measurePassingToBeatViewParameters.X2 = this.lbbMeasureLocationX +(this.beatWidth*(index)+this.circularMeasureCx-this.horzDivPadding/2);
          } else if (options.type == 'bead') {
            // reverse says whether the beads should be unrolled or not
            this.measurePassingToBeatViewParameters.reverse = true;
            if (options.movedToRight){
              this.measurePassingToBeatViewParameters.X1 = this.lbbMeasureLocationX +(this.beatWidth*(index+1));
              this.measurePassingToBeatViewParameters.X2 = this.lbbMeasureLocationX +(this.beatWidth*(index+1));              
            } else {
              this.measurePassingToBeatViewParameters.X1 = this.lbbMeasureLocationX +(this.beatWidth*(index));
              this.measurePassingToBeatViewParameters.X2 = this.lbbMeasureLocationX +(this.beatWidth*(index));
            }
          } else if (options.type == 'bar') {
            this.measurePassingToBeatViewParameters.reverse = true;
            this.measurePassingToBeatViewParameters.beatBBX = this.lbbMeasureLocationX +(this.beatWidth*(index)+this.circularMeasureCx-this.horzDivPadding/2);
          }
        } else {        
          this.measurePassingToBeatViewParameters.X1 = this.lbbMeasureLocationX +(this.beatWidth*(index));
          this.measurePassingToBeatViewParameters.X2 = this.lbbMeasureLocationX +(this.beatWidth*(index));
          this.measurePassingToBeatViewParameters.beatBBX = this.lbbMeasureLocationX +(this.beatWidth*(index));
        }
        this.measurePassingToBeatViewParameters.model = beat;
        this.measurePassingToBeatViewParameters.singleBeat = '#beat'+beat.cid;
        this.measurePassingToBeatViewParameters.beatIndex = index;
        this.measurePassingToBeatViewParameters.beatStartAngle = ((360 / this.beatsInMeasure)*index);
        this.measurePassingToBeatViewParameters.beatStartTime = this.firstBeatStart+(index)*(this.timeIncrement/1000);
        this.measurePassingToBeatViewParameters.color = index;

        new BeatView(this.measurePassingToBeatViewParameters);
      }, this);
    },
    beatFactoryParameters : function(options){
      return {
        // beat, number of beats, each beat's color, location, path
        measureModel: this.measureModel,
        beatFactoryHolder: this.beatFactoryHolder,
        beatsInMeasure: this.beatsInMeasure,
        remainingNumberOfBeats: 16-this.beatsInMeasure,
        currentRepresentationType: options.model.get('representationType'),
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
        beatFactoryBarWidth: this.beatFactoryBarWidth,
        beatFactoryBarHeight: this.beatFactoryBarHeight,
        linearLineLength: this.linearLineLength,
        lbbMeasureLocationY: this.lbbMeasureLocationY
      }
    },
    beatViewParameters : function(options){
      return {
        //General
        parentMeasureModel: this.parentMeasureModel,
        parentElHolder: '#beatHolder'+options.measureRepModel.cid,
        parentMeasureRepModel: this.measureRepModel,
        parentCID: this.measureRepModel.cid,
        margin : this.margin,
        currentRepresentationType: this.model.get('representationType'),
        beatsInMeasure: this.beatsInMeasure,
        // To use the range of colors
        // To use one color
        // color: x,
        timeIncrement: this.timeIncrement,
        // Bar
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
        Y1: this.numberLineY - this.lineHashHeight/2,
        Y2: this.numberLineY + this.lineHashHeight/2,
        // Circular Pie
        circularMeasureCx: this.circularMeasureCx,
        circularMeasureCy: this.circularMeasureCy,
        circularMeasureR: this.circularMeasureR,
        beatAngle: 360 / this.beatsInMeasure,
        
        // Circular Bead
        circularBeadBeatRadius: this.circularBeadBeatRadius,
        circleStates: this.circleStates,
        transitionNumberOfPoints: this.transitionNumberOfPoints,
        // Transition
        transitionDuration: this.transitionDuration,

        //Audio
        audioMeasureCx: this.audioMeasureCx,
        audioMeasureCy: this.audioMeasureCy,
        audioMeasureR: this.audioMeasureR,
        audioBeatCx: this.audioBeatCx,
        audioBeatCy: this.audioBeatCy,
        audioBeatR: this.audioBeatR,
        colorForAudio: this.colorForAudio,
        opacityForAudio: .2/this.beatsInMeasure
      }
    },
    templateParameters : function(options){
      return {
        measureRepID: 'measure-rep-'+options.measureRepModel.cid,
        measureClasses: 'measureRep measure-'+this.model.get('representationType'),
        measureRepDeltaID: 'delta-'+this.measureRepModel.cid,
        measureRepSVGID: 'svg-'+this.measureRepModel.cid,
        svgClasses: this.model.get('representationType'),
        measureRepType: this.model.get('representationType'),
        beatHolderID: 'beat-holder-'+this.measureRepModel.cid,
        secondaryBeatHolderID: 'secondary-beat-holder-'+this.measureRepModel.cid,
        beatFactoryHolderID: this.beatFactoryHolder,
        measureCount: this.measureCount,
        measureRep: this.model.get('representationType'),
        measureRepRecordID: 'record-'+this.measureRepModel.cid
      }
    },
    circleStart: function(e, ui) {
      console.log('circle start');
      if(this.oldW === undefined){
        console.log('this.oldW is undefined');
        this.oldW = ui.originalSize.width;
        this.oldH = ui.originalSize.height;
      }
      console.log(this.oldW)
      // because I don't know how to compute the arc from a point, I generate the pie slices and then move them as a group.  Thus we have to get the group's transform translate, and store the number, so that when we scale the slices in the next func(), we also translate them the original amount, otherwise when we are scaling it, the slices are not translated, and the origin is 0,0
      if (this.pieTranslate == undefined){
        this.pieTranslate = d3.select('#svg-'+this.measureRepModel.cid).select('g').attr('transform')
      }
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
    },
    circleResizeCallback: function( e, ui ) {
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      // console.log(e, ui)
      var newW = Math.floor(ui.size.width);
      var newH = Math.floor(ui.size.height);
      var deltaWidth = newW - this.oldW;
      var deltaHeight = newH - this.oldH;
      var deltaRatio = deltaWidth/this.oldW;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid);
      console.log(deltaWidth, deltaHeight);
      // To handle a wierd issue with the svgContainer reducing faster than the resize, we only want to grow the container when the measureRep is increased
      if ( deltaWidth>0 || deltaHeight>0 ){
        svgContainer.attr('width', parseInt(svgContainer.attr('width'))+deltaWidth );
        svgContainer.attr('height', parseInt(svgContainer.attr('height'))+deltaHeight );
      }
      if(this.model.get('representationType') == 'bead'){
        var circlePath = svgContainer.select('path');
        var scale = circlePath.attr('transform').slice(6, circlePath.attr('transform').length-1);
        this.scale = (this.originalScale+deltaRatio);
        // aspect ratio scale the measure circle, and the beats
        circlePath
            .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')');
        // svgContainer.selectAll('g')
              // .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')');
      } else if (this.model.get('representationType') == 'pie'){
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
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height);
      dispatch.trigger('resized.event', { cid: this.parentMeasureModel.cid });

      this.parentMeasureModel.setScale(this.scale);
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
      if(this.model.get('representationType') == 'line'){
        var linePath = svgContainer.select('path');
        var beatLines = svgContainer.select('g');
        var scale = linePath.attr('transform').slice(6, linePath.attr('transform').length-1);
        // var linePathCurrentScale = parseInt(scale.slice(0, scale.indexOf(',')));
        this.scale = (this.originalScale+deltaRatio);
        // linearly scale the Line, and the beats
        linePath
            .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
        beatLines
              .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
      } else if (this.model.get('representationType') == 'bar'){
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
    audioAnimate: function(target, dur, selected) {
      var d3Target = d3.select(target);
      var originalOpacity = target.getAttribute('opacity');
      if(selected == true){
        var newOpacity = 1;
      } else {
        var newOpacity = originalOpacity;
      }
      d3Target.transition()
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
    beadAnimate: function(target, dur) {
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
    lineAnimate: function(target, dur) {
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
    pieAnimate: function(target, dur) {
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
    barAnimate: function(target, dur) {
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
                self.audioAnimate(beats.eq(counter)[0], dur/2, selected);
              } else if (self.currentRepresentationType == 'bead'){
                var beats = $('#measure-rep-'+self.measureRepModel.cid).find('.bead-beat');
                self.beadAnimate(beats.eq(counter)[0], dur/2);
              } else if (self.currentRepresentationType == 'line'){
                var beats = $('#measure-rep-'+self.measureRepModel.cid).find('.line-beat');
                self.lineAnimate(beats.eq(counter)[0], dur/2);
              } else if (self.currentRepresentationType == 'pie'){
                var beats = $('#measure-rep-'+self.measureRepModel.cid).find('.pie-beat');
                self.pieAnimate(beats.eq(counter)[0], dur/2);
              } else if (self.currentRepresentationType == 'bar'){
                var beats = $('#measure-rep-'+self.measureRepModel.cid).find('.bar-beat');
                self.barAnimate(beats.eq(counter)[0], dur/2);
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
    movePrimaryLeft: function() {
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid)
        .transition()
          .attr('transform', 'translate('+(-1)*(this.circularMeasureR*2)+',0)')
          .duration(this.transitionDuration);
      this.circlePath
        .transition()
          .attr('transform', 'translate('+(-1)*(this.circularMeasureR*2)+',0)')
          .duration(this.transitionDuration);
    },
    movePrimaryRight: function() {
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid)
        .transition()
          .attr('transform', 'translate('+this.circularMeasureR*2+',0)')
          .duration(this.transitionDuration);
      var actualMeasureLinePath = d3.select('#svg-'+this.measureRepModel.cid + ' .line-path')
        .transition()
          .attr('transform', 'translate(0,0)')
          .duration(this.transitionDuration);
    },
    moveSecondaryLeft: function(options) {
      var beatHolder = d3.select('#secondary-beat-holder-'+this.measureRepModel.cid)
        .transition()
          .attr('transform', 'translate('+(-1)*(this.circularMeasureR*2)+',0)')
          .duration(this.transitionDuration);
      if (options){
        this.circlePath
          .transition()
            .attr('transform', 'translate('+(-1)*(this.circularMeasureR*2)+',0)')
            .duration(this.transitionDuration);
      }
    },
    moveSecondaryRight: function(options) {
      if (options){
        console.log('get');
        var actualMeasureLinePath = d3.select('#svg-'+this.measureRepModel.cid + ' .hidden-line-path')
          .transition()
            .attr('transform', 'translate(0,0)')
            .duration(this.transitionDuration);
        var movement = 0;
      } else {
        var movement = this.circularMeasureR*2;
      }
      var beatHolder = d3.select('#secondary-beat-holder-'+this.measureRepModel.cid)
        .transition()
          .attr('transform', 'translate('+movement+',0)')
          .duration(this.transitionDuration);
    },
    addInfiniteLine: function() {
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid);
      var infiniteLine = svgContainer
        .insert('line', ':first-child')
        .attr('class', 'infinite-line')
        .attr('x1', -200)
        .attr('y1', this.numberLineY)
        .attr('x2', 1000)
        .attr('y2', this.numberLineY)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('opacity', .5);
    },
    removeInfiniteLine: function() {
      var infiniteLine = d3.select('#svg-'+this.measureRepModel.cid + ' .infinite-line');
      infiniteLine.remove();
    },
    removeBarBox: function() {
      var barBox = d3.select('#svg-'+this.measureRepModel.cid + ' .bar-box');
      barBox.remove();      
    },
    beadToLine: function(options) {
      console.log('btl');
      var ƒthis = this;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.linearDivWidth+this.circularMeasureR*2 );
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid);
      var beadBeats = beatHolder.selectAll('.bead-beat');

      dispatch.trigger('beatTransition.event', ƒthis);
      for(i=0; i<this.transitionNumberOfPoints; i++){
        this.circlePath.data([this.circleStates[i]])
          .transition()
            .delay(this.transitionDuration*i)
            .duration(this.transitionDuration)
            .ease('linear')
            .attr('d', this.pathFunction)
      };
      setTimeout(function(){
        ƒthis.makeBeats({secondary:true, type:'line'});
        $('#beat-holder-'+this.measureRepModel.cid+' .bead-beat').fadeOut(this.animationIntervalDuration);
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration);
      setTimeout(function(){
        beadBeats.remove();
        ƒthis.addInfiniteLine();
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*2 );
      setTimeout(function(){
        ƒthis.moveSecondaryLeft('bead');
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*3 );
      setTimeout(function(){
        // this sets the transition count on the model itself, which the beatView is listening to
        dispatch.trigger('reRenderMeasure.event', this);
        // ƒthis.parentMeasureModel.increaseTransitionCount();
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*4 );
    },
    beadToBar: function(){
      console.log('btr');
      var ƒthis = this;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.linearDivWidth+this.circularMeasureR*2 );
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid);
      var beadBeats = beatHolder.selectAll('.bead-beat');
      var circlePath = $('#svg-'+this.measureRepModel.cid + ' .circle-path');

      dispatch.trigger('beatTransition.event', ƒthis);
      for(i=0; i<this.transitionNumberOfPoints; i++){
        this.circlePath.data([this.circleStates[i]])
          .transition()
            .delay(this.transitionDuration*i)
            .duration(this.transitionDuration)
            .ease('linear')
            .attr('d', this.pathFunction)
      };
      setTimeout(function(){
        ƒthis.makeBeats({secondary:true, type:'bar'});
        $('.bead-beat').fadeOut(this.animationIntervalDuration);
        circlePath.fadeOut(this.animationIntervalDuration);
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration);
      setTimeout(function(){
        beadBeats.remove();
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*2 );
      setTimeout(function(){
        ƒthis.moveSecondaryLeft('bead');
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*3 );
      setTimeout(function(){
        // this sets the transition count on the model itself, which the beatView is listening to
        dispatch.trigger('reRenderMeasure.event', this);
        // ƒthis.parentMeasureModel.increaseTransitionCount();
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*4 );
    },
    beadToPie: function(){
      console.log('btp');
      var ƒthis = this;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid);
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid);
      var beadBeats = beatHolder.selectAll('.bead-beat');
      var circlePath = $('#svg-'+this.measureRepModel.cid + ' .circle-path');

      setTimeout(function(){
        ƒthis.makeBeats({secondary:true, type:'pie'});
        $('.bead-beat').fadeOut(this.animationIntervalDuration);
        // circlePath.fadeOut(this.animationIntervalDuration);
      }, this.animationIntervalDuration);
      setTimeout(function(){
        beadBeats.remove();
      }, this.animationIntervalDuration*2 );
      setTimeout(function(){
        // this sets the transition count on the model itself, which the beatView is listening to
        dispatch.trigger('reRenderMeasure.event', this);
        // ƒthis.parentMeasureModel.increaseTransitionCount();
      }, this.animationIntervalDuration*3 );
    },
    lineToBar: function(){
      console.log('ltr');
      var ƒthis = this;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid);
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid);
      var lineBeats = beatHolder.selectAll('.line-beat');
      setTimeout(function(){
        ƒthis.removeInfiniteLine();
        ƒthis.moveSecondaryLeft();
      }, this.animationIntervalDuration );
      setTimeout(function(){
        ƒthis.makeBeats({secondary:true, type:'bar'});
        $('#beat-holder-'+ƒthis.measureRepModel.cid+' .line-beat').fadeOut(this.animationIntervalDuration);
        $('#svg-'+ƒthis.measureRepModel.cid+' .line-path').fadeOut(this.animationIntervalDuration);
      }, this.animationIntervalDuration*2 );
      setTimeout(function(){
        // ƒthis.parentMeasureModel.increaseTransitionCount();
        dispatch.trigger('reRenderMeasure.event', this);
      }, this.animationIntervalDuration*3 );
    },
    lineToBead: function(options) {
      console.log('ltb');
      var ƒthis = this;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
        .attr('width', this.linearDivWidth+this.circularMeasureR*2 )
        .attr('height', this.linearDivHeight+this.circularMeasureR*2 );
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid);
      var lineBeats = beatHolder.selectAll('.line-beat');
      setTimeout(function(){
        ƒthis.movePrimaryRight();
      }, this.transitionDuration + this.animationIntervalDuration );
      setTimeout(function(){
        ƒthis.removeInfiniteLine();
      }, this.transitionDuration + this.animationIntervalDuration*2 );
      setTimeout(function(){
        ƒthis.makeBeats({secondary:true, type:'bead'});
      }, this.transitionDuration + this.animationIntervalDuration*3 );
      setTimeout(function(){
        lineBeats.remove();
      }, this.transitionDuration + this.animationIntervalDuration*4 );
      setTimeout(function(){
        dispatch.trigger('beatTransition.event', ƒthis);
        for(i=0; i<ƒthis.transitionNumberOfPoints; i++){
          ƒthis.actualMeasureLinePath.data([ƒthis.circleStates[ƒthis.transitionNumberOfPoints-1-i]])
            .transition()
              .delay(ƒthis.transitionDuration*i)
              .duration(ƒthis.transitionDuration)
              .ease('linear')
              .attr('d', ƒthis.pathFunction)
              .attr('stroke', 'black')
              .attr('opacity', 1)
              .attr('class', 'circle')
              .attr('class', 'circle-path');
        }
      }, this.transitionDuration + this.animationIntervalDuration*5);
      setTimeout(function(){
        // ƒthis.parentMeasureModel.increaseTransitionCount();
        dispatch.trigger('reRenderMeasure.event', this);
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*6 );
    },
    lineToPie: function(){
      console.log('ltb');
      var ƒthis = this;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
        .attr('width', this.linearDivWidth+this.circularMeasureR*2 )
        .attr('height', this.linearDivHeight+this.circularMeasureR*2 );
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid);
      var lineBeats = beatHolder.selectAll('.line-beat');
      setTimeout(function(){
        ƒthis.movePrimaryRight();
      }, this.transitionDuration + this.animationIntervalDuration );
      setTimeout(function(){
        ƒthis.removeInfiniteLine();
      }, this.transitionDuration + this.animationIntervalDuration*2 );
      setTimeout(function(){
        ƒthis.makeBeats({secondary:true, type:'pie'});
      }, this.transitionDuration + this.animationIntervalDuration*3 );
      setTimeout(function(){
        lineBeats.remove();
      }, this.transitionDuration + this.animationIntervalDuration*4 );
      setTimeout(function(){
        dispatch.trigger('beatTransition.event', ƒthis);
        for(i=0; i<ƒthis.transitionNumberOfPoints; i++){
          ƒthis.actualMeasureLinePath.data([ƒthis.circleStates[ƒthis.transitionNumberOfPoints-1-i]])
            .transition()
              .delay(ƒthis.transitionDuration*i)
              .duration(ƒthis.transitionDuration)
              .ease('linear')
              .attr('d', ƒthis.pathFunction)
              .attr('stroke', 'black')
              .attr('opacity', 1)
              .attr('class', 'circle')
              .attr('class', 'circle-path');
        }
      }, this.transitionDuration + this.animationIntervalDuration*5);
      setTimeout(function(){
        // ƒthis.parentMeasureModel.increaseTransitionCount();
        dispatch.trigger('reRenderMeasure.event', this);
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*6 );
    },
    barToLine: function(){
      console.log('rtl');
      var ƒthis = this;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid);
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid);
      setTimeout(function(){
        ƒthis.removeBarBox();
        ƒthis.makeBeats();
        $('#beat-holder-'+ƒthis.measureRepModel.cid+' .bar-beat').fadeOut(this.animationIntervalDuration);
      }, this.animationIntervalDuration );
      setTimeout(function(){
        ƒthis.addInfiniteLine();
      }, this.animationIntervalDuration*2 );
      setTimeout(function(){
        // ƒthis.parentMeasureModel.increaseTransitionCount();
        dispatch.trigger('reRenderMeasure.event', this);
      }, this.animationIntervalDuration*3 );      
    },
    barToBead: function(){
      console.log('rtb');
      console.log(this.actualMeasureLinePath);
      var ƒthis = this;
      var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
        .attr('width', this.linearDivWidth+this.circularMeasureR*2 )
        .attr('height', this.linearDivHeight+this.circularMeasureR*2 );
      var beatHolder = d3.select('#beat-holder-'+this.measureRepModel.cid);
      setTimeout(function(){
        ƒthis.removeBarBox();
        ƒthis.moveSecondaryLeft();
      }, this.animationIntervalDuration );
      setTimeout(function(){
        $('#beat-holder-'+ƒthis.measureRepModel.cid+' .bar-beat').fadeOut(this.animationIntervalDuration);
        ƒthis.makeBeats({secondary:true, type:'bead' });
      }, this.animationIntervalDuration*2 );
      setTimeout(function(){
        var actualMeasureLinePath = d3.select('#svg-'+ƒthis.measureRepModel.cid+' .hidden-line-path')
          .transition()
            .attr('stroke', 'black');
      }, this.animationIntervalDuration*3 );
      setTimeout(function(){
        ƒthis.moveSecondaryRight('options');
      }, this.animationIntervalDuration*4 );
      setTimeout(function(){
        dispatch.trigger('beatTransition.event', ƒthis);
        for(i=0; i<ƒthis.transitionNumberOfPoints; i++){
          ƒthis.actualMeasureLinePath.data([ƒthis.circleStates[ƒthis.transitionNumberOfPoints-1-i]])
            .transition()
              .delay(ƒthis.transitionDuration*i)
              .duration(ƒthis.transitionDuration)
              .ease('linear')
              .attr('d', ƒthis.pathFunction)
              .attr('stroke', 'black')
              .attr('opacity', 1)
              .attr('class', 'circle')
              .attr('class', 'circle-path');
        }
      }, this.animationIntervalDuration*5 );      
      setTimeout(function(){
        ƒthis.parentMeasureModel.increaseTransitionCount();
        dispatch.trigger('reRenderMeasure.event', this);
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*6 );      
    },
    render: function(){
      console.log('mR render');
      var ƒthis = this;

      //set the el for JQ-UI Drag
      // may not be needed
      this.$el.attr('id', 'measure-rep-' + this.measureRepModel.cid);

      // compile the template for a representation
      var compiledTemplate = _.template( MeasureRepTemplate, this.measureRepTemplateParameters );
      // put in the rendered template in the measure-rep-container of the measure
      $(this.repContainerEl).append( compiledTemplate );
      this.setElement($('#measure-rep-'+this.measureRepModel.cid));

      if (this.model.get('representationType') == 'bead') {
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.circularDivWidth)
            .attr('height', this.circularDivHeight);
        var circlePath = svgContainer
            .insert('path', ':first-child')
            .data([this.circleStates[0]])
            .attr('d', this.pathFunction)
            .attr('stroke', 'black')
            .attr('opacity', 1)
            .attr('class', 'circle')
            .attr('class', 'circle-path')
            .attr('transform', 'scale('+this.originalScale+','+this.originalScale+')');
            this.circlePath = circlePath;

        // JQ-UI resizable
        this.$el.resizable({ 
          aspectRatio: true,
          // To keep the number Math.Floored
          grid:1,
          // ghost:true,
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

      } else if (this.model.get('representationType') == 'line'){
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.linearDivWidth)
            .attr('height', this.linearDivHeight);
        var infiniteLine = svgContainer
            .insert('line', ':first-child')
            .attr('class', 'infinite-line')
            .attr('x1', -200)
            .attr('y1', this.numberLineY)
            .attr('x2', 10000)
            .attr('y2', this.numberLineY)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('opacity', .5)
        var actualMeasureLinePath = svgContainer
            .insert('path', ':first-child')
            .data([this.circleStates[this.transitionNumberOfPoints-1]])
            .attr('d', this.pathFunction)
            .attr('stroke', 'black')
            .attr('opacity', 1)
            .attr('class', 'line')
            .attr('class', 'line-path')
            .attr('transform', 'scale('+this.originalScale+','+this.originalScale+')')
            .attr('transform', 'translate('+(this.circularMeasureR*-2-10)+',0)');
        this.actualMeasureLinePath = actualMeasureLinePath;

        // JQ-UI resizable
        $(this.el).resizable({ 
          maxHeight: 180, 
          minHeight: 180,
          grid:1,
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
      } else if (this.model.get('representationType') == 'pie'){
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.circularDivWidth)
            .attr('height', this.circularDivHeight);
        var circlePath = svgContainer
            .insert('path', ':first-child')
            .data([this.circleStates[0]])
            .attr('d', this.pathFunction)
            .attr('stroke', 'black')
            .attr('opacity', 1)
            .attr('class', 'circle')
            .attr('class', 'circle-path')
            .attr('transform', 'scale('+this.originalScale+','+this.originalScale+')');

        // JQ-UI resizable
        $(this.el).resizable({ 
          aspectRatio: true,
          grid:1,
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
      } else if (this.model.get('representationType') == 'audio'){
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
        var circlePath = svgContainer
            .insert('circle', ':first-child')
            .attr('cx', this.audioMeasureCx)
            .attr('cy', this.audioMeasureCy)
            .attr('r', this.audioMeasureR)
            .attr('fill', 'none')
            .attr('stroke', 'black');
      } else if (this.model.get('representationType') == 'bar'){
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            .attr('width', this.linearDivWidth)
            .attr('height', this.linearDivHeight);
        var box = svgContainer
            .insert('rect', ':first-child')
            .attr('class', 'bar-box')
            .attr('x', this.lbbMeasureLocationX)
            .attr('y', this.lbbMeasureLocationY)
            .attr('width', this.linearLineLength)
            .attr('height', this.measureHeight)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('fill', 'white')
            .attr('transform', 'scale('+this.originalScale+','+this.originalScale+')');
            this.box = box;
        var actualMeasureLinePath = svgContainer
            .insert('path', ':first-child')
            .data([ƒthis.circleStates[ƒthis.transitionNumberOfPoints-1]])
            .attr('d', ƒthis.pathFunction)
            .attr('stroke', 'none')
            .attr('opacity', 1)
            .attr('class', 'line')
            .attr('class', 'hidden-line-path')
            .attr('transform', 'scale('+ƒthis.originalScale+','+ƒthis.originalScale+')')
            .attr('transform', 'translate('+(ƒthis.circularMeasureR*-2-10)+',0)');
            this.actualMeasureLinePath = actualMeasureLinePath;


        // JQ-UI resizable
        $(this.el).resizable({ 
          // aspectRatio: true,
          maxHeight: 180, 
          minHeight: 180,
          grid:1,
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

      // make the beats
      this.makeBeats();
      // make a beat factory
      this.makeBeatFactory();

      return this;
    },
    makeBeatFactory: function(){
      if (this.model.get('representationType') == 'bead') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParameters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParameters.cX = this.horzDivPadding + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.cY = (this.circularDivHeight-this.vertDivPadding-this.beatFactoryR) + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          new BeadFactoryView(this.measurePassingToBeatFactoryParameters);
        }
      } else if (this.model.get('representationType') == 'line') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParameters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParameters.x1 = this.horzDivPadding + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.y1 = this.numberLineY + 60 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.x2 = this.measurePassingToBeatFactoryParameters.x1;
          this.measurePassingToBeatFactoryParameters.y2 = this.measurePassingToBeatFactoryParameters.y1 + this.lineHashHeight;
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          new BeadFactoryView(this.measurePassingToBeatFactoryParameters);
        }        
      } else if (this.model.get('representationType') == 'pie') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParameters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParameters.cX = this.horzDivPadding + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.cY = (this.circularDivHeight-this.vertDivPadding*3 - this.beatFactoryR*2) + (Math.random() * (30) - 20);
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          new BeadFactoryView(this.measurePassingToBeatFactoryParameters);
        }        
      } else if (this.model.get('representationType') == 'bar') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParameters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParameters.x = this.horzDivPadding + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.y = this.numberLineY + 90 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.beatHeight = this.beatHeight;
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          new BeadFactoryView(this.measurePassingToBeatFactoryParameters);
        }        
      }      
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
        if(this.measureRepresentations.length == 1) {
          console.log('Can\'t remove the last representation!');
          return;
        }
        console.log('removed representation');

        var measureModelCid = ev.srcElement.parentElement.parentElement.parentElement.id.slice(12);
        //we remove the measureRep and get its model.
        this.measureRepresentations.remove(measureModelCid);

        //send a log event showing the removal.
        log.sendLog([[3, 'Removed a measure representation: ' + this.cid]]);
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
    transitionRepresentation: function(e){
      e.srcElement.classList.add('transition-rep');
      console.log('transitioning a rep');
    },
    transition: function(){
      var PRT = this.model.get('previousRepresentationType');
      var CRT = this.model.get('representationType');

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
          this.beadToLine();
        } else if(this.model.get('representationType') == 'pie'){
          this.beadToPie();
        } else if(this.model.get('representationType') == 'bar'){
          this.beadToBar();
        }
      } else if(this.model.get('previousRepresentationType') == 'line'){
        if (this.model.get('representationType') == 'audio'){
        } else if(this.model.get('representationType') == 'bead'){
          this.lineToBead();
        } else if(this.model.get('representationType') == 'line'){
        } else if(this.model.get('representationType') == 'pie'){
          this.lineToPie();
        } else if(this.model.get('representationType') == 'bar'){
          this.lineToBar();
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
          this.barToBead();
        } else if(this.model.get('representationType') == 'line'){
          this.barToLine();
        } else if(this.model.get('representationType') == 'pie'){
        } else if(this.model.get('representationType') == 'bar'){
        }
      }
    },
    manuallPress: function(e) {
      // t = 116, d = 100
      if (e.keyCode == 116) {
        $('.measureRep:nth-child(2)').find('.delta').addClass('transition-rep')
      } else if (e.keyCode == 100) {
        // $('.measureRep')[1].
      }
    },
    recordMeasure: function(button) {
      console.log('Record clicked');
      if(!this.isTapping) {
        dispatch.trigger('doall.event');
        this.isTapping = true;
      }
      else {
        dispatch.trigger('doall.event');
        this.isTapping = false;
      }
    }

  });
});
