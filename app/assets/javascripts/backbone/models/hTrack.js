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
], function(_, Backbone, MeasuresCollection, RemainingInstrumentGenerator ) {
  var HTrackModel = Backbone.Model.extend({
    defaults: {
      label: 'snare',
      type: 'sn',
      img: 'ofAsnare',
      // mute: false, maybe not getting used?
      sample: 'shhh',
      measures: MeasuresCollection,
      active: true,
      signature: 0, //initially set to zero, but set in the init of StageView
      placementOrder: 0, //initially 0, but set later to its placement
      instrumentMenu: RemainingInstrumentGenerator,
      tempo: '' //bpm
    },
    initialize: function(){
    }
  });
  return HTrackModel;
});