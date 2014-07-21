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
        {label: 'Hi Hat', type: 'hh', image: 'hihat.png', sample: '808_hh.m4a'},
        {label: 'Kick Drum', type: 'kd', image: 'kick.png', sample: '808_kd.m4a'}
        // { label: 'other1', type: 'o1'},//, image: orange.png },
        // { label: 'other2', type: 'o2'}//, image: orange.png },
        // { label: 'Synth', type: 'sy'}//, image: synth.png }
      ],
      instrumentLookup: {
        sn: {label: 'Snare', type: 'sn', image: 'snare.png', sample: '808_sn.m4a', gain: .2 },
        hh: {label: 'Hi Hat', type: 'hh', image: 'hihat.png', sample: '808_hh.m4a', gain: 1 },
        kd: {label: 'Kick Drum', type: 'kd', image: 'kick.png', sample: '808_kd.m4a', gain: 1 },
        o1: {label: 'other1', type: 'o1', image: 'orange.png', sample: '808_sy.mp3', gain: 1 },
        o2: {label: 'other2', type: 'o2', image: 'orange.png', sample: '808_sy.mp3', gain: 1 }//,
        // sy: {label: 'Synth', type: 'sy', image: 'synth.png', sample: '808_.m4a'}
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
      this.listenTo(dispatch, 'addInstrumentToGeneratorModel.event', this.addInstrument);
      this.listenTo(dispatch, 'removeInstrumentFromGeneratorModel.event', this.removeInstrument);
    },

    getDefault: function(type, thing) {
      for (var key in this.instrumentLookup) {
        if (this.instrumentLookup[key].type == type) {
            return this.instrumentLookup[key][thing];
            break;
        }
      }      
    },


    removeInstrument: function(removedInstrument) {
      console.log('in remainingInstrumentGeneratorModel removeInstrument()');

      var len = this.unusedInstruments.length,
          i;

      var remove = function(arr, from) {
          // Based on John Resig's article (MIT Licensed)
          // http://ejohn.org/blog/javascript-array-remove/
          var rest = arr.slice(from + 1);
          arr.length = from;
          return arr.push.apply(arr, rest);
      };

      var found = false;
      for (i = 0; i < len ; ++i) {
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
      console.warn(this.unusedInstruments);
      console.warn('addedInstrument: '+ addedInstrument + ' to generatorModel' );
      var newLabel = this.defaults.instrumentLookup[ addedInstrument ].label;
      var newType = addedInstrument;
      console.warn(newLabel + ' ' + newType)
      this.unusedInstruments.push({ label: newLabel, type: newType });
      console.warn(this.unusedInstruments);
    }
  });
  
  return new remainingInstrumentGeneratorModel();
});