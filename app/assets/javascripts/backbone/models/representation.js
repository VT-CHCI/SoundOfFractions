//filename: models/representation.js
/*
  This is the representation model.
  It is the same as a measure model, but it is just
  representation purposes of the measure, not a collection
  itself
*/
define([
  'underscore',
  'backbone',
  'backbone/models/measure'
], function(_, Backbone, MeasureModel) {
  var RepresentationModel = Backbone.Model.extend({
    defaults: {
      // measureModel: MeasureModel,
      representationType: undefined //should ovveride this each time
    },
    initialize: function(){     
    }
  });
  return RepresentationModel;
});