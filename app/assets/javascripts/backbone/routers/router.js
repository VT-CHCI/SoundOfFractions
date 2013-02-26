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

  // var songs = {};
  var AppRouter = Backbone.Router.extend({
    songs: {},
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
      console.log('BB routes :: index : index');
      console.log('Songs Collection : ');
      console.log(this.songs);
      var view = new songsViewIndex(this.songs);
    },
    show: function(id){
      console.log('BB routes :: (:id) : show');
      console.log("id param: "+id);
      console.log(this.songs);
      console.log(this.songs.get(id));
      var createdSong = this.songs.get(id);

      var view = new songsViewShow(createdSong);
    },
    edit: function(id){
      console.log('BB routes edit');
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
    var app_router = new AppRouter;
    app_router.songs = new songsCollection();  //TODO HOW IS THIS SONGS COLLECTION GETTING POPULATED?
    app_router.songs.reset(options.songs);
    console.log(app_router.songs);
    console.log('options.songs reset');
    console.log("in init, router follows");
    console.log(app_router);

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

    // BB API call    
    // TODO:
    // This has to be at the bottom, and if you call Backbone.history.start({pushState: true})
    // with the parameter {pushState: true}, it breaks
    Backbone.history.start();
    return app_router;
  };

  return {
    initialize: initialize
  };
});