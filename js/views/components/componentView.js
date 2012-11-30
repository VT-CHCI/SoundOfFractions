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
      'click .control' : 'toggleMute',
      'click' : 'select'
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
      dispatch.on('toggleAnimation.event', this.toggleAnimation, this);
      dispatch.on('representation.event', this.cycleRep, this);
      dispatch.on('beatClicked.event', this.recalculateFraction, this);
      dispatch.on('signatureChange.event', this.recalculateFraction, this);
      this.render();
    },

    render: function(){
      new MeasuresView({collection:this.component.get('measures'), el:'#component'+this.component.cid});
      this.recalculateFraction();
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
      signature = $(this.el).find('.beat').length;

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
    },

    select: function(){
      $('.component').removeClass('selected');
      $('#component'+this.component.cid).addClass('selected');
    },

    cycleRep: function() {
      $('.count')
    },

    recalculateFraction: function(val){
      var numerator = 0;
      var denominator = 0;

      _.each(this.component.get('measures').models, function(measure) {
        _.each(measure.get('beats').models, function(beat) {
          if(beat.get('selected')) {
            if (val) {
              numerator = 0;
            } else {
              numerator++;
            }
          }
        }, this);

        if (val && $('#measure'+measure.cid).parent().hasClass('selected')) {
          denominator = val;
        } else {
          denominator = measure.get('beats').models.length;
        }
      }, this);

      $('#component'+this.component.cid).next().find('.numerator').text(numerator);
      $('#component'+this.component.cid).next().find('.denominator').text(denominator);
      this.component.set('signature', denominator);
    }
  });
});
