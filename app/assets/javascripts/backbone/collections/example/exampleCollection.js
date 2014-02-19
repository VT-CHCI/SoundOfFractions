//filename collections/exampleCollection.js
/*
  This is an example of a Collection in Backbone.js, integrated with Require.
  It is comprised of one or more models of specific types, or one or more collections of another type
*/

// The define function is part of Require.js. File extensions arent needed.
// It pairs file paths with variable names passed into the BackBone.Collection.extend({})
define([                                  // These are file paths
  'jquery',                               // We reference JQuery, although it isn't used
  'underscore',                           // We reference Underscore, again, evenb though it isn't used
  'backbone',                             // We must reference Backbone
  'backbone/models/measure',              // We reference a model that makes up this collection
  'backbone/collections/representations'  // We reference another collection, making it nested
            // We give names to the above mentioned files, as variable names.  Declaration orders much match
], function($, _, Backbone, MeasureModel, RepresentationsCollection){

  // In this case we donjust outright return the collection.   we don't instantiate it first then return it.
  // Please review this link to see How to handle difference declarations for  objects, functions, singletons, and such:
  // http://stackoverflow.com/questions/17556040/instantiation-of-an-object-vs-function-in-backbone-js
  return Backbone.Collection.extend({
    model: MeasureModel,
    repCollection: RepresentationsCollection,
    initialize: function(){
    }
  });

});
