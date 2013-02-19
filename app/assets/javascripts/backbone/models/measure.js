define([
  'underscore',
  'backbone',
  'backbone/collections/beats'
], function(_, Backbone, beatsCollection) {
  var measureModel = Backbone.Model.extend({
    defaults: {
      label: '0/4',
      beats: beatsCollection,
      numberOfBeats: 0,
      divisions: 8
    },
    initialize: function(){     
    }

  });
  
  return measureModel;
});