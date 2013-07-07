//filename: remainingInstrumentGenerator.js

//This is the model for the generate new instrument based on what instruments are not in use
define([
  'underscore',
  'backbone',
  'app/dispatch'
  // 'images/snare.png',
  // 'images/hihat.png',
  // 'images/kick.png',
  // 'images/synth.png'
], function(_, Backbone, dispatch){//, SnareImage, HiHatImage, KickDrumImage, SynthImage) {
  var remainingInstrumentGeneratorModel = Backbone.Model.extend({
    defaults: {
      unusedInstruments: [
        // { label: 'Snare', type: 'sn'},//, image: SnareImage },
        {label: 'Hi Hat', type: 'hh', image: 'hihat.png', sample: '.808_hh.m4a'},
        {label: 'Kick Drum', type: 'kd', image: 'kick.png', sample: '.808_kd.m4a'}
        // { label: 'other1', type: 'o1'},//, image: KickDrumImage },
        // { label: 'other2', type: 'o2'}//, image: KickDrumImage },
        // { label: 'Synth', type: 'sy'}//, image: SynthImage }
      ],
      instrumentLookup: {
        sn: {label: 'Snare', type: 'sn', image: 'snare.png', sample: '.808_sn.m4a'},
        hh: {label: 'Hi Hat', type: 'hh', image: 'hihat.png', sample: '.808_hh.m4a'},
        kd: {label: 'Kick Drum', type: 'kd', image: 'kick.png', sample: '.808_kd.m4a'},
        o1: {label: 'other1', type: 'o1', image: 'orange.png', sample: '.808_sy.mp3'},
        o2: {label: 'other2', type: 'o2', image: 'orange.png', sample: '.808_sy.mp3'}//,
        // sy: {label: 'Synth', type: 'sy', image: 'synth.png', sample: '.808_.m4a'}
      }
    },

    initialize: function(){
      this.unusedInstruments = this.defaults.unusedInstruments;
      //  [
      //   // { label: 'Snare'},//, image: SnareImage },
      //   { label: 'Hi Hat'},//, image: HiHatImage },
      //   { label: 'Kick Drum'}//, image: KickDrumImage },
      //   // { label: 'Synth'}//, image: SynthImage }
      // ]
      dispatch.on('addInstrumentToGeneratorModel', this.addInstrument, this);
      dispatch.on('removeInstrumentFromGeneratorModel', this.removeInstrument, this);
    },

    getLabel: function(type){
      var len = this.unusedInstruments.length,
          i;

      for (i = 0; i < len ; ++i) {
          if (this.unusedInstruments[i].type == type) {
              return this.unusedInstruments[i].label;
              break;
          }
      }
    },

    removeInstrument: function(removedInstrument) {
      console.warn('removedIntrument: '+ removedInstrument );
      var len = this.unusedInstruments.length,
          i;

      var remove = function(arr, from) {
          // Based on John Resig's article (MIT Licensed)
          // http://ejohn.org/blog/javascript-array-remove/
          var rest = arr.slice(from + 1);
          arr.length = from;
          return arr.push.apply(arr, rest);
      };

      for (i = 0; i < len ; ++i) {
          if (this.unusedInstruments[i].type == removedInstrument) {
              remove(this.unusedInstruments, i);
              break;
          }
      }
    },

    addInstrument: function(addedIntrument) {
      console.warn('addedIntrument: '+ addedIntrument );
      var newLabel = this.defaults.instrumentLookup[ addedIntrument ].label;
      var newType = addedIntrument;
      console.warn(newLabel + ' ' + newType)
      this.unusedInstruments.push({ label: newLabel, type: newType });
    }
  });
  
  return remainingInstrumentGeneratorModel;
});