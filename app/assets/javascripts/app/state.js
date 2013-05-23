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
      baseTempo: 120,
      components: null,
      micLevel: 1
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
      if(window.gon) {
        this.micLevel = gon.micLevel;
        console.warn('Mic Level = ' + this.micLevel);
      }
      dispatch.on('recordClicked.event', this.recordButtonClicked, this);
      dispatch.on('tappingTempo.event', this.tapTempoClicked, this);
      dispatch.on('stopRecording.event', this.stopRecording, this);
      dispatch.on('tempoDetected.event', this.stopRecording, this);
    },

    processWaveform: function(time, waveform) {
      var totals = 0;
      this.totals = totals;
      for(var i = 0; i < waveform.length; i++) {
        this.totals += waveform[i] * waveform[i];
      }
      this.totals = this.totals / waveform.length;
      var RMS = Math.sqrt(this.totals);
      if(RMS > 0.05 && ((time - this.prevTime) > 200) && this.isTapping && this.isWaiting) {
        console.log('RMS = ' + RMS);
        console.log(time - this.prevTime);
        this.prevTime = time;
        if(this.countIn == 1) {
          this.previousTime = new Date().getTime();
          console.log("Start time: " + this.previousTime);
          this.countIn++;
          this.signature++;
          console.log("Beats per Measure = " + this.signature);
        }
        else if(this.isWaiting) {
          var currentTime = new Date().getTime();
          this.signature++;
          console.log("Beats per Measure = " + this.signature);
          this.timeIntervals[(this.countIn - 2)] = currentTime - this.previousTime;
          this.previousTime = currentTime;
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
            if(that.waitCount == 2) {
              that.isWaiting = false;
              that.waitCount = 0;

              that.mainCounter = 0;
              that.isRecording = true;
              for(var i = 0; i < that.signature; i++) {
                that.beatArray[i] = 0;
              }

              dispatch.trigger('signatureChange.event', that.signature);
              
              that.isTapping = false;
              that.countIn = 1;
              //show the BPM
              var bpm = 1000 / that.average * 60;
              that.set('baseTempo', bpm);
              that.set('tempo', bpm);
              that.set('signature', that.signature);
              $('#tap-tempo').click();
              $('#tempo-slider-input').val(1);
              dispatch.trigger('tempoChange.event', bpm);
              dispatch.trigger('stopRecording.event');
              window.clearInterval(waitIntervalID);
            }
            that.waitCount++;
          }, this.average);
          this.countIn++;
        }
          
        console.log(this.timeIntervals);
      }
      else if(RMS > 0.05 && this.isRecording) {
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

    tapTempoClicked: function() {
      console.log('Tap Tempo Clicked');
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

      if (this.hasGetUserMedia()) {
        console.log("we do have user media access.");
        var context = new window.webkitAudioContext();
        var that = this;
        navigator.webkitGetUserMedia({audio: true}, function(stream) {
          var microphone = context.createMediaStreamSource(stream);
          that.microphone = microphone;
          that.micGain = context.createGainNode();
          that.micGain.gain = that.micLevel;
          that.jsNode = context.createScriptProcessor(512, 2, 2);
          that.microphone.connect(that.micGain);
          that.microphone.connect(context.destination);   
          that.micGain.connect(that.jsNode);
          that.jsNode.connect(context.destination);
          that.prevTime = new Date().getTime();
          that.jsNode.onaudioprocess = (function() {
            return function(e) {
              that.analyze(e);
            };
          }());
          that.waveform = new Float32Array(that.jsNode.bufferSize);   
        }, this.onFailSoHard);
      } 
      else {
        alert('getUserMedia() is not supported in your browser');
      }
    },

    recordButtonClicked: function() {
     if(this.transport.isPlaying) {
        dispatch.trigger('togglePlay.event');
      }
      $('#transport').click();
      this.isTapping = true;
      if(window.tapIntervalID) {
        window.clearInterval(tapIntervalID);
      }
      for(var i = 0; i < window.signature; i++) {
        window.beatArray[i] = 0;
      }
      this.isWaiting = false;
      this.isRecording = true;

      if (this.hasGetUserMedia()) {
        console.log("we do have user media access.");
        var context = new window.webkitAudioContext();
        var that = this;
        navigator.webkitGetUserMedia({audio: true}, function(stream) {
          var microphone = context.createMediaStreamSource(stream);
          that.microphone = microphone;
          that.micGain = context.createGainNode();
          that.micGain.gain = that.micLevel;
          that.jsNode = context.createScriptProcessor(512, 2, 2);
          that.microphone.connect(that.micGain);
          that.microphone.connect(context.destination);
          that.micGain.connect(that.jsNode);
          that.jsNode.connect(context.destination);
          that.prevTime = new Date().getTime();
          that.jsNode.onaudioprocess = (function() {
            return function(e) {
              that.analyze(e);
            };
          }());
          that.waveform = new Float32Array(that.jsNode.bufferSize);   
        }, this.onFailSoHard);
      } 
      else {
        alert('getUserMedia() is not supported in your browser');
      } 
    },

    analyze: function(e){
      var time = e.timeStamp;
      this.e = e;
      this.waveform = e.inputBuffer.getChannelData(0);
      this.processWaveform(time, this.waveform);
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
      this.microphone.disconnect();
      this.jsNode.disconnect();
      this.micGain.disconnect();

      if(window.waitIntervalID) {
        window.clearInterval(window.waitIntervalID);
      }

      if(window.tapIntervalID) {
        window.clearInterval(tapIntervalID);
      }
    },

    hasGetUserMedia: function() {
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia);
    },

    onFailSoHard: function(e) {
      console.log('Reeeejected!', e);
    }

  });
  return new state;
});