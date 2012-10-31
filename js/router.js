// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/homeView',
  'views/slider/beatSliderView',
  'views/beatBars/beatBarsView',
  'views/components/componentsView',
  'views/slider/tempoSliderView'
], function($, _, Backbone, mainHomeView, beatSliderView, beatBarsView, componentsView, tempoSliderView){
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Default
      '*actions': 'defaultAction'
    },
    defaultAction: function(actions){
      // We have no matching route, lets display the home page
      mainHomeView.render();
      beatSliderView.render();
      beatBarsView.render();
      componentsView.render();
      tempoSliderView.render();
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
