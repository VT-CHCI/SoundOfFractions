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
      dispatch.on('signatureChange.event', this.setSignature, this);
    },

    setTempo: function(val) {
      tempo = val;
    },

    setSignature: function(val) {
      signature = val;
    }


  });

  return new state;
});