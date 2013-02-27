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
], function($, _, Backbone, beatModel){
  return Backbone.Collection.extend({
    model: beatModel,

    initialize: function(){

    }
  });

  //return new beatsCollection();
});
