define([
  'underscore',
  'backbone',
  'app/dispatch'
], function(_, Backbone, dispatch) {
  var state = Backbone.Model.extend({
    defaults: {
      signature: 4,
      tempo: 120 
    },
    initialize: function(){

      dispatch.on('tempoChange.event', this.setTempo, this);
    },

    setTempo: function(val) {
      tempo = val;

    }
  });
  
  return new state;
});