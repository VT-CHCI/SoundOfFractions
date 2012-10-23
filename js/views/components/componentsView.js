// Filename: views/beatBars/beatBarsView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beats',
  'collections/measures',
  'collections/components',
  'text!templates/components/components.html',
  'app/dispatch'
], function($, _, Backbone, beatsCollection, measuresCollection, componentsCollection, componentsTemplate, dispatch){
  var componentsView = Backbone.View.extend({
    el: $('#beat-pallet #visual-beats'),

    initialize: function(){
      this.measure = beatsCollection;

      this.measure = beatsCollection.add({ selected: false});
      this.measure = beatsCollection.add({ selected: false});
      this.measure = beatsCollection.add({ selected: false});
      this.measure = beatsCollection.add({ selected: false});

      this.component = measuresCollection;

      this.component = measuresCollection.add({ 
        label: '0/4', 
        beats: this.beats,
        numberOfBeats: 0,
        divisions: 8
      });

      this.drumkit = componentsCollection;

      this.drumkit = componentsCollection.add({
        label: 'snare',
        img: 'ofAsnare',
        mute: false,
        sample: 'chk',
        tempo: 120,
        measures: this.component,
        active: true
      });

      this.drumkit = componentsCollection.add({
        label: 'highHat',
        img: 'ofAhighHat',
        mute: true,
        sample: 'kshh',
        tempo: 120,
        measures: this.component,
        active: true
      });

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
      var data = {
        beatBars: this.collection.models,
        _: _
      };
      var compiledTemplate = _.template( beatBarsTemplate, data );
      $(this.el).html( compiledTemplate );

      return this;
    }
  });
  return new beatBarsView();
});
