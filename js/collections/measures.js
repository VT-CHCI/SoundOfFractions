//filename collections/measures.js
/*
  This is the measures collection.
  It is a collection of measure models.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'models/measure'
], function($, _, Backbone, measureModel){
  return Backbone.Collection.extend({
    model: measureModel,

    initialize: function(){

    }
  });

  // return new measuresCollection();
});
