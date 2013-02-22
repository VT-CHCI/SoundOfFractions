// Filename: views/songs/new_view
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'text!backbone/templates/songs/new.jst.ejs',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, songsTemplate, dispatch, state){
  return Backbone.View.extend({
    model: {},
    el: $('#songs'),

    initialize: function(options){
      // super(options); TODO
      console.log("new_view init");
      if (options) {
        this.model = options.model;
      } else {
        this.model = new SongsModel;
      }
      
      this.model.bind("change:errors", function(){
          return this.render()
        }
      );

      // TODO
      // dispatch.on('signatureChange.event', this.reconfigure, this);
      this.render();
      // this.calcBeatWidth(state.get('signature'));
    },

    events: { 
      "submit #new-song": "save"
    },

    save: function(e){
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      return this.collection.create(this.model.toJSON(), {
        success: function(song) {
          _this.model = song;
          return window.location.hash = "/" + _this.model.id;
        },
        error: function(song, jqXHR) {
          return _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
        }
      });
    },

    render: function(){
      $(this.el).html('');

      _.each(this.collection.models, function(beat) {
        var compiledTemplate = _.template( songsTemplate, {song: this.model} );
        $(this.el).append( compiledTemplate );

        // new ASongsView({model:this.model});
        // new SongsView({model:this.model});
      }, this);

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
