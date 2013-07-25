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
  var BeatModel = Backbone.Model.extend({
    defaults: {
      selected: false
    },
    initialize: function(options){
      if(options) {
        for (var key in options) {
          this[key] = options[key];
        }
      }
    }
  });
  return BeatModel;
});