// Filename: views/measures/measuresView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beats',
  'collections/measures',
  'views/beats/beatsView',
  'text!templates/measures/measures.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, BeatsView, measuresTemplate, dispatch, state){
  return Backbone.View.extend({
    el: $('.component'),

    events : {
      'click .addMeasure' : 'add',
      'click .delete' : 'remove'
    },

    initialize: function(options){
      if (options) {
        this.component = options.collection;
        this.parent = options.parent;
        this.el = options.el;
      } else {
        this.measure = new BeatsCollection;

        for (var i = 0; i < 4; i++) {
          this.measure.add();
        }

        this.component = new MeasuresCollection;
        this.component.add({beats: this.measure});
      }
      this.render();
    },

    render: function(){
      $(this.el).html('<div class="addMeasure">+</div>');

      _.each(this.component.models, function(measure) {
        var compiledTemplate = _.template( measuresTemplate, {measure: measure} );
        $(this.el).find('.addMeasure').before( compiledTemplate );

        new BeatsView({collection:measure.get('beats'), el:'#measure'+measure.cid});
      }, this);

     return this;
    },

    add: function(){
      if ($('#measure'+this.component.models[0].cid).parent().hasClass('selected')) {
        _.each(this.component.models, function(measure) {
          _.each(measure.get('beats').models, function(beats) {
            //console.log(beats.get('selected'));
          }, this);
        }, this);

        console.log('add measure');
        this.measure = new BeatsCollection;

        for (var i = 0; i < state.get('signature'); i++) {
          this.measure.add();
        }

        this.component.add({beats: this.measure});

        this.render();

        dispatch.trigger('stopRequest.event', 'off');
        dispatch.trigger('signatureChange.event', this.parent.get('signature'));
      }
    },

    remove: function(ev){
      if ($('#measure'+this.component.models[0].cid).parent().hasClass('selected')) {
        if(this.component.models.length == 1) {
          console.log('Can\'t remove the last measure!');
          return;
        }
        console.log('remove measure');

        var model = this.component.getByCid($(ev.target).parents('.measure').attr('id').replace('measure',''));
        this.component.remove(model);

        dispatch.trigger('stopRequest.event', 'off');
        dispatch.trigger('signatureChange.event', this.parent.get('signature'));

        this.render();
      }
    }
  });
});
