//filename: models/beat.js
/*
  This is the beat model.
  It only knows about whether or not it
  is selected.
*/
define([
  'underscore',
  'bbone'
], function(_, Backbone) {
  var BeatModel = Backbone.Model.extend({
    defaults: {
      selected: false
    },
    initialize: function(boolean){
      if(boolean) {
        this.selected = boolean;
      }
    },
    toggle: function(){
      if(this.get('selected') == false) {      
        this.set('selected', true);
      } else if (this.get('selected') == true) {
        this.set('selected', false);
      } else {
        console.error('Should not be in here: Beat Model Toggle, `selected` is no longer boolean');
      }
      // MAYBE send a log

      // I don't think this function is being used -> see beatView line 392
    }
  });
  return BeatModel;
});