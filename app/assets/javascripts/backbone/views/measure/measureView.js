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
      // if we're being created by a HTrackView, we are passed in options.
      // Many variables get passed in.  We attach those variable with this function, so for each variable:
      // this.something = options.something; 
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
        // This is the scaling to start scaling with.
        this.originalScale = this.measureModel.get('originalScale');
        this.circularMeasureR = 51; // 8 pxs per bead plus 1 px border = 10
                                    // 10 * 16 = 160/pi = 51
        // we attach to the DOM of the measure container from our parent measure
        this.el = '#measure-container-'+options.parent.cid;
      // Error catching
      } else {
        console.error('Should not be in here: NO Measure!');
      }
      // We use this to make sure we are deleting all the views later
      // TODO this is buggy. we need to figure out how to delete properly via backbone views
      this.newMeasureRepViews = [];

      //Dispatch listeners
      // dispatch.on('signatureChange.event', this.reconfigure, this);
      // dispatch.on('measureRepresentation.event', this.changeMeasureRepresentation, this);
      // dispatch.on('unroll.event', this.unroll, this);
      // dispatch.on('tempoChange.event', this.adjustRadius, this);
      // dispatch.on('reRenderMeasure.event', this.render, this);
      this.listenTo(dispatch, 'signatureChange.event', this.reconfigure);
      this.listenTo(dispatch, 'measureRepresentation.event', this.changeMeasureRepresentation);
      this.listenTo(dispatch, 'unroll.event', this.unroll);
      this.listenTo(dispatch, 'tempoChange.event', this.adjustRadius);
      this.listenTo(dispatch, 'reRenderMeasure.event', this.render);

      // this bindall method is thor the remainging listeners, per StackOverflow suggestions
      _.bindAll(this, 'render');
      // when we add or delete a meauserRep
      this.listenTo(this.measureRepresentations, 'remove', _.bind(this.render, this));  
      this.listenTo(this.measureRepresentations, 'add', _.bind(this.render, this));  
      this.model.on('change:scale', _.bind(this.render, this));

      // This is for version2, when we add or delete a measure
      this.collectionOfMeasures.on('add', _.bind(this.render, this));
      this.collectionOfMeasures.on('remove', _.bind(this.render, this));

      this.render();
    },
    // We need to calculate the number of points for animation transitions
    // We want to be above 30 for fluidity, but below 90 to avoid computational and animation delay
    calculateNumberOfPoints: function(n) {
      switch (n){
        case 1:
          this.transitionNumberOfPoints = 40;
          break;
        case 2:
          this.transitionNumberOfPoints = 40;
          break;
        case 3:
          this.transitionNumberOfPoints = 42;
          break;
        case 4:
          this.transitionNumberOfPoints = 40;
          break;
        case 5:
          this.transitionNumberOfPoints = 40;
          break;
        case 6:
          this.transitionNumberOfPoints = 42;
          break;
        case 7:
          this.transitionNumberOfPoints = 42;
          break;
        case 8:
          this.transitionNumberOfPoints = 40;
          break;
        case 9:
          this.transitionNumberOfPoints = 45;
          break;
        case 10:
          this.transitionNumberOfPoints = 40;
          break;
        case 11:
          this.transitionNumberOfPoints = 44;
          break;
        case 12:
          this.transitionNumberOfPoints = 48;
          break;
        case 13:
          this.transitionNumberOfPoints = 39;
          break;
        case 14:
          this.transitionNumberOfPoints = 42;
          break;
        case 15:
          this.transitionNumberOfPoints = 45;
          break;
        case 16:
          this.transitionNumberOfPoints = 48;
          break;
      }
    },
    render: function(){
      this.scale = this.measureModel.get('scale');
      console.log('m render with scale of: '+this.scale);

      // Make a template for the measure and append the MeasureTemplate to the measure area in the hTrack
      // Get some parameters for the template
      var measureTemplateParameters = {
        mCID: this.model.cid,
        measureCount: this.measureCount,
        measureNumberOfBeats: this.model.get('beats').length
      };
      // compile the template
      var compiledMeasureTemplate = _.template( MeasureTemplate, measureTemplateParameters );
      
      // If we are adding a rep, clear the current reps, then add the template
      while(this.newMeasureRepViews.length >0) {
        var deleting = this.newMeasureRepViews.pop();
        deleting.stopListening();
        delete deleting;
      }
      // clear the html
      $(this.el).html('');
      // append the new completed compiled template
      $(this.el).append( compiledMeasureTemplate )

      // Constant Variables throughout the representations
      // General
        var originalScale = this.originalScale;
        var scale = this.scale;
        var vertDivPadding = 0;
        var horzDivPadding = 25;
      // Circular
        var cX = 100;
        var cY = 75
        var circularMeasureCx = (cX+horzDivPadding)*scale;
        var circularMeasureCy = (cY+vertDivPadding)*scale;
        var circularMeasureR = this.circularMeasureR*scale;
        this.calculateNumberOfPoints(this.collectionOfMeasures.models[0].get('beats').models.length);
        var circularDivWidth = 2*circularMeasureR + horzDivPadding*2 + cX*this.scale; 
        var circularDivHeight = 2*circularMeasureR + vertDivPadding*2 + cY*this.scale; 
      // Linear
        var linearLineLength = 2 * circularMeasureR * Math.PI;
        var linearDivWidth = linearLineLength + horzDivPadding;
        var linearDivHeight = 25 + vertDivPadding;
      // Transition
        var transitionNumberOfPoints = this.transitionNumberOfPoints;
        var firstBeatStart = 0; // in s
        var timeIncrement = 500; // in ms
        var margin = {top: 20, left: 60};
        var lineDivision = linearLineLength/transitionNumberOfPoints;
        var transitionDuration = 3000/transitionNumberOfPoints;
        var animationIntervalDuration = 1000;

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
        var numberLineY = 25 + vertDivPadding;
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
        var beatFactoryBarWidth = 30;
        var beatFactoryBarHeight = 15;

      // This is what calculates the different states of circles and lines throughout an animation of a circle to a line or a line to a circle
      var circleStates = [];
      for (i=0; i<transitionNumberOfPoints; i++){
          // circle portion
          var circleState = $.map(Array(transitionNumberOfPoints), function (d, j) {
            var x = circularMeasureCx + lineDivision*i + circularMeasureR * Math.sin(2 * j * Math.PI / (transitionNumberOfPoints - 1));
            var y =  circularMeasureCy - circularMeasureR * Math.cos(2 * j * Math.PI / (transitionNumberOfPoints - 1));
            return { x: x, y: y};
          })
          circleState.splice(transitionNumberOfPoints-i);
          //line portion
          var lineState = $.map(Array(transitionNumberOfPoints), function (d, j) {
            var x = circularMeasureCx + lineDivision*j;
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

        // get parameters for the template for a measure
        var measureRepViewParameters = {
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
          transitionNumberOfPoints: transitionNumberOfPoints,
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
          beatFactoryBarWidth: beatFactoryBarWidth,
          beatFactoryBarHeight: beatFactoryBarHeight,
          beatBBY: beatBBY,
          beatHeight: beatHeight,
          measureHeight: lbbMeasureHeight,
          measureColor: COLORS.hexColors[COLORS.colorIndices.WHITE],
          // Transition
          circleStates: circleStates,
          transitionNumberOfPoints: this.transitionNumberOfPoints,
          pathFunction: this.circlePath,
          transitionDuration: transitionDuration,
          animationIntervalDuration: animationIntervalDuration
        };
        //This part is the hack      This is where we create a measureRepView for each one using the paramaters
        this.newMeasureRepViews.push(new MeasureRepView(measureRepViewParameters));
      }, this);
      // All of the views together
      console.log(this.newMeasureRepViews);

      window.mrc = this;

      return this;
    },

    /*
      Version 1 should not support multiple measures, but we have it for when we will

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
      Again, Version 1 should not support multiple measures, but we have it for when we will
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
    // This is called when the signature of a measure is changed
    reconfigure: function(options) {
      this.render();
    }
  });
});
