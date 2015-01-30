//filename collections/measures.js
/*
  This is the measures collection, a collection of measure models.
*/
define([
  'underscore',
  'backbone',
  'backbone/models/measure'
], function(_, Backbone, MeasureModel){
  return Backbone.Collection.extend({
    model: MeasureModel,
    initialize: function(){
    }
  });

  // return new measuresCollection();
});
