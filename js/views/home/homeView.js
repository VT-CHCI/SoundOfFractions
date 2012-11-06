// Filename: views/home/main
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/main.html'
], function($, _, Backbone, mainHomeTemplate){
  var mainHomeView = Backbone.View.extend({
    el: $(".container-fluid"),
    render: function(){
      $(this.el).prepend(mainHomeTemplate);
      return this;
    }
  });
  return new mainHomeView();
});
