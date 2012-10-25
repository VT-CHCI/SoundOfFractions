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

    events : {
      'click img' : 'temp'
    },

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
        sample: 'samples/808_chh.ogg',
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
    },

    temp: function(){
      var tempo = 0;
      var numBeats = 0;
      var i = 0;
      var componentDurations = new Array(this.drumkit.models.length);
      _.each(this.drumkit.models, function(component) {
        componentDurations[i] = new Array();
        tempo = component.get('tempo');

        _.each(component.get('measures').models, function(measure) {
          numBeats = measure.get('beats').length;
          var beatDuration = 60 / tempo * 4 / numBeats;
          _.each(measure.get('beats').models, function(beat) {
            console.log(beatDuration);

          }, this);
        }, this);
        i++;
      }, this);
    }
  });
  return new componentsView();
});
