// Filename: router.js
/*
  This is the main router for the backbone framework.
  We are essentially using one route to draw the entire application.
*/
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
      //This is our main page.
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

    //we call this so that backbone will allow the back button
    //on the browser to go back through state changes.
    Backbone.history.start({pushState:true});

    //If the user does not login we use this to generate a random number
    //to identify the user.
    if (!sessionStorage.userId) {
      sessionStorage.setItem("userId", Math.floor(Math.random()*1000000001));
    }

    //we create a string representation of the inital state
    //and send it to the logging system.
    //(important so that we know the IDs of everything)
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
