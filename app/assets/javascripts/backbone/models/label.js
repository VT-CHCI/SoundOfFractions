//filename: models/label.js
/*
  This is the label model.
*/
define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var LabelModel = Backbone.Model.extend({
    defaults: {
      label: '',
      type: ''
    },
    initialize: function(){
    },
  });
  
  return LabelModel;
});