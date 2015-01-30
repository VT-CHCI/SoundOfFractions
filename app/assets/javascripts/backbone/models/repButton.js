//filename: models/repButton.js
/*
  This is the representation button model.
  This keeps track of which kind of mathematical
  notation is chosen for the labels of each hTrack.
*/
define([
  'underscore',
  'backbone',
], function(_, Backbone) {
  var RepButtonModel = Backbone.Model.extend({
    defaults: {
      buttonState: 'fraction',
      text:'Representation' 
    },
    initialize: function(){
    },
  });
  
  return RepButtonModel;
});