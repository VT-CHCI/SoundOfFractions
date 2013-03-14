//filename: unsavedSong.js  //BB version of an unsaved song 'template'
define([
  'underscore',
  'backbone',
  'backbone/collections/components',
  'backbone/collections/beats',
  'backbone/collections/measures',
  'backbone/models/beat',
  'backbone/models/measure',
  'backbone/models/component'
], function(_, Backbone, componentCollection, BeatsCollection, MeasuresCollection, 
    BeatModel, MeasureModel, ComponentModel) {
  var unsavedSongModel = Backbone.Model.extend({
    // paramRoot: 'song',
    defaults: {
      // title: '',                        //move to unsavedSongTemplate.js
      components: componentCollection   //move to unsavedSongTemplate.js
    },
    initialize: function(components){
      // this.components = ;
      if (components) {
        for(var i = 0; i < components.length; i++) {
          var component = new ComponentModel();
          component.set('label', components[i].label);
          component.set('img', components[i].img);
          component.set('mute', components[i].mute);
          component.set('sample', components[i].sample);
          component.set('active', components[i].active);
          component.set('signature', components[i].signature);
          component.set('representation', components[i].representation);
          var mC = new MeasuresCollection();
          for(var j = 0; j < components[i].measures.length; j++) {
            var measureObj = components[i].measures[j];
            var measure = new MeasureModel();
            measure.set('label', measureObj.label);
            measure.set('numberOfBeats', measureObj.numberOfBeats);
            measure.set('divisions', measureObj.divisions);
            var bC = new BeatsCollection();
            for(var k = 0; k < measureObj.beats.length; k++) {
              var beatObj = measureObj.beats[k];
              var beat = new BeatModel();
              beat.set('selected', beatObj.selected);
              bC.add(beat);
            }
            measure.set('beats', bC);
            mC.add(measure);
          }
          component.set('measures', mC);
          this.get('components').add(component);
        }
      }
    }
  });
  
  return unsavedSongModel;
});