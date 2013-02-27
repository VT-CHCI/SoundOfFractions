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
  'backbone/models/beatBar'
], function($, _, Backbone, beatBarModel){
  var beatBarsCollection = Backbone.Collection.extend({
    model: beatBarModel,

    initialize: function(){

    }
  });

  return new beatBarsCollection();
});
