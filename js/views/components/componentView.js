// Filename: views/components/componentView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above,
  'models/component',
  'views/measures/measuresView',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, Component, MeasuresView, dispatch, state){
  return Backbone.View.extend({
    el: $('.component'),

    events : {
      'click .control' : 'toggleMute'
    },

    initialize: function(options){
      if (options) {
        this.component = options.collection;
        this.el = options.el;

        this.gainNode = options.gainNode;
      } else {
        this.component = new Component;
      }
      this.render();
    },

    render: function(){
      new MeasuresView({collection:this.component.get('measures'), el:'#component'+this.component.cid});

     return this;
    },

    toggleMute: function(){
      this.component.set('active', !this.component.get('active'));

      if (this.gainNode.gain.value == 1) {
        this.gainNode.gain.value = 0;
        $(this.el).find('.control').removeClass('unmute').addClass('mute');
      } else {
        this.gainNode.gain.value = 1;
        $(this.el).find('.control').removeClass('mute').addClass('unmute');
      }



      // console.log(this.gainNode, this.gainNode.gain.value);
    }
  });
});
