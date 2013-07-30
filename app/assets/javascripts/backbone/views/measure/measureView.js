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
    // el: $('.measure')[0],

    //registering click events to add and remove measures.
    events : {
      'click .add-measure' : 'addMeasure',
      'click .delete-measure' : 'removeMeasure',
      'click .measure' : 'toggleSelection'
    },

    initialize: function(options){
      //if we're being created by a HTrackView, we are
      //passed in options.
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
        this.circularMeasureR = 51; // 8 pxs per bead plus 1 px border = 10
                                    // 10 * 16 = 160/pi = 51
        this.el = '#measure-container-'+options.parent.cid;
      } else {
        console.error('Should not be in here: NO Measure!');
      }
      this.counter = 0;

      //registering a callback for signatureChange events.
      dispatch.on('signatureChange.event', this.reconfigure, this);
      //Dispatch listeners
      dispatch.on('measureRepresentation.event', this.changeMeasureRepresentation, this);
      dispatch.on('unroll.event', this.unroll, this);
      dispatch.on('tempoChange.event', this.adjustRadius, this);
      dispatch.on('addMeasureRepresentation.event', this.addRepToMeasure, this);

      this.render();
    },

    render: function(options){
      // Make a template for the measure and append the MeasureTemplate to the measure area in the hTrack
      var measureTemplateParamaters = {
        mCID: this.model.cid,
        measureCount: this.measureCount,
        measureNumberOfBeats: this.model.get('beats').length
      };
      var compiledMeasureTemplate = _.template( MeasureTemplate, measureTemplateParamaters );
      // If we are adding a rep, clear the current reps, then add the template
      if (options = 'adding') {
        $(this.el).html('');
      }
      $(this.el).append( compiledMeasureTemplate )

      // Constant Variables throughout the representations
      // Audio
      var audioMeasureCx = 50;
      var audioMeasureCy = 40;
      var audioMeasureR = 12;
      var audioBeatCx = 50;
      var audioBeatCy = 40;
      var audioBeatR = 12;
      var colorForAudio = COLORS.hexColors[5];
      // Circular
      var circularMeasureCx = 100;
      var circularMeasureCy = 75;
      var circularMeasureR = this.circularMeasureR;
      var measureNumberOfPoints = 60; //keep under 91 to avoid computational and animation delay
      this.measureNumberOfPoints = measureNumberOfPoints;
      // Linear
      var lineLength = 2 * circularMeasureR * Math.PI;
      var beatWidth = lineLength/this.model.get('beats').length;
      var beatHashHeight = 10;
      // Transition
      var firstBeatStart = 0; // in s
      var timeIncrement = 500; // in ms
      var margin = {top: 20, left: 60};
      var lineDivision = lineLength/measureNumberOfPoints;
      var animationDuration = 3000/measureNumberOfPoints;

      // Pie
      var measureStartAngle = 0;
      var beatStartAngle;
      var beatEndAngle;
      // Bead
      var circularBeadBeatRadius = 8;
      //Number Line
      var lineHashHeight = 30;
      var numberLineY = 50;
      // Bar
      var xMeasureLocation = 15; // 5%
      var yMeasureLocation = 10;
      var lbbMeasureWidth = 272; // 90%
      var lbbMeasureHeight = 25;
      var linearBeatXPadding = 0; // 5% left AND right
      var linearBeatYPadding = 0;  // tiny sliver
      var beatHeight = 25 - 2*linearBeatYPadding;
      var beatBBY = 10 + linearBeatYPadding;

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
      _.each(this.collectionOfRepresentations.models, function(rep, repIndex) {
        // (when representation button changes, the current representation template will get updated)
        // compile the template for a measure

        var measureRepViewParamaters = {
          parentMeasureModel: this.parentMeasureModel,
          beatsInMeasure: this.model.get('beats').models.length,
          parent: this,
          measureRepModel: rep,
          parentCID: this.cid,
          hTrackEl: this.hTrackEl,
          representationType: rep.representationType,
          mCID: this.model.cid,
          measureRepContainer: '#measure-rep-container-'+this.model.cid,
          beatHolder:'beatHolder'+this.model.cid,
          measureNumberOfBeats: this.model.get('beats').length,
          // beatFactoryHolder: 'beat-factory-holder-'+this.model.cid,
          measureCount: this.measureCount,
          measureAngle: 360.0,
          // SVG Properties
          measureWidth: lbbMeasureWidth,
          measureHeight: lbbMeasureHeight,
          measureColor: COLORS.hexColors[COLORS.colorIndices.WHITE],
          // Circular
          circularMeasureCx: circularMeasureCx,
          circularMeasureCy: circularMeasureCy,
          circularMeasureR: circularMeasureR,
          circularBeadBeatRadius: circularBeadBeatRadius,
          xMeasureLocation: xMeasureLocation,
          yMeasureLocation: yMeasureLocation,
          // Bead
          measureNumberOfPoints: measureNumberOfPoints,
          margin: margin,
          //Audio
          audioMeasureCx: audioMeasureCx,
          audioMeasureCy: audioMeasureCy,
          audioMeasureR: audioMeasureR,
          audioBeatCx: audioBeatCx,
          audioBeatCy: audioBeatCy,
          audioBeatR: audioBeatR,
          colorForAudio: colorForAudio,
          // Transition
          circleStates: circleStates,
          measureNumberOfPoints: this.measureNumberOfPoints,
          // lineData: lineData,
          pathFunction: this.circlePath,

          //Number Line
          xOffset: lineLength/this.model.get('beats').models.length / 2,
          yOffset: lbbMeasureHeight / 2,
          lineHashHeight: lineHashHeight,
          lineLength: lineLength,
          beatBBY: beatBBY,
          beatWidth: beatWidth,
          numberLineY: numberLineY
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
      console.warn(options);
      this.render();
    },
    addRepToMeasure: function(options) {
      console.log('adding rep trigged in measureView');
      var representationModel = new RepresentationModel;
      representationModel.representationType = options.newRepType;
      console.log(options.newRepType);
      // Currently forcing it to add to the first measure
      StageCollection.get(options.hTrack).get('measures').models[0].get('measureRepresentations').add(representationModel);
      this.counter++;
      console.log(this.counter);
      this.render('adding');
    },
    //This is called when the hTrack is clicked anywhere to bring
    //the hTrack into focus as selected.
    toggleSelection: function(e){
      e.stopPropagation();
      $('#measure'+this.measuresCollection.models[0].cid).toggleClass('selected');
    }
  });
});
