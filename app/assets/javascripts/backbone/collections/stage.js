//filename: collections/stage.js
/*
  This is the stage collection.
  It is referred to in StageView as 'stage'
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/hTrack'
], function($, _, Backbone, HTrackModel){
  var StageCollection = Backbone.Collection.extend({
    model: HTrackModel,
    initialize: function(){
    }
  });

  return new StageCollection();
});