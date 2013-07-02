//filename models/hTrack.js
/*
  This is the horizontal line track model.
  It represents one individual instrument (of a unique sound)
  They are 
*/
define([
  'underscore',
  'backbone',
  'backbone/collections/measures',
  'backbone/models/remainingInstrumentGenerator'
], function(_, Backbone, measuresCollection, remainingInstrumentGenerator ) {
  var componentModel = Backbone.Model.extend({
    defaults: {
      label: 'snare',
      img: 'ofAsnare',
      mute: false,
      sample: 'shhh',
      measures: measuresCollection,
      active: true,
      signature: 0, //initially set to zero, but set in the init of componentsView
      placementOrder: 0, //initially 0, but set later to its placement
      instrumentMenu: remainingInstrumentGenerator
    },
    initialize: function(){
    }
  });
  
  return componentModel;
});