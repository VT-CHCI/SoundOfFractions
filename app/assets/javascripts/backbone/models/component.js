//filename models/component.js
/*
  This is the component model.
  A component represents an individual drum or instrument
  component models are created in componentsView.js
*/
define([
  'underscore',
  'backbone',
  'backbone/collections/measures',
  'backbone/collections/measureReps'
], function(_, Backbone, MeasuresCollection, MeasureRepsCollection) {
  var componentModel = Backbone.Model.extend({
    defaults: {
      label: 'snare',
      type: 'sn',
      img: 'orange.png',
      mute: false,
      sample: 'shhh',
      measures: MeasuresCollection,
      representations: MeasureRepsCollection,
      active: true,
      signature: 0, //initially set to zero, but set in the init of componentsView
      representation: 'fraction'
    },
    initialize: function(){
    }
  });
  
  return componentModel;
});