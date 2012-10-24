//This is one component
define([
  'jquery',
  'underscore',
  'backbone',
  'models/measure'
], function($, _, Backbone, measureModel){
  return Backbone.Collection.extend({
    model: measureModel,

    initialize: function(){

    }
  });

  // return new measuresCollection();
});
