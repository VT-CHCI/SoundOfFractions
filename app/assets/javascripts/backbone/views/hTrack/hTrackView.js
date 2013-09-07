// Filename: views/hTrack/hTrackView.js
/*
  This is the view for one hTrack of the drum kit.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/hTrack',
  'backbone/models/state',
  'backbone/collections/representations',
  'backbone/views/measure/measureView',
  'backbone/views/fraction/fractionView',
  'backbone/views/menu/instrumentDropDownView',
  'backbone/views/slider/beatsPerMeasureSliderView',
  'backbone/views/button/deleteInstrumentView',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, HTrackModel, StateModel, RepresentationsCollection, MeasureView, FractionRepresentationView, InstrumentDropDownView, BPMSliderView, DeleteInstrumentView, dispatch, log){
  return Backbone.View.extend({
    // this is needed to recalculate a beat's size
    el: $('.hTrack'),

    //registering two handlers for backbone's click events.
    //the first is for toggling the hTrack's muted state.
    //the second is for setting this hTrack in focus (or selected).
    events : {
      'click .control' : 'toggleMute',
      'click .hTrack-container' : 'toggleSelection',
      'click .addMeasureRep' : 'addRepresentationToHTrack'
    },

    /*
      We are receiving options from stageView, where this view is
      being instantiated.

      We get a hTrack model, a DOM element, and a gainNode.
      this.gainNode is the gainNode responsible for controlling the
      individual muting of this hTrack in the web audio API.
    */
    initialize: function(options){
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
      } else {
        this.hTrack = new HTrackModel;
      }
      // allow the letter p to click the first plus sign
      _.bindAll(this, 'manuallPress');
      $(document).bind('keypress', this.manuallPress);
      // this.hTrack.representations = new RepresentationsCollection;
      // this.animationIntervalID = null;
      // this.hTrack.set('currentBeat',0);

      //registering our handlers for serveral events.
      // dispatch.on('toggleAnimation.event', this.toggleAnimation, this);
      dispatch.on('signatureChange.event', this.updateModelSignature, this);
      dispatch.on('instrumentChanged.event', this.changeInstrument, this);

      // dispatch.on('fractionRepresentation.event', this.recalculateFraction, this);
      // dispatch.on('beatClicked.event', this.recalculateFraction, this);

      this.render();
    },

    /*
      This View does not have its own html rendering, but instead creates
      a new MeasureView which gets rendered instead.
    */
    render: function(options){
      if(options) {
        var ƒthis = this;
        // for each of the measures (V1 should only have 1 Measure)
        _.each(this.hTrack.get('measures').models, function(measure, index) {
          new MeasureView({
            collectionOfMeasures: ƒthis.hTrack.get('measures'),
            parent: ƒthis.hTrack,
            parentEl: '#hTrack-'+ƒthis.hTrack.cid,
            model: ƒthis.hTrack.get('measures').models[index],
            currentMeasureRepresentation: options.representation
          });
        });
      } else {
        var ƒthis = this;
        // for each of the measures (V1 should only have 1 Measure)
        _.each(this.hTrack.get('measures').models, function(measure, index) {
          new MeasureView({
            collectionOfMeasures: ƒthis.hTrack.get('measures'),
            measureRepresentations: measure.get('measureRepresentations'),
            parent: ƒthis.hTrack,
            parentEl: '#measure-container-'+ƒthis.hTrack.cid,
            hTrackEl: '#hTrack-'+ƒthis.hTrack.cid,
            model: ƒthis.hTrack.get('measures').models[index],
            measureModel: measure,
            defaultMeasureRepresentation: ƒthis.defaultMeasureRepresentation,
            measureIndex: index,
            measureCount: ƒthis.hTrack.get('measures').models.length
          });
        });

        new InstrumentDropDownView({
          unusedInstrumentsModel: this.unusedInstrumentsModel,
          collection: this.hTrack.get('measures'),
          parent: this.hTrack,
          el: '#instrument-selector-'+this.hTrack.cid,
          parentCID: this.hTrack.cid,
          unusedInstrumentsModel: this.unusedInstrumentsModel
        });

        new DeleteInstrumentView({
          collection: this.hTrack.get('measures'),
          parent: this.hTrack,
          el: '#delete-hTrack-'+this.hTrack.cid,
          parentCID: this.hTrack.cid
        });

        // new FractionRepresentationView({
        //   collection:this.hTrack.get('measures'),
        //   parent: this.hTrack,
        //   el:'#fraction'+this.hTrack.cid,
        //   defaultFractionRepresentation: this.defaultFractionRepresentation
        // });
      }
      // $(this.el).draggable({ axis: "y", containment: "#middle-left-column" });
      return this;
    },

    updateModelSignature: function(val){
      if($('#hTrack'+this.hTrack.cid).hasClass('selected')) {
        this.hTrack.set('signature', val);
      }
    },
    /*
      This is called when the user clicks on the icon of this hTrack
      which has the css class 'control'
      
      This toggles the appearance of the [X] on the hTrack as well
      as the volume of the gainNode associated with this hTrack's muting state.

      gainNode volumes are stored in the value attribute and range from 0 to 1.

      This also sends a log message.
    */
    toggleMute: function(){
      this.hTrack.set('active', !this.hTrack.get('active'));
      if (this.gainNode.gain.value == 1) {
        this.gainNode.gain.value = 0;
        $(this.el).find('.control').removeClass('unmute').addClass('mute');
        $(this.el+ ' .control').html('<i class="icon-volume-off"></i>');
        log.sendLog([[2, "hTrack muted: "+"hTrack"+this.hTrack.cid]]);

      } else {
        this.gainNode.gain.value = 1;
        $(this.el).find('.control').removeClass('mute').addClass('unmute');
        $(this.el+ ' .control').html('<i class="icon-volume-up"></i>');

        log.sendLog([[2, "hTrack unmuted: "+"hTrack"+this.hTrack.cid]]);
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
      signature = this.hTrack.get('signature');

      //duration is of one beat.
      var dur = duration/signature/maxMeasures;

      //this is the SVG animation of a beat being played.
      this.d3AudioAnimate = function(target) {
        var target = d3.select('.audio-beat');
        console.log(target);
        target.transition()
          .attr('x', target.attr('x')+ 10)
          .duration(dur)
      };
      this.d3BeadAnimate = function(target) {
        var target = d3.select('.bead-beat');
        console.log(target);
        target.transition()
          .attr('x', target.attr('x')+ 10)
          .duration(1000)
      };
      this.d3LineAnimate = function(target) {
        var target = d3.select('.line-beat');
        console.log(target);
        target.transition()
          .attr('x', target.attr('x')+ 10)
          .duration(1000)
      };
      this.d3PieAnimate = function(target) {
        var target = d3.select('.pie-beat');
        console.log(target);
        target.transition()
          .attr('x', target.attr('x')+ 10)
          .duration(1000)
      };
      this.d3BarAnimate = function(target) {
        var target = d3.select('.bar-beat');
        console.log(target);
        target.transition()
          .attr('x', target.attr('x')+ 10)
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
        console.log('starting animation', dur);

        // this sets the time interval that each animation should take,
        // and then calls animate on each beat with the appropriate
        // timing interval.
        this.animationIntervalID = setInterval((function(self) {
          console.warn(self)
          return function() {
            if (counter >= 0 && counter < beats.length)
              self.hTrack.set('currentBeat',counter);
              if (self.defaultMeasureRepresentation == 'audio'){
                self.d3AudioAnimate(beats.eq(counter).children().first()[0]);
              } else if (self.defaultMeasureRepresentation == 'bead'){
                self.d3BeadAnimate(beats.eq(counter).children().first()[0]);
              } else if (self.defaultMeasureRepresentation == 'line'){
                self.d3LineAnimate(beats.eq(counter).children().first()[0]);
              } else if (self.defaultMeasureRepresentation == 'pie'){
                self.d3PieAnimate(beats.eq(counter).children().first()[0]);
              } else if (self.defaultMeasureRepresentation == 'bar'){
                self.d3BarAnimate(beats.eq(counter).children().first()[0]);
              }
            if (counter < (signature*maxMeasures-1))
              counter ++;
            else
              counter = 0;
          }
        })(this), dur); //duration should be set to something else
        //this.animationWrapper(counter, beats, signature, maxMeasures, duration);
      }
    },
    addRepresentationToHTrack: function(e) {
      e.srcElement.parentElement.classList.add('cs');
      console.log('clicked the plus sign');
    },
    manuallPress: function(e) {
      if (e.keyCode == 112) {
        $('.icon-plus')[1].parentElement.classList.add('cs');
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

    //This is called when the hTrack is clicked anywhere to bring
    //the hTrack into focus as selected.
    toggleSelection: function(){
      $('#hTrack-container-'+this.hTrack.cid).toggleClass('selected');

      //we trigger this event to cause the beats per measure slider and
      //beat bars to update based on which hTrack is selected.
      // dispatch.trigger('bPMSlider.event', {signature: this.hTrack.get('signature'), name: this.hTrack.get('label') } );
    }
  });
});