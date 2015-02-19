//filename: models/measure.js
/*
  This is the measure model.
  An hTrack has a collection of these models.
  these models have a collection of beats and
  a collection of representations
*/
define([
  'underscore',
  'backbone',
  'backbone/models/beat',
  'backbone/collections/beats',
  'backbone/collections/representations'
], function(_, Backbone, BeatModel, BeatsCollection, RepresentationsCollection) {
  var MeasureModel = Backbone.Model.extend({
    beats: BeatsCollection,
    measureRepresentations: RepresentationsCollection,
    transitioned: 0,
    // defaults: {
    //   originalScale: 1,
    //   previousScale: 1,
    //   currentScale: 1
    // },
    initialize: function(){
    },
    increaseTransitionCount: function(){
      this.set({transitioned : this.transitioned+1});
    },
    // setCurrentScale: function(newScale){
    //   this.set({previousScale : this.get('currentScale')});
    //   this.set({currentScale : newScale});
    // },
    // This is used by the Beat Factory when a new beat is added in a specific position
    addBeatToBeatsCollection: function(newBeat, newIndex){
      console.log('in measure model, a beat is getting added at index: ', newIndex);
      this.get('beats').add(newBeat, {at:newIndex});
    }
  });
  return MeasureModel;
});