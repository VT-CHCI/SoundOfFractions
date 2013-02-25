//filename: models/beat.js
/*
  This is the beat model.
  It only knows about whether or not it
  is selected.
*/
define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var beatModel = Backbone.Model.extend({
    defaults: {
      selected: false
    },
    initialize: function(){
    }
  });
  
  return beatModel;
});