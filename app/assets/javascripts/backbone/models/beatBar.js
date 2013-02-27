//filename: models/beatBar.js
/*
  This is the beatBar model.
  It maintains its width.
  beatBars are the bars in the beat pallete
  on the right of the main view.
*/
define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var beatBarModel = Backbone.Model.extend({
    defaults: {
      width: 1
    },
    initialize: function(){
    }
  });
  
  return beatBarModel;
});