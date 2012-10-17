//This is one component
define([
  'jquery',
  'underscore',
  'backbone',
  'models/measure'
], function($, _, Backbone, measureModel){
  var measuresCollection = Backbone.Collection.extend({
    model: measureModel,

    initialize: function(){

    }
  });

  return new measuresCollection();
});
