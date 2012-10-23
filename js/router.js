// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/homeView',
  'views/slider/sliderView',
  'views/beatBars/beatBarsView',
  'views/beats/beatsView'
], function($, _, Backbone, mainHomeView, sliderView, beatBarsView, beatsView){
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Default
      '*actions': 'defaultAction'
    },
    defaultAction: function(actions){
      // We have no matching route, lets display the home page
      mainHomeView.render();
      sliderView.render();
      beatBarsView.render();
      beatsView.render();
    }
  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start({pushState:true});
  };
  return {
    initialize: initialize
  };
});
