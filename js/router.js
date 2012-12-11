// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home/homeView',
  'views/slider/beatSliderView',
  'views/beatBars/beatBarsView',
  'views/components/componentsView',
  'views/slider/tempoSliderView',
  'views/transport/transportView',
  'views/button/repButtonView',
  'app/log'
], function($, _, Backbone, mainHomeView, beatSliderView, beatBarsView, componentsView, tempoSliderView, transportView, repButtonView, log){
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Default
      '*actions': 'defaultAction'
    },
    defaultAction: function(actions){
      // We have no matching route, lets display the home page
      mainHomeView;
      beatSliderView.render();
      beatBarsView.render();
      componentsView.render();
      tempoSliderView.render();
      transportView.render();
      repButtonView.render();
    }
  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start({pushState:true});

    sessionStorage.setItem("userId", Math.floor(Math.random()*1001));

    name = '';
    $('.component').each( function() {
      name = name + $(this).attr('id') + '.';

      $(this).children('.measure').each( function() {
        name = name + $(this).attr('id') + '.';

          $(this).children('.beat').each( function() {
            name = name + $(this).attr('id') + '.';
          });
      });

      log.sendLog([[1, "Component structure: "+name]]);
      name = '';
    });

  };
  return {
    initialize: initialize
  };
});
