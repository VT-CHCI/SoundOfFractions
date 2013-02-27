// Filename: router.js
/*
  This is the main router for the backbone framework.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/views/home/homeView',
  'backbone/views/slider/beatSliderView',
  'backbone/views/beatBars/beatBarsView',
  'backbone/views/components/componentsView',
  'backbone/views/slider/tempoSliderView',
  'backbone/views/transport/transportView',
  'backbone/views/button/repButtonView',
  'app/log',
  'backbone/collections/songsCollection',
  'backbone/views/songs/new_view',
  'backbone/views/songs/index_view',
  'backbone/views/songs/show_view',
  'backbone/views/songs/edit_view'
], function($, _, Backbone, mainHomeView, beatSliderView, beatBarsView, componentsView, tempoSliderView, transportView, repButtonView, log, songsCollection, songsViewNew, songsViewIndex, songsViewShow, songsViewEdit){

  var AppRouter = Backbone.Router.extend({
    songs: {},
    routes: {
      'new'       : 'newSong',
      'index'     : 'index',
      ':id/edit'  : 'edit',
      ':id'       : 'show',
      //Catchall
      '.*'        : 'newSong'
    },
    newSong: function(){
      console.log('BB routes :: new : newSong');
      console.log('Songs : ');
      console.log(this.songs);
      var view = new songsViewNew({collection : this.songs});
      mainHomeView.render();
      beatSliderView.render();
      beatBarsView.render();
      componentsView.render();
      tempoSliderView.render();
      transportView.render();
      repButtonView.render();
    },
    index: function(){
      console.log('bb routes index');
    },
    show: function(id){
      console.log('BB router : show');
      console.log("id param: "+id);

      console.log('Songs Collection : ');
      console.log(this.songs);
      var createdSong = this.songs.get(id);
      console.log(createdSong);
      var view = new songsViewShow(createdSong);

    },
    edit: function(id){
      console.log('bb routes edit');
    },
    // defaultAction: function(actions){
    //   // We have no matching route, lets display the home page
    //   console.log('bb routes DEFAULT');
    //   mainHomeView;
    //   beatSliderView.render();
    //   beatBarsView.render();
    //   componentsView.render();
    //   tempoSliderView.render();
    //   transportView.render();
    //   repButtonView.render();
    // }
  });

  // Initialize the Router, with the options, where (options) is declared in SOF.js
  // and called from application.js
  //
  // (options) == 'assest.js.erb' => App.songs{ songs : <%= Song.all.to_json.html_safe %> }
  // (options) == All the songs in the DB
  var initialize = function(options){
    
    console.log("router init");
    
    var app_router = new AppRouter;

    console.log("router init 2");
    app_router.songs = new songsCollection();  //TODO HOW IS THIS SONGS COLLECTION GETTING POPULATED?

    console.log("router init 3");
    // BB API call    
    console.log("router init 4");

    app_router.songs.reset(options.songs);
    console.log(app_router.songs);
    console.log('options.songs reset');
    console.log("in init, router follows");
    console.log(app_router);

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

    //we call this so that backbone will allow the back button
    //on the browser to go back through state changes.
    // It has to be at the bottom
    Backbone.history.start();
    return app_router;
  };

  return {
    initialize: initialize
  };
});