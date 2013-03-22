//filename: collections/beatBars.js
/*
  This is the collection of beat bars, which are the
  bars in the beat pallete on the right side of the
  main screen.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/additiveLinearBeatBar'
], function($, _, Backbone, additiveLinearBeatBarModel){
  var additiveBeatPallete = Backbone.Collection.extend({
    model: additiveLinearBeatBarModel,

    initialize: function(){

    }
  });

  return new additiveBeatPallete();
});
