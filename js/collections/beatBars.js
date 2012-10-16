define([
  'jquery',
  'underscore',
  'backbone',
  'models/beatBar'
], function($, _, Backbone, beatBarModel, dispatch){
  var beatBarsCollection = Backbone.Collection.extend({
    model: beatBarModel,

    initialize: function(){
      
    }
  });

  return new beatBarsCollection();
});
