// Filename: views/components/componentView.js
/*
  This is the view for one component of the drum kit.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/component',
  'backbone/views/measure/measureView',
  'backbone/views/fraction/fractionView',
  'backbone/views/slider/beatsPerMeasureSliderView',
  'app/dispatch',
  'backbone/models/state',
  'app/log'
], function($, _, Backbone, Component, MeasuresView, FractionRepresentationView, BPMSliderView, dispatch, state, log){
  return Backbone.View.extend({
    // this is needed to recalculate a beat's size
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
        if (options.defaultMeasureRepresentation) {
          this.defaultMeasureRepresentation = options.defaultMeasureRepresentation;
        }
        if (options.defaultFractionRepresentation) {
          this.defaultFractionRepresentation = options.defaultFractionRepresentation;
        }
      } else {
        this.component = new Component;
      }

      this.animationIntervalID = null;

      this.component.set('currentBeat',0);

      //registering our handlers for serveral events.
      dispatch.on('toggleAnimation.event', this.toggleAnimation, this);
      dispatch.on('signatureChange.event', this.updateModelSignature, this);
      // dispatch.on('fractionRepresentation.event', this.recalculateFraction, this);
      // dispatch.on('beatClicked.event', this.recalculateFraction, this);

      this.render();
    },

    /*
      This View does not have its own html rendering, but instead creates
      a new MeasuresView which gets rendered instead.
    */
    render: function(options){
      if(options) {
        new MeasuresView({
          collection:this.component.get('measures'),
          parent: this.component,
          el:'#component'+this.component.cid,
          newMeasureRepresentation: options.representation
        });

        new FractionRepresentationView({
          collection:this.component.get('measures'),
          parent: this.component,
          el:'#fraction'+this.component.cid,
          defaultFractionRepresentation: this.defaultFractionRepresentation
        }); 
      }
      else {
        new MeasuresView({
          collection:this.component.get('measures'),
          parent: this.component,
          el:'#component'+this.component.cid,
          defaultMeasureRepresentation: this.defaultMeasureRepresentation
        });

        new FractionRepresentationView({
          collection:this.component.get('measures'),
          parent: this.component,
          el:'#fraction'+this.component.cid,
          defaultFractionRepresentation: this.defaultFractionRepresentation
        });
      }
      $(this.el).draggable({ axis: "y",containment: "parent" });
      return this;
    },

    updateModelSignature: function(val){
      if($('#component'+this.component.cid).hasClass('selected')) {
        this.component.set('signature', val);
      }
      
      var rep = $('#measure-representation-buttons').find('.active').data('state')

      var options = {representation: rep};
      this.render(options);
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
      // TODO why bring in signature to have it reset
      //signature = $(this.el).find('.measure').eq(0).find('.beat').length;
      signature = this.component.get('signature');

      //duration is of one beat.
      duration = duration/signature/maxMeasures;

      //this is the SVG animation of a beat being played.
      this.animate = function(target) {
        target.setAttributeNS(null, 'dur', (duration/1000)+'s');
        target.beginElement();
      };

      this.d3animate = function() {
        var target = d3.select('.d3');
        console.log(target);
        target.transition()
              // .delay(duration)
              // .ease('linear')
              .attr("x", 10)
              .duration(1000)
      };

      var beats = $(this.el).find('.beat');
      var counter = 0-(signature*maxMeasures-1);

      //when playing is stoped we stop the animation.
      if (state == 'off') {
        clearInterval(this.animationIntervalID);
        this.animationIntervalID = null;

        console.log('stopped animation');
      }
      else {
        console.log('starting animation', duration);

        // this sets the time interval that each animation should take,
        // and then calls animate on each beat with the appropriate
        // timing interval.
        this.animationIntervalID = setInterval((function(self) {
          return function() {
            if (counter >= 0 && counter < beats.length)
              self.component.set('currentBeat',counter);
              if (self.defaultMeasureRepresentation == 'circular-bead'){
                window.csf = $('.d3');
                // console.log(self.component.get('currentBeat'));
                self.d3animate();
              } else {
                self.animate(beats.eq(counter).children().first()[0]);
              }
            if (counter < (signature*maxMeasures-1))
              counter ++;
            else
              counter = 0;
          }
        })(this), duration); //duration should be set to something else
        //this.animationWrapper(counter, beats, signature, maxMeasures, duration);
      }
    },

    animationWrapper: function(counter, beats, signature, maxMeasures, duration) {
      console.warn('ANIMATION WRAPPER CALLED');
      if (counter >= 0 && counter < beats.length)
        this.animate(beats.eq(counter).children().first()[0]);
      if (counter < (signature*maxMeasures-1))
        counter ++;
      else {
        counter = 0;
      }
      this.animationIntervalID = setTimeout(this.animationWrapper, duration);
    },

    //This is called when the component is clicked anywhere to bring
    //the component into focus as selected.
    select: function(){
      $('.component').removeClass('selected');
      $('#component'+this.component.cid).addClass('selected');

      //we trigger this event to cause the beats per measure slider and
      //beat bars to update based on which component is selected.
      dispatch.trigger('bPMSlider.event', {signature: this.component.get('signature'), name: this.component.get('label') } );
    },
  });
});