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
  var beatsView = Backbone.View.extend({
    el: $('.measure'),

    initialize: function(){
      this.collection = beatsCollection;

      for (var i = 0; i < 8; i++) {
        this.collection = beatsCollection.add();
      }

      dispatch.on('signatureChange.event', this.reconfigure, this);
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
        this.collection = beatsCollection.add();
      }

      this.render();
    }
  });

  return new beatsView();
});
