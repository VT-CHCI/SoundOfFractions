//filename collections/representations.js
/*
  This is the representations collection, a collection of representation models.
*/
define([
  'underscore',
  'bbone',
  'backbone/models/representation'
], function(_, Backbone, RepresentationModel){
  var RepresentationsCollection = Backbone.Collection.extend({
    model: RepresentationModel,
    initialize: function(){
    }
  });

  return RepresentationsCollection;
});
