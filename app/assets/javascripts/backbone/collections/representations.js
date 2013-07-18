//filename collections/representations.js
/*
  This is the representations collection.
  It is a collection of representation models.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/representation'
], function($, _, Backbone, RepresentationModel){
  var RepresentationsCollection = Backbone.Collection.extend({
    model: RepresentationModel,
    initialize: function(){
    }
  });

  return RepresentationsCollection;
});
