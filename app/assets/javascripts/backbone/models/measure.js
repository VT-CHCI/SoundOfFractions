//filename: models/measure.js
/*
  This is the measure model.
  A component has a collection of these models.
  these models have a collection of beats.
*/
define([
  'underscore',
  'backbone',
  'backbone/collections/beats'
], function(_, Backbone, beatsCollection) {
  var measureModel = Backbone.Model.extend({
    defaults: {
      beats: beatsCollection,
      numberOfBeats: 0,
      representation: undefined
    },
    initialize: function(){     
    }

  });
  
  return measureModel;
});