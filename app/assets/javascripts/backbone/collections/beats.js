//Filename: collections/beats.js
/*
  This is the beats collection.
  It is a collection of beat models.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/beat'
], function($, _, Backbone, BeatModel){
  var BeatsCollection = Backbone.Collection.extend({
    model: BeatModel,
    initialize: function(){
    }
  });

  return BeatsCollection;
});
