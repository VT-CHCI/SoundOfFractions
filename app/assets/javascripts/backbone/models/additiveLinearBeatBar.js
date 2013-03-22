//filename: models/additiveLinearBeatBar.js
/*
  This is the additiveLinearBeatBar model.
  It maintains its width.
  additiveLinearBeatBars are the bars in the beat pallete
  on the right of the main view.
*/
define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var additiveLinearBeatBarModel = Backbone.Model.extend({
    defaults: {
      width: 1
    },
    initialize: function(){
    }
  });
  
  return additiveLinearBeatBarModel;
});