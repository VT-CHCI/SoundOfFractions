//filename: collections/hTracks.js
/*
  This is the components collection.
  It is referred to in componentsView as 'drumkit'
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/hTracks'
], function($, _, Backbone, hTrackModel){
  var hTracksCollection = Backbone.Collection.extend({
    model: hTrackModel,
    tempo: 120,
    initialize: function(){
    }
  });

  return hTracksCollection;
});