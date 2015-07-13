//filename: backbone/models/state.js
/*
  This maintains two pieces of information that are
  global to the song.
  namely, the time signature (# of beats per measure)
  and the tempo in beats per minute.
*/

define([
  'underscore',
  'bbone',
  'backbone/models/conductor'
], function(_, Backbone, TransportModel) {
  var State = Backbone.Model.extend({
    defaults: {
      signature: 4,
      tempo: 120,
      baseTempo: 120,
      stage: null,
      micLevel: .8
    },

    initialize: function() {
      this.signature = 0;
      this.countIn = 1;
      this.globalDate = new Date();
      this.previousTime = 0;
      this.timeIntervals = [0];
      this.isTapping = false;
      this.isRecording = false;
      this.beatArray = new Array();
      this.waitCount = 0;
      this.isWaiting = false;
      this.TransportModel = TransportModel;
      this.finalMeasureBeatTimeIntervals50 = [];
      this.finalMeasureBeatTimeIntervals100 = [];
      this.finalMeasureBeatTimeIntervals150 = [];
      this.finalMeasureBeatTimeIntervals200 = [];
      this.finalMeasureBeatTimeIntervals250 = [];
      if(window.gon) {
        this.micLevel = gon.micLevel;
        console.warn('Mic Level = ' + this.micLevel);
      }

      this.context = new window.AudioContext();

      // TODO Replace these events
      // dispatch.on('doall.event', this.recordTempoAndPattern, this);
      this.on('recordTempoAndPattern', this.recordTempoAndPattern, this);
      // dispatch.on('recordClicked.event', this.recordButtonClicked, this);
      // dispatch.on('tappingTempo.event', this.tapTempoClicked, this);
      // dispatch.on('tempoDetected.event', this.stopRecording, this);
    },
    turnIsWaitingOn: function(){
      // this.isTapping = true;
      this.isWaiting = true;
    },
    turnIsWaitingOff: function(){
      this.set('isTapping', false);
    },
    recordTempoAndPatternByTapping: function(instrument) {
      console.log('recordTempoAndPatternByTapping function in state');
      console.log('Instrument type: '+ instrument);
      this.set('instrumentTypeBeingRecorded', instrument);
      if(TransportModel.get('isPlaying')) {
        TransportModel.stop();
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
        var µthis = this;
        navigator.webkitGetUserMedia({audio: true}, function(stream) {
          var microphone = µthis.context.createMediaStreamSource(stream);
          µthis.microphone = microphone;
          µthis.micGain = µthis.context.createGain();
          µthis.micGain.gain = µthis.micLevel;
          µthis.jsNode = µthis.context.createScriptProcessor(512, 2, 2);
          µthis.microphone.connect(µthis.micGain);
          µthis.microphone.connect(µthis.context.destination);   
          µthis.micGain.connect(µthis.jsNode);
          µthis.jsNode.connect(µthis.context.destination);
          µthis.prevTime = new Date().getTime();
          µthis.jsNode.onaudioprocess = (function() {
            return function(e) {
              µthis.analyze(e);
            };
          }());
          µthis.waveform = new Float32Array(µthis.jsNode.bufferSize);   
        }, this.onFailSoHard);
      } 
      else {
        alert('getUserMedia() is not supported in your browser');
      }
    },
    recordTempoAndPatternByKeyboard: function(time) {
      console.log('recordTempoAndPatternByTapping function in state');
      if(this.isWaiting){
        this.processKeyboardTapping(time);
      } else {
        console.log('we are not listening to taps');
      }
      // this.signature = 0;
    },
    processWaveform: function(time, waveform) {
      this.totals = 0;
      // Waveform.length = 512  ¿ I think this means we listen to 512 partitions per second?
      for(var i = 0; i < waveform.length; i++) {
        this.totals += waveform[i] * waveform[i];
      }
      this.totals = this.totals / waveform.length;
      var RMS = Math.sqrt(this.totals);
      console.warn(this.prevTime);
      // console.warn('Time: ' + time + ' RMS: ' + RMS);

      // elapsed time since last beat analysis in ms
      var elapsedTime = time - this.prevTime;

      // If we are still tapping, and are still recording (isWaiting = true), and the RMS is greater than .05
      if(RMS > 0.05 && (elapsedTime > 200) && this.isTapping && this.isWaiting) {
        console.log('RMS = ' + RMS);
        console.log('elapsed time: ' + elapsedTime);
        this.prevTime = time;
        //On the first beat
        if(this.countIn == 1) {
          var newCurrentTime = new Date().getTime();
          this.startTime = newCurrentTime;
          console.log('Start time: ' + this.startTime);
          this.previousTime = newCurrentTime;
          console.warn(this.beatTimings);
          this.countIn++;
          this.signature++;
          console.log('Beats in Measure = ' + this.signature);
          console.log('average in ms: ' + 'CAN\'T MEASSURE WITH ONE BEAT' + ' || average in BPM: ' + 'CAN\'T MEASSURE WITH ONE BEAT');
        }
        // As long as we are still tapping, but not on the first beat
        else if(this.isWaiting) {
          // Beat Count
          this.signature++;
          //Reset the wait counter since a beat was detected
          this.waitCount = 0;
          console.log('Beats in Measure = ' + this.signature);

          // BPM in ms and min
          var currentTime = new Date().getTime();
          this.timeIntervals.push(currentTime - this.previousTime);
          this.previousTime = currentTime;
          this.lastTimeDelta = currentTime - this.previousTime;
          var songTotalTimeDuration = 0;
          for(var i = 0; i < this.timeIntervals.length; i++) {
            songTotalTimeDuration += this.timeIntervals[i];
          }
          this.average = songTotalTimeDuration / this.timeIntervals.length;
          console.log('average in ms: ' + this.average + ' || average in BPM: ' + 60*1000/this.average);

          // Waiting for the listener to stop tapping
          if(window.waitIntervalID) {
            window.clearInterval(window.waitIntervalID);
            this.waitCount = 0;
          }

          var µthis = this;
          window.waitIntervalID = window.setInterval(function() {
            // If the user stops beating for *n* times, we stop listening to the tapping automatically
            // *n* is represented by µthis.waitCount
            console.warn('waitCount: ' + µthis.waitCount);
            if(µthis.waitCount == 2) {
              µthis.isWaiting = false;
              µthis.waitCount = 0;

              µthis.mainCounter = 0;
              µthis.isRecording = true;
              for(var i = 0; i < µthis.signature; i++) {
                µthis.finalMeasureBeatTimeIntervals50.push(µthis.roundTo50(µthis.timeIntervals[i]));
                µthis.finalMeasureBeatTimeIntervals100.push(µthis.roundTo100(µthis.timeIntervals[i]));
                µthis.finalMeasureBeatTimeIntervals150.push(µthis.roundTo150(µthis.timeIntervals[i]));
                µthis.finalMeasureBeatTimeIntervals200.push(µthis.roundTo200(µthis.timeIntervals[i]));
                µthis.finalMeasureBeatTimeIntervals250.push(µthis.roundTo250(µthis.timeIntervals[i]));
                µthis.beatArray[i] = 0;
              }
              // µthis.finalMeasureBeatTimeIntervals[µthis.finalMeasureBeatTimeIntervals.length-1] = µthis.roundTo100(µthis.lastTimeDelta);
              console.warn(µthis.finalMeasureBeatTimeIntervals100);
              // [0, 800, 200, 1000, 800, 700] 
              var mdc = function(o){
                  if(!o.length)
                      return 0;
                  for(var r, a, i = o.length - 1, b = o[i]; i;)
                      for(a = o[--i]; r = a % b; a = b, b = r);
                  return b;
              };

              var diffBeats = [];
              //var beats = [ 0, 800, 200, 1000, 800, 800 ];
              var beats = µthis.finalMeasureBeatTimeIntervals100;

              //Greatest Common Divisor of the beats
              var gcd = mdc(beats);

              for (var i=0 ; i<beats.length ; i++) {
                  if(i==0){
                      diffBeats.push('ON');
                  } else {
                      var rests = (beats[i]/gcd == 0) ? 0 : beats[i]/gcd-1 ;
                      for (var j= 0 ; j<rests ; j++) {
                          diffBeats.push('OFF');
                      }
                      diffBeats.push('ON');
                  }
              }
              diffBeats.splice(16);
              console.log(diffBeats);

              // TODO Replace these events
              // µthis.trigger('signatureChange.event', µthis.signature);

              //show the BPM
              var bpm = 1000 / µthis.average * 60;
              µthis.stopRecording();

              µthis.trigger('instrumentTempoRecorded', {instrument:µthis.get('instrumentTypeBeingRecorded'), beatPattern:diffBeats, bpm:bpm});
              // debugger;

              µthis.isTapping = false;
              µthis.countIn = 1;
              µthis.set('baseTempo', bpm);
              // µthis.set('tempo', bpm);
              µthis.set('signature', µthis.signature);


              window.clearInterval(waitIntervalID);
            }
            µthis.waitCount++;
          }, this.average);
          this.countIn++;
        }
        console.warn(this.timeIntervals);
      }
      else if(RMS > 0.05 && this.isRecording) {
        _.each(this.get('stage').models, function(hTrack) {
          if($('#hTrack'+hTrack.cid).hasClass('selected')) {
            console.log(hTrack.get('currentBeat'));
            var measuresCollection = hTrack.get('measures');
            _.each(measuresCollection.models, function(measure) {
              var beatsCollection = measure.get('beats');
              var beat = beatsCollection.at(hTrack.get('currentBeat'));
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
    processKeyboardTapping: function(time) {
      this.totals = 0;
      // If we are still tapping, and are still recording (isWaiting = true)
      if(this.isWaiting) {
        // console.log('elapsed time: ' + elapsedTime);
        this.prevTime = time;
        //On the first beat
        if(this.countIn == 1) {
          this.isTapping = true;
          this.startTime = time;
          console.log('Start time: ' + this.startTime);
          this.previousTime = time;
          this.countIn++;
          this.signature++;
          console.log('Beats in Measure = ' + this.signature);
          console.log('average in ms: ' + 'CAN\'T MEASSURE WITH ONE BEAT' + ' || average in BPM: ' + 'CAN\'T MEASSURE WITH ONE BEAT');
        }
        // As long as we are still tapping, but not on the first beat
        else {
          // Beat Count
          this.signature++;
          //Reset the wait counter since a beat was detected
          this.waitCount = 0;
          console.log('Beats in Measure = ' + this.signature);

          // BPM in ms and min
          var currentTime = new Date().getTime();
          this.timeIntervals.push(currentTime - this.previousTime);
          this.previousTime = currentTime;
          this.lastTimeDelta = currentTime - this.previousTime;
          var songTotalTimeDuration = 0;
          for(var i = 0; i < this.timeIntervals.length; i++) {
            songTotalTimeDuration += this.timeIntervals[i];
          }
          this.average = songTotalTimeDuration / this.timeIntervals.length;
          console.log('average in ms: ' + this.average + ' || average in BPM: ' + 60*1000/this.average);

          // Waiting for the listener to stop tapping
          if(window.waitIntervalID) {
            window.clearInterval(window.waitIntervalID);
            this.waitCount = 0;
          }
          var µthis = this;
          window.waitIntervalID = window.setInterval(function() {
            // If the user stops beating for *n* times, we stop listening to the tapping automatically
            // *n* is represented by µthis.waitCount
            console.warn('waitCount: ' + µthis.waitCount);
            console.warn(µthis.isTapping + ' ' + µthis.isWaiting);
            if(µthis.waitCount == 2) {
              µthis.isWaiting = false;
              µthis.waitCount = 0;

              µthis.mainCounter = 0;
              µthis.isRecording = true;
              for(var i = 0; i < µthis.signature; i++) {
                µthis.finalMeasureBeatTimeIntervals50.push(µthis.roundTo50(µthis.timeIntervals[i]));
                µthis.finalMeasureBeatTimeIntervals100.push(µthis.roundTo100(µthis.timeIntervals[i]));
                µthis.finalMeasureBeatTimeIntervals150.push(µthis.roundTo150(µthis.timeIntervals[i]));
                µthis.finalMeasureBeatTimeIntervals200.push(µthis.roundTo200(µthis.timeIntervals[i]));
                µthis.finalMeasureBeatTimeIntervals250.push(µthis.roundTo250(µthis.timeIntervals[i]));
                µthis.beatArray[i] = 0;
              }
              // µthis.finalMeasureBeatTimeIntervals[µthis.finalMeasureBeatTimeIntervals.length-1] = µthis.roundTo100(µthis.lastTimeDelta);
              console.warn(µthis.finalMeasureBeatTimeIntervals100);
              // [0, 800, 200, 1000, 800, 700] 
              var mdc = function(o){
                  if(!o.length)
                      return 0;
                  for(var r, a, i = o.length - 1, b = o[i]; i;)
                      for(a = o[--i]; r = a % b; a = b, b = r);
                  return b;
              };

              var diffBeats = [];
              //var beats = [ 0, 800, 200, 1000, 800, 800 ];
              var beats = µthis.finalMeasureBeatTimeIntervals100;

              //Greatest Common Divisor of the beats
              var gcd = mdc(beats);

              for (var i=0 ; i<beats.length ; i++) {
                  if(i==0){
                      diffBeats.push('ON');
                  } else {
                      var rests = (beats[i]/gcd == 0) ? 0 : beats[i]/gcd-1 ;
                      for (var j= 0 ; j<rests ; j++) {
                          diffBeats.push('OFF');
                      }
                      diffBeats.push('ON');
                  }
              }
              diffBeats.splice(16);
              console.log(diffBeats);

              // TODO Replace these events
              // dispatch.trigger('signatureChange.event', µthis.signature);

              //show the BPM
              var bpm = 1000 / µthis.average * 60;

              // TODO Replace these events
              // dispatch.trigger('instrumentTempoRecorded', {instrument:'hh', beatPattern:diffBeats, bpm:bpm});

              µthis.isTapping = false;
              µthis.countIn = 1;
              µthis.set('baseTempo', bpm);
              // µthis.set('tempo', bpm);
              µthis.set('signature', µthis.signature);
              // $('#tap-tempo').click();
              $('#tempo-slider-input').val(1);

              µthis.stopRecording();

              window.clearInterval(waitIntervalID);
            }
            µthis.waitCount++;
          }, this.average);
          this.countIn++;
        }
        console.warn(this.timeIntervals);
      }
      else if(this.isRecording) {
        _.each(this.get('stage').models, function(hTrack) {
          if($('#hTrack'+hTrack.cid).hasClass('selected')) {
            console.log(hTrack.get('currentBeat'));
            var measuresCollection = hTrack.get('measures');
            _.each(measuresCollection.models, function(measure) {
              var beatsCollection = measure.get('beats');
              var beat = beatsCollection.at(hTrack.get('currentBeat'));
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
      if(this.TransportModel.isPlaying) {
        // TODO Replace these events
        // dispatch.trigger('togglePlay.event');
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
        var µthis = this;
        navigator.webkitGetUserMedia({audio: true}, function(stream) {
          var microphone = µthis.context.createMediaStreamSource(stream);
          µthis.microphone = microphone;
          µthis.micGain = µthis.context.createGain();
          µthis.micGain.gain = µthis.micLevel;
          µthis.jsNode = µthis.context.createScriptProcessor(512, 2, 2);
          µthis.microphone.connect(µthis.micGain);
          µthis.microphone.connect(µthis.context.destination);   
          µthis.micGain.connect(µthis.jsNode);
          µthis.jsNode.connect(µthis.context.destination);
          µthis.prevTime = new Date().getTime();
          µthis.jsNode.onaudioprocess = (function() {
            return function(e) {
              µthis.analyze(e);
            };
          }());
          µthis.waveform = new Float32Array(µthis.jsNode.bufferSize);   
        }, this.onFailSoHard);
      } 
      else {
        alert('getUserMedia() is not supported in your browser');
      }
    },

    recordButtonClicked: function() {
      console.log('Tap Tempo Clicked');
      if(this.TransportModel.isPlaying) {
        // TODO Replace these events
        // dispatch.trigger('togglePlay.event');
      }
      $('#conductor').click();
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
        var µthis = this;
        navigator.webkitGetUserMedia({audio: true}, function(stream) {
          var microphone = µthis.context.createMediaStreamSource(stream);
          µthis.microphone = microphone;
          µthis.micGain = µthis.context.createGain();
          µthis.micGain.gain = µthis.micLevel;
          µthis.jsNode = µthis.context.createScriptProcessor(512, 2, 2);
          µthis.microphone.connect(µthis.micGain);
          µthis.microphone.connect(µthis.context.destination);
          µthis.micGain.connect(µthis.jsNode);
          µthis.jsNode.connect(µthis.context.destination);
          µthis.prevTime = new Date().getTime();
          µthis.jsNode.onaudioprocess = (function() {
            return function(e) {
              µthis.analyze(e);
            };
          }());
          µthis.waveform = new Float32Array(µthis.jsNode.bufferSize);   
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
      this.timeIntervals = [0];
      this.isTapping = false;
      this.isRecording = false;
      this.beatArray = new Array();
      this.waitCount = 0;
      this.isWaiting = true;
      if(this.microphone) { this.microphone.disconnect(); }
      if(this.jsNode) { this.jsNode.disconnect(); }
      if(this.micGain) { this.micGain.disconnect(); }

      // If the waitIntervalID or tapIntervalID exist, clear them
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
    },

    roundTo50: function(x){
      return (x % 50) >= 25 ? parseInt(x / 50) * 50 + 50 : parseInt(x / 50) * 50;
    },
    roundTo100: function(x){
      return (x % 100) >= 50 ? parseInt(x / 100) * 100 + 100 : parseInt(x / 100) * 100;
    },
    roundTo150: function(x){
      return (x % 150) >= 75 ? parseInt(x / 150) * 150 + 150 : parseInt(x / 150) * 150;
    },
    roundTo200: function(x){
      return (x % 200) >= 100 ? parseInt(x / 200) * 200 + 200 : parseInt(x / 200) * 200;
    },
    roundTo250: function(x){
      return (x % 250) >= 125 ? parseInt(x / 250) * 250 + 250 : parseInt(x / 250) * 250;
    }
  });
  // This is a Singleton
  return new State();
});