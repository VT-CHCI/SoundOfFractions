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
  'backbone/collections/representations',
  'app/dispatch'
], function(_, Backbone, BeatModel, BeatsCollection, RepresentationsCollection, dispatch) {
  var MeasureModel = Backbone.Model.extend({
    beats: BeatsCollection,
    measureRepresentations: RepresentationsCollection,
    transitioned: 0,
    defaults: {
      originalScale: 1,
      scale: 1
    },
    initialize: function(){
    },
    increaseTransitionCount: function(){
      this.set({transitioned : this.transitioned+1});
    },
    setScale: function(newScale){
      this.set({scale : newScale});
    },
    addBeatToBeatsCollection: function(newBeat, newIndex){
      console.log('gfret');
      // µthis.parentMeasureModel.get('beats').add(new BeatModel({selected:true}), {at: newIndex})
      this.get('beats').add(newBeat, {at:newIndex});
      dispatch.trigger('signatureChange.event', this);
    }
  });
  return MeasureModel;
});
