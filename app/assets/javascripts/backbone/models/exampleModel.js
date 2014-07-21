//filename models/example/exampleModel.js
/*
  This is an example of a Model in Backbone.js, integrated with Require 
*/

// The define function is part of Require.js.  File extensions arent needed.
// It pairs file paths with variable names passed into the BackBone.Model.extend({})
define([                                            // These are file paths
  'underscore',                                     // Underscore gives us nice and easy funtions like _.each()
  'backbone',                                       // Backbone handles the MV* on the frontend
  'backbone/collections/measures',                  // Here we reference a Collection, defined in the Collections folder
  'backbone/models/remainingInstrumentGenerator',   // Here is another Model, reference in the same Model folder
  'app/dispatch'                                    // This is the dispatcher, which handles events for us

            // We give names to the above mentioned files, as variable names.  Declaration orders much match
], function(_, Backbone, MeasuresCollection, RemainingInstrumentGenerator, dispatch ) { 
  // We call the Model the name of the model, and extend it from the Backbone Model Class
  var HTrackModel = Backbone.Model.extend({

    // We populate it with predefined defaults, accessible as this.variableName in the global parent scope for this file
    defaults: {
      label: 'snare',
      type: 'sn',
      img: 'ofAsnare',
      sample: 'shhh',
      gain: 1,
      measures: MeasuresCollection,
      active: true,
      signature: 0, 
      placementOrder: 0,
      instrumentMenu: RemainingInstrumentGenerator,
      // Note, that the last item in the array doesn't have a comma.   This is true for functions declared within the model as well, as in line 50 after updateModelSignature
      tempo: '' //bpm
    },

    // The Init file must be present in every model declaration.
    initialize: function(options){
      console.log('initing the hTrackModel with these options: ');

      // Here, the model is listening for a signatureChange event, and when that even occurs, we run the updateModelSignature function, and pass in the paramaters as 'this'.
      //dispatch.on('signatureChange.event', this.updateModelSignature, this);
      this.listenTo(dispatch, 'signatureChange.event', this.updateModelSignature);

    },

    // This is an additional function we declare on the model, giving us additional functionality
    updateModelSignature: function(){
      console.log('updating htrack signature to '+(this.get('measures').models[0].get('beats').length));
      this.set('signature', this.get('measures').models[0].get('beats').length);
    }
  });
  // We must return the same variable name we decalre in line 19
  return HTrackModel;
});