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

  var songs = {};
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Default
      'new'       : 'newSong',
      'index'     : 'index',
      ':id/edit'  : 'edit',
      ':id'       : 'show',
      '.*'        : 'newSong'
      // '*actions'  : 'defaultAction'
    },
    newSong: function(){
      console.log('BB routes :: new : newSong');
      console.log('Songs : ');
      console.log(songs);
      var view = new songsViewNew({collection : songs});
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
      console.log('bb routes show');
      console.log("id param: "+id);
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
    // console.log(options);
    // console.log(options.songs);
    songs = new songsCollection();  //TODO HOW IS THIS SONGS COLLECTION GETTING POPULATED?
    // console.log('SONGS collections created:');
    // console.log(songs);
    // console.log(options.songs);
    // BB API call
    songs.reset(options.songs);
    console.log('options.songs reset');
    var app_router = new AppRouter;
    console.log("in init, router follows");
    console.log(app_router);
    Backbone.history.start({pushState:true});

    if (!sessionStorage.userId) {
      sessionStorage.setItem("userId", Math.floor(Math.random()*1000000001));
    }

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