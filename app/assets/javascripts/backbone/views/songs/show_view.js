// Filename: views/songs/show_view
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/songsCollection',
  'backbone/collections/components',
  'backbone/models/song',
  'backbone/views/components/componentsView',
  'text!backbone/templates/songs/show.html',
  'text!backbone/templates/songs/navSave.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, SongsCollection, Components, song, ComponentsView, songsBodyTemplate, songNavSaveTemplate, dispatch, state){
  return Backbone.View.extend({
    // model: {},
    navEl: $('#nav-songs-save'),
    showBodyEl: $('#show-song'),
    sofComposerEl: $('#sof-composer'),

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

    // events: { 
    // },

    render: function(){
      console.log("Show View Rendering...");
      $(this.showBodyEl).html('');      
      console.log('this.model:')
      console.warn(this.model);
      // console.log(this.model.toJSON());
      // console.log(songsBodyTemplate);
      // _.each(this.collection.models, function(song) {
      //   var compiledTemplate = _.template( songsBodyTemplate, {song: song} );
      //   console.log(compiledTemplate);
      //   $(this.showBodyEl).append( compiledTemplate );

      //   // show SongsView({model:this.model});
      // }, this);

      var compiledNavTemplate = _.template ( songNavSaveTemplate, this.model.toJSON());
      var compiledBodyTemplate = _.template ( songsBodyTemplate, this.model.toJSON());

      // change the nav section to the song title name
      $(this.navEl).html(compiledNavTemplate);
      // remove the sof-composer 
      //$(this.sofComposerEl).html('');
      // change the body to show the title
      $(this.showBodyEl).html(compiledBodyTemplate);

      // var measureCount = 1;
      // $('.component-container').each(function() {
        // $(this).find('.number').each(function() {
          // $(this).text(measureCount);
          // measureCount++;
        // });
        // measureCount = 1;
      // });
      ComponentsView.build(this.model);
      console.log("Show View rendered");

      return this;
    },

    // reconfigure: function(signature) {
    //   if ($(this.showBodyEl).parent().hasClass('selected')) {
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
    //   if ($(this.showBodyEl).parent().hasClass('selected')) {
    //     var px = 100/$('.measure').css('width').replace(/[^-\d\.]/g, '');
    //     var beatWidth = (100 - ((signature*1+1)*px))/signature;

    //     $(this.showBodyEl).children('.beat').css({
    //       'width' : beatWidth+'%'
    //     });
    //   }
    // }
  });
});
