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
  'backbone/collections/beats',
  'backbone/collections/representations'
], function(_, Backbone, BeatsCollection, RepresentationsCollection) {
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
    }
  });
  return MeasureModel;
});
