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
      label: '', // The text such as `/` or `1` or `2`
      type: ''   // Is it a system label or a user placed label
    },
    initialize: function(){
    },
  });
  
  return LabelModel;
});