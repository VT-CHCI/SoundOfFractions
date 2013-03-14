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
  'text!backbone/templates/tiny/navSave.html',
  'text!backbone/templates/tiny/navLoad.html',
  'text!backbone/templates/tiny/navUpdate.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, SongsCollection, Components, song, ComponentsView, songsBodyTemplate, songNavSaveTemplate, songNavLoadTemplate, songNavUpdateTemplate, dispatch, state){
  return Backbone.View.extend({
    // model: {},
    navLoadEl: $('#nav-songs-load'),
    navUpdateEl: $('#nav-songs-update'),
    navInfoEl: $('#nav-songs-info'),
    navSaveEl: $('#nav-songs-save'),
    showBodyEl: $('#show-song'),
    sofSaveoserEl: $('#sof-composer'),

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

      var compiledNavUpdateTemplate = _.template ( songNavUpdateTemplate, this.collection.toJSON());
      var compiledNavLoadTemplate = _.template ( songNavLoadTemplate, this.collection.toJSON());
      var compiledNavTemplate = _.template ( songNavSaveTemplate, this.model.toJSON());
      var compiledBodyTemplate = _.template ( songsBodyTemplate, this.model.toJSON());

      // load the update button
      $(this.navUpdateEl).html(compiledNavUpdateTemplate);
      // load the songs into the load button
      $(this.navLoadEl).html(compiledNavLoadTemplate);
      // change the nav section to the song title name
      $(this.navInfoEl).html(compiledNavTemplate);
      //remove the save button
      $(this.navSaveEl).html('');
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

      // Update song
      var self = this;
      this.navUpdateEl.click(function(){
        console.warn(self.model.toJSON());
        console.warn(self.model.get('content').components[0].measures[0].beats[0]);
        window.router.songs.update(self.model, {remove: false});
        console.log('Update occurred');
      });

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
