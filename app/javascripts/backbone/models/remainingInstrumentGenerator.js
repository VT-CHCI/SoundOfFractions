//filename: remainingInstrumentGenerator.js

//This is the model for the generate new instrument based on what instruments are not in use
define([
  'underscore',
  'bbone',
  'general/lookupInstrument'
], function(_, Backbone, LookupInstrument){//, SnareImage, HiHatImage, KickDrumImage, SynthImage) {
  var remainingInstrumentGeneratorModel = Backbone.Model.extend({
    defaults: {
      unusedInstruments: [
        {label: 'Snare', type: 'sn'},
        {label: 'Hi Hat', type: 'hh'},
        {label: 'Kick Drum', type: 'kd'}
        // { label: 'Synth', type: 'sy'}//, image: synth.png },
        // { label: 'other1', type: 'o1'},//, image: orange.png },
        // { label: 'other2', type: 'o2'}//, image: orange.png }
      ]
    },
    initialize: function(options){
      if (options) {
        // This will be for when we load songs.....
        if(options.unusedInstruments) {
          this.set('unusedInstruments', options.unusedInstruments);
        }
      } else {
        this.set('unusedInstruments', this.defaults.unusedInstruments);
      }
      this.instrumentLookup = LookupInstrument;

    },
    removeInstrumentFromUnused: function(removedInstrument) {
      console.log('in remainingInstrumentGeneratorModel removeInstrument()');
      // remove the index *from* the array *arr*
      var remove = function(arr, from) {
          // Based on John Resig's article (MIT Licensed)
          // http://ejohn.org/blog/javascript-array-remove/
          var rest = arr.slice(from + 1);
          arr.length = from;
          return arr.push.apply(arr, rest);
      };
      var found = false;
      // Got through each of the instruments
      for (i = 0; i < this.get('unusedInstruments').length ; ++i) {
        // If the one we want to remove from the remaining parts matches one type available, remove it
        if (this.get('unusedInstruments')[i].type == removedInstrument.type) {
            remove(this.get('unusedInstruments'), i);
            console.warn('removing Instrument: '+ removedInstrument.type + ' from generatorModel');
            found = true;

            this.trigger('removedInstrumentFromUnused', {type: removedInstrument.type});
    
            break;
        } else {
          console.warn('Looking for: ' + removedInstrument + ' ...');
        }
      }
      if (!found) { console.error('none found!'); }
    },
    addInstrument: function(addedInstrument) {
      // Get the label name of the instrument to be added back to the generator
      var newLabel = LookupInstrument.getDefault(addedInstrument.type, 'label');
      console.log(newLabel);
      // We have to use a slice method to get a deep copy of the unused instrument so Backbone will recognize the change
      var newUnused = this.get('unusedInstruments').slice();
      newUnused.push({ label: newLabel, type: addedInstrument.type });
      this.set('unusedInstruments', newUnused );
      console.warn('addedInstrument: '+ addedInstrument.type + ' to generatorModel' );
    }
  });
  // This is a Singleton
  return new remainingInstrumentGeneratorModel();
});