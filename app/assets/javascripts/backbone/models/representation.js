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
    initialize: function(options){
      this.representationType = options.representationType;
      this.previousRepresentationType = undefined;
      this.transitions = 0;
    },
    transition: function(newRep){
      this.set({
        previousRepresentationType: this.representationType,
        representationType: newRep
      });
    },
    increaseTransitionCount: function(){
      console.log('in mR increase count');
      this.set({
        transitions: this.transitions+1
      });
    }
  });
  return RepresentationModel;
});