//filename: collections/components.js
/*
  This is the components collection.
  It is referred to in componentsView as 'drumkit'
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/component'
], function($, _, Backbone, componentModel){
  var componentsCollection = Backbone.Collection.extend({
    model: componentModel,

    initialize: function(){

    }
  });

  return new componentsCollection();
});