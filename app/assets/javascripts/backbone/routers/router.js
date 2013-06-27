// Filename: router.js
/*
  This is the main router for the backbone framework.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/views/home/homeView',
  'backbone/views/slider/beatsPerMeasureSliderView',
  'backbone/views/additiveBeatPalette/additiveLinearBeatPaletteView',
  'backbone/views/component/componentsView',
  'backbone/views/slider/tempoSliderView',
  'backbone/views/transport/transportView',
  'backbone/views/button/fractionRepresentionView',
  'backbone/views/button/wholeMeasureRepresentationView',
  'backbone/views/recorder/recorderView',
  'backbone/views/button/tapTempoView',
  'backbone/views/button/doallView',
  'backbone/views/label/systemLabelView',
  'app/log',
  'backbone/collections/songsCollection',
  'backbone/views/song/new_view',
  'backbone/views/song/index_view',
  'backbone/views/song/show_view',
  'backbone/views/song/edit_view'
], function($, _, Backbone, mainHomeView, beatsPerMeasureSliderView, additiveLinearBeatPaletteView, componentsView, tempoSliderView, transportView, fractionRepresentionView, wholeMeasureRepresentationView, recorderView, tapTempoView, doallView, systemLabelView, log, songsCollection, songsViewNew, songsViewIndex, songsViewShow, songsViewEdit ){

  var BBRouter = Backbone.Router.extend({
    // songs: {},
    routes: {
      'new'       : 'newSong',
      'index'     : 'index',
      ':id/edit'  : 'edit',
      ':id'       : 'show',
      //Catchall
      '.*'        : 'newSong'
    },
    newSong: function(){
      console.log('BB routes => new : newSong');
      var view = new songsViewNew({collection : this.songs});
      //left side
      mainHomeView.render();
      //right side
      componentsView.render();
      tempoSliderView.render();
      transportView.render();
      // fractionRepresentionView.render();
      wholeMeasureRepresentationView.render();
      recorderView.render();
      tapTempoView.render();
      doallView.render();
      systemLabelView.render();
    },

    index: function(){
      console.log('BB Router => index : index');
      var view = new songsViewIndex({collection : this.songs});
    },

    show: function(id){
      var currentIDSong = window.router.songs.get(id);
      console.warn(currentIDSong);
      //left side
      var view = new songsViewShow(currentIDSong);
      //right side
      fractionRepresentionView.render();
      wholeMeasureRepresentationView.render();
      additiveLinearBeatPaletteView.render();
      tempoSliderView.render();
      transportView.render();
      recorderView.render();
    },

    edit: function(id){
      console.log('BB Router edit');
    },

  });

  // Initialize the Router, with the options, where (options) is declared in SOF.js
  // and called from application.js
  //
  // (options) == 'assest.js.erb' => App.songs{ songs : <%= Song.all.to_json.html_safe %> }
  // (options) == All the songs in the DB
  var initialize = function(options){
    console.log("BB Router => Initializing...");
    var filteredOptions = [];

    console.log('filtering');
    if (window.gon) {
      for (var i = 0 ; i < options.songs.length ; i++){
          if (options.songs[i].user_id == gon.userID ){
            filteredOptions.push(options.songs[i]);
          }
      }
    }
    options.songs = filteredOptions;

    var bb_router = new BBRouter;

    bb_router.songs = new songsCollection();
    bb_router.songs.reset(options.songs);
    bb_router.songs.fetch();

    //If the user does not login we use this to generate a random number
    //to identify the user.
    if (!sessionStorage.userId) {
      sessionStorage.setItem("userId", Math.floor(Math.random()*1000000001));
    }

    //we create a string representation of the initial state
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

    // attach the router to the window to make access of the songs easier throughout the app
    window.router = bb_router;
    console.log('BB Router => Initialized');

    // BB API call    
    // we call this so that backbone will allow the back button
    // on the browser to go back through state changes.
    // It has to be at the bottom
    // TODO : Cannot call Backbone.history.start({pushState: true}) because it will break
    Backbone.history.start({root: '/songs/#new'});
  };

  return {
    initialize: initialize
  };
});