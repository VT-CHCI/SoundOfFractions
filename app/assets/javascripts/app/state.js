//filename: app/state.js
/*
  This maintains two pieces of information that are
  global to the song.
  namely, the time signature (# of beats per measure)
  and the tempo in beats per minute.
*/
define([
  'underscore',
  'backbone',
  'app/dispatch'
], function(_, Backbone, dispatch) {
  var state = Backbone.Model.extend({
    defaults: {
      signature: 4,
      tempo: 120
    }

  });

  return new state;
});