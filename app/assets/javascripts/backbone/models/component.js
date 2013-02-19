define([
  'underscore',
  'backbone',
  'backbone/collections/measures'
], function(_, Backbone, measuresCollection) {
  var componentModel = Backbone.Model.extend({
    defaults: {
      label: 'snare',
      img: 'ofAsnare',
      mute: false,
      sample: 'shhh',
      measures: measuresCollection,
      active: true,
      signature: 4,
      representation: 'fraction'
    },
    initialize: function(){
    }
  });
  
  return componentModel;
});