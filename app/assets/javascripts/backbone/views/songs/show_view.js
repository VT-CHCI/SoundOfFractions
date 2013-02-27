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
], function($, _, Backbone, SongsCollection, Components, song, songsTemplate, dispatch, state){
  return Backbone.View.extend({
    // model: {},
    el: $('#show-song'),

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
      "submit #new-song": "save"
    },

    render: function(){
      console.log("new view::render");
      console.log($(this.el));
      $(this.el).html('');      
      console.log(this.model);
      // console.log(this.model.toJSON());
      // console.log(songsTemplate);
      // _.each(this.collection.models, function(song) {
      //   var compiledTemplate = _.template( songsTemplate, {song: song} );
      //   console.log(compiledTemplate);
      //   $(this.el).append( compiledTemplate );

      //   // new SongsView({model:this.model});
      // }, this);

      var compiledTemplate = _.template ( songsTemplate, this.model.toJSON());
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
