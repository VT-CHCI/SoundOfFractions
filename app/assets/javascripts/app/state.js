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
  'app/dispatch',
  'backbone/models/transport'
], function(_, Backbone, dispatch, transport) {
  var state = Backbone.Model.extend({
    defaults: {
      signature: 4,
      tempo: 120,
      components: null
    },

    initialize: function() {
      this.signature = 0;
      this.countIn = 1;
      this.globalDate = new Date();
      this.previousTime = 0;
      this.timeIntervals = new Array();
      this.isTapping = false;
      this.isRecording = false;
      this.beatArray = new Array();
      this.waitCount = 0;
      this.isWaiting = true;
      this.transport = transport;
      dispatch.on('recordClicked.event', this.recordButtonClicked, this);
      dispatch.on('stopRecording.event', this.stopRecording, this);
      var that = this;
      $(window).keypress(function(event) {
        that.keyPressed(event);
      });
    },

    keyPressed: function(keyEvent) {
    console.log(this.signature);
    if(keyEvent.keyCode == 32 && this.isTapping && this.isWaiting) {
      keyEvent.preventDefault();
      if(this.countIn == 1) {
        this.previousTime = new Date().getTime();
        console.log("Start time: " + this.previousTime);
        console.log(this.countIn);
        this.countIn++;
        this.signature++;
      }
      else if(this.isWaiting) {
        var currentTime = new Date().getTime();
        this.signature++;
        console.log("Current time: " + currentTime);
        this.timeIntervals[(this.countIn - 2)] = currentTime - this.previousTime;
        this.previousTime = currentTime;
        console.log(this.countIn);
        var total = 0;
        for(var i = 0; i < this.timeIntervals.length; i++) {
          total += this.timeIntervals[i];
        }
        this.average = total / this.timeIntervals.length;
        console.log("average ms: " + this.average);
        if(window.waitIntervalID) {
          window.clearInterval(window.waitIntervalID);
        }
        var that = this;
        window.waitIntervalID = window.setInterval(function() {
          console.log('waitCount = ' + that.waitCount);
          if(that.waitCount == 2) {
            that.isWaiting = false;
            that.waitCount = 0;

            that.mainCounter = 0;
            that.isRecording = true;
            for(var i = 0; i < that.signature; i++) {
              that.beatArray[i] = 0;
            }
            
            dispatch.trigger('signatureChange.event', that.signature);
            // window.tapIntervalID = window.setInterval(function() {
            //   that.count = that.mainCounter + 1;
              
            //   that.mainCounterTime = new Date().getTime();
            //   console.log(that.beatArray + " " + that.count);
            //   that.mainCounter = (that.mainCounter + 1) % that.signature;
            // }, that.average);
            that.isTapping = false;
            that.countIn = 1;
            //show the BPM
            var bpm = 1000 / that.average * 60;
            console.log('BPM = ' + bpm);
            that.set('tempo', bpm);
            $('#transport').removeClass();
            $('#transport').addClass('pause');
            that.transport.isPlaying = true;
            dispatch.trigger('tempoChange.event', bpm);
            dispatch.trigger('togglePlay.event', 'on');
            // set bpm slider here ! ! ! ! !
            window.clearInterval(waitIntervalID);
          }
          that.waitCount++;
        }, this.average);
        this.countIn++;
      }
        
      console.log(this.timeIntervals);
    }
    else if(keyEvent.keyCode == 32 && this.isRecording) {
      keyEvent.preventDefault();
      // var keyTime = new Date().getTime();
      // if(Math.abs(keyTime - this.mainCounterTime) < (this.average / 3)) {
      //   this.beatArray[this.count - 1] = 1;
      //   console.log("beat activated!!!");
      // }
      _.each(this.get('components').models, function(component) {
        if($('#component'+component.cid).hasClass('selected')) {
          console.log(component.get('currentBeat'));
          var measuresCollection = component.get('measures');
          _.each(measuresCollection.models, function(measure) {
            var beatsCollection = measure.get('beats');
            var beat = beatsCollection.at(component.get('currentBeat'));
            console.log(beat);
            if(!beat.get('selected')) {
              $('#beat'+beat.cid).click();
            }
            console.log($('#beat'+beat.cid));
          }, this);
        }
      }, this);
    }

    },

    recordButtonClicked: function() {
      if(transport.isPlaying) {
        dispatch.trigger('togglePlay.event');
      }
      this.isTapping = true;
      if(window.tapIntervalID) {
        window.clearInterval(tapIntervalID);
      }
      for(var i = 0; i < window.signature; i++) {
        window.beatArray[i] = 0;
      }
      this.isWaiting = true;
      this.signature = 0;
    },

    stopRecording: function() {
      this.signature = 0;
      this.countIn = 1;
      this.globalDate = new Date();
      this.previousTime = 0;
      this.timeIntervals = new Array();
      this.isTapping = false;
      this.isRecording = false;
      this.beatArray = new Array();
      this.waitCount = 0;
      this.isWaiting = true;

      if(window.waitIntervalID) {
        window.clearInterval(window.waitIntervalID);
      }

      if(window.tapIntervalID) {
        window.clearInterval(tapIntervalID);
      }
    }
  });
  return new state;
});