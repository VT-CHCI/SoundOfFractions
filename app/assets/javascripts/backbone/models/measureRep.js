//filename: models/measureRep.js
/*
  This is the measureRep model.
  It is the same as a measure model, but it is just
  representation purposes of the measure, not a collection
  itself
*/
define([
  'underscore',
  'backbone',
  'backbone/models/measure'
], function(_, Backbone, MeasureModel) {
  var measureModel = Backbone.Model.extend({
    defaults: {
      measureModel: MeasureModel,
      beats: MeasureModel.beats,
      // numberOfBeats: 0,
      representation: undefined
    },
    initialize: function(){     
    }

  });
  
  return measureModel;
});