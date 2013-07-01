//filename: remainingInstrumentGenerator.js

//This is the model for the generate new instrument based on what instruments are not in use
define([
  'underscore',
  'backbone'//,
  // 'images/snare.png',
  // 'images/hihat.png',
  // 'images/kick.png',
  // 'images/synth.png'
], function(_, Backbone){//, SnareImage, HiHatImage, KickDrumImage, SynthImage) {
  var remainingInstrumentGeneratorModel = Backbone.Model.extend({
    defaults: {
      unusedInstruments: [
        { label: 'Snare'},//, image: SnareImage },
        { label: 'Hi Hat'},//, image: HiHatImage },
        { label: 'Kick Drum'},//, image: KickDrumImage },
        { label: 'Synth'}//, image: SynthImage }
      ]
    },

    initialize: function(){
    }
  });
  
  return remainingInstrumentGeneratorModel;
});