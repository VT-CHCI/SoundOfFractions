define([
  'underscore',
  'backbone',
  'collections/measures'
], function(_, Backbone, measuresCollection) {
  var componentModel = Backbone.Model.extend({
    defaults: {
      label: 'snare',
      img: 'ofAsnare',
      mute: false,
      sample: 'shhh',
      measures: measuresCollection,
      active: true
    },
    initialize: function(){
    }
  });
  
  return componentModel;
});