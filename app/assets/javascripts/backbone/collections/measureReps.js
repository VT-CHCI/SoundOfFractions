//filename collections/measureReps.js
/*
  This is the measureReps collection.
  It is a collection of measureRep models.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/measureRep'
], function($, _, Backbone, MeasureRepModel){
  return Backbone.Collection.extend({
    model: MeasureRepModel,
    initialize: function(){
    }
  });

  // return new measuresCollection();
});
