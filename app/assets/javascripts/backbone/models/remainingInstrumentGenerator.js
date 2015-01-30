//filename: remainingInstrumentGenerator.js

//This is the model for the generate new instrument based on what instruments are not in use
define([
  'underscore',
  'backbone'
], function(_, Backbone){//, SnareImage, HiHatImage, KickDrumImage, SynthImage) {
  var remainingInstrumentGeneratorModel = Backbone.Model.extend({
    defaults: {
      unusedInstruments: [
        // { label: 'Snare', type: 'sn'},//, image: SnareImage },
        {label: 'Hi Hat', type: 'hh', image: 'hihat.png', sample: '808_hh.m4a'},
        {label: 'Kick Drum', type: 'kd', image: 'kick.png', sample: '808_kd.m4a'}
        // { label: 'Synth', type: 'sy'}//, image: synth.png },
        // { label: 'other1', type: 'o1'},//, image: orange.png },
        // { label: 'other2', type: 'o2'}//, image: orange.png }
      ],
      instrumentLookup: {
        sn: {label: 'Snare', type: 'sn', image: 'snare.png', sample: '808_sn.m4a', gain: .2 },
        hh: {label: 'Hi Hat', type: 'hh', image: 'hihat.png', sample: '808_hh.m4a', gain: 1 },
        kd: {label: 'Kick Drum', type: 'kd', image: 'kick.png', sample: '808_kd.m4a', gain: 1 },
        sy: {label: 'Synth', type: 'sy', image: 'synth.png', sample: '808_.m4a'},
        o1: {label: 'other1', type: 'o1', image: 'orange.png', sample: '808_sy.mp3', gain: 1 },
        o2: {label: 'other2', type: 'o2', image: 'orange.png', sample: '808_sy.mp3', gain: 1 }
      }
    },
    initialize: function(options){
      if (options) {
        this.unusedInstruments = options.unusedInstruments;
        this.instrumentLookup = options.instrumentLookup;
      } else {
        this.unusedInstruments = this.defaults.unusedInstruments;
        this.instrumentLookup = this.defaults.instrumentLookup;
      }

      // dispatch.on('addInstrumentToGeneratorModel.event', this.addInstrument, this);
      // dispatch.on('removeInstrumentFromGeneratorModel.event', this.removeInstrument, this);
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
    },
    removeInstrument: function(removedInstrument) {
      console.log('in remainingInstrumentGeneratorModel removeInstrument()');

      // remove the item from the array
      var remove = function(arr, from) {
          // Based on John Resig's article (MIT Licensed)
          // http://ejohn.org/blog/javascript-array-remove/
          var rest = arr.slice(from + 1);
          arr.length = from;
          return arr.push.apply(arr, rest);
      };

      var found = false;
      // Got through each of the instruments
      for (i = 0; i < this.unusedInstruments.length ; ++i) {
        // If the one we want to remove from the remaining parts matches one type available, remove it
        if (this.unusedInstruments[i].type == removedInstrument) {
            remove(this.unusedInstruments, i);
            console.warn('removedIntrument: '+ removedInstrument + ' from generatorModel');
            found = true;
            break;
        } else {
          console.warn('Looking...');
        }
      }
      if (!found) { console.error('none found!'); }
    },
    addInstrument: function(addedInstrument) {
      // Get the label name of the insturment to be added back to the generator
      var newLabel = this.defaults.instrumentLookup[ addedInstrument ].label;
      console.warn(newLabel + ': ' + addedInstrument)
      this.unusedInstruments.push({ label: newLabel, type: addedInstrument });
      console.warn('addedInstrument: '+ addedInstrument + ' to generatorModel' );
    }
  });
  // This is a Singleton
  return new remainingInstrumentGeneratorModel();
});



// // OLD
// //filename: remainingInstrumentGenerator.js

// //This is the model for the generate new instrument based on what instruments are not in use
// define([
//   'underscore',
//   'backbone',
//   'app/dispatch'
//   // 'images/snare.png',
//   // 'images/hihat.png',
//   // 'images/kick.png',
//   // 'images/synth.png'
// ], function(_, Backbone, dispatch){//, SnareImage, HiHatImage, KickDrumImage, SynthImage) {
//   var remainingInstrumentGeneratorModel = Backbone.Model.extend({
//     defaults: {
//       unusedInstruments: [
//         // { label: 'Snare', type: 'sn'},//, image: SnareImage },
//         {label: 'Hi Hat', type: 'hh', image: 'hihat.png', sample: '808_hh.m4a'},
//         {label: 'Kick Drum', type: 'kd', image: 'kick.png', sample: '808_kd.m4a'}
//         // { label: 'other1', type: 'o1'},//, image: orange.png },
//         // { label: 'other2', type: 'o2'}//, image: orange.png },
//         // { label: 'Synth', type: 'sy'}//, image: synth.png }
//       ],
//       instrumentLookup: {
//         sn: {label: 'Snare', type: 'sn', image: 'snare.png', sample: '808_sn.m4a', gain: .2 },
//         hh: {label: 'Hi Hat', type: 'hh', image: 'hihat.png', sample: '808_hh.m4a', gain: 1 },
//         kd: {label: 'Kick Drum', type: 'kd', image: 'kick.png', sample: '808_kd.m4a', gain: 1 },
//         o1: {label: 'other1', type: 'o1', image: 'orange.png', sample: '808_sy.mp3', gain: 1 },
//         o2: {label: 'other2', type: 'o2', image: 'orange.png', sample: '808_sy.mp3', gain: 1 }//,
//         // sy: {label: 'Synth', type: 'sy', image: 'synth.png', sample: '808_.m4a'}
//       }
//     },

//     initialize: function(options){
//       if (options) {
//         this.unusedInstruments = options.unusedInstruments;
//         this.instrumentLookup = options.instrumentLookup;
//       } else {
//         this.unusedInstruments = this.defaults.unusedInstruments;
//         this.instrumentLookup = this.defaults.instrumentLookup;
//       }

//       dispatch.on('addInstrumentToGeneratorModel.event', this.addInstrument, this);
//       dispatch.on('removeInstrumentFromGeneratorModel.event', this.removeInstrument, this);
//     },

//     getDefault: function(type, thing) {
//       for (var key in this.instrumentLookup) {
//         if (this.instrumentLookup[key].type == type) {
//             return this.instrumentLookup[key][thing];
//             break;
//         }
//       }      
//     },


//     removeInstrument: function(removedInstrument) {
//       console.log('in remainingInstrumentGeneratorModel removeInstrument()');

//       var len = this.unusedInstruments.length,
//           i;

//       var remove = function(arr, from) {
//           // Based on John Resig's article (MIT Licensed)
//           // http://ejohn.org/blog/javascript-array-remove/
//           var rest = arr.slice(from + 1);
//           arr.length = from;
//           return arr.push.apply(arr, rest);
//       };

//       var found = false;
//       for (i = 0; i < len ; ++i) {
//         if (this.unusedInstruments[i].type == removedInstrument) {
//             remove(this.unusedInstruments, i);
//             console.warn('removedIntrument: '+ removedInstrument + ' from generatorModel');
//             found = true;
//             break;
//         } else {
//           console.warn('Looking...');
//         }
//       }
//       if (!found) { console.error('none found!'); }
//     },

//     addInstrument: function(addedInstrument) {
//       console.warn(this.unusedInstruments);
//       console.warn('addedInstrument: '+ addedInstrument + ' to generatorModel' );
//       var newLabel = this.defaults.instrumentLookup[ addedInstrument ].label;
//       var newType = addedInstrument;
//       console.warn(newLabel + ' ' + newType)
//       this.unusedInstruments.push({ label: newLabel, type: newType });
//       console.warn(this.unusedInstruments);
//     }
//   });
  
//   return new remainingInstrumentGeneratorModel();
// });