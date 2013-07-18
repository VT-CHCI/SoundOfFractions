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
      selected: false,
      state: 'OFF'
    },
    initialize: function(){
    },
    getStyleClass: function() {
      if (this.selected) {
        return 'ON';
      }
      else {
        return 'OFF';
      }
    }
  });
  
  return BeatModel;
});