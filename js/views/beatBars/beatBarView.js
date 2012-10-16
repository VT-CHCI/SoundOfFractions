// Filename: views/beatBars/beatBarView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beatBars',
  'text!templates/beatBars/beatBar.html',
], function($, _, Backbone, beatBarsCollection, beatBarTemplate){
  var beatBarView = Backbone.View.extend({
    tagname: $('#visual-beats'),

    initialize: function(){

    },

    render: function(beatBar){
      var compiledTemplate = _.template( beatBarTemplate, beatBar );
      $('#visual-beats').append(compiledTemplate);
      return this;
    }
    
  });
  return new beatBarView();
});