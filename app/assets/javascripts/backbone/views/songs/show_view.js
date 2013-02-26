// Filename: views/songs/show_view
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'backbone/collections/songsCollection',
  'backbone/collections/components',
  'backbone/models/song',
  // 'backbone/views/songs/a_song_view',
  'text!backbone/templates/songs/show.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, SongsCollection, Components, song, songsShowTemplate, dispatch, state){
  return Backbone.View.extend({
    // model: {},
    el: $('#song-bucket'),

    initialize: function(options){
      console.log("show_view init");
      
      this.model = options;
      console.log(this.model);

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

    // save: function(e){
    //   e.preventDefault();
    //   e.stopPropagation();
    //   var toBeSavedSong = new this.collection.model(); 
    //   // var JSONSong = JSON.stringify(this.model.toJSON());
    //   // console.log(JSONSong);
    //   // this.model.unset("errors");
    //   // this.model.set({
    //   //   title: $('#title').val(),
    //   //   content:  
    //   // });
    //   toBeSavedSong.set({
    //     // this.model is a unsavedSong.js model which contains 'title', and 'components'
    //     content : this.model.toJSON(),
    //     title : $('#title').val()
    //   });
    //   console.log($("meta[name=csrf-param]").attr('content'));
    //   console.log($("meta[name=csrf-token]").attr('content'));
    //   toBeSavedSong.set($("meta[name=csrf-param]").attr('content'), $("meta[name=csrf-token]").attr('content'));

    //   console.log('toBeSavedSong.toJSON()');
    //   console.log(toBeSavedSong.toJSON());
      
    //   return this.collection.create(toBeSavedSong.toJSON(), {
    //     success: function(song) {
    //       console.log('saved!');
    //       this.model = song;
    //       return window.location.hash = "/" + this.model.id;
          
    //     },
    //     error: function(song, jqXHR) {
    //       return this.model.set({
    //         errors: $.parseJSON(jqXHR.responseText)
    //       });
    //     }
    //   });
    // },

    render: function(){
      console.log("show view::render");
      $(this.el).html('');

      // console.log(this.collection);      
      console.log(this.model);
      // console.log(this.model.toJSON());
      // console.log(songsShowTemplate);
      // _.each(this.collection.models, function(song) {
      //   var compiledTemplate = _.template( songsShowTemplate, {song: song} );
      //   console.log(compiledTemplate);
      //   $(this.el).append( compiledTemplate );

      //   // new SongsView({model:this.model});
      // }, this);

      var compiledTemplate = _.template ( songsShowTemplate, this.model.toJSON());
      console.log("modelllllll content");
      console.log(this.model.get('content'));
      // console.log(compiledTemplate);
      $(this.el).html(compiledTemplate);
      // console.log($(this.el).html());
      // var measureCount = 1;
      // $('.component-container').each(function() {
        // $(this).find('.number').each(function() {
          // $(this).text(measureCount);
          // measureCount++;
        // });
        // measureCount = 1;
      // });

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
