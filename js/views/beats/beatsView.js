// Filename: views/beats/beatsView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beats',
  'views/beats/beatView',
  'text!templates/beats/beats.html',
  'app/dispatch'
], function($, _, Backbone, beatsCollection, BeatView, beatsTemplate, dispatch){
  return Backbone.View.extend({
    el: $('.measure'),

    initialize: function(options){
      if (options) {
        this.collection = options.collection;
        this.el = options.el;
      } else {
        this.collection = new beatsCollection;
      }

      dispatch.on('signatureChange.event', this.reconfigure, this);
      this.render();
    },

    render: function(){
      $(this.el).html('');
      $(this.el).append('<span class="title">Measure <span class="number">1</span> - <span class="delete">[X]</span></span>');
      // new BeatView({model:this.collection.at(0), el:'#drum-kit'});

      _.each(this.collection.models, function(beat) {
        var compiledTemplate = _.template( beatsTemplate, {beat: beat} );
        $(this.el).append( compiledTemplate );

        new BeatView({model:beat, el:'#beat'+beat.cid});
      }, this);

      return this;
    },

    reconfigure: function(signature) {
      this.collection.reset();
      
      for (var i = 0; i < signature*2; i++) {
        this.collection.add();
      }

      this.render();
    }
  });
});
