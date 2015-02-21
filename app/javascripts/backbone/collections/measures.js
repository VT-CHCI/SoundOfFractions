//filename collections/measures.js
/*
  This is the measures collection, a collection of measure models.
*/
define([
  'underscore',
  'bbone',
  'backbone/models/measure'
], function(_, Backbone, MeasureModel){
  var MeasuresCollection = Backbone.Collection.extend({
    model: MeasureModel,
    initialize: function(){
    }
   });
  return MeasuresCollection;
});
