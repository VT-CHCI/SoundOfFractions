//filename: models/representation.js
/*
  This is the representation model.
  It keeps track of what type of representation it is and was, and how many times it has been transitioned
*/
define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var RepresentationModel = Backbone.Model.extend({
    initialize: function(options){
      this.representationType = options.representationType;
      this.previousRepresentationType = 'not_yet_defined';
      this.transitions = 0;
    },
    transition: function(newRep){
      this.set('previousRepresentationType', this.get('representationType'));
      this.set('representationType', newRep);
      this.set({
        transitions: this.get('transitions')+1
      });
    }
  });

  return RepresentationModel;
});