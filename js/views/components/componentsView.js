// Filename: views/beatBars/beatBarsView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beats',
  'collections/measures',
  'collections/components',
  'views/measures/measuresView',
  'text!templates/components/components.html',
  'app/dispatch'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, componentsCollection, MeasuresView, componentsTemplate, dispatch){
  var componentsView = Backbone.View.extend({
    el: $('#drum-kit'),

    initialize: function(){
      this.measure = new BeatsCollection;

      for (var i = 0; i < 8; i++) {
        this.measure.add();
      }

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection;

      this.drumkit = componentsCollection.add({
        label: 'snare',
        img: 'ofAsnare',
        mute: false,
        sample: '../../../samples/808_chh.ogg',
        tempo: 120,
        measures: this.component,
        active: true
      });

      this.measure = new BeatsCollection;

      for (var i = 0; i < 8; i++) {
        this.measure.add();
      }

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection.add({
        label: 'highHat',
        img: 'ofAhighHat',
        mute: true,
        sample: 'kshh',
        tempo: 120,
        measures: this.component,
        active: true
      });

      this.measure = new BeatsCollection;

      for (var i = 0; i < 8; i++) {
        this.measure.add();
      }

      this.component = new MeasuresCollection;
      this.component.add({beats: this.measure});

      this.drumkit = componentsCollection.add({
        label: 'kickDrum',
        img: 'ofAkickDrum',
        mute: true,
        sample: 'badum',
        tempo: 120,
        measures: this.component,
        active: false
      });
      
      //dispatch.on('signatureChange.event', this.reconfigure, this);
    },

    render: function(){
      $(this.el).html('');

      _.each(this.drumkit.models, function(component) {
        var compiledTemplate = _.template( componentsTemplate, {component: component} );
        $(this.el).append( compiledTemplate );

        new MeasuresView({collection:component.get('measures'), el:'#component'+component.cid});
      }, this);

     return this;
    }
  });
  return new componentsView();
});
