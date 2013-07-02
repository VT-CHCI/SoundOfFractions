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
        // { label: 'Snare'},//, image: SnareImage },
        { label: 'Hi Hat', type: 'hh'},//, image: HiHatImage },
        { label: 'Kick Drum', type: 'kd'},//, image: KickDrumImage },
        { label: 'other1', type: 'o1'},//, image: KickDrumImage },
        { label: 'other2', type: 'o2'}//, image: KickDrumImage },
        // { label: 'Synth'}//, image: SynthImage }
      ]
    },

    initialize: function(){
      this.unusedInstruments = this.defaults.unusedInstruments;
      //  [
      //   // { label: 'Snare'},//, image: SnareImage },
      //   { label: 'Hi Hat'},//, image: HiHatImage },
      //   { label: 'Kick Drum'}//, image: KickDrumImage },
      //   // { label: 'Synth'}//, image: SynthImage }
      // ]
    },

    removeInstrument: function(removedInstrument) {
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
      this.unusedInstruments.push(addedIntrument);
    }
  });
  
  return remainingInstrumentGeneratorModel;
});