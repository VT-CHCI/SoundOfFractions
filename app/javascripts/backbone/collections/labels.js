//filename: collections/labels.js
/*
  This is the labels collection.
*/
define([
  'underscore',
  'bbone',
  'backbone/models/label'
], function(_, Backbone, LabelModel){
  return Backbone.Collection.extend({
    model: LabelModel,
    initialize: function(){
    }
  });

  // return new LabelCollection();
});