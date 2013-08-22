//filename: models/representation.js
/*
  This is the representation model.
  It is the same as a measure model, but it is just
  representation purposes of the measure, not a collection
  itself
*/
define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var RepresentationModel = Backbone.Model.extend({
    representationType: undefined, //should overide this each time

    initialize: function(options){
      if(options){
        this.set('representationType' , options.representationType);
      }
    }
  });
  return RepresentationModel;
});