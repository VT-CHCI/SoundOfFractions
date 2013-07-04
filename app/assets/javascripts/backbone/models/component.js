//filename models/component.js
/*
  This is the component model.
  A component represents an individual drum or instrument
  component models are created in componentsView.js
*/
define([
  'underscore',
  'backbone',
  'backbone/collections/measures'
], function(_, Backbone, measuresCollection) {
  var componentModel = Backbone.Model.extend({
    defaults: {
      label: 'snare',
      type: 'sn',
      img: 'ofAsnare',
      mute: false,
      sample: 'shhh',
      measures: measuresCollection,
      active: true,
      signature: 0, //initially set to zero, but set in the init of componentsView
      representation: 'fraction'
    },
    initialize: function(){
    }
  });
  
  return componentModel;
});