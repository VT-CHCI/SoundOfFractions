//filename: models/measure.js
/*
  This is the measure model.
  A component has a collection of these models.
  these models have a collection of beats and
  a collection of representations
*/
define([
  'underscore',
  'backbone',
  'backbone/collections/beats',
  'backbone/collections/representations'
], function(_, Backbone, BeatsCollection, RepresentationsCollection) {
  var measureModel = Backbone.Model.extend({
    defaults: {
      beats: BeatsCollection,
      measureRepresentations: RepresentationsCollection
    },
    initialize: function(){
    }
  });
  return measureModel;
});