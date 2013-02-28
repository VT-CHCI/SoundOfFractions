// Filename: views/songs/show_view
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/songsCollection',
  'backbone/collections/components',
  'backbone/models/song',
  'text!backbone/templates/songs/show.html',
  'text!backbone/templates/songs/nav.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, SongsCollection, Components, song, songsBodyTemplate, songNavTemplate, dispatch, state){
  return Backbone.View.extend({
    // model: {},
    navEl: $('#nav-songs'),
    bodyEl: $('#show-song'),

    initialize: function(options){
      console.log("Show View initializing...");
      console.warn(options);
      this.model = options;
      console.warn(this.model);

      // this.model.bind("change:errors", function(){
        // console.log("in change error func for show view");
        // return this.render()
      // });

      // TODO
      // dispatch.on('signatureChange.event', this.reconfigure, this);
      this.render();
      // this.calcBeatWidth(state.get('signature'));
      console.log("Show View initialized");
    },

    events: { 
      "submit #show-song": "save"
    },

    render: function(){
      console.log("Show View Rendering");
      $(this.bodyEl).html('');      
      console.warn(this.model);
      // console.log(this.model.toJSON());
      // console.log(songsBodyTemplate);
      // _.each(this.collection.models, function(song) {
      //   var compiledTemplate = _.template( songsBodyTemplate, {song: song} );
      //   console.log(compiledTemplate);
      //   $(this.bodyEl).append( compiledTemplate );

      //   // show SongsView({model:this.model});
      // }, this);

      var compiledNavTemplate = _.template ( songNavTemplate, this.model.toJSON());
      var compiledBodyTemplate = _.template ( songsBodyTemplate, this.model.toJSON());
      // console.log(compiledTemplate);
      $(this.navEl).html(compiledNavTemplate);
      $(this.bodyEl).html(compiledBodyTemplate);
      // console.log($(this.bodyEl).html());
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
    //   if ($(this.bodyEl).parent().hasClass('selected')) {
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
    //   if ($(this.bodyEl).parent().hasClass('selected')) {
    //     var px = 100/$('.measure').css('width').replace(/[^-\d\.]/g, '');
    //     var beatWidth = (100 - ((signature*1+1)*px))/signature;

    //     $(this.bodyEl).children('.beat').css({
    //       'width' : beatWidth+'%'
    //     });
    //   }
    // }
  });
});
