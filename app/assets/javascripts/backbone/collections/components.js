//This is a drum kit
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