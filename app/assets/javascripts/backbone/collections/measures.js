//filename collections/measures.js
/*
  This is the measures collection.
  It is a collection of measure models.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/measure'
], function($, _, Backbone, MeasureModel){
  return Backbone.Collection.extend({
    model: MeasureModel,
    initialize: function(){
    }
  });

  // return new measuresCollection();
});
