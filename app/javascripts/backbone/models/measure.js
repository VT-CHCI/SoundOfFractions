//filename: models/measure.js
/*
  This is the measure model.
  An hTrack has a collection of these models.
  these models have a collection of beats and
  a collection of representations
*/
define([
  'underscore',
  'bbone',
  'backbone/models/beat',
  'backbone/models/conductor',
  'backbone/collections/beats',
  'backbone/collections/representations',
  'logging'
], function(_, Backbone, BeatModel, ConductorModel, BeatsCollection, RepresentationsCollection, Logging) {
  var MeasureModel = Backbone.Model.extend({
    beatsCollection: BeatsCollection,
    measureRepresentations: RepresentationsCollection,
    allMeasureChildRepresentationsTransitioned: 0,
    defaults: {
      pixelsPerSecond: 100,
      originalScale: 1,
      currentScale: 1,
      totalTimeMeasurePlaysInMilliseconds: 3204,
      baseTimeMeasurePlaysInMilliseconds: 3204,
      timesRecorded: 0
    },
    initialize: function(){
      this.name = 'model-measure';
      this.listenTo(this.get('beatsCollection'), 'add remove', this.turnPlayingOff);
      this.listenTo(this.get('beatsCollection'), 'remove', this.logRemoval);
      // this.listenTo(this.get('currentScale'), 'change', this.updateMeasureLength);
    },
    turnPlayingOff: function(){
      if(ConductorModel.get('isPlaying')){
        ConductorModel.stop();
      }
    },
    increaseTransitionCount: function(){
      this.set({allMeasureChildRepresentationsTransitioned : this.allMeasureChildRepresentationsTransitioned+1});
    },
    setCurrentScaleAndDivDimensions: function(options){
      // debugger;
      // if(options.height){
      // }
      this.set({divHeight : options.height});
      // if(options.width){
      //   this.set({divHeight : this.get('divHeight')*(1+options.width) });
      // }
      this.set({previousScale : this.get('currentScale')});
      this.set({currentScale : options.scale});
    },
    updateBeatsCollection: function(options) {
      this.set('timesRecorded', this.get('timesRecorded')+1);
      this.get('beatsCollection').reset();
      // Passing silent true to avoid the hTrack model from listening to it;
      this.get('beatsCollection').set(options.beatsCollection.models, {silent: true});
    },
    updateCurrentScale: function(options) {
      this.set({previousScale : this.get('currentScale')});
      this.set({currentScale : options.scale});
    },
    updateTotalTime: function(options) {
      this.set({totalTimeMeasurePlaysInMilliseconds : options.totalTimeMeasurePlaysInMilliseconds});
      this.updateCurrentScale( { scale : this.get('totalTimeMeasurePlaysInMilliseconds')/this.get('baseTimeMeasurePlaysInMilliseconds') } );
    },
    logRemoval: function(beatModel, newBeatsCollection, indexOfRemovedBeat){
      Logging.logStorage("Removed a beat.  It was at index: " + indexOfRemovedBeat.index);
    },
    // This is used by the Beat Factory when a new beat is added in a specific position
    addBeatToBeatsCollection: function(newBeat, newIndex, repType, repIndex, instrumentType){
      console.log('in measure model, a beat is getting added at index: ', newIndex);
      this.get('beatsCollection').add(newBeat, {at:newIndex});
      // interaction log
      Logging.logStorage("Added a beat.  At index: " + newIndex + '.  On type ' + repType + ' at rep index of (1 based): ' + repIndex + ' of the instrument: ' + instrumentType);
    }
  });
  return MeasureModel;
});