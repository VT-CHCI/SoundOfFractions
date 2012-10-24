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
], function($, _, Backbone, BeatsCollection, BeatView, beatsTemplate, dispatch){
  return Backbone.View.extend({
    el: $('.measure'),

    initialize: function(options){
      if (options) {
        this.collection = options.collection;
        this.el = options.el;
      } else {
        this.collection = new BeatsCollection;
      }

      dispatch.on('signatureChange.event', this.reconfigure, this);
      this.render();
    },

    render: function(){
      $(this.el).html('');
      $(this.el).append('<span class="title">Measure <span class="number"></span> - <span class="delete">[X]</span></span>');

      _.each(this.collection.models, function(beat) {
        var compiledTemplate = _.template( beatsTemplate, {beat: beat} );
        $(this.el).append( compiledTemplate );

        new BeatView({model:beat, el:'#beat'+beat.cid});
      }, this);

      var measureCount = 1;
      $('.number').each(function() {
        $(this).text(measureCount);
        measureCount++;
      });

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
