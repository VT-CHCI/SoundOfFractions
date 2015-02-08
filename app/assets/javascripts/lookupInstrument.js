define([
], function(){
  return LookupInstrument = {
    instrumentLookup: {
      sn: {label: 'Snare', type: 'sn', image: 'snare.png', sample: '808_sn.m4a', gain: .2 },
      hh: {label: 'Hi Hat', type: 'hh', image: 'hihat.png', sample: '808_hh.m4a', gain: 1 },
      kd: {label: 'Kick Drum', type: 'kd', image: 'kick.png', sample: '808_kd.m4a', gain: 1 },
      sy: {label: 'Synth', type: 'sy', image: 'synth.png', sample: '808_.m4a'},
      o1: {label: 'other1', type: 'o1', image: 'orange.png', sample: '808_sy.mp3', gain: 1 },
      o2: {label: 'other2', type: 'o2', image: 'orange.png', sample: '808_sy.mp3', gain: 1 }
    },
    // This is used to lookup the appropriat information in the table to populate a new instrument being made
    getDefault: function(type, thing) {
      // For each instrument in the information lookup table
      for (var key in this.instrumentLookup) {
        // If the type coming in matches the lookup table
        if (this.instrumentLookup[key].type == type) {
          // Return the appropriate information
          return this.instrumentLookup[key][thing];
          break;
        }
      }
    }
  };
});

