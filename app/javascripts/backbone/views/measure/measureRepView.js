// Filename: views/measure/measureRepView.js
/*
  This is the MeasureRepView.
  This is contained in a MeasureView.
*/
define([
  'jquery', 'underscore', 'bbone',
  'backbone/collections/beats',
  'backbone/models/measure', 'backbone/models/representation', 'backbone/models/state',
  'backbone/views/beat/beatView',
  'backbone/views/beat/auxBeatView',
  'backbone/views/factory/beatFactoryView',
  'text!backbone/templates/measure/measureRep.html',
  'general/lookupInstrument',
  'colors',
  'logging'
], function($, _, Backbone, BeatsCollection, MeasureModel, RepresentationModel, StateModel, BeatView, AuxBeatView, BeatFactoryView, MeasureRepTemplate, LookupInstrument, COLORS, Logging){
  return Backbone.View.extend({
    //registering click events to add and remove measures.
    events : {
      'click .remove-measure-rep' : 'removeRepresentationModel',
      'click .delta' : 'transitionRepresentation',
      'click .record-button' : 'recordMeasure'
      // 'click .record-button' : 'manualForcedRecording'
    },
    initialize : function(options){
      //if we're being created by a MeasureView, we are passed in options. Otherwise we create a single
      //measure and add it to our collection.
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
        // colors || greyscale || greyOff
        // this.beatColorStyle = "colors";
        // this.beatColorStyle = "greyscale";
        this.beatColorStyle = "greyOff";

        this.setElement($('#measure-rep-'+this.model.cid));
        // Using the new variables to attach various things to the view
        this.repContainerEl = options.measureRepContainer;
        this.measurePassingToBeatViewParameters = this.beatViewParameters(options);
        this.measureRepTemplateParameters = this.templateParameters(options);
        // this.measurePassingToBeatFactoryParameters = this.beatFactoryParameters(options.beatColorStyle=this.beatColorStyle);
        this.measurePassingToBeatFactoryParameters = this.beatFactoryParameters(options);
        // This is to create a line in d3
        this.pathFunction = d3.svg.line()
            .x(function (d) {return d.x;})
            .y(function (d) {return d.y;})
            .interpolate('basis'); // bundle | basis | linear | cardinal are also options


        // allow the letter p to click the first plus sign
        $(document).bind('keypress', this.manualPress);

      } else {
        console.error('measureRepView(init): Should not be in here!');
      }

      this.childPrimaryViews = [];
      this.childSecondaryViews = [];
      this.childTertiaryViews = [];
      this.childFactoryViews = [];

      this.listenTo(this.parentHTrackView, 'toggleAnimation', this.toggleAnimation);
      this.listenTo(StateModel, 'recordingComplete', this.recordStop, this);
      
      this.listenTo(this.parentMeasureModel.get('beatsCollection'), 'add remove', this.updateRender);

      this.listenTo(this.model, 'change:currentRepresentationType', this.transition, this);
      this.listenTo(this.parentMeasureModel, 'change:currentScale', this.updateRender);
      // this.listenTo(this.parentMeasureModel, 'change:totalTimeMeasurePlaysInMilliseconds', this.updateRender);
      // this.listenTo(this.model, 'destroy', this.close, this);

      // dispatch.on('resized.event', this.destroy, this);
      this.render();

      this.makeDeleteAndTransitionButtons();

      // make the beats
      this.makeBeats();
      // make a beat factory
      this.makeBeatFactory();

    },
    computeNormalBeatViewParameters: function(beatModel, index){
      this.measurePassingToBeatViewParameters.beatColorStyle = this.beatColorStyle;
      this.measurePassingToBeatViewParameters.lineBeatY1 = this.model.get('lineBeatY1');
      this.measurePassingToBeatViewParameters.lineBeatY2 = this.model.get('lineBeatY2');
      this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
      this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
      // this.model.set({beatBBX: this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index))});
      this.measurePassingToBeatViewParameters.beatBBX = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));

      // All beat params
      this.measurePassingToBeatViewParameters.model = beatModel;
      this.measurePassingToBeatViewParameters.parentMeasureModel = this.parentMeasureModel;
      this.measurePassingToBeatViewParameters.parentMeasureRepModel = this.model;
      this.measurePassingToBeatViewParameters.singleBeat = '#beat'+beatModel.cid;
      this.measurePassingToBeatViewParameters.beatIndex = index;
      this.model.set({beatStartAngle: ((360 / this.parentMeasureModel.get('beatsCollection').models.length)*index)});
      this.measurePassingToBeatViewParameters.beatStartTime = this.model.get('firstBeatStart')+(index)*(this.model.get('timeIncrement')/1000);
      this.measurePassingToBeatViewParameters.color = index;
      this.measurePassingToBeatViewParameters.circleStates = this.model.get('circleStates');

    },
    computeTransitionBeatViewParameters: function(beatModel, index, options){
      // Linestates must be defined here to propagate through transitions
      var lineStatesUnrolling = [];
      var lineStatesRollup = [];
      var sliceLength = this.model.get('transitionNumberOfPoints')/this.parentMeasureModel.get('beatsCollection').models.length;
      for ( var i=0 ; i<this.model.get('transitionNumberOfPoints') ; i++ ){
        var startIndex = (index*sliceLength);// - subtractor;
        var inner = this.model.get('circleStates')[i].slice(startIndex, startIndex+sliceLength);
        lineStatesUnrolling.push(inner);
        lineStatesRollup.splice(0,0,inner);
      }
      this.measurePassingToBeatViewParameters.lineStatesUnrolling = lineStatesUnrolling;
      this.measurePassingToBeatViewParameters.lineStatesRollup = lineStatesRollup;
        // For each subsequent line, we need to start at the last point of the previous line
          // var subtractor = (index===0) ? 0 : 1 ;

      // transition beat params
      if (options){
        this.measurePassingToBeatViewParameters.drawType = options.type;
        this.measurePassingToBeatViewParameters.opacity = beatModel.get('selected');
        if (options.type === 'line') {
          //Unsure of why horzDivPadding needs to be divided by 2, but w/e
          this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index)+this.model.get('circularMeasureCx')-this.model.get('horzDivPadding')/2);
          this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index)+this.model.get('circularMeasureCx')-this.model.get('horzDivPadding')/2);
        } else if (options.type === 'bead') {
          if (options.movedToRight){
            this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index+1));
            this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index+1));
          } else {
            this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
            this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
          }
        } else if (options.type === 'beadCircle') {
          if (options.movedToRight){
            this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index+1));
            this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index+1));
          } else {
            this.measurePassingToBeatViewParameters.X1 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
            this.measurePassingToBeatViewParameters.X2 = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index));
          }
        } else if (options.type === 'bar') {
          // TODO Figure out the pixel difference
          this.measurePassingToBeatViewParameters.beatBBX = this.model.get('lbbMeasureLocationX') +(this.model.get('beatWidth')*(index)+this.model.get('circularMeasureCx')-this.model.get('horzDivPadding')/2);
        } else if (options.type === 'lineRolling') {

        } else if (options.type === 'lineUnrolling') {

        } else if (options.type === 'pie') {

        }
      // Normal beat params
      } else {        
        console.error('Should not be in here! mRV computeTransitionBeatViewParameters')
      }
      // All beat params
      this.measurePassingToBeatViewParameters.parentMeasureRepModel = this.model;
      this.measurePassingToBeatViewParameters.beatIndex = index;
      this.model.set({beatStartAngle: ((360 / this.parentMeasureModel.get('beatsCollection').models.length)*index)});
      this.measurePassingToBeatViewParameters.beatStartTime = this.model.get('firstBeatStart')+(index)*(this.model.get('timeIncrement')/1000);
      this.measurePassingToBeatViewParameters.color = index;
      this.measurePassingToBeatViewParameters.lineStatesUnrolling = lineStatesUnrolling;
      this.measurePassingToBeatViewParameters.lineStatesRollup = lineStatesRollup;
      this.measurePassingToBeatViewParameters.circleStates = this.model.get('circleStates');
    },
    // This is a bad way of handling view deletion, but idk better
    destroy: function(options){
      console.warn(options);
      if (options.cid === this.parentMeasureModel.cid){
        console.log('destroying');
        this.remove();
      }
    },
    makeMeasureRepParts: function(){
      // Bead rep
      if (this.model.get('currentRepresentationType') === 'bead') {
        this.makeBeadRep();
      // Line Rep
      } else if (this.model.get('currentRepresentationType') === 'line'){
        this.makeLineRep();
      // Pie rep
      } else if (this.model.get('currentRepresentationType') === 'pie'){
        this.makePieRep();
      // Audio Rep
      } else if (this.model.get('currentRepresentationType') === 'audio'){
        this.makeAudioRep();
      // Bar Rep
      } else if (this.model.get('currentRepresentationType') === 'bar'){
        this.makeBarRep();
      }
      this.addDroppable();
    },
    // This is abstracted out so we can just call makeBeats() when needed
    // If there are options, it is for the second or third part for transitions {secondary:true, type:'line'}
    makeBeats: function(options){
      // Setting which container the beats go in, primary for first rendering, seconary for transitions
      if (!options){
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
      // this.model.updateInformation();
      _.all(this.parentMeasureModel.get('beatsCollection').models, function(beatModel, index) {
        // Make a new set of beats
        // If Primary
        if(!options){
          µthis.computeNormalBeatViewParameters(beatModel, index);
          // create a Beatview
          var newBeatView = new BeatView(µthis.measurePassingToBeatViewParameters);
          µthis.childPrimaryViews.push(newBeatView);
        // If secondary 
        } else if(options.secondary){
          µthis.computeTransitionBeatViewParameters(beatModel, index, options);
          // create a Secondary Beatview
          var newBeatView = new AuxBeatView(µthis.measurePassingToBeatViewParameters);
          µthis.childSecondaryViews.push(newBeatView);
        // or tertiary transitional beat
        } else if(options.tertiary){
          µthis.computeTransitionBeatViewParameters(beatModel, index, options);
          // create a Tertirary Beatview
          var newBeatView = new AuxBeatView(µthis.measurePassingToBeatViewParameters);
          µthis.childTertiaryViews.push(newBeatView);          
        } else {
          console.error('Should NOT be in here: measureRepView beat making, not primary, secondary, or tertiary beat');
        }
        // if(options){console.error(this.measurePassingToBeatViewParameters);}
        // if (this.currentRepresentationType === 'audio') {
        //   return false;
        // } else {
        //   return true;
        //   //or 
        //   return this;
        // }
        return this;
      }, this);
    },
    updateDeleteButtonPosition: function(){
      var crt = this.model.get('currentRepresentationType') ;
      if (crt === 'line' || crt === 'bar'){
        var deleteXLocation = this.model.get('linearDivWidth') - this.model.get('horzDivPadding');
      } else if (crt === 'bead' || crt === 'pie'){
        var deleteXLocation = this.model.get('circularDivWidth') - this.model.get('horzDivPadding');
      } else if (crt === 'audio'){
        var deleteXLocation = this.model.get('circularDivWidth')/3;
      }

      var xButton = d3.select('#svg-'+this.model.cid).select('.remove-measure-rep')
          .attr('x', deleteXLocation)
    },
    makeDeleteAndTransitionButtons: function(){
      var crt = this.model.get('currentRepresentationType') ;
      if (crt === 'line' || crt === 'bar'){
        var deleteXLocation = this.model.get('linearDivWidth') - this.model.get('horzDivPadding');
      } else if (crt === 'bead' || crt === 'pie'){
        var deleteXLocation = this.model.get('circularDivWidth') - this.model.get('horzDivPadding');
      } else if (crt === 'audio'){
        var deleteXLocation = this.model.get('circularDivWidth')/3;
      }

      var svgContainer = d3.select('#svg-'+this.model.cid)
      var buttonArea = svgContainer
          .append('g', ':first-child')
          .classed('top-rep-buttons', true)
          .attr('id', 'top-rep-buttons-' + this.model.cid);
      buttonArea.append('text')
          .classed('remove-measure-rep', true)
          .attr('id', 'remove-measure-rep-'+ this.model.cid)
          .attr('x', deleteXLocation)
          .attr('y', this.model.get('vertDivPadding'))
          .attr('dy', '.35em')
          .text('X')
          .on("mouseover", function(){ return buttonArea.select('text').attr('stroke', 'red').attr('fill', 'red');})
          .on("mouseout", function(){ return buttonArea.select('text').attr('stroke', 'black').attr('fill', 'black');});

      if (crt !== 'audio'){
        buttonArea.append('text')
            .classed('delta', true)
            .attr('x', this.model.get('horzDivPadding'))
            .attr('y', this.model.get('vertDivPadding'))
            .attr('dy', '.5em')
            .text('Δ')
            // .on("mouseover", function(){ return this.select('text').attr('stroke', '#00ff00');})
            // .on("mouseout", function(){ return this.select('text').attr('stroke', 'black');});
      }
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
      this.model.set({beatAngle: 360/this.parentMeasureModel.get('beatsCollection').models.length});
      this.model.updateInformation();
      return {
        //General
        parentMeasureRepView: this,
        parentMeasureModel: this.parentMeasureModel,
        parentMeasureRepModel: this.model
      }
    },
    // These are the template parameters for the HTML of the MeasureRepView
    templateParameters: function(options){
      return {
        measureRepID: 'measure-rep-'+options.model.cid,
        measureClasses: 'measureRep measureRep-'+this.model.get('currentRepresentationType'),
        measureRepDeltaID: 'delta-'+this.model.cid,
        measureRepSVGID: 'svg-'+this.model.cid,
        svgClasses: this.model.get('currentRepresentationType'),
        measureRepType: this.model.get('currentRepresentationType'),
        beatHolderID: 'beat-holder-'+this.model.cid,
        secondaryBeatHolderID: 'secondary-beat-holder-'+this.model.cid,
        beatFactoryHolderID: 'beat-factory-holder-'+this.model.cid,
        measureCount: this.parentHTrackModel.get('measures').models.length,
        measureRep: this.model.get('currentRepresentationType'),
        measureRepRecordID: 'record-'+this.model.cid
      }
    },
    // This is to START dragging a circle {pie or bead}
    circleStart: function(e, ui) {
      console.log('circle dragging start');
      // Set the current circle's opacity lower,
      this.circlePath.attr('opacity', .4);
      // and draw another one to be resized
      var svgContainer = d3.select('#svg-'+this.model.cid);
      var temporaryCirclePath = svgContainer
          .insert('path', ':first-child')
          .data([this.model.get('circleStates')[0]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'black')
          .attr('opacity', 1)
          .classed('temporary-dragging-path circle circle-path', true)
          // .attr('transform', 'scale('+this.parentMeasureModel.get('currentScale')+','+this.parentMeasureModel.get('currentScale')+')');

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
      // console.log('circle dragging resize');
      // console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      // console.log(e, ui)
      var newWidth = Math.floor(ui.size.width);
      var deltaWidth = newWidth - this.oldW;
      var newHeight = Math.floor(ui.size.height);
      // Not really using the height, we only base off of the width, but we compute it just in case they get separated?
      var deltaHeight = newHeight - this.oldH;
      var deltaRatio = deltaWidth/this.oldW;
      console.log(this.oldW, newWidth, newWidth-this.oldW, (newWidth-this.oldW)/this.oldW, 1+((newWidth-this.oldW)/this.oldW));

      var svgContainer = d3.select('#svg-'+this.model.cid);
      // console.log(deltaWidth, deltaHeight);
      // To handle a weird issue with the svgContainer reducing faster than the resize, we only want to grow the container when the measureRep is increased
      if ( deltaWidth>0 || deltaHeight>0 ){
        svgContainer.attr('width', parseInt(svgContainer.attr('width'))+deltaWidth );
        svgContainer.attr('height', parseInt(svgContainer.attr('height'))+deltaHeight );
      }
      if(this.model.get('currentRepresentationType') == 'bead'){

        var circlePath = svgContainer.select('.temporary-dragging-path');
        // var scale = circlePath.attr('transform').slice(6, circlePath.attr('transform').length-1);
        // TODO MAybe set this to the new scale on the measureRepModel
        // this.scale = (this.parentMeasureModel.get('currentScale')+deltaRatio);
        this.scale = 1+((newWidth-this.oldW)/this.oldW);
        // console.log(this.parentMeasureModel.get('currentScale'),deltaRatio,(this.parentMeasureModel.get('currentScale')+deltaRatio));
        // this.actualScale = (this.parentMeasureModel.get('currentScale')+deltaRatio);
        // this.scale = (this.parentMeasureModel.get('originalScale')+deltaRatio);
        // aspect ratio scale the measure circle, and the beats
        circlePath
            // .attr('transform', 'scale(' + this.scale + ',' + this.scale + ')');
            .attr('transform', 'scale(' + (1+deltaRatio) + ',' + (1+deltaRatio) + ')');
        svgContainer.select('.beatHolder')
            .attr('transform', 'scale(' + (1+deltaRatio) + ',' + (1+deltaRatio) + ')');
      } else if (this.model.get('currentRepresentationType') == 'pie'){
        var circlePath = svgContainer.select('.temporary-dragging-path');
        var beatSlices = svgContainer.select('g');
        // TODO MAybe set this to the new scale on the measureRepModel
        this.scale = 1+((newWidth-this.oldW)/this.oldW);
        // aspect ratio scale the measure circle, and the beats
        circlePath
            .attr('transform', 'scale(' + (1+deltaRatio) + ',' + (1+deltaRatio) + ')');
        beatSlices
            .attr('transform', 'scale(' + (1+deltaRatio) + ',' + (1+deltaRatio) + ')' + this.pieTranslate);
      }
    },
    // AFTER dragging stops on a circle
    circleStop: function(e, ui) {
      console.log('circle: adjusted scale to : ' + this.parentMeasureModel.get('currentScale')*this.scale);
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      this.oldW = ui.size.width;
      this.oldH = ui.size.height;
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height);

      // Delete the translate text for next dragging of a pie
      if(this.pieTranslate){
        this.pieTranslate = undefined;
      }
      // Reset the transform scale
      var svgContainer = d3.select('#svg-'+this.model.cid)
        .select('.beatHolder')
          .attr('transform', 'scale(1,1)');

      // Remove the temporary-dragging-path
      d3.select('#svg-'+this.model.cid).select('.temporary-dragging-path').remove();

      // TODO Replace these events
      // dispatch.trigger('resized.event', { cid: this.parentMeasureModel.cid });

      Logging.logStorage('Scaled a ' + this.model.get('currentRepresentationType') + ' representation by a scale of ' + this.scale + ' to a scale of: ' + this.parentMeasureModel.get('currentScale')*this.scale);

      this.parentMeasureModel.setCurrentScaleAndDivDimensions({ scale: this.parentMeasureModel.get('currentScale')*this.scale, 
                                                                height: ui.size.height});

      //Break css constraints to allow scaling of mRV container
      // Dont think we need this?
      // $('.measureRep').css('height','auto');
    },
    // STARTING a linear drag {number line or bar}
    linearStart: function(e, ui) {
      console.log('linear start');

      if(this.model.get('currentRepresentationType') == 'line'){
        // Set the current line's opacity lower, and draw another one to be resized
        this.actualMeasureLinePath.attr('opacity', .4);
        this.actualMeasureLinePath.attr('transform', 'translate(' + this.model.get('circularMeasureR')*-2 + ',-20)')

        var svgContainer = d3.select('#svg-'+this.model.cid);
        var temporaryMeasureLinePath = svgContainer
            .insert('path', ':first-child')
            .data([this.model.get('circleStates')[this.model.get('transitionNumberOfPoints')-1]])
            .attr('d', this.pathFunction)
            .attr('stroke', 'black')
            .attr('stroke-width', 3)
            .attr('opacity', 1)
            .classed('temporary-dragging-path line line-path', true)
            .attr('transform', 'scale('+this.model.get('currentScale')+','+this.model.get('currentScale')+') translate('+(this.model.get('circularMeasureR')*-2)+',0)')
      } else if (this.model.get('currentRepresentationType') == 'bar'){
      }

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
      var newWidth = ui.size.width;
      var deltaWidth = newWidth - this.oldW;
      var deltaRatio = deltaWidth/this.oldW;
      var svgContainer = d3.select('#svg-'+this.model.cid);

      console.log(this.oldW, newWidth, newWidth-this.oldW, (newWidth-this.oldW)/this.oldW, 1+((newWidth-this.oldW)/this.oldW));      

      if ( deltaWidth>0 ){
        svgContainer.attr('width', parseInt(svgContainer.attr('width'))+deltaWidth*3 );
      }

      if(this.model.get('currentRepresentationType') == 'line'){
        var linePath = svgContainer.select('.temporary-dragging-path');
        var beatLines = svgContainer.select('g');
        // var scale = linePath.attr('transform').slice(6, linePath.attr('transform').length-1);
        // var linePathCurrentScale = parseInt(scale.slice(0, scale.indexOf(',')));
        this.scale = 1+((newWidth-this.oldW)/this.oldW);
        // linearly scale the Line, and the beats
        // This is getting translated and scaled at the same time.  Hence you must translate based on the scale
        linePath
            .attr('transform', 'translate('+(this.model.get('circularMeasureR')*-2*this.scale)+',0) scale(' + this.scale + ',' + 1 + ')')
        beatLines
            .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
      } else if (this.model.get('currentRepresentationType') == 'bar'){
        var barPath = svgContainer.select('rect');
        var beatBars = svgContainer.select('g');
        this.scale = 1+((newWidth-this.oldW)/this.oldW);

        // linearly scale the Line, and the beats
        barPath
            .attr('transform', 'scale(' + this.scale + ',' + 1 + ')')
        beatBars
              .attr('transform', 'scale(' + this.scale + ',' + 1 + ')');
      }
    },
    // AFTER a linear drag stops
    linearStop: function(e, ui) {
      var newWidth = ui.size.width;
      var deltaWidth = newWidth - this.oldW;
      var deltaRatio = deltaWidth/this.oldW;
      var newScale = this.parentMeasureModel.get('currentScale') + deltaRatio;

      console.log('linear adjusted scale by : ' + newScale);
      console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      this.oldW = ui.size.width;
      this.oldH = ui.size.height;
      // console.log(this.oldW, this.oldH, ui.size.width, ui.size.height)
      // Remove the temporary-dragging-path
      d3.select('#svg-'+this.model.cid).select('.temporary-dragging-path').remove();

      // Reset the transform scale
      var svgContainer = d3.select('#svg-'+this.model.cid)
        .select('.beatHolder')
          .attr('transform', 'scale(1,1)');

      Logging.logStorage('Scaled a ' + this.model.get('currentRepresentationType') + ' representation by a scale of ' + this.scale + ' to a scale of: ' + this.parentMeasureModel.get('currentScale')*this.scale);

      this.parentMeasureModel.setCurrentScaleAndDivDimensions({ scale: this.parentMeasureModel.get('currentScale')*this.scale, 
                                                                height: this.model.get('divHeight')*(1+deltaRatio)});


      //Break css constraints to allow scaling of mRV container
      // Dont think we need this?
      // $('.measureRep').css('height','auto');
    },
    // Making a targeted 'Audio' beat animate
    audioAnimate: function(target, dur, selected) {
      // console.log('Audio animate target: ', target);
      var d3Target = d3.select(target);
      // var originalFillColor = 'none';
      var originalOpacity = 'none';
      // if(selected == true){
      //   var newFillColor = this.model.get('colorForAudio');
      // } else {
      //   var newFillColor = originalFillColor;
      // }
      var originalOpacity = target.getAttribute('fill-opacity');
      if(selected == true){
        var newOpacity = 1;
      } else {
        var newOpacity = originalOpacity;
      }

      if(this.parentMeasureModel.get('timesRecorded') !== 0) {
      d3Target
        .attr('fill-opacity', newOpacity);

        setTimeout(function(){
          d3Target
            .attr('fill-opacity', originalOpacity);
        }, dur);
      // Otherwise we use the standard method
      } else {      

      }

      d3Target.transition()
        .attr('fill-opacity', newOpacity)
        // .attr('fill', newFillColor )
        .duration(0)
        .each('end',function() {                   // as seen above
          d3.select(this).                         // this is the object 
            transition()                           // a new transition!
              // .attr('fill', originalFillColor )   // we could have had another
              .attr('fill-opacity', originalOpacity )   // we could have had another
              .duration(dur*2);                      // .each("end" construct here.
              // .delay(dur-1)
              // .duration(1);                      // .each("end" construct here.
         });
    },
    // Making a targeted 'Bead' beat animate
    //dur is half of the beat length
    beadAnimate: function(target, dur) {
      var d3target = d3.select(target);

      var centerCX = this.model.get('circularMeasureCx');
      var centerCY = this.model.get('circularMeasureCy');
      var originalCX = parseInt(d3target.attr('cx'));
      var originalCY = parseInt(d3target.attr('cy'));
      var deltaCX = originalCX - centerCX;
      var deltaCY = originalCY - centerCY;
      var angleInDegrees = Math.atan2(deltaCY, deltaCX) * 180 / Math.PI;
      var angleInRadians = Math.atan2(deltaCY, deltaCX);
      var diffAngle = angleInDegrees + 90;
      var newCX = centerCX + (this.model.get('circularMeasureR')+(this.model.get('circularBeadBeatRadius')*2)) * Math.cos(angleInRadians);
      var newCY = centerCY + (this.model.get('circularMeasureR')+(this.model.get('circularBeadBeatRadius')*2)) * Math.sin(angleInRadians);

      // If the have recorded their own rhythm, then we have to use a setTimeout function for some reason.
      if(this.parentMeasureModel.get('timesRecorded') !== 0) {
        d3target
          .attr('cx', newCX )
          .attr('cy', newCY )

        setTimeout(function(){
          d3target
            .attr('cx', originalCX )
            .attr('cy', originalCY )
        }, dur);
      // Otherwise we use the standard method
      } else {      
        d3target.transition()
          .attr('cx', newCX )
          .attr('cy', newCY )
          .duration(dur)
          .each('end',function() {                   // as seen above
            d3.select(this).                         // this is the object 
              transition()                           // a new transition!
                .attr('cx', originalCX )    // we could have had another
                .attr('cy', originalCY )    // we could have had another
                .duration(dur);                  // .each("end" construct here.
           });
      }
    },
    // Making a targeted 'Line' beat animate
    lineAnimate: function(target, dur) {
      var target = d3.select(target);
      var originalY1 = parseInt(target.attr('y1'));
      var originalY2 = parseInt(target.attr('y2'));
      // Make the line beat move up by its own height
      var newY1 = originalY1 - this.model.get('lineHashHeight');
      var newY2 = originalY2 - this.model.get('lineHashHeight');

      if(this.parentMeasureModel.get('timesRecorded') !== 0) {
        target
          .attr('y1', newY1 )
          .attr('y2', newY2 );

        setTimeout(function(){
          target
            .attr('y1', originalY1 )    
            .attr('y2', originalY2 )    // we could have had another
        }, dur);
      // Otherwise we use the standard method
      } else {      
        target.transition()
          .attr('y1', newY1 )
          .attr('y2', newY2 )
          .duration(dur)
          .each('end',function() {                   // as seen above
            d3.select(this).                         // this is the object 
              transition()                           // a new transition!
                .attr('y1', originalY1 )    
                .attr('y2', originalY2 )    // we could have had another
                .duration(dur);                  // .each("end" construct here.
           });
      }
    },
    // Making a targeted 'Pie' beat animate
    pieAnimate: function(target, index, totalNumberOfBeats, dur) {      
      var d3target = d3.select(target);
      var angleInRadians = 2*Math.PI/totalNumberOfBeats * index - ( (2*Math.PI/4) - (2*Math.PI/totalNumberOfBeats/2) );
      var newCX = (this.model.get('circularMeasureR')) * Math.cos(angleInRadians)/1.5;
      var newCY = (this.model.get('circularMeasureR')) * Math.sin(angleInRadians)/1.5;

      if(this.parentMeasureModel.get('timesRecorded') !== 0) {
        d3target
          .attr('transform', 'translate(' + newCX + ',' + newCY + ')' );
          
        setTimeout(function(){
          d3target
            .attr('transform', 'translate(0,0)' )
        }, dur);
      // Otherwise we use the standard method
      } else {      
        d3target.transition()
          .attr('transform', 'translate(' + newCX + ',' + newCY + ')' )
          .duration(dur)
          .each('end',function() {                               // as seen above
            d3.select(this).                                     // this is the object 
              transition()                                       // a new transition!
                .attr('transform', 'translate(0,0)' )
                .duration(dur);                                 // .each("end" construct here.
           });
      }

    },
    // Making a targeted 'Bar' beat animate
    barAnimate: function(target, dur) {
      var target = d3.select(target);
      var originalY = parseInt(target.attr('y'));
      // Make the bar beat move up by its own height
      var newY = originalY - this.model.get('lbbMeasureHeight');

      if(this.parentMeasureModel.get('timesRecorded') !== 0) {
        target
          .attr('y', newY )

        setTimeout(function(){
          target
            .attr('y', originalY )
        }, dur);
      // Otherwise we use the standard method
      } else {      
        target.transition()
          .attr('y', newY )
          .duration(dur)
          .each('end',function() {                   // as seen above
            d3.select(this).                         // this is the object 
              transition()                           // a new transition!
                .attr('y', originalY )    // we could have had another
                .duration(dur);                  // .each("end" construct here.
           });
      }

    },
    // This toggles the animation, not the sound
    // The state is passed in from the toggleAnimation.event
    toggleAnimation: function(options){
      var µthis = this;

        var standardR = this.model.get('initialCircularMeasureR'); // 51
/**x**/ var standardLengthOfRhythmInPixels = 2*Math.PI*standardR; // 320 with a scale of 1
        var standardPixelsPerBeat = standardLengthOfRhythmInPixels/16; // ~20

        // 320 x 8

        var standardBeatsPerMinute = 120; // 120 bpm
/**x**/ var standardBeatsPerSecond = standardBeatsPerMinute/60; // 2 beats per second

        // var standardPixelsPerSecond = standardBeatsPerSecond * standardPixelsPerBeat; // 20 pixels per beat @ 2 beats per second || 40 pixels per second
/**x**/ var standardPixelsPerSecond = this.parentMeasureModel.get('pixelsPerSecond');; 
        var standardPixelsPerMinute = standardPixelsPerSecond * 60; // 6000 pixels per minute


        var scaledR = this.model.get('circularMeasureR');
/**x**/ var scaledLengthOfRhythmInPixels = 2*Math.PI*scaledR; // 320 with a scale of 1
        var scaledPixelsPerBeat = scaledLengthOfRhythmInPixels/16; // ~20
        
        //s might need to apply scale factor here
        var howLongToPlayFullRhythmLinearly = scaledLengthOfRhythmInPixels/standardPixelsPerSecond; // 8 seconds


//TODO USE signature or beats
      var signature = this.parentMeasureModel.get('beatsCollection').length;      
      // var tempo = this.parentHTrackModel.get('tempo');
      var measuresCount = this.parentHTrackModel.get('measures').length;
      // var currentInstrumentDuration = measuresCount * beats / tempo * 60.0 * 1000.0;
      //dur is time of one beat.
      var dur = this.parentMeasureModel.get('totalTimeMeasurePlaysInMilliseconds')/signature;
      // var dur = 8000 / beats;
      // var dur = options.beatDuration *1000;
      // var calcDur = 1000/(tempo/60);

      var totalNumberOfBeats = signature*measuresCount;
      // go through the measure(s) first without animation
      var counter = 0;
      var measureCounter = 0;
      this.retrievedRepresentationType = this.model.get('currentRepresentationType');
      //when playing is stopped we stop the animation.
      if (options.turn === 'Off') {
        console.log('stopped animation');
        clearInterval(this.animationIntervalID);
        this.animationIntervalID = null;
      // When playing is started, we start the animation
      } else if(options.turn === 'On') {
        console.log('in toggle animation starting');
        // If there are beats to be animated, play each in sequence, keeping a count as we go along
        // The first set is play the song from the get go
        if (counter >= 0 && counter < totalNumberOfBeats) {
          if (this.retrievedRepresentationType == 'audio'){
            //TODO 
            var beats = $('#measure-rep-'+this.model.cid).find('.audio-beat');
            // A boolean value if the beat is selected
            var selected = this.parentMeasureModel.get('beatsCollection').models[counter].get('selected');
            // Animate the Audio beat
            this.audioAnimate(beats.eq(0)[0], dur/2.0, selected);
          } else if (this.retrievedRepresentationType == 'bead'){
            var beats = $('#measure-rep-'+this.model.cid).find('.bead-beat');
            // Animate the Bead beat
            this.beadAnimate(beats.eq(0)[0], dur/2.0/8.0);
          } else if (this.retrievedRepresentationType == 'line'){
            var beats = $('#measure-rep-'+this.model.cid).find('.line-beat');
            // Animate the Line beat
            this.lineAnimate(beats.eq(0)[0], dur/2.0/8.0);
          } else if (this.retrievedRepresentationType == 'pie'){
            var beats = $('#measure-rep-'+this.model.cid).find('.pie-beat');
            // Animate the Pie beat
            this.pieAnimate(beats.eq(0)[0], 0, totalNumberOfBeats, dur/2.0/8.0);
          } else if (this.retrievedRepresentationType == 'bar'){
            var beats = $('#measure-rep-'+this.model.cid).find('.bar-beat');
            // Animate the Bar beat
            this.barAnimate(beats.eq(0)[0], dur/2.0/8.0);
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
                var selected = self.parentMeasureModel.get('beatsCollection').models[counter].get('selected');
                // console.log('calling from second loop');
                // self.audioAnimate(beats.eq(0)[0], dur/2.0, selected);
                self.audioAnimate(beats.eq(counter)[0], dur/2.0, selected);
              } else if (self.retrievedRepresentationType == 'bead'){
                var beats = $('#measure-rep-'+self.model.cid).find('.bead-beat');
                self.beadAnimate(beats.eq(counter)[0], dur/2.0/8.0);
              } else if (self.retrievedRepresentationType == 'line'){
                var beats = $('#measure-rep-'+self.model.cid).find('.line-beat');
                self.lineAnimate(beats.eq(counter)[0], dur/2.0/8.0);
              } else if (self.retrievedRepresentationType == 'pie'){
                var beats = $('#measure-rep-'+self.model.cid).find('.pie-beat');
                self.pieAnimate(beats.eq(counter)[0], counter, totalNumberOfBeats, dur/2.0/8.0);
              } else if (self.retrievedRepresentationType == 'bar'){
                var beats = $('#measure-rep-'+self.model.cid).find('.bar-beat');
                self.barAnimate(beats.eq(counter)[0], dur/2.0/8.0);
              }
              counter ++;
            }
          }
        })(this), dur); //duration should be set to something else
      } else {
        console.error('ERROR, Should Not be in here: measureRepView.js.  State:');
        console.error(options)
      }
    },
    // This clears the intervals to both stop the animations, and prevent the browser from crashing after stopping
    clearAnimationIntervalID: function() {
        console.log('stopped animation with func() call');
        clearInterval(this.animationIntervalID);
        this.animationIntervalID = null;
    },
    // reset the groups if they were translated during animations
    resetSVGGroups: function() {
      // Primary
      var primaryBeatHolder = d3.select('#beat-holder-'+this.model.cid)
        .attr('transform', 'translate(0,0)');
      // Secondary
      var secondaryBeatHolder = d3.select('#secondary-beat-holder-'+this.model.cid)
        .attr('transform', 'translate(0,0)');
      // Tertiary
      var tertiaryBeatHolder = d3.select('#tertiary-beat-holder-'+this.model.cid)
        .attr('transform', 'translate(0,0)');
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
      // var actualMeasureLinePath = d3.select(this.actualMeasureLinePath)
        .transition()
          .attr('transform', 'translate(0,0)')
          .duration(this.model.get('transitionDuration'));
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
        .classed('infinite-line', true)
        .attr('x1', -200)
        .attr('y1', this.model.get('numberLineY'))
        .attr('x2', 1000)
        .attr('y2', this.model.get('numberLineY'))
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('opacity', .5);
      this.infiniteLine = infiniteLine;
    },
    // removes the infinite line on the number line
    removeInfiniteLine: function() {
      // var infiniteLine = d3.select('#svg-'+this.model.cid + ' .infinite-line');
      this.infiniteLine.remove();
    },
    // removes the measure box on a bar
    removeBarBox: function() {
      var barBox = d3.select('#svg-'+this.model.cid + ' .bar-box');
      barBox.remove();      
    },
    // TRANSITIONS
    beadToLine: function(options) {
      console.log('btl');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
            .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var beadBeats = beatHolder.selectAll('.bead-beat');

      $('#measure-rep-'+this.model.cid).width('auto')
      this.removeLabels();

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
        // make the number line beats
        µthis.makeBeats({secondary:true, type:'line'});
        // Fade out the beads
        $('#beat-holder-'+µthis.model.cid+' .bead-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration'));
      // Third Stage
      setTimeout(function(){
        // remove the primary bead views
        µthis.removeSpecificChildren(µthis.childPrimaryViews);
        // add the infinite line
        µthis.addInfiniteLine();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*2 );
      // Fourth Stage
      setTimeout(function(){
        // move entire portion to the left
        µthis.moveSecondaryLeft('bead');
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*3 );
      // Fifth Stage
      setTimeout(function(){
        µthis.resetSVGGroups();
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

      $('#measure-rep-'+this.model.cid).width('auto')
      this.removeLabels();

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
        $('#beat-holder-'+µthis.model.cid+' .bead-beat').fadeOut(µthis.model.get('animationIntervalDuration'));
        // fade circle measure (the unrolling line)
        circlePath.fadeOut(µthis.model.get('animationIntervalDuration'));
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration'));
      // Third Stage
      setTimeout(function(){
        // move entire portion to the left
        µthis.moveSecondaryLeft();
        // remove the primary bead views
        // µthis.removeSpecificChildren(µthis.childPrimaryViews);
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*2 );
      // Fourth Stage
      setTimeout(function(){
        µthis.resetSVGGroups();
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

      this.removeLabels();

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
        // µthis.removeSpecificChildren(µthis.childPrimaryViews);
      }, this.model.get('animationIntervalDuration')*2 );
      // re-render
      setTimeout(function(){
        µthis.resetSVGGroups();
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
      
      this.removeLabels();

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
        µthis.resetSVGGroups();
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
      
      $('#measure-rep-'+this.model.cid).width('auto')
      this.removeLabels();

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
        // µthis.removeSpecificChildren(µthis.childPrimaryViews);
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
              // For some reason the d3 classed() doesn't work and errors
              .attr('class', 'circle circle-path')
              .attr('d', µthis.pathFunction)
              .attr('stroke', 'black')
              .attr('opacity', 1);
              // .attr('transform', 'translate(0,0)')
        }
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*5);
      // re-render
      setTimeout(function(){
        // rerender everything to get the factory as well
        // Change the type of the representation
        // µthis.model.set('currentRepresentationType', 'bead');
        //  Reset any moved svg group holders
        µthis.resetSVGGroups();
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
      
      $('#measure-rep-'+this.model.cid).width('auto')
      this.removeLabels();

      // move the entire thing right to allow for rolling up
      setTimeout(function(){
        µthis.movePrimaryRight();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration') );
      // remove the infinte line
      setTimeout(function(){
        µthis.removeInfiniteLine();
      }, this.model.get('transitionDuration') + this.model.get('animationIntervalDuration')*2 );
      // make the seconadry line rolling beats
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
        $('.lineRolling').fadeOut(µthis.model.get('animationIntervalDuration'));
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*6 );
      // re-render
      setTimeout(function(){
        µthis.resetSVGGroups();
        // rerender everything to get the factory as well
        µthis.updateRender();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*7 );
    },
    barToLine: function(){
      console.log('rtl');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid);
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      
      this.removeLabels();

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
        µthis.resetSVGGroups();
        // rerender everything to get the factory as well
        µthis.updateRender();
      }, this.model.get('animationIntervalDuration')*3 );      
    },
    barToBead: function(){
      console.log('rtb');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
        .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 )
        .attr('height', this.model.get('linearDivHeight')+this.model.get('circularMeasureR')*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      
      $('#measure-rep-'+this.model.cid).width('auto')
      this.removeLabels();

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
          µthis.actualMeasureLinePath.data([µthis.model.get('circleStates')[µthis.model.get('transitionNumberOfPoints')-1-i]])
            .transition()
              .delay(µthis.model.get('transitionDuration')*i)
              .duration(µthis.model.get('transitionDuration'))
              .ease('linear')
              .attr('d', µthis.pathFunction)
              .attr('stroke', 'black')
              .attr('opacity', 1)
              .attr('class', 'circle circle-path');
        }
      }, this.model.get('animationIntervalDuration')*3 ); 
      // re-render
      setTimeout(function(){
        µthis.resetSVGGroups();
        µthis.updateRender();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*4 );      
    },
    barToPie: function(){
      console.log('rti');
      var µthis = this;
      var svgContainer = d3.select('#svg-'+this.model.cid)
        .attr('width', this.model.get('linearDivWidth')+this.model.get('circularMeasureR')*2 )
        .attr('height', this.model.get('linearDivHeight')+this.model.get('circularMeasureR')*2 );
      var beatHolder = d3.select('#beat-holder-'+this.model.cid);
      var barBeats = beatHolder.selectAll('.bar-beat');

      $('#measure-rep-'+this.model.cid).width('auto')
      this.removeLabels();

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
        µthis.resetSVGGroups();
        µthis.updateRender();
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

      this.removeLabels();

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
        µthis.resetSVGGroups();
        // rerender everything to get the factory as well
        console.warn('Not using updateRender, you may want to check that');
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

      $('#measure-rep-'+this.model.cid).width('auto')
      this.removeLabels();

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
        var svgContainer = d3.select('#svg-'+µthis.model.cid);
        var actualMeasureLinePath = svgContainer
            .insert('path', ':first-child')
            .data([µthis.model.get('circleStates')[µthis.model.get('transitionNumberOfPoints')-1]])
            .attr('d', µthis.pathFunction)
            .attr('stroke', 'black')
            .attr('opacity', 1)
            .attr('class', 'line line-path')
            .attr('transform', 'scale('+µthis.model.get('currentScale')+','+µthis.model.get('currentScale')+')')
            .attr('transform', 'translate('+(µthis.model.get('circularMeasureR')*-2-10)+',0)');
        µthis.actualMeasureLinePath = actualMeasureLinePath;
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*8 );
      setTimeout(function(){
        µthis.resetSVGGroups();
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

      $('#measure-rep-'+this.model.cid).width('auto')
      this.removeLabels();

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
        µthis.resetSVGGroups();
        µthis.updateRender();
      }, this.model.get('transitionDuration')*(this.model.get('transitionNumberOfPoints')) + this.model.get('animationIntervalDuration')*5 );
    },
    makeBeadRep: function(){
      $('#measure-rep-' + this.model.cid).height(this.model.get('divHeight'));

      // find the svg container
      var svgContainer = d3.select('#svg-'+this.model.cid)
          .attr('width', this.model.get('circularDivWidth'))
          .attr('height', this.model.get('circularDivHeight'));
      // add a circle representing the whole measure
      var circlePath = svgContainer
          .insert('path', ':first-child')
          .data([this.model.get('circleStates')[0]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'black')
          .attr('opacity', 1)
          .classed('circle circle-path', true)
          // .attr('transform', 'scale(' + this.model.get('currentScale') + ',' + this.model.get('currentScale') + ')');
      // Attach it to the view
      this.circlePath = circlePath;
      // Attach the resizable callbacks
      this.circleResizable();
    },
    makeLineRep: function(){
      this.model.updateInformation();
      $('#measure-rep-' + this.model.cid).height(this.model.get('divHeight'));
      $('#measure-rep-' + this.model.cid).width(this.model.get('linearDivWidth'));

      // Find the SVG container
      var svgContainer = d3.select('#svg-'+this.model.cid)
          .attr('width', this.model.get('linearDivWidth'))
          // .attr('height', this.model.get('linearDivHeight'));
          .attr('height', this.model.get('divHeight'));
      // add the infinite line
      var infiniteLine = svgContainer
          .insert('line', ':first-child')
          .classed('infinite-line', true)
          .attr('x1', -200)
          .attr('y1', this.model.get('numberLineY'))
          .attr('x2', 2000)
          .attr('y2', this.model.get('numberLineY'))
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('opacity', .5)
      this.infiniteLine = infiniteLine;
      // Draw the Thicker line representing the measure
      var actualMeasureLinePath = svgContainer
          .insert('path', ':first-child')
          .data([this.model.get('circleStates')[this.model.get('transitionNumberOfPoints')-1]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'black')
          .attr('stroke-width', 3)
          .attr('opacity', 1)
          .classed('line line-path', true)
          // .attr('transform', 'scale(' + this.parentMeasureModel.get('currentScale') + ',' + this.parentMeasureModel.get('currentScale') + ')')
          // For when I get the scaling done correctly.
          // .attr('transform', 'translate('+(this.model.get('circularMeasureR')*-2*this.parentMeasureModel.get('currentScale'))+',0)');
          .attr('transform', 'translate('+(this.model.get('circularMeasureR')*-2)+',0)');
      // attach it to the view
      this.actualMeasureLinePath = actualMeasureLinePath;
      this.linearResizable();
    },
    makePieRep: function(){
      this.model.updateInformation();
      $('#measure-rep-' + this.model.cid).height(this.model.get('divHeight'));

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
          .classed('circle circle-path', true)
          // .attr('transform', 'scale('+this.model.get('currentScale')+','+this.model.get('currentScale')+')')
      // Attach it to the view
      this.circlePath = circlePath;
      this.circleResizable();
    },
    makeBarRep: function(){
      this.model.updateInformation();
      $('#measure-rep-' + this.model.cid).height(this.model.get('divHeight'));
      $('#measure-rep-' + this.model.cid).width(this.model.get('linearDivWidth'));

      // Find the SVG Container
      var svgContainer = d3.select('#svg-'+this.model.cid)
          // the 15 is because the circle path line may not be exact on the line rep, and its easier just to add a buffer on this bar rep
          // .attr('width', this.model.get('linearDivWidth')+15)
          .attr('width', this.model.get('linearDivWidth'))
          .attr('height', this.model.get('divHeight'));
      var  secondaryBeatHolder = d3.select('#secondary-beat-holder-'+this.model.cid);
      // Make a Box that holds the smaller beat bars
      var barBox = svgContainer
          .insert('rect', ':first-child')
          .classed('bar-box', true)
          .attr('x', this.model.get('lbbMeasureLocationX'))
          .attr('y', this.model.get('lbbMeasureLocationY'))
          .attr('width', this.model.get('linearLineLength'))
          .attr('height', this.model.get('lbbMeasureHeight'))
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('fill', 'white')
          // .attr('transform', 'scale('+this.model.get('currentScale')+','+this.model.get('currentScale')+')')
          this.barBox = barBox;

      var actualMeasureLinePath = secondaryBeatHolder
          .insert('path', ':last-child')
          .data([this.model.get('circleStates')[this.model.get('transitionNumberOfPoints')-1]])
          .attr('d', this.pathFunction)
          .attr('stroke', 'none')
          .attr('opacity', 1)
          .classed('line hidden-line-path', true)
          // .attr('transform', 'scale('+this.model.get('currentScale')+','+this.model.get('currentScale')+')')
          .attr('transform', 'translate('+(this.model.get('circularMeasureR')*-2-10)+',0)');
      // Attach it to the view
      this.actualMeasureLinePath = actualMeasureLinePath;
      this.linearResizable();
    },
    makeAudioRep: function(){
      $('#measure-rep-' + this.model.cid).height(this.model.get('divHeight'));

      // Find the SVG Container
      var svgContainer = d3.select('#svg-'+this.model.cid);
      // Make a large Circle representing the container for all beats as they pulse
      var metronomeCirlce = svgContainer
          .insert('circle', ':first-child')
          .attr('cx', this.model.get('audioMeasureCx'))
          .attr('cy', this.model.get('audioMeasureCy'))
          .attr('r', this.model.get('audioMeasureR'))
          .attr('fill', this.model.get('colorForAudio'))
          .attr('fill-opacity', 0.2)
          .classed('metronome-tap', true)
          .attr('stroke', 'black');
    },
    render: function(){
      var µthis = this;

      // TODO see if this can be removed
      //set the el for JQ-UI Drag
      // may not be needed
      // this.$el.attr('id', 'measure-rep-' + this.model.cid);
      // this.setElement($('#measure-rep-'+this.model.cid));

      // compile the template for a representation
      var compiledTemplate = _.template(MeasureRepTemplate);
      // put in the rendered template in the measure-rep-container of the measure
      $(this.repContainerEl).append( compiledTemplate(this.measureRepTemplateParameters) );
      this.setElement($('#measure-rep-'+this.model.cid));

      this.makeMeasureRepParts();

      return this;
    },
    // This makes the bead factory in each measureRep
    makeBeatFactory: function(){
      var remainingNumberOfBeats = 16-this.parentMeasureModel.get('beatsCollection').models.length;
      
      // Bead
      if (this.model.get('currentRepresentationType') == 'bead') {
        for (i = 0 ; i < remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          //                                                                              |-Added as a buffer -|
          this.measurePassingToBeatFactoryParameters.cX = this.model.get('horzDivPadding') +        10          + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.cY = (this.model.get('circularDivHeight')-this.model.get('vertDivPadding')-this.model.get('beatFactoryR')) + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          var newBeadFactory = new BeatFactoryView(this.measurePassingToBeatFactoryParameters);
          this.childFactoryViews.push(newBeadFactory);
        }
      // Line
      } else if (this.model.get('currentRepresentationType') == 'line') {
        for (i = 0 ; i < remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          //                                                                              |-Added as a buffer -|
          this.measurePassingToBeatFactoryParameters.x1 = this.model.get('horzDivPadding') +        10           + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.y1 = this.model.get('numberLineY') + 80 + (Math.random() * (20) - 10);
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
          //                                                                              |-Added as a buffer -|
          this.measurePassingToBeatFactoryParameters.cX = this.model.get('horzDivPadding') +       15            +(Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.cY = (this.model.get('circularDivHeight')-this.model.get('vertDivPadding')-this.model.get('beatFactoryR')) + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParameters.colorIndex = index;
          this.measurePassingToBeatFactoryParameters.circularMeasureCx = this.model.get('circularMeasureCx');
          this.measurePassingToBeatFactoryParameters.circularMeasureCy = this.model.get('circularMeasureCy');
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
    /*
      This is called when the user clicks on the minus to remove a measureRep.
    */
    removeRepresentationModel: function(ev){
      // if ($('#measure'+this.measuresCollection.models[0].cid).parent()) {
        //removing the last measure isn't allowed.
        if(this.parentMeasureModel.measureRepresentations.length == 1) {
          console.log('Can\'t remove the last representation!');
          return;
        }
        console.log('this.model: ', this.model.cid, this.model);

        this.model.destroy();
        this.close();

        console.log('removed representation');

        // var measureModelCid = ev.srcElement.parentElement.parentElement.parentElement.id.slice(12);
        // //we remove the measureRep and get its model.
        // this.measureRepresentations.remove(measureModelCid);

        console.log('Removed measureRep ' + this.cid + ", ");
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
      if(!$('#measure-rep-'+this.model.cid).hasClass('transition-rep')){      
        console.log('transitioning a rep');
        $('#measure-rep-'+this.model.cid).addClass('transition-rep');
        // e.srcElement.classList.add('transition-rep');
      } else {
        console.log('un clicking transitioning a rep');
        $('#measure-rep-'+this.model.cid).removeClass('transition-rep');
        // e.srcElement.classList.remove('transition-rep');
      }
    },
    // Manages the transition paths
    transition: function(){
      console.log('in transition func() of measureRepView');
      var PRT = this.model.get('previousRepresentationType');
      var CRT = this.model.get('currentRepresentationType');
      // Increase the count for the parent measure model
      this.parentMeasureModel.increaseTransitionCount();
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
    // Remove all the stamps prior to a transition
    removeLabels: function(){
      $(this.$el).find('.stamped').remove();
    },
    // Shortcuts: T for transition
    manualPress: function(e) {
      // t = 116, d = 100, w = 119, o = 111
      if(!$('.modal-content:visible').length){
        if (e.keyCode == 111) {
          // $('.record-button')[0].click();
        } else if (e.keyCode == 100) {
          // $('.measureRep')[1].
        } else if (e.keyCode == 119) {
          if(this.isTapping) {        
            var timeTapped = new Date();
            StateModel.recordTempoAndPatternByKeyboard(timeTapped.getTime());
          }
        }
      }
    },
    // Record the measure
    recordMeasure: function(button) {
      if(!this.isTapping) {
        this.recordStart();
      } else {
        this.recordStop();
      }
    },
    manualForcedRecording: function(){
      console.log('getting into manual forced');
      if(!this.isTapping) {
        StateModel.processManualWaveform(this.parentHTrackModel.get('type'));
        StateModel.turnIsWaitingOn();
        this.isTapping = true;
        $('#measure-rep-'+this.model.cid + ' .record-div').addClass('recording')
      } else {
        this.recordStop();
      }
    },
    recordStart: function(){
      console.log('Recording clicked');
      // This is for recording by tapping on the desk...
      // We need to know which instrument was being recorded
      StateModel.recordTempoAndPatternByTapping(this.parentHTrackModel.get('type'));
      
      // I think this is for recording by tapping on the keyboard keys...
      // Nope, still dont know what this is for
      StateModel.turnIsWaitingOn();

      // Keep a handle if we are tapping or not
      this.isTapping = true;
      // Update the record button to be green to let us know we are recording
      $('#measure-rep-'+this.model.cid + ' .record-div').addClass('recording')
    },
    recordStop: function(){
      $('#measure-rep-'+this.model.cid + ' .record-div').removeClass('recording')
      StateModel.turnIsWaitingOff();
      this.isTapping = false;      
    },
    circleResizable: function() {
      var µthis = this;
      // JQ-UI resizable
      $(this.el).resizable({ 
        aspectRatio: true,
        // To keep the number Math.Floored
        // grid:10,
        // minWidth:200,
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
    linearResizable: function() {
      var µthis = this;
      // this.setElement($('#measure-rep-'+this.model.cid));
      // JQ-UI resizable
      this.$el.resizable({ 
        // minWidth: 310,
        // The min/max height keep it so it only goes scales in the X direction
        minHeight: this.model.get('divHeight'),
        maxHeight: this.model.get('divHeight'),
        grid:10,
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
    addDroppable: function(){
      // JQ Droppable
      var µthis = this;
      $(this.el).droppable({
        accept: '.stamp',
        tolerance: 'fit', //Make sure the label is entirely in the measureRep
        drop: function(event, ui) {
          var µthis = this;
          var type = this.dataset.representation;
          var label = ui.draggable.text();
          var left = ui.offset.left-this.offsetLeft-1;
          var top = ui.offset.top-this.offsetTop-116;
          var instrument = LookupInstrument.getDefault($(this).parent().parent().parent().parent().data().state, 'label');
          Logging.logStorage('Added a label to a measureRep of type: ' + type + ' on instrument: '+ instrument +', Label: ' + label + ' at left: ' + left + ' , top: ' + top + ' with ' + $(µthis).children('.stamped').text().split('').length + ' labels already on the rep: ' + $(µthis).children('.stamped').text().split('') );


          // Create a new div, that can also be dragged around within the measureRep
          var newDiv = $('<div class="dbtn stamped dropped"></div>')
            .text(ui.draggable.text())
            //Allow it to be dragged again
            .draggable({ 
              // When it drags
              drag: function(dragEvent, dragUI){
                //  to the left            to the right                           to the top          to the bottom
                if (this.offsetLeft < 0 || this.offsetLeft > µthis.offsetWidth || this.offsetTop < 0 || this.offsetTop > µthis.offsetHeight) {
                  console.info('Dragged a label already in the mR outside of the mR');  
                  var instrument = LookupInstrument.getDefault($(this).parent().parent().parent().parent().parent().data().state, 'label');
                  var type = $(this).parent().data().representation;
                  Logging.logStorage('Removed a label already in the mR : Instrument: '+ instrument+' , Label: ' + this.textContent+' , type: '+type);
                  this.remove();
                  this.removed = true;
                }
              },
              // When it stops
              stop: function(stopEvent, stopUI) {
                if(!this.removed){
                  Logging.logStorage('Adjusted a label already in the mR.  Label: ' + this.textContent + ' at left: ' + this.offsetLeft + ' , top: ' + this.offsetTop);
                }
              }
            })
            .appendTo(this)
            // the good is at 122L  77T
            // the bad is at  110L 135T
            // at this point, there are two labels, the helper (good) which is still tied to the System-Label div
            // There is also the new one we just created, and we need to offset it properly
                                                                            // Not sure why there is an extra 1 pixel needed
            .css({position:"absolute", left:ui.offset.left-this.offsetLeft  -1})
                                                                        // I think 116 is the offset between the row and the htrack height
            .css({position:"absolute", top:ui.offset.top-this.offsetTop -116})

            // .css({position:"absolute", left:ui.offset.left-this.offsetLeft-10});
            // .css({position:"absolute", left:ui.offset.left-this.offsetLeft-10, top:ui.offset.top-this.offsetTop});
        }
      });
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
      this.removeSpecificChildren(this.childPrimaryViews);
      this.removeSpecificChildren(this.childSecondaryViews);
      this.removeSpecificChildren(this.childTertiaryViews);
      this.removeSpecificChildren(this.childFactoryViews);
    },
    // We have to abstract this out so when we are doing transitions, we can get rid of specific views as needed
    removeSpecificChildren: function(childViews){
      _.each(childViews, function(childView){
        if (childView.close){
          childView.close();
        }
      })
    },
    removeMeasureRepParts: function(){
      // To prevent stacking of the first audio beat that protects users from clicking the beats
      if($('#svg-'+this.model.cid+' circle:first-child')) {
        $('#svg-'+this.model.cid+' circle:first-child').remove();
      }
      if(this.circlePath){this.circlePath.remove()};
      if(this.barBox){this.barBox.remove()};
      if(this.infiniteLine){this.infiniteLine.remove()};
      if(this.actualMeasureLinePath){this.actualMeasureLinePath.remove()};
    },
    updateRender: function(){
      console.log('getting to updateRender');

      // var width = this.$el.width();
      // var height = this.$el.height();
      this.closeAllChildren();
      this.removeMeasureRepParts();
      this.makeMeasureRepParts();
      this.updateDeleteButtonPosition();

      var crt = this.model.get('currentRepresentationType');

      // NOT SURE IF WE NEED THIS
      // FROM HERE
      // if (crt === 'line' || crt === 'bar'){
      //   this.$el.width(this.model.get('linearDivWidth'));
      //   this.$el.height(this.model.get('linearDivHeight'));
      // } else if (crt === 'bead' || crt === 'pie'){
      //   this.$el.width(this.model.get('circularDivWidth'));
      //   this.$el.height(this.model.get('circularDivHeight'));
      // }
      // TO HERE

      // make the beats
      this.makeBeats();
      // make a beat factory
      this.makeBeatFactory();
      // update the classes and the data-representation type
      this.updateDivInfo();
      this.updateDeleteButtonPosition();
      // remove and replace the div in its place to ensure rendering
      // this.trigger('removeReplace', 'test');

      // NOT SURE IF WE NEED THIS
      // FROM HERE

      // $elemDivs = $(this.el)
      // var originals = [];
      // var dimensions = [];
      // $elemDivs.each(function() {
      //   // Clone original, keeping event handlers and any children elements
      //   dimensions.push({
      //     width: $(this).width(),
      //     height: $(this).height()
      //   });
      //   originals.push($(this).clone(true)); 
      //   // Create placeholder for original content
      //   $(this).replaceWith('<div id="original_' + originals.length + '" class="update-render-temp-holder"></div>');
      // });

      // // Replace placeholders with original content
      // // for (var i = 0; i < originals.length; i++) {
      // //  $('#original_' + (i + 1)).replaceWith(originals[i]);
      // // };

      // // setTimeout(function(){
      //   // Replace placeholders with original content
      //   for (var i = 0; i < originals.length; i++) {
      //    $('#original_' + (i + 1)).replaceWith(originals[i]);
      //   };
      // // }, 1 );

      // TO HERE
    },
    // This is called when rerender a measureRepView and this way it stays in the same order
    updateDivInfo: function(){
      // Since audio reps can't be resized
      if(this.model.get('currentRepresentationType') !== 'audio'){
        this.$el.resizable('destroy');      
        // $('#measure-rep-'+this.model.cid).height('auto')
      }
      if(this.model.get('currentRepresentationType') === 'audio'){
        // TODO Make the audio div the same height
        // $('#measure-rep-'+this.model.cid + ' svg').attr('height', this.model.get('circularDivHeight') * this.parentMeasureModel.get('currentScale'));
      }

      this.$el.droppable('destroy');
      this.$el.attr('class','measureRep measureRep-'+this.model.get('currentRepresentationType'));
      this.$el.attr('data-representation', this.model.get('currentRepresentationType'));
      // $('#beat-holder-'+this.model.cid).attr('transform', 'translate(0,0)')
      // $('#secondary-beat-holder-'+this.model.cid).attr('transform', 'translate(0,0)')
      // $('#tertiary-beat-holder-'+this.model.cid).attr('transform', 'translate(0,0)')

      var crt = this.model.get('currentRepresentationType') ;
      if (crt === 'line' || crt === 'bar'){
        this.linearResizable();
      } else if (crt === 'bead' || crt === 'pie'){
        this.circleResizable();
      }
      // Add the droppable again
      this.addDroppable();
    },
    onClose: function(){
      // this.model.unbind("change", this.render);

      $(document).unbind('keypress', this.manualPress);

      // this.unbind('signatureChange.event', this.reconfigure);
      // this.unbind('unroll.event', this.unroll);
      // this.unbind('toggleAnimation.event', this.toggleAnimation);
      // this.unbind('resized.event', this.destroy);
      this.model.unbind('change', this.transition);
      // this.model.destroy();
    }
  });
});
