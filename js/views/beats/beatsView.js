// Filename: views/beats/beatsView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beats',
  'views/beats/beatView',
  'text!templates/beats/beats.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, BeatsCollection, BeatView, beatsTemplate, dispatch, state){
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
      this.reconfigure(state.get('signature'));
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
      $('.component-container').each(function() {
        $(this).find('.number').each(function() {
          $(this).text(measureCount);
          measureCount++;
        });
        measureCount = 1;
      });

      return this;
    },

    reconfigure: function(signature) {
      if ($(this.el).parent().hasClass('selected')) {
        dispatch.trigger('stopRequest.event', 'off');
        this.collection.reset();

        for (var i = 0; i < signature; i++) {
          this.collection.add();
        }

        this.render();

        var px = 100/$('.measure').css('width').replace(/[^-\d\.]/g, '');
        var beatWidth = (100 - ((signature*1+1)*px))/signature;

        $(this.el).children('.beat').css({
          'width' : beatWidth+'%'
        });
      }

    }
  });
});
