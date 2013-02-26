// Filename: views/songs/index_view
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'backbone/collections/songsCollection',
  'backbone/collections/components',
  'backbone/models/song',
  'text!backbone/templates/songs/index.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, SongsCollection, Components, song, songsIndexTemplate, dispatch, state){
  return Backbone.View.extend({
    // model: {},
    el: $('#song-bucket'),

    initialize: function(options){
      console.log("index_view init");
      this.model = options;

      // this.model.bind("change:errors", function(){
        // console.log("in change error func for new view");
        // return this.render()
      // });

      // TODO
      // dispatch.on('signatureChange.event', this.reconfigure, this);
      this.render();
      // this.calcBeatWidth(state.get('signature'));
    },

    events: { 
      // "submit #new-song": "save"
    },

    render: function(){
      console.log("index view::render");
      $(this.el).html('');

      console.log('this.model :');      
      console.log(this.model);      
      console.log('this.model.toJSON() :');
      console.log(this.model.toJSON());
      // console.log(songsIndexTemplate);
      // _.each(this.collection.models, function(song) {
      //   var compiledTemplate = _.template( songsIndexTemplate, {song: song} );
      //   console.log(compiledTemplate);
      //   $(this.el).append( compiledTemplate );

      //   // new SongsView({model:this.model});
      // }, this);

      var compiledTemplate = _.template ( songsIndexTemplate, this.model);
      // console.log(compiledTemplate);
      $(this.el).html(compiledTemplate);

      return this;
    },

    // reconfigure: function(signature) {
    //   if ($(this.el).parent().hasClass('selected')) {
    //     dispatch.trigger('stopRequest.event', 'off');
    //     this.collection.reset();

    //     for (var i = 0; i < signature; i++) {
    //       this.collection.add();
    //     }

    //     this.render();

    //     this.calcBeatWidth(signature);
    //   }
    // },

    // calcBeatWidth: function(signature) {
    //   if ($(this.el).parent().hasClass('selected')) {
    //     var px = 100/$('.measure').css('width').replace(/[^-\d\.]/g, '');
    //     var beatWidth = (100 - ((signature*1+1)*px))/signature;

    //     $(this.el).children('.beat').css({
    //       'width' : beatWidth+'%'
    //     });
    //   }
    // }
  });
});


// SoundOfFractions.Views.Songs ||= {}

// class SoundOfFractions.Views.Songs.IndexView extends Backbone.View
//   template: JST["backbone/templates/songs/index"]

//   initialize: () ->
//     @options.songs.bind('reset', @addAll)

//   addAll: () =>
//     @options.songs.each(@addOne)

//   addOne: (song) =>
//     view = new SoundOfFractions.Views.Songs.SongView({model : song})
//     @$("tbody").append(view.render().el)

//   render: =>
//     $(@el).html(@template(songs: @options.songs.toJSON() ))
//     @addAll()

//     return this
