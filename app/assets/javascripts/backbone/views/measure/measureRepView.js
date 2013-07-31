// Filename: views/measure/measureRepView.js
/*
  This is the MeasureRepView.
  This is contained in a MeasureView.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/beats',
  'backbone/models/measure',
  'backbone/models/representation',
  'backbone/models/state',
  'backbone/views/beat/beatView',
  'backbone/views/factory/beadFactoryView',
  'text!backbone/templates/measure/audioMeasures.html',
  'text!backbone/templates/measure/linearBarMeasures.html',
  'text!backbone/templates/measure/circularPieMeasures.html',
  'text!backbone/templates/measure/circularBeadMeasures.html',
  'text!backbone/templates/measure/numberLineMeasures.html',
  'text!backbone/templates/measure/measureRep.html',
  'colors',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatsCollection, MeasureModel, RepresentationModel, StateModel, BeatView, BeadFactoryView, AudioMeasuresTemplate, LinearBarMeasuresTemplate, CircularPieMeasuresTemplate, CircularBeadMeasuresTemplate, NumberLineMeasuresTemplate, MeasureRepTemplate, COLORS, dispatch, log){
  return Backbone.View.extend({
    // The different representations
    representations: {
      'audio': AudioMeasuresTemplate,
      'bar': LinearBarMeasuresTemplate,
      'pie': CircularPieMeasuresTemplate,
      'bead': CircularBeadMeasuresTemplate,
      'line': NumberLineMeasuresTemplate
    },
    //grab the current measure representation's data-state
    currentRepresentationType: '', //temp-holder until init
    previousRepresentationType: '', //temp-holder until init
    //registering click events to add and remove measures.
    events : {
      'click .remove-measure-rep' : 'removeRepresentation'
    },
    initialize: function(options){
      //if we're being created by a MeasureView, we are
      //passed in options. Otherwise we create a single
      //measure and add it to our collection.
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
        this.el = options.measureRepContainer;
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
      this.render();
    },
    changeMeasureRepresentation: function(representation) {
      this.previousRepresentationType = this.currentRepresentationType;
      this.currentRepresentationType = representation;
      this.render();
    },
    transitionRoll: function(options) {
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
    },
    rollup: function() {
      for(i=0; i<this.measureNumberOfPoints; i++){
        circlePath.data([this.circleStates[this.measureNumberOfPoints-1-i]])
          .transition()
          .delay(this.animationDuration*i)
          .duration(this.animationDuration)
          .ease('linear')
          .attr('d', this.pathFunction);
      }
    },
    render: function(){
      // compile the template for a representation
      var measureRepTemplateParamaters = {
        measureRepID: 'measure-rep-'+this.measureRepModel.cid,
        measureClasses: 'measureRep resizable measure-'+this.currentRepresentationType,
        measureRepDeltaID: 'delta-'+this.measureRepModel.cid,
        measureRepSVGID: 'svg-'+this.measureRepModel.cid,
        svgClasses: this.currentRepresentationType,
        beatHolderID: 'beat-holder-'+this.measureRepModel.cid,
        beatFactoryHolderID: this.beatFactoryHolder,
        measureCount: this.measureCount,
        measureRep: this.currentRepresentationType,
        measureRepRecordID: 'record-'+this.measureRepModel.cid
      };
      var compiledTemplate = _.template( MeasureRepTemplate, measureRepTemplateParamaters );
      // put in the rendered template in the measure-rep-container of the measure
      $(this.el).append( compiledTemplate );

      if (this.currentRepresentationType == 'bead') {
        var margin = this.margin;
        var lineData = $.map(Array(this.measureNumberOfPoints), function (d, i) {
            var y = margin.top;
            var x = margin.left + i * this.lineLength / (this.measureNumberOfPoints - 1)
            return {x: x, y: y}
        });
        var pathFunction = d3.svg.line()
            .x(function (d) {return d.x;})
            .y(function (d) {return d.y;})
            .interpolate('basis'); // bundle | basis | linear | cardinal are also options

        //The Circle SVG Path we draw MUST BE AFTER THE COMPILED TEMPLATE
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
            // .call(d3.experiments.dragAll);
        var circlePath = svgContainer
            .insert('path', ':first-child')
            .data([this.circleStates[0]])
            .attr('d', pathFunction)
            .attr('stroke', 'black')
            .attr('opacity', 1)
            .attr('class', 'circle')
            .attr('class', 'circle-path')

        function transitionRoll(options) {
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
      } else if (this.currentRepresentationType == 'line'){
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
        var measureLine = svgContainer
            .insert('line', ':first-child')
            .attr('x1', -200)
            .attr('y1', this.numberLineY)
            .attr('x2', 600)
            .attr('y2', this.numberLineY)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
        var actualMeasureLinePath = svgContainer
            .insert('line', ':first-child')
            .attr('x1', this.xMeasureLocation)
            .attr('y1', this.numberLineY)
            .attr('x2', this.xMeasureLocation+this.lineLength)
            .attr('y2', this.numberLineY)
            .attr('stroke', 'black')
            .attr('stroke-width', 2)

      } else if (this.currentRepresentationType == 'pie'){

      } else if (this.currentRepresentationType == 'audio'){
        var svgContainer = d3.select('#svg-'+this.measureRepModel.cid)
        var circlePath = svgContainer
            .insert('circle', ':first-child')
            .attr('cx', this.audioMeasureCx)
            .attr('cy', this.audioMeasureCy)
            .attr('r', this.audioMeasureR)
            .attr('fill', this.colorForAudio)
            .attr('stroke', 'black')
            .attr('opacity', .2)

      } else if (this.currentRepresentationType == 'bar'){

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
          beatBBX: this.xMeasureLocation +(this.beatWidth*(index)),
          beatBBY: this.beatBBY,
          beatHolderWidth: this.beatHolderWidth,
          linearBeatXPadding: this.linearBeatXPadding,
          beatWidth: this.beatWidth,
          beatHeight: this.beatHeight,
          // Line
          numberLineY: this.numberLineY,
          lineHashHeight: this.lineHashHeight,
          X1: this.xMeasureLocation +(this.beatWidth*(index)),
          Y1: this.numberLineY - this.lineHashHeight/2,
          X2: this.xMeasureLocation +(this.beatWidth*(index)),
          Y2: this.numberLineY + this.lineHashHeight/2,
          // Circular Pie
          circularMeasureCx: this.circularMeasureCx,
          circularMeasureCy: this.circularMeasureCy,
          circularMeasureR: this.circularMeasureR,
          beatAngle: 360 / this.beatsInMeasure,
          beatStartAngle: -90+((360 / this.beatsInMeasure)*index),
          beatStartTime: this.firstBeatStart+(index)*(this.timeIncrement/1000),
          
          // Circular Bead
          beadRadius: this.circularBeadBeatRadius,
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
          colorForAudio: this.colorForAudio
        };

        // manipulate pie beat parameters
        // 
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
        lineLength: this.lineLength
      };
      if (this.currentRepresentationType == 'bead') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParamaters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParamaters.cX = 20 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.cY = 130 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.colorIndex = index;
          // this.measurePassingToBeatFactoryParamaters.colorIndex = 18;
          console.log()
          new BeadFactoryView(this.measurePassingToBeatFactoryParamaters);
        }
      } else if (this.currentRepresentationType == 'line') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParamaters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParamaters.x1 = 20 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.y1 = this.numberLineY + 60 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.x2 = this.measurePassingToBeatFactoryParamaters.x1;
          this.measurePassingToBeatFactoryParamaters.y2 = this.measurePassingToBeatFactoryParamaters.y1 + this.lineHashHeight;
          this.measurePassingToBeatFactoryParamaters.colorIndex = index;
          new BeadFactoryView(this.measurePassingToBeatFactoryParamaters);
        }        
      }

      return this;
    },

    /*
      This is called when the user clicks on the plus to add a new measure.

      It creates a new measure and adds it to the hTrack.
      It generates a string representing the id of the measure and the ids of
      its beats and logs the creation.

      Lastly, it triggers a stopRequest, because we can't continue playing until
      all the durations get recalculated to reflect this new measure.
    */

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
      This is called when the user clicks on the minus to remove a measure.
    */
    removeRepresentation: function(ev){
      console.log('getting here')
      if ($('#measure'+this.measuresCollection.models[0].cid).parent()) {
        //removing the last measure isn't allowed.
        if(this.measuresCollection.models.length == 1) {
          console.log('Can\'t remove the last measure!');
          return;
        }
        console.log('remove measure');

        //we remove the measure and get its model.
        var model = this.measuresCollection.get($(ev.target).parents('.measure').attr('id').replace('measure',''));
        this.measuresCollection.remove(model);

        //send a log event showing the removal.
        log.sendLog([[3, 'Removed a measure: measure' + this.cid]]);

        //re-render the view.
        this.render();

        //trigger a stop request to stop playback.
        dispatch.trigger('stopRequest.event', 'off');
        dispatch.trigger('signatureChange.event', this.parent.get('signature'));
      }
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
    //This is called when the hTrack is clicked anywhere to bring
    //the hTrack into focus as selected.
    toggleSelection: function(e){
      e.stopPropagation();
      $('#measure'+this.measuresCollection.models[0].cid).toggleClass('selected');
    }
  });
});
