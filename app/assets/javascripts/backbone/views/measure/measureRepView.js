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
  'backbone/views/beat/auxBeatView',
  'backbone/views/factory/beatFactoryView',
  'text!backbone/templates/measure/measureRep.html',
  'colors',
  'app/log'
], function($, _, Backbone, BeatsCollection, MeasureModel, RepresentationModel, StateModel, BeatView, AuxBeatView, BeatFactoryView, MeasureRepTemplate, COLORS, log){
  return Backbone.View.extend({
    //registering click events to add and remove measures.
    events : {
      'click .remove-measure-rep' : 'removeRepresentationModel',
      'click .delta' : 'transitionRepresentation',
      'click .record-button' : 'recordMeasure'
    },
    initialize : function(options){
      //if we're being created by a MeasureView, we are passed in options. Otherwise we create a single
      //measure and add it to our collection.
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }

        // Using the new variables to attach various things to the view
        this.repContainerEl = options.measureRepContainer;
        this.measurePassingToBeatViewParameters = this.beatViewParameters(options);
        this.measureRepTemplateParameters = this.templateParameters(options);
        this.measurePassingToBeatFactoryParameters = this.beatFactoryParameters(options);
        // This is to create a line in d3
        this.pathFunction = d3.svg.line()
            .x(function (d) {return d.x;})
            .y(function (d) {return d.y;})
            .interpolate('basis'); // bundle | basis | linear | cardinal are also options

        // allow the letter p to click the first plus sign
        _.bindAll(this, 'manuallPress');
        $(document).bind('keypress', this.manuallPress);

      } else {
        console.error('measureRepView(init): Should not be in here!');
      }

      this.childPrimaryViews = [];
      this.childSecondaryViews = [];
      this.childTertiaryViews = [];
      this.childFactoryViews = [];

      //Dispatch listeners
      // TODO Replace these events

      this.listenTo(this.parentHTrackView, 'toggleAnimation', this.toggleAnimation);
      this.parentMeasureModel.get('beats').on('add', this.updateRender, this);
      // dispatch.on('toggleAnimation.event', this.toggleAnimation, this);
      // dispatch.on('signatureChange.event', this.reconfigure, this);
      // dispatch.on('unroll.event', this.unroll, this);
      // dispatch.on('resized.event', this.destroy, this);

      this.listenTo(this.model, 'change:currentRepresentationType', this.transition, this);
      // this.listenTo(this.model, 'destroy', this.close, this);

      this.render();

      // make the beats
      this.makeBeats();
      // make a beat factory
      this.makeBeatFactory();

    },
    computeNormalBeatViewParameters: function(beatModel, index){      
      this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
      this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
      // this.model.set({beatBBX: this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index))});
      this.measurePassingToBeatViewParameters.beatBBX = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));

      // All beat params
      this.measurePassingToBeatViewParameters.model = beatModel;
      this.measurePassingToBeatViewParameters.parentMeasureRepModel = this.model;
      this.measurePassingToBeatViewParameters.singleBeat = '#beat'+beatModel.cid;
      this.measurePassingToBeatViewParameters.beatIndex = index;
      this.model.set({beatStartAngle: ((360 / this.parentMeasureModel.get('beats').models.length)*index)});
      this.measurePassingToBeatViewParameters.beatStartTime = this.model.get('firstBeatStart')+(index)*(this.model.get('timeIncrement')/1000);
      this.measurePassingToBeatViewParameters.color = index;
      this.measurePassingToBeatViewParameters.circleStates = this.model.get('circleStates');
    },
    computeTransitionBeatViewParameters: function(beatModel, index, options){
      // Linestates must be defined here to propagate through transitions
      var lineStatesUnrolling = [];
      var lineStatesRollup = [];
      var sliceLength = this.model.get('transitionNumberOfPoints')/this.parentMeasureModel.get('beats').models.length;
      for ( var i=0 ; i<this.model.get('transitionNumberOfPoints') ; i++ ){
        var startIndex = (index*sliceLength);// - subtractor;
        var inner = this.model.get('circleStates')[i].slice(startIndex, startIndex+sliceLength);
        lineStatesUnrolling.push(inner);
        lineStatesRollup.splice(0,0,inner);
      }
      this.measurePassingToBeatViewParameters.lineStatesUnrolling = lineStatesUnrolling;
      this.measurePassingToBeatViewParameters.lineStatesRollup = lineStatesRollup;
        // For each subsequent line, we need to start at the last point of the previous line
          // var subtractor = (index==0) ? 0 : 1 ;

      // transition beat params
      if (options){
        this.measurePassingToBeatViewParameters.drawType = options.type;
        this.measurePassingToBeatViewParameters.opacity = beatModel.get('selected');
        if (options.type == 'line') {
          //Unsure of why horzDivPadding needs to be divided by 2, but w/e
          this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index)+this.model.get('circularMeasureCx')-this.model.get('horzDivPadding')/2);
          this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index)+this.model.get('circularMeasureCx')-this.model.get('horzDivPadding')/2);
        } else if (options.type == 'bead') {
          if (options.movedToRight){
            this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index+1));
            this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index+1));
          } else {
            this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
            this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
          }
        } else if (options.type == 'beadCircle') {
          if (options.movedToRight){
            this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index+1));
            this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index+1));
          } else {
            this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
            this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
          }
        } else if (options.type == 'bar') {
          // TODO Figure out the pixel difference
          this.measurePassingToBeatViewParameters.beatBBX = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index)+this.model.get('circularMeasureCx')-this.model.get('horzDivPadding')/2);
        } else if (options.type == 'lineRolling') {

        } else if (options.type == 'lineUnrolling') {

        } else if (options.type == 'pie') {

        }
      // Normal beat params
      } else {        
        console.error('Should not be in here! mRV computeTransitionBeatViewParameters')
      }
      // All beat params
      this.measurePassingToBeatViewParameters.parentMeasureReppietolineModel = this.model;
      this.measurePassingToBeatViewParameters.beatIndex = index;
      this.model.set({beatStartAngle: ((360 / this.parentMeasureModel.get('beats').models.length)*index)});
      this.measurePassingToBeatViewParameters.beatStartTime = this.model.get('firstBeatStart')+(index)*(this.model.get('timeIncrement')/1000);
      this.measurePassingToBeatViewParameters.color = index;
      this.measurePassingToBeatViewParameters.lineStatesUnrolling = lineStatesUnrolling;
      this.measurePassingToBeatViewParameters.lineStatesRollup = lineStatesRollup;
      this.measurePassingToBeatViewParameters.circleStates = this.model.get('circleStates');
    },
    // This is a bad way of handling view deletion, but idk better
    destroy: function(options){
      console.warn(options);
      if (options.cid == this.parentMeasureModel.cid){
        console.log('destroying');
        this.remove();
      }
    },
    // This is abstracted out so we can just call makeBeats() when needed
    // If there are options, it is for the second or third part for transitions {secondary:true, type:'line'}
    makeBeats: function(options){
      // Setting which container the beats go in, primary for first rendering, seconary for transitions
      if (!options){
        // If we aren't adding beats in the second or third container, we are basically rerendering, so we delete the children and put in a new set of beats
        this.measurePassingToBeatViewParameters.beatContainer = '#beat-holder-'+this.model.cid;
      } else {
        if (options.secondary){
          this.measurePassingToBeatViewParameters.beatContainer = '#secondary-beat-holder-'+this.model.cid;
          this.measurePassingToBeatViewParameters.secondary = options.secondary;
        } else if (options.tertiary){
          this.measurePassingToBeatViewParameters.beatContainer = '#tertiary-beat-holder-'+this.model.cid;
          this.measurePassingToBeatViewParameters.tertiary = options.tertiary;
        }
      }

      // for each beat in this measureRep
      µthis = this;
      _.all(this.parentMeasureModel.get('beats').models, function(beatModel, index) {
        // Make a new beat
        if(!options){
          µthis.computeNormalBeatViewParameters(beatModel, index);
          // create a Beatview
          var newBeatView = new BeatView(this.measurePassingToBeatViewParameters);
          this.childPrimaryViews.push(newBeatView);
        // Make a secondary or third beat
        } else if(options.secondary){
          µthis.computeTransitionBeatViewParameters(beatModel, index, options);
          // create a Secondary Beatview
          var newBeatView = new AuxBeatView(this.measurePassingToBeatViewParameters);
          this.childSecondaryViews.push(newBeatView);
        } else if(options.tertiary){
          µthis.computeTransitionBeatViewParameters(beatModel, index, options);
          // create a Tertirary Beatview
          var newBeatView = new AuxBeatView(this.measurePassingToBeatViewParameters);
          this.childTertiaryViews.push(newBeatView);          
        } else {
          console.error('Should NOT be in here: measureRepView beat making, not primary, secondary, or tertiary beat');
        }
        // if(options){console.error(this.measurePassingToBeatViewParameters);}
        // if (this.currentRepresentationType == 'audio') {
        //   return false;
        // } else {
        //   return true;
        //   //or 
        //   return this;
        // }
        return this;
      }, this);
    },
    // These are the parameters for the beat factory
    beatFactoryParameters: function(options){
      return {
        parentMeasureModel: this.parentMeasureModel,
        beatFactoryHolder: '#beat-factory-holder-'+this.model.cid,
        parentMeasureRepModel: this.model
      }
    },
    // These are the parameters for the beatView
    beatViewParameters: function(options){
      this.model.set({beatAngle: 360/this.parentMeasureModel.get('beats').models.length});
      return {
        //General
        parentMeasureRepView: this,
        parentMeasureModel: this.parentMeasureModel,
        parentMeasureRepModel: this.model,
        // Line
        Y1: this.model.get('numberLineY') - this.model.get('lineHashHeight')/2,
        Y2: this.model.get('numberLineY') + this.model.get('lineHashHeight')/2,
      }
    },
    // These are the template parameters for the HTML of the MeasureRepView
    templateParameters: function(options){
      return {
        measureRepID: 'measure-rep-'+options.model.cid,
        measureClasses: 'measureRep measure-'+this.model.get('currentRepresentationType'),
        measureRepDeltaID: 'delta-'+this.model.cid,
        measureRepSVGID: 'svg-'+this.model.cid,
        svgClasses: this.model.get('currentRepresentationType'),
        measureRepType: this.model.get('currentRepresentationType'),
        beatHolderID: 'beat-holder-'+this.model.cid,
        secondaryBeatHolderID: 'secondary-beat-holder-'+this.model.cid,
        beatFactoryHolderID: 'beat-factory-holder-'+this.model.cid,
        measureCount: this.measureCount,
        measureRep: this.model.get('currentRepresentationType'),
        measureRepRecordID: 'record-'+this.model.cid
      }
    },
    // This is to START dragging a circle {pie or bead}
    circleStart: function(e, ui) {
      console.log('circle dragging start');
      // Set the current circle's opacity lower, and draw another one to be resized
      this.circlePath.attr('opacity', .4);
      var svgContainer = d3.select('#svg-'+this.model.cid);
      var circlePath = svgContainer
          .insert('path', ':first-child')
          .data([this.model.get('circleStates')[0]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'black')
          .attr('opacity', 1)
          .attr('class', 'circle')
          .attr('class', 'circle-path')
          .attr('transform', 'scale('+this.model.get('originalScale')+','+this.model.get('originalScale')+')');

      if(this.oldW === undefined){
        console.log('this.oldW is undefined');
        this.oldW = ui.originalSize.width;
        this.oldH = ui.originalSize.height;
      }
      console.log(this.oldW)
      // because I don't know how to compute the arc from a point, I generate the pie slices and then move them as a group.  Thus we have to get the group's transform translate, and store the number, so that when we scale the slices in the next func(), we also translate them the original amount, otherwise when we are scaling it, the slices are not translated, and the origin is 0,0
      if (this.pieTranslate == undefined){
        this.pieTranslate = d3.select('#svg-'+this.model.cid).select('g').attr('transform')
      }
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
    },
    // DURING a dragging of a circle
    circleResizeCallback: function( e, ui ) {
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      // console.log(e, ui)
      var newW = Math.floor(ui.size.width);
      var newH = Math.floor(ui.size.height);
      var deltaWidth = newW - this.oldW;
      var deltaHeight = newH - this.oldH;
      var deltaRatio = deltaWidth/this.oldW;
      var svgContainer = d3.select('#svg-'+this.model.cid);
      console.log(deltaWidth, deltaHeight);
      // To handle a wierd issue with the svgContainer reducing faster than the resize, we only want to grow the container when the measureRep is increased
      if ( deltaWidth>0 || deltaHeight>0 ){
        svgContainer.attr('width', parseInt(svgContainer.attr('width'))+deltaWidth );
        svgContainer.attr('height', parseInt(svgContainer.attr('height'))+deltaHeight );
      }
      if(this.model.get('currentRepresentationType') == 'bead'){

        var circlePath = svgContainer.select('path');
        var scale = circlePath.attr('transform').slice(6, circlePath.attr('transform').length-1);
        // TODO MAybe set this to the new scale on the measureRepModel
        this.scale = (this.model.get('originalScale')+deltaRatio);
        // aspect ratio scale the measure circle, and the beats
        circlePath
            .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')');
        // svgContainer.selectAll('g')
              // .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')');
      } else if (this.model.get('currentRepresentationType') == 'pie'){
        var circlePath = svgContainer.select('path');
        var beatSlices = svgContainer.select('g');
        var scale = circlePath.attr('transform').slice(6, circlePath.attr('transform').length-1);
        // TODO MAybe set this to the new scale on the measureRepModel
        this.scale = (this.model.get('originalScale')+deltaRatio);
        // aspect ratio scale the measure circle, and the beats
        circlePath
            .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')');
        beatSlices
              .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')' + this.pieTranslate);
      }
    },
    // AFTER dragging stops on a circle
    circleStop: function(e, ui) {
      console.log('circle: adjusted scale by : ' + this.scale);
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      this.oldW = ui.size.width;
      this.oldH = ui.size.height;
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height);

      // TODO Replace these events
      // dispatch.trigger('resized.event', { cid: this.parentMeasureModel.cid });

      this.parentMeasureModel.setCurrentScale(this.scale);
      
      console.log(this.parent);
      //Break css constraints to allow scaling of mRV container
      $('.measureRep').css('height','auto');
    },
    // STARTING a linear drag {number line or bar}
    linearStart: function(e, ui) {
      console.log('linear start');

      // Set the current circle's opacity lower, and draw another one to be resized
      this.actualMeasureLinePath.attr('opacity', .4);
      var svgContainer = d3.select('#svg-'+this.model.cid);
      var actualMeasureLinePath = svgContainer
          .insert('path', ':first-child')
          .data([this.model.get('circleStates')[this.model.get('transitionNumberOfPoints')-1]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'black')
          .attr('opacity', 1)
          .attr('class', 'line')
          .attr('class', 'line-path')
          .attr('transform', 'scale('+this.model.get('originalScale')+','+this.model.get('originalScale')+')')
          .attr('transform', 'translate('+(this.model.get('circularMeasureR')*-2-10)+',0)');

      console.log(this.oldW)
      if(this.oldW === undefined){
        console.log('this.oldW is undefined');
        this.oldW = ui.originalSize.width;
        this.oldH = ui.originalSize.height;
      }
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
    },
    // DURING a linear drag
    linearResizeCallback: function( e, ui ) {
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      // console.log(e, ui)
      var newW = ui.size.width;
      var newH = ui.size.height;
      var deltaWidth = newW - this.oldW;
      var deltaRatio = deltaWidth/this.oldW;
      var svgContainer = d3.select('#svg-'+this.model.cid);
      if ( deltaWidth>0 ){
        svgContainer.attr('width', parseInt(svgContainer.attr('width'))+deltaWidth*3 );
      }

      if(this.model.get('currentRepresentationType') == 'line'){
        var linePath = svgContainer.select('path');
        var beatLines = svgContainer.select('g');
        var scale = linePath.attr('transform').slice(6, linePath.attr('transform').length-1);
        // var linePathCurrentScale = parseInt(scale.slice(0, scale.indexOf(',')));
        this.scale = (this.model.get('originalScale')+deltaRatio);
        // linearly scale the Line, and the beats
        linePath
            .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
        beatLines
              .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
      } else if (this.model.get('currentRepresentationType') == 'bar'){
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
    // AFTER a linear drag stops
    linearStop: function(e, ui) {
      console.log('linear adjusted scale by : ' + this.scale);
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      this.oldW = ui.size.width;
      this.oldH = ui.size.height;
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      this.parentMeasureModel.setCurrentScale(this.scale);
      //Break css constraints to allow scaling of mRV container
      $('.measureRep').css('height','auto');
    },
    // Making a targeted 'Audio' beat animate
    audioAnimate: function(target, dur, selected) {
      // console.log('Audio animate target: ', target);
      var d3Target = d3.select(target);
      var originalFillColor = 'none';
      if(selected == true){
        var newFillColor = COLORS.hexColors[5];
      } else {
        var newFillColor = originalFillColor;
      }
      // var originalOpacity = target.getAttribute('opacity');
      // if(selected == true){
      //   var newOpacity = 1;
      // } else {
      //   var newOpacity = originalOpacity;
      // }
      d3Target.transition()
        .attr('fill', newFillColor )
        .duration(dur)
        .each('end',function() {                   // as seen above
          d3.select(this).                         // this is the object 
            transition()                           // a new transition!
              .attr('fill', originalFillColor )   // we could have had another
              // .delay(dur)
              .duration(dur);                      // .each("end" construct here.
              // .delay(dur-1)
              // .duration(1);                      // .each("end" construct here.
         });
    },
    // Making a targeted 'Bead' beat animate
    //dur is half of the beat length
    beadAnimate: function(target, dur) {

      var target = d3.select(target);
      var originalCX = parseInt(target.attr('cx'));
      var newCX = originalCX + 10;
      target.transition()
        .attr('cx', newCX )
        .duration(dur/8.0)
        .each('end',function() {                   // as seen above
          d3.select(this).                         // this is the object 
            transition()                           // a new transition!
              .attr('cx', originalCX )    // we could have had another
              .duration(dur/8.0);                  // .each("end" construct here.
              // .duration((dur*7.0)/8.0);                  // .each("end" construct here.
         });
        // .each('end',function() {                   // as seen above
        //   d3.select(this).                         // this is the object 
        //     transition()                           // a new transition!
        //       .attr('cx', originalCX )    // we could have had another
        //       .duration(dur+);                  // .each("end" construct here.
        //  });
    },
    // Making a targeted 'Line' beat animate
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
              .attr('x1', originalX )    
              .attr('x2', originalX )    // we could have had another
              .duration(dur);                  // .each("end" construct here.
         });
    },
    // Making a targeted 'Pie' beat animate
    pieAnimate: function(target, dur) {
      var target = d3.select(target);
      target.transition()
        .attr('transform', 'translate(10,0)' )
        .duration(dur)
        .each('end',function() {                               // as seen above
          d3.select(this).                                     // this is the object 
            transition()                                       // a new transition!
              .attr('transform', 'translate(0,0)' )
              .duration(dur);                                 // .each("end" construct here.
         });
    },
    // Making a targeted 'Bar' beat animate
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
    // This toggles the animation, not the sound
    // The state is passed in from the toggleAnimation.event
    toggleAnimation: function(state){
      console.log('state: ',state);
      var µthis = this;

//TODO USE signature or beats
      var signature = this.parentMeasureModel.get('beats').length;
      var beats = this.parentHTrackModel.get('signature');
      
      var tempo = this.parentHTrackModel.get('tempo');
      var measuresCount = this.parentHTrackModel.get('measures').length;
      var currentInstrumentDuration = measuresCount*beats/tempo*60.0*1000.0;
      //dur is time of one beat.
      var dur = currentInstrumentDuration/measuresCount/beats;
      var calcDur = 1000/(tempo/60);

      var totalNumberOfBeats = signature*measuresCount;
      // go through the measure(s) first without animation
      var counter = 0;
      var measureCounter = 0;

      this.retrievedRepresentationType = this.model.get('currentRepresentationType');
      //when playing is stopped we stop the animation.
      if (state == 'Off') {
        console.log('stopped animation');
        clearInterval(this.animationIntervalID);
        this.animationIntervalID = null;
      // When playing is started, we start the animation
      } else {
        console.log('in toggle animation starting');
        // If there are beats to be animated, play each in sequence, keeping a count as we go along
        // The first set is play the song from the get go
        if (counter >= 0 && counter < totalNumberOfBeats) {
          if (this.retrievedRepresentationType == 'audio'){
            //TODO 
            var beats = $('#measure-rep-'+this.model.cid).find('.audio-beat');
            // A boolean value if the beat is selected
            console.log('beats: ', beats);
            var selected = this.parentMeasureModel.get('beats').models[counter].get('selected');
            // TODO, find a better way to animate the audio beats
            // Animate the Audio beat
            // console.log('calling from first block');
            // this.audioAnimate(beats.eq(0)[0], dur/2.0, selected);
            this.audioAnimate(beats.eq(counter)[0], dur/2.0, selected);
          } else if (this.retrievedRepresentationType == 'bead'){
            var beats = $('#measure-rep-'+this.model.cid).find('.bead-beat');
            // Animate the Bead beat
            this.beadAnimate(beats.eq(counter)[0], dur/2.0);
          } else if (this.retrievedRepresentationType == 'line'){
            var beats = $('#measure-rep-'+this.model.cid).find('.line-beat');
            // Animate the Line beat
            this.lineAnimate(beats.eq(counter)[0], dur/2.0);
          } else if (this.retrievedRepresentationType == 'pie'){
            var beats = $('#measure-rep-'+this.model.cid).find('.pie-beat');
            // Animate the Pie beat
            this.pieAnimate(beats.eq(counter)[0], dur/2.0);
          } else if (this.retrievedRepresentationType == 'bar'){
            var beats = $('#measure-rep-'+this.model.cid).find('.bar-beat');
            // Animate the Bar beat
            this.barAnimate(beats.eq(counter)[0], dur/2.0);
          }
          counter ++;
        }

        // the second set is for the loops
        this.animationIntervalID = setInterval((function(self) {
          return function() {
            // If we havenb't animated all of the beats in the measureRep
            if (counter >= 0 && counter < totalNumberOfBeats) {
              if (self.retrievedRepresentationType == 'audio'){
                //TODO 
                var beats = $('#measure-rep-'+self.model.cid).find('.audio-beat');
                // A boolean value if the beat is selected
                var selected = self.parentMeasureModel.get('beats').models[counter].get('selected');
                // console.log('calling from second loop');
                // self.audioAnimate(beats.eq(0)[0], dur/2.0, selected);
                self.audioAnimate(beats.eq(counter)[0], dur/2.0, selected);
              } else if (self.retrievedRepresentationType == 'bead'){
                var beats = $('#measure-rep-'+self.model.cid).find('.bead-beat');
                self.beadAnimate(beats.eq(counter)[0], dur/2.0);
              } else if (self.retrievedRepresentationType == 'line'){
                var beats = $('#measure-rep-'+self.model.cid).find('.line-beat');
                self.lineAnimate(beats.eq(counter)[0], dur/2.0);
              } else if (self.retrievedRepresentationType == 'pie'){
                var beats = $('#measure-rep-'+self.model.cid).find('.pie-beat');
                self.pieAnimate(beats.eq(counter)[0], dur/2.0);
              } else if (self.retrievedRepresentationType == 'bar'){
                var beats = $('#measure-rep-'+self.model.cid).find('.bar-beat');
                self.barAnimate(beats.eq(counter)[0], dur/2.0);
              }
              counter ++;
            }
          }
        })(this), dur); //duration should be set to something else
      }
    },
    // This clears the intervals to both stop the animations, and prevent the browser from crashing after stopping
    clearAnimationIntervalID: function() {
        console.log('stopped animation with func() call');
        clearInterval(this.animationIntervalID);
        this.animationIntervalID = null;
    },
    // move the primary set of beats left
    movePrimaryLeft: function() {
      var beatHolder = d3.select('#beat-holder-'+this.model.cid)
        .transition()
          .attr('transform', 'translate('+(-1)*(this.model.get('circularMeasureR')*2)+',0)')
          .duration(this.model.get('transitionDuration'));
      this.circlePath
        .transition()
          .attr('transform', 'translate('+(-1)*(this.model.get('circularMeasureR')*2)+',0)')
          .duration(this.model.get('transitionDuration'));
    },
    // move the primary set of beats left
    moveTertiaryLeft: function() {
      var beatHolder = d3.select('#tertiary-beat-holder-'+this.model.cid)
        .transition()
          .attr('transform', 'translate('+(-1)*(this.model.get('circularMeasureR')*2)+',0)')
          .duration(this.model.get('transitionDuration'));
      this.circlePath
        .transition()
          .attr('transform', 'translate('+(-1)*(this.model.get('circularMeasureR')*2)+',0)')
          .duration(this.model.get('transitionDuration'));
    },
    // move the primary set of beats right ie before a line is rolled up
    movePrimaryRight: function() {
      var beatHolder = d3.select('#beat-holder-'+this.model.cid)
        .transition()
          .attr('transform', 'translate('+this.model.get('circularMeasureR')*2+',0)')
          .duration(this.model.get('transitionDuration'));
      var actualMeasureLinePath = d3.select('#svg-'+this.model.cid + ' .line-path')
        .transition()
          .attr('transform', 'translate(0,0)')
          .duration(this.transitionDuration);
    },
    // move the second set of beats left, ie after bead rolls up to a line
    moveSecondaryLeft: function(options) {
      var beatHolder = d3.select('#secondary-beat-holder-'+this.model.cid)
        .transition()
          .attr('transform', 'translate('+(-1)*(this.model.get('circularMeasureR')*2)+',0)')
          .duration(this.model.get('transitionDuration'));
      if (options){
        this.circlePath
          .transition()
            .attr('transform', 'translate('+(-1)*(this.model.get('circularMeasureR')*2)+',0)')
            .duration(this.model.get('transitionDuration'));
      }
    },
    // move the second beats to the right ie before bar lines rollup to beads
    moveSecondaryRight: function(options) {
      if (options){
        console.log('get');
        var actualMeasureLinePath = d3.select('#svg-'+this.model.cid + ' .hidden-line-path')
          .transition()
            .attr('transform', 'translate(0,0)')
            .duration(this.model.get('transitionDuration'));
        var movement = 0;
      } else {
        var movement = this.model.get('circularMeasureR')*2;
      }
      var beatHolder = d3.select('#secondary-beat-holder-'+this.model.cid)
        .transition()
          .attr('transform', 'translate('+movement+',0)')
          .duration(this.model.get('transitionDuration'));
    },
    // adds the infinite line on a number line
    addInfiniteLine: function() {
      var svgContainer = d3.select('#svg-'+this.model.cid);
      var infiniteLine = svgContainer
        .insert('line', ':first-child')
        .attr('class', 'infinite-line')
        .attr('x1', -200)
        .attr('y1', this.model.get('numberLineY'))
        .attr('x2', 1000)
        .attr('y2', this.model.get('numberLineY'))
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('opacity', .5);
    },
    addMeasureLinePath: function() {
      var svgContainer = d3.select('#svg-'+this.model.cid);
      var actualMeasureLinePath = svgContainer
          .insert('path', ':first-child')
          .data([this.model.get('circleStates')[this.model.get('transitionNumberOfPoints')-1]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'black')
          .attr('opacity', 1)
          .attr('class', 'line')
          .attr('class', 'line-path')
          .attr('transform', 'scale('+this.model.get('currentScale')+','+this.model.get('currentScale')+')')
          .attr('transform', 'translate('+(this.model.get('circularMeasureR')*-2-10)+',0)');
    },
    // removes the infinite line on the number line
    removeInfiniteLine: function() {
      var infiniteLine = d3.select('#svg-'+this.model.cid + ' .infinite-line');
      infiniteLine.remove();
    },
    // removes the measure box on a bar
    removeBarBox: function() {
      var barBox = d3.select('#svg-'+this.model.cid + ' .bar-box');
      barBox.remove();      
    },
    addBeadMeasurePath: function() {
      var circlePath = svgContainer
            .insert('path', ':first-child')
            .data([this.circleStates[0]])
            .attr('d', this.pathFunction)
            .attr('stroke', 'black')
            .attr('opacity', 1)
            .attr('class', 'circle')
            .attr('class', 'circle-path')
            .attr('transform', 'scale('+this.originalScale+','+this.originalScale+')');
        // Attach it to the view
        this.circlePath = circlePath;
    },

    // TRANSITIONS
    beadToLine: function(options) {
      console.log('btl');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
            .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var beadBeats = beatHolder.selectAll('.bead-beat');

      // send the event to the beatView to unroll at the same time
      this.trigger('beatTransition');

      // First stage
      // unroll
      for(i=0; i<this.model.get('transitionNumberOfPoints'); i++){
        this.circlePath.data([this.model.get('circleStates')[i]])
          .transition()
            .delay(this.model.get('transitionDuration')*i)
            .duration(this.model.get('transitionDuration'))
            .ease('linear')
            .attr('d', this.pathFunction)
      }
      // Second Stage
      setTimeout(function(){
        console.log(µthis.childPrimaryViews.length, µthis.childSecondaryViews.length, µthis.childTertiaryViews.length, µthis.childFactoryViews.length)
        // make the number line beats
        µthis.makeBeats({secondary:true, type:'line'});
        console.log(µthis.childPrimaryViews.length, µthis.childSecondaryViews.length, µthis.childTertiaryViews.length, µthis.childFactoryViews.length)
        // Fade out the beads
        // $('#beat-holder-'+µthis.model.cid+' .bead-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration'));
      // Third Stage
      setTimeout(function(){
        console.log(µthis.childPrimaryViews.length, µthis.childSecondaryViews.length, µthis.childTertiaryViews.length, µthis.childFactoryViews.length)
        // remove the primary bead views
        µthis.removeSpecificChildren(µthis.childPrimaryViews);
        console.log(µthis.childPrimaryViews.length, µthis.childSecondaryViews.length, µthis.childTertiaryViews.length, µthis.childFactoryViews.length)
        // beadBeats.remove();
        // add the infinite line
        µthis.addInfiniteLine();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*2 );
      // Fourth Stage
      setTimeout(function(){
        console.log(µthis.childPrimaryViews.length, µthis.childSecondaryViews.length, µthis.childTertiaryViews.length, µthis.childFactoryViews.length)
        // move entire portion to the left
        µthis.moveSecondaryLeft('bead');
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*3 );
      // Fifth Stage
      setTimeout(function(){
        // rerender everything to get the factory as well
        µthis.updateRender();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*4 );
    },
    beadToBar: function(){
      console.log('btr');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
            .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var beadBeats = beatHolder.selectAll('.bead-beat');
      var circlePath = $('#svg-'+this.model.cid + ' .circle-path');
      // First stage
      // Unroll
      this.trigger('beatTransition');
      for(i=0; i<this.model.get('transitionNumberOfPoints'); i++){
        this.circlePath.data([this.model.get('circleStates')[i]])
          .transition()
            .delay(this.model.get('transitionDuration')*i)
            .duration(this.model.get('transitionDuration'))
            .ease('linear')
            .attr('d', this.pathFunction)
      };
      // Second Stage
      setTimeout(function(){
        // make the new bar beats
        µthis.makeBeats({secondary:true, type:'bar'});
        // fade the old bead beats 
        // $('#beat-holder-'+µthis.model.cid+' .bead-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
        // fade circle measure (the unrolling line)
        circlePath.fadeOut(µthis.model.get('animationIntervalDuration'));
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration'));
      // Third Stage
      setTimeout(function(){
        // move entire portion to the left
        µthis.moveSecondaryLeft();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*2 );
      // Fourth Stage
      setTimeout(function(){
        // remove the primary bead views
        µthis.removeSpecificChildren(µthis.childPrimaryViews);
        // re-render
        µthis.updateRender();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*3 );
    },
    beadToPie: function(){
      console.log('bti');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid);
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var beadBeats = beatHolder.selectAll('.bead-beat');
      var circlePath = $('#svg-'+this.model.cid + ' .circle-path');

      // First Stage
      setTimeout(function(){
        // Make the secondary pie beats 
        µthis.makeBeats({secondary:true, type:'pie'});
        // fade the bead beats
        $('.bead-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
        // circlePath.fadeOut(this.animationIntervalDuration);
      }, this.model.get('animationIntervalDuration'));
      setTimeout(function(){
        // remove the bead beats
        beadBeats.remove();
        // remove the primary bead views
        µthis.removeSpecificChildren(µthis.childPrimaryViews);
      }, this.model.get('animationIntervalDuration')*2 );
      // re-render
      setTimeout(function(){
        // re-render
        µthis.updateRender();
      }, this.model.get('animationIntervalDuration')*3 );
    },
    lineToBar: function(){
      console.log('ltr');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid);
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var lineBeats = beatHolder.selectAll('.line-beat');
      // remove the infinite line and move the secondary left to align for the bar positioning
      setTimeout(function(){
        µthis.removeInfiniteLine();
        µthis.moveSecondaryLeft();
      }, this.model.get('animationIntervalDuration') );
      // make the secondary bar beats and fade out the line paths beats
      setTimeout(function(){
        µthis.makeBeats({secondary:true, type:'bar'});
        $('#beat-holder-'+µthis.model.cid+' .line-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
        $('#svg-'+µthis.model.cid+' .line-path').fadeOut(µthis.model.get('animationIntervalDuration'));
      }, this.model.get('animationIntervalDuration')*2 );
      // re-render
      setTimeout(function(){
        // rerender everything to get the factory as well
        µthis.updateRender();
      }, this.model.get('animationIntervalDuration')*3 );
    },
    lineToBead: function(options) {
      console.log('ltb');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
        .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 )
        .attr('height', this.model.get('linearDivHeight')+this.model.get('circularMeasureR')*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var lineBeats = beatHolder.selectAll('.line-beat');
      // move the entire thing right, to allow for rolling up
      setTimeout(function(){
        µthis.movePrimaryRight();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration') );
      // remove the infinite line
      setTimeout(function(){
        µthis.removeInfiniteLine();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*2 );
      // make the secondary beats
      setTimeout(function(){
        µthis.makeBeats({secondary:true, type:'bead'});
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*3 );
      // remove the line beats
      setTimeout(function(){
        lineBeats.remove();
        // remove the primary bead views
        µthis.removeSpecificChildren(µthis.childPrimaryViews);
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*4 );
      // rollup the beads and path aliong with the beatView event
      setTimeout(function(){
        // send the event to the beatView to unroll at the same time
        µthis.trigger('beatTransition');

        for(i=0; i<µthis.model.get('transitionNumberOfPoints'); i++){
          µthis.actualMeasureLinePath.data([µthis.model.get('circleStates')[µthis.model.get('transitionNumberOfPoints')-1-i]])
            .transition()
              .delay(µthis.model.get('transitionDuration')*i)
              .duration(µthis.model.get('transitionDuration'))
              .ease('linear')
              .attr('d', µthis.pathFunction)
              .attr('stroke', 'black')
              .attr('opacity', 1)
              .attr('class', 'circle')
              .attr('class', 'circle-path');
        }
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*5);
      // re-render
      setTimeout(function(){
        // rerender everything to get the factory as well
        µthis.updateRender();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*6 );
    },
    lineToPie: function(){
      console.log('lti');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
        // Adjust the measureRep container to accomodate the line rep
        .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 )
        .attr('height', this.model.get('linearDivHeight')+this.model.get('circularMeasureR')*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var lineBeats = beatHolder.selectAll('.line-beat');
      var lineMeasure = svgContainer.selectAll('.line-path');
      // move the entire thing right to allow for rolling up
      setTimeout(function(){
        µthis.movePrimaryRight();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration') );
      // remove the infinte line
      setTimeout(function(){
        µthis.removeInfiniteLine();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*2 );
      // // make the seconadry line rollgin beats
      setTimeout(function(){
        µthis.makeBeats({secondary:true, type:'lineRolling'});
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*3 );
      // remove the line beats and the line measure
      setTimeout(function(){
        lineBeats.remove();
        lineMeasure.remove();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*4 );
      // send the beat transition event 
      setTimeout(function(){
        µthis.trigger('secondaryBeatTransition', µthis);
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*5);
      // make the secondary pie beats
      setTimeout(function(){
        µthis.makeBeats({tertiary:true, type:'pie'});
        // $('.lineRolling').fadeOut(µthis.model.get('animationIntervalDuration'));
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*6 );
      // re-render
      setTimeout(function(){
        // rerender everything to get the factory as well
        µthis.updateRender();
      }, this.transitionDuration*(this.transitionNumberOfPoints) + this.animationIntervalDuration*7 );
    },
    barToLine: function(){
      console.log('rtl');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid);
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      
      // remove the measure bounding bar box and fade out the bar beats
      setTimeout(function(){
        µthis.removeBarBox();
        µthis.addInfiniteLine();
        µthis.moveSecondaryLeft();
        µthis.makeBeats({secondary:true, type: 'line'});
      }, this.model.get('animationIntervalDuration') );
      // add the infinite line
      setTimeout(function(){
        $('#beat-holder-'+µthis.model.cid+' .bar-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
      }, this.model.get('animationIntervalDuration')*2 );
      // re-render
      setTimeout(function(){
        // rerender everything to get the factory as well
        µthis.updateRender();
      }, this.model.get('animationIntervalDuration')*3 );      
    },
    barToBead: function(){
      console.log('rtb');
      console.log(this.actualMeasureLinePath);
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
        .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 )
        .attr('height', this.model.get('linearDivHeight')+this.model.get('circularMeasureR')*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      
      // remove the measure bounding bar box and move the secondary left to align with the new beats
      setTimeout(function(){
        µthis.removeBarBox();
        µthis.movePrimaryRight();
        µthis.moveSecondaryRight('options');
      }, this.model.get('animationIntervalDuration') );
      // Make bead beats and show measure path while fading out bar beats
      setTimeout(function(){
        µthis.makeBeats({secondary:true, type:'bead' });
        var actualMeasureLinePath = d3.select('#svg-'+µthis.model.cid+' .hidden-line-path')
          .transition()
            .attr('stroke', 'black');
        $('#beat-holder-'+µthis.model.cid+' .bar-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
      }, this.model.get('animationIntervalDuration')*2 );
      //Roll measure path
      setTimeout(function(){
        µthis.trigger('secondaryBeatTransition', µthis);
        for(i=0; i<µthis.model.get('transitionNumberOfPoints'); i++){
          µthis.actualMeasureLinePath.data([µthis.model.get('circleStates')[µthis.model.get('transitionNumberOfPoints')-1-i]])  //actualMeasurePath is undefined
            .transition()
              .delay(µthis.model.get('transitionDuration')*i)
              .duration(µthis.model.get('transitionDuration'))
              .ease('linear')
              .attr('d', µthis.pathFunction)
              .attr('stroke', 'black')
              .attr('opacity', 1)
              .attr('class', 'circle')
              .attr('class', 'circle-path');
        }
      }, this.model.get('animationIntervalDuration')*3 ); 
      // re-render
      setTimeout(function(){
        µthis.parentMeasureModel.increaseTransitionCount();
        // TODO Replace these events
        // dispatch.trigger('reRenderMeasure.event', this);
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*4 );      
    },
    barToPie: function(){
      console.log('rti');
      console.log(this.actualMeasureLinePath);
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
        .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 )
        .attr('height', this.model.get('linearDivHeight')+this.model.get('circularMeasureR')*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var barBeats = beatHolder.selectAll('.bar-beat');

      // remove the measure bounding bar box and move the secondary left to align with the new beats
      setTimeout(function(){
        µthis.removeBarBox();
        µthis.movePrimaryRight();
      }, this.model.get('animationIntervalDuration') );
      // fade out the bar beats, and make the secondary bead beats
      setTimeout(function(){
        $('#beat-holder-'+µthis.model.cid+' .bar-beat').fadeOut(this.animationIntervalDuration);
        µthis.makeBeats({secondary:true, type:'lineRolling' });
      }, this.model.get('animationIntervalDuration')*2 );
      // send the beat transition event 
      setTimeout(function(){
        // barBeats.remove();
        µthis.trigger('secondaryBeatTransition', µthis);
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*3);
      // make the secondary pie beats
      setTimeout(function(){
        µthis.makeBeats({tertiary:true, type:'pie'});
        //The following selection methods all work, but here is why I'm using jQuery:
          //http://stackoverflow.com/questions/24685881/manipulating-an-object-in-a-settimeout-function-that-was-created-by-a-previous-s
        // $(d3.selectAll('.lineRolling')).fadeOut(500);
        $('.lineRolling').fadeOut(µthis.model.get('animationIntervalDuration'));
        // d3.selectAll('.lineRolling').remove();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*4 );
      //re-render
      setTimeout(function(){
        µthis.parentMeasureModel.increaseTransitionCount();
        // TODO Replace these events
        // dispatch.trigger('reRenderMeasure.event', this);
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*5 );     
    },
    pieToBead: function(){
      console.log('itb');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var pieBeats = beatHolder.selectAll('.pie-beat');
      //var circlePath = svgContainer.selectAll('.circle-path');
      var circlePath = $('#svg-'+this.model.cid + ' .circle-path');

      // Make the secondary bead beats and fade the pie beats
      // setTimeout(function(){
      //   µthis.makeBeats({secondary:true, type:'lineUnrolling'});
      //   $('.pie-beat').fadeOut(this.animationIntervalDuration);
      // }, this.model.get('animationIntervalDuration'));
      setTimeout(function(){
        µthis.makeBeats({secondary:true, type:'beadCircle'});
        // pieBeats.remove();
      }, this.model.get('animationIntervalDuration')*2);
      //remove the pie beats
      setTimeout(function(){
        pieBeats.remove();
      }, this.model.get('animationIntervalDuration')*3 );
      // re-render
      setTimeout(function(){
        // rerender everything to get the factory as well
        // µthis.updateRender();
      }, this.model.get('animationIntervalDuration')*3 );
    },
    pieToLine: function(){
      console.log('itl');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
        // Adjust the measureRep container to accomodate the line rep
        .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 )
        // .attr('height', this.linearDivHeight+this.circularMeasureR*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var pieBeats = beatHolder.selectAll('.pie-beat');
      var circlePath = svgContainer.selectAll('.circle-path');

      // make the secondary line-Unrolling beats, and remove the circle measure
      setTimeout(function(){
        µthis.makeBeats({secondary:true, type:'lineUnrolling'});
        // $('.pie-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
        circlePath.remove();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration') );
      // remove the pie beats
      setTimeout(function(){
        pieBeats.remove();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*2 );
      // add the infinite line
      setTimeout(function(){
        µthis.addInfiniteLine();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*3 );
      // send the beatView event
      setTimeout(function(){
        µthis.trigger('secondaryBeatTransition', µthis);
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*4);
      // Make the tertiary/secondary line beats
      setTimeout(function(){
         µthis.makeBeats({tertiary:true, type:'line'});
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*5 );
      //Delete the lineUnrolling beats
      setTimeout(function(){
         $('.lineRolling').fadeOut(µthis.animationIntervalDuration);
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*6 );
      // Move to the left
      setTimeout(function(){
        µthis.moveTertiaryLeft();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*7 );
      // Add the line
      setTimeout(function(){
        // TODO Figure out the pixel difference
        µthis.addMeasureLinePath();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*8 );
      setTimeout(function(){
        // rerender everything to get the factory as well
        µthis.updateRender();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*9 );
    },
    pieToBar: function(){
      console.log('itr');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
        // Adjust the measureRep container to accomodate the line rep
        .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 )
        // .attr('height', this.linearDivHeight+this.circularMeasureR*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var pieBeats = beatHolder.selectAll('.pie-beat');
      var circlePath = svgContainer.selectAll('.circle-path');

      // make the secondary line-Unrolling beats, and remove the circle measure
      setTimeout(function(){
        µthis.makeBeats({secondary:true, type:'lineUnrolling'});
        $('.pie-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
        circlePath.remove();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration') );
      // remove the pie beats
      setTimeout(function(){
        pieBeats.remove();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*2 );
      // send the beatView event
      setTimeout(function(){
        µthis.trigger('secondaryBeatTransition', µthis);
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*2);
      // Make the tertiary/secondary pie beats
      setTimeout(function(){
        µthis.makeBeats({tertiary:true, type:'bar'});
        //Not sure why this is now lineRolling, but that's how it is in the DOM...
        $('.lineRolling').fadeOut(µthis.animationIntervalDuration);
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*3 );
      setTimeout(function(){
        µthis.moveTertiaryLeft();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*4 );
      // re-render
      setTimeout(function(){
        // TODO Replace these events
        // dispatch.trigger('reRenderMeasure.event', this);
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*5 );
    },
    makeBeadRep: function(){
      // find the svg container
      var svgContainer = d3.select('#svg-'+this.model.cid)
          .attr('width', this.circularDivWidth)
          .attr('height', this.circularDivHeight);
      // add a circle representing the whole measure
      var circlePath = svgContainer
          .insert('path', ':first-child')
          .data([this.model.get('circleStates')[0]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'black')
          .attr('opacity', 1)
          .attr('class', 'circle')
          .attr('class', 'circle-path')
          .attr('transform', 'scale(' + this.model.get('currentScale') + ',' + this.model.get('currentScale') + ')');
      // Attach it to the view
      this.circlePath = circlePath;

      // JQ-UI resizable
      this.$el.resizable({ 
        aspectRatio: true,
        // To keep the number Math.Floored
        grid:1,
        // ghost:true,
        // animate: true,
        start: function(e, ui) {
          µthis.circleStart(e, ui);
        },
        resize: function( e, ui ) {
          µthis.circleResizeCallback(e, ui);
        },
        stop: function(e, ui) {
          µthis.circleStop(e, ui);
        }  
      });
    },
    makeLineRep: function(){
      // Find the SVG container
      var svgContainer = d3.select('#svg-'+this.model.cid)
          .attr('width', this.model.get('linearDivWidth'))
          .attr('height', this.model.get('linearDivHeight'));
      // add the infinite line
      var infiniteLine = svgContainer
          .insert('line', ':first-child')
          .attr('class', 'infinite-line')
          .attr('x1', -200)
          .attr('y1', this.model.get('numberLineY'))
          .attr('x2', 2000)
          .attr('y2', this.model.get('numberLineY'))
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('opacity', .5)
      // Draw the Thicker line representing the measure
      var actualMeasureLinePath = svgContainer
          .insert('path', ':first-child')
          .data([this.model.get('circleStates')[this.model.get('transitionNumberOfPoints')-1]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'black')
          .attr('opacity', 1)
          .attr('class', 'line')
          .attr('class', 'line-path')
          .attr('transform', 'scale('+this.model.get('currentScale')+','+this.model.get('currentScale')+')')
          .attr('transform', 'translate('+(this.model.get('circularMeasureR')*-2-10)+',0)');
      // attach it to the view
      this.actualMeasureLinePath = actualMeasureLinePath;

      // JQ-UI resizable
      $(this.el).resizable({ 
        maxHeight: 180, 
        minHeight: 180,
        grid:1,
        start: function(e, ui) {
          µthis.linearStart(e, ui);
        },
        resize: function( e, ui ) {
          µthis.linearResizeCallback(e, ui);
        },
        stop: function(e, ui) {
          µthis.linearStop(e, ui);
        }  
      });
    },
    makePieRep: function(){
      // Find the SVG container
      var svgContainer = d3.select('#svg-'+this.model.cid)
          .attr('width', this.model.get('circularDivWidth'))
          .attr('height', this.model.get('circularDivHeight'));
      // Add the circle path representing the whole measure
      var circlePath = svgContainer
          .insert('path', ':first-child')
          .data([this.model.get('circleStates')[0]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'black')
          .attr('opacity', 1)
          .attr('class', 'circle')
          .attr('class', 'circle-path')
          .attr('transform', 'scale('+this.model.get('currentScale')+','+this.model.get('currentScale')+')')
      // Attach it to the view
      this.circlePath = circlePath;

      // JQ-UI resizable
      $(this.el).resizable({ 
        aspectRatio: true,
        grid:1,
        start: function(e, ui) {
          µthis.circleStart(e, ui);
        },
        resize: function( e, ui ) {
          µthis.circleResizeCallback(e, ui);
        },
        stop: function(e, ui) {
          µthis.circleStop(e, ui);
        }  
      });
    },
    makeBarRep: function(){
      // Find the SVG Container
      var svgContainer = d3.select('#svg-'+this.model.cid)
          .attr('width', this.model.get('linearDivWidth'))
          .attr('height', this.model.get('linearDivHeight'));
      var  secondaryBeatHolder = d3.select('#secondary-beat-holder-'+this.model.cid);
      // Make a Box that holds the smaller beat bars
      var box = svgContainer
          .insert('rect', ':first-child')
          .attr('class', 'bar-box')
          .attr('x', this.model.get('lbbMeasureLocationX'))
          .attr('y', this.model.get('lbbMeasureLocationY'))
          .attr('width', this.model.get('linearLineLength'))
          .attr('height', this.model.get('lbbMeasureHeight'))
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('fill', 'white')
          .attr('transform', 'scale('+this.model.get('currentScale')+','+this.model.get('currentScale')+')')
          this.box = box;

      var actualMeasureLinePath = secondaryBeatHolder
          .insert('path', ':last-child')
          .data([this.model.get('circleStates')[this.model.get('transitionNumberOfPoints')-1]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'none')
          .attr('opacity', 1)
          .attr('class', 'line')
          .attr('class', 'hidden-line-path')
          .attr('transform', 'scale('+this.model.get('currentScale')+','+this.model.get('currentScale')+')')
          .attr('transform', 'translate('+(this.model.get('circularMeasureR')*-2-10)+',0)');
      // Attach it to the view
      this.actualMeasureLinePath = actualMeasureLinePath;

      // JQ-UI resizable
      $(this.el).resizable({ 
        // aspectRatio: true,
        maxHeight: 180, 
        minHeight: 180,
        grid:1,
        start: function(e, ui) {
          µthis.linearStart(e, ui);
        },
        resize: function( e, ui ) {
          µthis.linearResizeCallback(e, ui);
        },
        stop: function(e, ui) {
          µthis.linearStop(e, ui);
        }  
      });
    },
    makeAudioRep: function(){
      // Find the SVG Container
      var svgContainer = d3.select('#svg-'+this.model.cid)
      // Make a large Circle reprsenting the conatiner for all beats as they pulse
      var metronomeCirlce = svgContainer
          .insert('circle', ':first-child')
          .attr('cx', this.model.get('audioMeasureCx'))
          .attr('cy', this.model.get('audioMeasureCy'))
          .attr('r', this.model.get('audioMeasureR'))
          .attr('fill', this.model.get('colorForAudio'))
          .attr('fill-opacity', 0.2)
          .attr('stroke', 'black');
    },
    render: function(){
      // console.log('mR render');
      var µthis = this;

      //set the el for JQ-UI Drag
      // may not be needed
      this.$el.attr('id', 'measure-rep-' + this.model.cid);

      // compile the template for a representation
      var compiledTemplate = _.template( MeasureRepTemplate, this.measureRepTemplateParameters );
      // put in the rendered template in the measure-rep-container of the measure
      $(this.repContainerEl).append( compiledTemplate );
      this.setElement($('#measure-rep-'+this.model.cid));

      // Bead rep
      if (this.model.get('currentRepresentationType') == 'bead') {
        this.makeBeadRep();
      // Line Rep
      } else if (this.model.get('currentRepresentationType') == 'line'){
        this.makeLineRep();
      // Pie rep
      } else if (this.model.get('currentRepresentationType') == 'pie'){
        this.makePieRep();
      // Audio Rep
      } else if (this.model.get('currentRepresentationType') == 'audio'){
        this.makeAudioRep();
      // Bar Rep
      } else if (this.model.get('currentRepresentationType') == 'bar'){
        this.makeBarRep();
      }

      // JQ Droppable
      $(this.el).droppable({
        accept: '.stamp',
        drop: function(event, ui) {
         $(this).append(ui.helper.clone());
        }
      });

      return this;
    },
    // This makes the bead factory in each measureRep
    makeBeatFactory: function(){
      // Bead
      var remainingNumberOfBeats = 16-this.parentMeasureModel.get('beats').models.length;
      if (this.model.get('currentRepresentationType') == 'bead') {
        for (i = 0 ; i < remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParameters.cX = this.model.get('horzDivPadding') + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.cY = (this.model.get('circularDivHeight')-this.model.get('vertDivPadding')*2-this.model.get('beatFactoryR')*2) + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          var newBeadFactory = new BeatFactoryView(this.measurePassingToBeatFactoryParameters);
          this.childFactoryViews.push(newBeadFactory);
        }
      // Line
      } else if (this.model.get('currentRepresentationType') == 'line') {
        for (i = 0 ; i < remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParameters.x1 = this.model.get('horzDivPadding') + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.y1 = this.model.get('numberLineY') + 60 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.x2 = this.measurePassingToBeatFactoryParameters.x1;
          this.measurePassingToBeatFactoryParameters.y2 = this.measurePassingToBeatFactoryParameters.y1 + this.model.get('lineHashHeight');
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          var newLineFactory = new BeatFactoryView(this.measurePassingToBeatFactoryParameters);
          this.childFactoryViews.push(newLineFactory);
        }
      // Pie
      } else if (this.model.get('currentRepresentationType') == 'pie') {
        for (i = 0 ; i < remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParameters.cX = this.model.get('horzDivPadding') + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.cY = (this.model.get('circularDivHeight')-this.model.get('vertDivPadding')*3 - this.model.get('beatFactoryR')*2) + (Math.random() * (30) - 20);
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          var newPieFactory = new BeatFactoryView(this.measurePassingToBeatFactoryParameters);
          this.childFactoryViews.push(newPieFactory);
        } 
      // Bar
      } else if (this.model.get('currentRepresentationType') == 'bar') {
        for (i = 0 ; i < remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParameters.x = this.model.get('horzDivPadding') + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.y = this.model.get('numberLineY') + 90 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.beatHeight = this.model.get('beatHeight');
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          var newBarFactory = new BeatFactoryView(this.measurePassingToBeatFactoryParameters);
          this.childFactoryViews.push(newBarFactory);
        }        
      }      
    },
    // Adding a measureRep to the measure
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
    removeRepresentationModel: function(ev){
      // if ($('#measure'+this.measuresCollection.models[0].cid).parent()) {
        //removing the last measure isn't allowed.
        if(this.measureRepresentations.length == 1) {
          console.log('Can\'t remove the last representation!');
          return;
        }
        console.log('this.model: ', this.model.cid, this.model);
        oldModelCid = this.oldModelCid;
        // this.model.destroy();
        this.close();

        console.log('removed representation');

        // var measureModelCid = ev.srcElement.parentElement.parentElement.parentElement.id.slice(12);
        // //we remove the measureRep and get its model.
        // this.measureRepresentations.remove(measureModelCid);

        //send a log event showing the removal.
        log.sendLog([[3, 'Removed a measure representation: ' + this.cid]]);
        console.log('Removed measureRep ' + this.cid + ", " + oldModelCid);
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
        // TODO Replace these events
        // dispatch.trigger('stopRequest.event', 'off');
        for (var i = 0; i < this.measuresCollection.models.length; i++) {
          while (this.measuresCollection.models[i].get('beats').length < signature) {
            this.measuresCollection.models[i].get('beats').add();
          }
          while (this.measuresCollection.models[i].get('beats').length > signature) {
            // silent:true means to not call another event
            this.measuresCollection.models[i].get('beats').pop({silent:true});
            // when selected beats equals the denominator, and we remove a beat, we need to recalculate
            // the fraction with the new selected beats
            // TODO Replace these events
            // dispatch.trigger('signatureChange.event', this.measuresCollection.models[i].get('beats').length)
          } 
        }
        //re-render the view.
        this.render();
      }
    },
    // Part of the transistion process, when a user clicks the 'delta'
    transitionRepresentation: function(e){
      e.srcElement.classList.add('transition-rep');
      console.log('transitioning a rep');
    },
    // Manages the transition paths
    transition: function(){
      console.log('in transition func() of measureRepView');
      var PRT = this.model.get('previousRepresentationType');
      var CRT = this.model.get('currentRepresentationType');
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
          //keep it bead, do nothing
        } else if(CRT == 'line'){
          this.beadToLine();
        } else if(CRT == 'pie'){
          this.beadToPie();
        } else if(CRT == 'bar'){
          this.beadToBar();
        }
      } else if(PRT == 'line'){
        if (CRT == 'audio'){
        } else if(CRT == 'bead'){
          this.lineToBead();
        } else if(CRT == 'line'){
          //keep it line, do nothing
        } else if(CRT == 'pie'){
          this.lineToPie();
        } else if(CRT == 'bar'){
          this.lineToBar();
        }
      } else if(PRT == 'pie'){
        if (CRT == 'audio'){
        } else if(CRT == 'bead'){
          this.pieToBead();
        } else if(CRT == 'line'){
          this.pieToLine();
        } else if(CRT == 'pie'){
          //keep it pie, do nothing
        } else if(CRT == 'bar'){
          this.pieToBar();
        }
      } else if(PRT == 'bar'){
        if (CRT == 'audio'){
        } else if(CRT == 'bead'){
          this.barToBead();
        } else if(CRT == 'line'){
          this.barToLine();
        } else if(CRT == 'pie'){
          this.barToPie();
        } else if(CRT == 'bar'){
          //keep it bar, do nothing
        }
      }
    },
    // Shortcuts: T for transition
    manuallPress: function(e) {
      // t = 116, d = 100
      if (e.keyCode == 116) {
        $('.measureRep:nth-child(5)').find('.delta').addClass('transition-rep')
      } else if (e.keyCode == 100) {
        // $('.measureRep')[1].
      }
    },
    // Record the measure
    recordMeasure: function(button) {
      console.log('Record clicked');
      if(!this.isTapping) {
        dispatch.trigger('doall.event');
        this.isTapping = true;
      }
      else {
        // TODO Replace these events
        // dispatch.trigger('doall.event');
        this.isTapping = false;
      }
    },
    close: function(){
      console.log('in measureRepView close function');
      this.remove();
      this.unbind();
      // handle other unbinding needs, here
      if(this.onClose){
        this.onClose();
      }
    },
    closeAllChildren: function(){
      console.log('in measureRepView close function, CLOSING ALL CHILDREN');
      console.log('in measureRepView close function, closing PRIMARY children');
      this.removeSpecificChildren(this.childPrimaryViews);
      console.log('in measureRepView close function, closing SECONDARY children');
      this.removeSpecificChildren(this.childSecondaryViews);
      console.log('in measureRepView close function, closing TERTIARY children');
      this.removeSpecificChildren(this.childTertiaryViews);
      console.log('in measureRepView close function, closing FACTORY children');
      this.removeSpecificChildren(this.childFactoryViews);
    },
    removeSpecificChildren: function(childViews){
      console.log('Closing specific child views: ', childViews);
      _.each(childViews, function(childView){
        if (childView.close){
          childView.close();
        }
      })
    },
    updateRender: function(){
      console.log('getting to updateRender');
      this.closeAllChildren();
      // this.render();
    },
    onClose: function(){
      // this.model.unbind("change", this.render);

      $(document).unbind('keypress', this.manuallPress);

      // this.unbind('signatureChange.event', this.reconfigure);
      // this.unbind('unroll.event', this.unroll);
      // this.unbind('toggleAnimation.event', this.toggleAnimation);
      // this.unbind('resized.event', this.destroy);
      this.model.unbind('change', this.transition);
      // this.model.destroy();
    }
 
  });
});