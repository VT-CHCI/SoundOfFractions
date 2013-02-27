// Filename: views/components/componentView.js
/*
  This is the view for one component of the drum kit.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above,
  'backbone/models/component',
  'backbone/views/measures/measuresView',
  'app/dispatch',
  'app/state',
  'app/log'
], function($, _, Backbone, Component, MeasuresView, dispatch, state, log){
  return Backbone.View.extend({
    el: $('.component'),

    //registering two handlers for backbone's click events.
    //the first is for toggling the component's muted state.
    //the second is for setting this component in focus (or selected).
    events : {
      'click .control' : 'toggleMute',
      'click' : 'select'
    },

    /*
      We are receiving options from componentsView, where this view is
      being instantiated.

      We get a component model, a DOM element, and a gainNode.
      this.gainNode is the gainNode responsible for controlling the
      individual muting of this component in the web audio API.
    */
    initialize: function(options){
      if (options) {
        this.component = options.collection;
        this.el = options.el;

        this.gainNode = options.gainNode;
      } else {
        this.component = new Component;
      }

      this.animationIntervalID = null;

      //registering our handlers for serveral events.
      dispatch.on('toggleAnimation.event', this.toggleAnimation, this);
      dispatch.on('representation.event', this.recalculateFraction, this);
      dispatch.on('beatClicked.event', this.recalculateFraction, this);
      dispatch.on('signatureChange.event', this.recalculateFraction, this);
      this.render();
    },

    /*
      This View does not have its own html rendering, but instead creates
      a new MeasuresView which gets rendered instead.
    */
    render: function(){
      new MeasuresView({collection:this.component.get('measures'), parent: this.component, el:'#component'+this.component.cid});
      this.recalculateFraction();
     return this;
    },

    /*
      This is called when the user clicks on the icon of this component
      which has the css class 'control'
      
      This toggles the appearance of the [X] on the component as well
      as the volume of the gainNode associated with this component's muting state.

      gainNode volumes are stored in the value attribute and range from 0 to 1.

      This also sends a log message.
    */
    toggleMute: function(){
      this.component.set('active', !this.component.get('active'));

      if (this.gainNode.gain.value == 1) {
        this.gainNode.gain.value = 0;
        $(this.el).find('.control').removeClass('unmute').addClass('mute');

        log.sendLog([[2, "Component muted: "+"component"+this.component.cid]]);

      } else {
        this.gainNode.gain.value = 1;
        $(this.el).find('.control').removeClass('mute').addClass('unmute');

        log.sendLog([[2, "Component unmuted: "+"component"+this.component.cid]]);
      }
    },

    /*
      This is the animation that occurs when the sequencer is being played.
      This is triggered by toggleAnimation events.

      This controls the css animation of each beat.
    */
    toggleAnimation: function(state, duration, signature, maxMeasures){
      signature = $(this.el).find('.measure').eq(0).find('.beat').length;
      duration = duration/signature/maxMeasures;

      //this is the css animation of a beat being played.
      function animate (targetDiv) {
        targetDiv.css({'width':'+=5', 'height':'+=20', 'top': '-=10', 'left' :'-=2'});
        targetDiv.css('background-color', targetDiv.parent().css('background-color'));
        targetDiv.css('border-width','1px');
        targetDiv.css('z-index','100');
        targetDiv.animate({
          width: '-=5',
          left: '+=2',
          height: '-=20',
          top: '+=10'
        }, duration, function() {
          targetDiv.hide();
          targetDiv.css({'width':'', 'height':'', 'top': '', 'left' : ''});
          targetDiv.css('border-width','0');
          targetDiv.css('z-index','-1');
          targetDiv.show();
        });
      };

      var beats = $(this.el).find('.beat')
      var counter = 0-(signature*maxMeasures-1);

      //when playing is stoped we stop the animation.
      if (state == 'off') {
        clearInterval(this.animationIntervalID);
        this.animationIntervalID = null;

        console.log('stopped animation');
      }
      else {
        console.log('starting animation', duration);

        //this sets the time interval that each animation should take,
        //and then calls animate on each beat with the appropriate
        //timing interval.
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

    //This is called when the component is clicked anywhere to bring
    //the component into focus as selected.
    select: function(){
      $('.component').removeClass('selected');
      $('#component'+this.component.cid).addClass('selected');

      //we trigger this event to cause the beats per measure slider and
      //beat bars to update based on which component is selected.
      dispatch.trigger('sliderChange.event', this.component.get('signature'));
    },

    /*
      This function is called whenever representation, signatureChange, or
      beatClicked events occur.

      This is used to determine what the label should be on the component, based
      on the selected representation and the number of 'selected' or activated
      beats and the number of measures.
    */
    recalculateFraction: function(val){
      var numerator = 0;
      var denominator = 0;

      //first we determine which representation we are using.
      var state = this.component.get('representation');
      if((val === 'fraction') || (val === 'decimal') || (val === 'percent') || val === 'none') {
        state = val;
        this.component.set('representation', state);
        val = null;
      }
      //then, we calculate the numerator by counting selected beats.
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
        //then we determine the denominator
        if (val && $('#measure'+measure.cid).parent().hasClass('selected')) {
          denominator = val;
        } else {
          denominator = measure.get('beats').models.length;
        }
      }, this);
      
      /*
        This next section renders the correct representation of the
        fraction/decimal/percent for this component.
      */
      if(state === 'fraction') {
        $('#component-container'+this.component.cid + ' .count').html('<span class="numerator">4</span><span class="denominator">6</span>');


        $('#component'+this.component.cid).next().find('.numerator').text(numerator);
        $('#component'+this.component.cid).next().find('.denominator').text(denominator);
      }
      else if(state === 'decimal') {
        $('#component-container'+this.component.cid + ' .count').html('<span class="decimal">0.0</span>');
        var decimal = numerator / denominator;
        $('#component'+this.component.cid).next().find('.decimal').text(decimal.toFixed(2));
      }
      else if(state === 'percent'){
        $('#component-container'+this.component.cid + ' .count').html('<span class="percent">0%</span>');
        var percent = numerator / denominator * 100;
        $('#component'+this.component.cid).next().find('.percent').text(percent.toFixed(0) + '%');
      }
      else if(state === 'none') {
        $('#component-container'+this.component.cid + ' .count').empty();
        $('#component-container'+this.component.cid + ' .count').trigger('create');
      }

      this.component.set('signature', denominator);
    }
  });
});
