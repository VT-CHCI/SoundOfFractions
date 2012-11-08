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

      this.animationIntervalID = null;
      dispatch.on('togglePlay.event', this.toggleAnimation, this)

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
    },

    toggleAnimation: function(state, duration, signature, maxMeasures){
      duration = duration/signature/maxMeasures;

      function animate (targetDiv) {
        targetDiv.css('background-color', targetDiv.parent().css('background-color'));
        targetDiv.css('border-width','1px');
        targetDiv.css('z-index','100');
        targetDiv.animate({
          width: '+=5',
          left: '-=2',
          height: '+=20',
          top: '-=10'
        }, duration, function() {
          targetDiv.hide();
          targetDiv.css({'width':'', 'height':'', 'top': '', 'left' : ''});
          targetDiv.css('border-width','0');
          targetDiv.css('z-index','-1');
          targetDiv.show();
        });
      };

      var beats = $(this.el).find('.beat')
      var counter = 0-(signature*maxMeasures-2);
      // var counter = 0;

      if (state == 'off') {
        clearInterval(this.animationIntervalID);
        this.animationIntervalID = null;

        console.log('stopped animation');
      }
      else {
        console.log('starting animation', duration);

        this.animationIntervalID = setInterval((function(self) {
          return function() {
            if (counter >= 0 && counter < beats.length)
              animate(beats.eq(counter).find('.animated-beat'));
            if (counter < (signature*maxMeasures-1))
              counter ++;
            else
              counter = 0;
          }
        })(this), duration); //duration should be set to something else
      }
    }
  });
});
