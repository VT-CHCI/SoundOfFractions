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
      label: '0/4',
      beats: beatsCollection,
      numberOfBeats: 0,
      divisions: 8
    },
    initialize: function(){     
    }

  });
  
  return measureModel;
});