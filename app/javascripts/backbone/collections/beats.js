//Filename: collections/beats.js
/*
  This is the beats collection, a collection of beat models.
*/
define([
  'underscore',
  'bbone',
  'backbone/models/beat'
], function(_, Backbone, BeatModel){
  var BeatsCollection = Backbone.Collection.extend({
    model: BeatModel,
    initialize: function(){
    }
  });
  return BeatsCollection;
});
