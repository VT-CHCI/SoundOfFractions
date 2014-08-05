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
  'backbone/models/remainingInstrumentGenerator',
  'app/dispatch'
], function(_, Backbone, MeasuresCollection, RemainingInstrumentGenerator, dispatch ) {
  var HTrackModel = Backbone.Model.extend({
    defaults: {
      label: 'snare',
      type: 'sn',
      img: 'ofAsnare',
      // mute: false, maybe not getting used?
      sample: 'shhh',
      gain: 1,
      measures: MeasuresCollection,
      active: true,
      signature: 0, //initially set to zero, but set in the init of StageView
      placementOrder: 0, //initially 0, but set later to its placement
      instrumentMenu: RemainingInstrumentGenerator,
      tempo: '' //bpm
    },
    initialize: function(options){
      console.log('initing the hTrackModel with these options: ');

      // I need to listen to the beat collection length on the measure model of the measure collection
      this.listenTo(dispatch, 'signatureChange.event', this.updateModelSignature);

    },
    updateModelSignature: function(){
      console.log('updating htrack signature to '+(this.get('measures').models[0].get('beats').length));
      this.set('signature', this.get('measures').models[0].get('beats').length);
    }
  });
  return HTrackModel;
});