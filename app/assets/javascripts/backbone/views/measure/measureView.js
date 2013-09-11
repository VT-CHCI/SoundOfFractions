// Filename: views/measure/measureView.js
/*
  This is the MeasureView.
  This is contained in a HTrackView.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/beats',
  'backbone/collections/stage',
  'backbone/collections/representations',
  'backbone/models/measure',
  'backbone/models/state',
  'backbone/models/representation',
  'backbone/views/beat/beatView',
  'backbone/views/factory/beadFactoryView',
  'backbone/views/measure/measureRepView',
  'text!backbone/templates/measure/measure.html',
  'colors',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatsCollection, StageCollection, RepresentationsCollection, MeasureModel, StateModel, RepresentationModel, BeatView, BeadFactoryView, MeasureRepView, MeasureTemplate, COLORS, dispatch, log){
  return Backbone.View.extend({

    //registering click events to add and remove measures.
    events : {
      'click .add-measure' : 'addMeasure',
      'click .delete-measure' : 'removeMeasure'
    },

    initialize: function(options){
      //if we're being created by a HTrackView, we are
      //passed in options.
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
        this.originalScale = this.measureModel.get('originalScale');
        this.circularMeasureR = 51; // 8 pxs per bead plus 1 px border = 10
                                    // 10 * 16 = 160/pi = 51
        this.el = '#measure-container-'+options.parent.cid;
      } else {
        console.error('Should not be in here: NO Measure!');
      }

      //registering a callback for signatureChange events.
      // dispatch.once('signatureChange.event', this.reconfigure, this);
      //Dispatch listeners
      dispatch.on('afterUnrollAnim', this.render, this);
      dispatch.on('measureRepresentation.event', this.changeMeasureRepresentation, this);
      dispatch.on('unroll.event', this.unroll, this);
      dispatch.on('tempoChange.event', this.adjustRadius, this);

      _.bindAll(this, 'render');
      this.listenTo(this.measureRepresentations, 'remove', _.bind(this.render, this));  
      this.listenTo(this.measureRepresentations, 'add', _.bind(this.render, this));  
      this.collectionOfMeasures.on('add', _.bind(this.render, this));
      this.collectionOfMeasures.on('remove', _.bind(this.render, this));

      this.render();
    },
    calculateNumberOfPoints: function(n) {
      // We want to be above 30, but below 90 to avoid computational and animation delay
      switch (n){
        case 1:
          this.measureNumberOfPoints = 60;
          break;
        case 2:
          this.measureNumberOfPoints = 60;
          break;
        case 3:
          this.measureNumberOfPoints = 60;
          break;
        case 4:
          this.measureNumberOfPoints = 60;
          break;
        case 5:
          this.measureNumberOfPoints = 60;
          break;
        case 6:
          this.measureNumberOfPoints = 60;
          break;
        case 7:
          this.measureNumberOfPoints = 63;
          break;
        case 8:
          this.measureNumberOfPoints = 64;
          break;
        case 9:
          this.measureNumberOfPoints = 63;
          break;
        case 10:
          this.measureNumberOfPoints = 60;
          break;
        case 11:
          this.measureNumberOfPoints = 66;
          break;
        case 12:
          this.measureNumberOfPoints = 60;
          break;
        case 13:
          this.measureNumberOfPoints = 65;
          break;
        case 14:
          this.measureNumberOfPoints = 56;
          break;
        case 15:
          this.measureNumberOfPoints = 60;
          break;
        case 16:
          this.measureNumberOfPoints = 64;
          break;
      }
    },
    render: function(){
      console.log('m render');
      this.scale = this.measureModel.get('scale');
      // Make a template for the measure and append the MeasureTemplate to the measure area in the hTrack
      var measureTemplateParameters = {
        mCID: this.model.cid,
        measureCount: this.measureCount,
        measureNumberOfBeats: this.model.get('beats').length
      };
      var compiledMeasureTemplate = _.template( MeasureTemplate, measureTemplateParameters );
      
      // If we are adding a rep, clear the current reps, then add the template
      $(this.el).html('');
      $(this.el).append( compiledMeasureTemplate )

      // Constant Variables throughout the representations
      // General
        var originalScale = this.originalScale;
        var scale = this.scale;
        var vertDivPadding = 25;
        var horzDivPadding = 25;
      // Circular
        var cX = 100;
        var cY = 75
        var circularMeasureCx = (cX+horzDivPadding)*scale;
        var circularMeasureCy = (cY+vertDivPadding)*scale;
        var circularMeasureR = this.circularMeasureR*scale;
        this.calculateNumberOfPoints(this.collectionOfMeasures.models[0].get('beats').models.length);
        var measureNumberOfPoints = this.measureNumberOfPoints;
        var circularDivWidth = 2*circularMeasureR + horzDivPadding*2 + cX*this.scale; 
        var circularDivHeight = 2*circularMeasureR + vertDivPadding*2 + cY*this.scale; 
      // Linear
        var linearLineLength = 2 * circularMeasureR * Math.PI;
        var linearDivWidth = linearLineLength + horzDivPadding;
        var linearDivHeight = 25 + vertDivPadding;
      // Transition
        var firstBeatStart = 0; // in s
        var timeIncrement = 500; // in ms
        var margin = {top: 20, left: 60};
        var lineDivision = linearLineLength/measureNumberOfPoints;
        var animationDuration = 3000/measureNumberOfPoints;

      // Audio
        //Measure
        var audioMeasureCx = 50;
        var audioMeasureCy = 40;
        var audioMeasureR = 12;
        //Beat
        var audioBeatCx = 50;
        var audioBeatCy = 40;
        var audioBeatR = 12;
        var colorForAudio = COLORS.hexColors[5];
      // Pie
        //Measure
        var measureStartAngle = 0;
        //Beat
        var beatStartAngle;
        var beatEndAngle;
        var beatFactoryR = 30;
      // Bead
        var circularBeadBeatRadius = 8;
      //Number Line
        var lineHashHeight = 30;
        var numberLineY = 50;
      // Bar
        //Measure
        var lbbMeasureLocationX = 15; // 5%
        var lbbMeasureLocationY = 10;
        var lbbMeasureWidth = linearLineLength;
        var lbbMeasureHeight = 25;
        //Beat
        var linearBeatXPadding = 0;
        var linearBeatYPadding = 0;
        var beatWidth = linearLineLength/this.model.get('beats').length;
        var beatHeight = lbbMeasureHeight - 2*linearBeatYPadding;
        var beatBBY = linearBeatYPadding + lbbMeasureLocationY;
        var beatFactoryWidth = 50;

      var circleStates = [];
      for (i=0; i<measureNumberOfPoints; i++){
          // circle portion
          var circleState = $.map(Array(measureNumberOfPoints), function (d, j) {
            // margin.left + measureRadius
            var x = circularMeasureCx + lineDivision*i + circularMeasureR * Math.sin(2 * j * Math.PI / (measureNumberOfPoints - 1));
            // margin.top + measureRadius
            var y =  circularMeasureCy - circularMeasureR * Math.cos(2 * j * Math.PI / (measureNumberOfPoints - 1));
            return { x: x, y: y};
          })
          circleState.splice(measureNumberOfPoints-i);
          //line portion
          var lineState = $.map(Array(measureNumberOfPoints), function (d, j) {
             // margin.left + measureRadius
            var x = circularMeasureCx + lineDivision*j;
            // margin.top
            var y =  circularMeasureCy - circularMeasureR;
            return { x: x, y: y};
          })
          lineState.splice(i);
          //together
          var individualState = lineState.concat(circleState);
          circleStates.push(individualState);
      }
      this.circleStates = circleStates;

      // for each rep in the measuresCollection
      _.each(this.measureRepresentations.models, function(rep, repIndex) {
        // (when representation button changes, the current representation template will get updated)
        // compile the template for a measure

        var measureRepViewParamaters = {
          // HTrack
          hTrackEl: this.hTrackEl,
          hTrack: this.parent,
          measureCount: this.measureCount,
          // Measure
          parentMeasureModel: this.measureModel,
          beatsInMeasure: this.model.get('beats').models.length,
          parent: this,
          parentCID: this.cid,
          mCID: this.model.cid,
          measureRepContainer: '#measure-rep-container-'+this.model.cid,
          circularDivWidth: circularDivWidth,
          circularDivHeight: circularDivHeight,
          linearDivWidth: linearDivWidth,
          linearDivHeight: linearDivHeight,
          vertDivPadding: vertDivPadding,
          horzDivPadding: horzDivPadding,
          // Measure Rep
          originalScale: this.originalScale,
          scale: this.scale,
          model: rep,
          measureRepModel: rep,
          representationType: rep.get('representationType'),
          beatHolder:'beatHolder'+this.model.cid,
          margin: margin,
          measureRepresentations: this.measureRepresentations,
          //Audio
          audioMeasureCx: audioMeasureCx,
          audioMeasureCy: audioMeasureCy,
          audioMeasureR: audioMeasureR,
          audioBeatCx: audioBeatCx,
          audioBeatCy: audioBeatCy,
          audioBeatR: audioBeatR,
          colorForAudio: colorForAudio,
          // Pie
          measureAngle: 360.0,
          beatFactoryR: beatFactoryR,
          // Circular
          circularMeasureCx: circularMeasureCx,
          circularMeasureCy: circularMeasureCy,
          circularMeasureR: circularMeasureR,
          circularBeadBeatRadius: circularBeadBeatRadius,
          lbbMeasureLocationX: lbbMeasureLocationX,
          lbbMeasureLocationY: lbbMeasureLocationY,
          // Bead
          measureNumberOfPoints: measureNumberOfPoints,
          //Number Line
          xOffset: linearLineLength/this.model.get('beats').models.length / 2,
          yOffset: lbbMeasureHeight / 2,
          lineHashHeight: lineHashHeight,
          linearLineLength: linearLineLength,
          numberLineY: numberLineY,
          lineDivision: lineDivision,
          // Bar
          measureWidth: lbbMeasureWidth,
          beatWidth: beatWidth,
          beatFactoryWidth: beatFactoryWidth,
          beatBBY: beatBBY,
          beatHeight: beatHeight,
          measureHeight: lbbMeasureHeight,
          measureColor: COLORS.hexColors[COLORS.colorIndices.WHITE],
          // Transition
          circleStates: circleStates,
          measureNumberOfPoints: this.measureNumberOfPoints,
          pathFunction: this.circlePath,
          animationDuration: animationDuration
        };

        new MeasureRepView(measureRepViewParamaters);
      }, this);

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
    addMeasure: function(){
        console.log('add a measure');
        var newMeasure = new BeatsCollection;

        for (var i = 0; i < this.parent.get('signature'); i++) {
          newMeasure.add();
        }

        this.measuresCollection.add({beats: newMeasure});

        //Logging
        name = 'measure' + _.last(this.measuresCollection.models).cid + '.';
        _.each(newMeasure.models, function(beats) {
          name = name + 'beat'+ beats.cid + '.';
        }, this);
        log.sendLog([[3, 'Added a measure: ' + name]]);

        //Render
        this.render();
        //Dispatch
        dispatch.trigger('stopRequest.event', 'off');
    },

    /*
      This is called when the user clicks on the minus to remove a measure.
    */
    removeMeasure: function(ev){
      console.error('here');
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
    reconfigure: function(options) {
      this.render();
    }
  });
});
