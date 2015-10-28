//filename: backbone/models/state.js
/*
  This is where most of the audio processing happens
*/

define([
  'underscore',
  'bbone',
  'backbone/models/conductor',
  'logging'
], function(_, Backbone, ConductorModel, Logging) {
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
      this.finalMeasureBeatTimeIntervals50 = [];
      this.finalMeasureBeatTimeIntervals100 = [];
      this.finalMeasureBeatTimeIntervals150 = [];
      this.finalMeasureBeatTimeIntervals200 = [];
      this.finalMeasureBeatTimeIntervals250 = [];

      this.context = new window.AudioContext();

      this.on('recordTempoAndPattern', this.recordTempoAndPattern, this);
    },
    turnIsWaitingOn: function(){
      // this.isTapping = true;
      this.set('isWaiting',  true);
    },
    turnIsWaitingOff: function(){
      // this.set('isTapping', false);
      this.set('isWaiting', false);
    },
    recordTempoAndPatternByTapping: function(instrument) {
      console.log('recordTempoAndPatternByTapping function in state');
      console.log('Instrument type: '+ instrument);
      this.set('instrumentTypeBeingRecorded', instrument);
      if(ConductorModel.get('isPlaying')) {
        ConductorModel.stop();
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
      console.log('recordTempoAndPatternByKeyboard function in state');
      if(this.isWaiting){
        this.processKeyboardTapping(time);
      } else {
        console.log('we are not listening to taps');
      }
      // this.signature = 0;
    },
    manualWaveform: function(type) {
      console.log('getting into process manual waveform');
      var gcmBeatPattern = ["ON", "ON", "ON"];
      var gcmBeatTimesPattern = [0, 200, 200];
      this.trigger('instrumentTempoRecorded', {
        instrument: type,
        beatPattern: gcmBeatPattern,
        beatTimesPattern: gcmBeatTimesPattern,
        bpm: 430.622,
        totalTimeMeasurePlaysInMilliseconds: 600
      });
    },
    processWaveform: function(time, waveform) {
      if(time - this.startRecordingTime >= 10000) { 
        this.stopRecording();
        console.error('need to process what we have');
        Logging.logStorage('Song was recorded longer than 10 seconds');
      }

      this.totals = 0;
      // Waveform.length = 512  ¿ I think this means we listen to 512 partitions per second?
      for(var i = 0; i < waveform.length; i++) {
        this.totals += waveform[i] * waveform[i];
      }
      this.totals = this.totals / waveform.length;
      var RMS = Math.sqrt(this.totals);
      // console.warn('Time: ' + time + ' RMS: ' + RMS);
      // console.warn(this.prevTime);

      // elapsed time since last beat analysis in ms
      var elapsedTime = time - this.prevTime;

      // If we are still tapping, and are still recording (isWaiting = true), and the RMS is greater than .05
      if(RMS > 0.05 && (elapsedTime > 200) && this.isTapping && this.isWaiting) {
        console.log('RMS = ' + RMS);
        console.log('elapsed time: ' + elapsedTime);
        this.prevTime = time;

        // find the instrument that was recording, and get the metronome tapping circle in the audio representation
        var target = ($('.recording').parent().find('svg .metronome-tap'));
        var dur = 200;
        var d3Target = d3.select(target);
        var originalOpacity = parseFloat($('.recording').parent().find('svg .metronome-tap').attr('fill-opacity'))
        var newOpacity = 1;

        d3Target.transition()
          .duration(dur)
          .attr('fill-opacity', newOpacity)
          // .attr('fill', newFillColor )
          .transition()                               // a new transition!
            .attr('fill-opacity', originalOpacity )  // we could have had another
            .duration(dur)

        //On the first beat
        if(this.countIn == 1) {
          var newCurrentTime = new Date().getTime();
          this.startRecordingTime = newCurrentTime;
          console.log('Start time: ' + this.startRecordingTime);
          this.previousTime = newCurrentTime;
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
          this.timeIntervals.push(time - this.previousTime);
          this.previousTime = time;
          var songTotalTimeDuration = 0;
          for(var i = 0; i < this.timeIntervals.length; i++) {
            songTotalTimeDuration += this.timeIntervals[i];
          }
          this.average = songTotalTimeDuration / this.timeIntervals.length;
          console.log('average in ms: ' + this.average + ' || average in BPM: ' + 60*1000/this.average);

          // If there was already a waitInterval, we need to clear it and reset it for another new recording
          if(window.waitIntervalID) {
            window.clearInterval(window.waitIntervalID);
            this.waitCount = 0;
          }

          // Waiting for the listener to stop tapping
          var µthis = this;
          window.waitIntervalID = window.setInterval(function() {
            // If the user stops beating for *n* times, we stop listening to the tapping automatically
            // *n* is represented by µthis.waitCount
            console.warn('waitCount: ' + µthis.waitCount);
            // As soon as we have waited 2 times the average beat duration, we stop
            // Or if the total time is greater than 10 seconds
            // if(µthis.waitCount == 2 ) {
            if(µthis.waitCount == 2 || µthis.startRecordingTime-time >= 10000 ) {
              µthis.isWaiting = false;
              µthis.waitCount = 0;

              µthis.mainCounter = 0;
              µthis.isRecording = true;
              µthis.finalMeasureBeatTimeIntervals50 = [];
              µthis.finalMeasureBeatTimeIntervals100 = [];
              µthis.finalMeasureBeatTimeIntervals150 = [];
              µthis.finalMeasureBeatTimeIntervals200 = [];
              µthis.finalMeasureBeatTimeIntervals250 = [];

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

              var gcmBeatPattern = [];
              var gcmBeatTimesPattern = [];
              //var beats = [ 0, 800, 200, 1000, 800, 800 ];
              var roundedBeatPatternArray = µthis.finalMeasureBeatTimeIntervals100;

              //Greatest Common Divisor of the beats
              var gcm = mdc(roundedBeatPatternArray);

              for (var i=0 ; i<roundedBeatPatternArray.length ; i++) {
                if(i==0){
                  gcmBeatPattern.push('ON');
                  gcmBeatTimesPattern.push(0);
                } else {
                  // For the middle beats
                  if(i!==roundedBeatPatternArray.length) {
                    // count how many rests there are given the GCM of the beat pattern
                    var rests = (roundedBeatPatternArray[i]/gcm == 0) ? 0 : roundedBeatPatternArray[i]/gcm-1 ;
                    // For each rest that there is, put a rest beat in its place
                    for (var j= 0 ; j<rests ; j++) {
                      gcmBeatPattern.push('OFF');
                      gcmBeatTimesPattern.push(gcm);
                    }
                    // Since we need to add the beat we are on, add it to the end
                    gcmBeatPattern.push('ON');
                    gcmBeatTimesPattern.push(gcm);
                  // For the last beat that we noticed recording in the roundedBeatPatternArray
                  } else {
                    gcmBeatPattern.push('ON');
                    gcmBeatTimesPattern.push(gcm);                    
                    // If we want to add some time to the end of the, we would add it  
                    // HERE
                  }
                }
              }
              console.log('pre:: ', gcmBeatPattern);
              var postGcmBeatPattern = $.extend(true, [], gcmBeatPattern);
              // Get the first 16
              postGcmBeatPattern.length > 16 ? postGcmBeatPattern.length = 16 : postGcmBeatPattern.length = postGcmBeatPattern.length;
              console.log('post: ', postGcmBeatPattern);
              console.log(gcmBeatTimesPattern);
              console.log(gcmBeatPattern.length);;
              console.log(postGcmBeatPattern.length);
              if(gcmBeatPattern.length > postGcmBeatPattern.length) {
                console.log('trimmed down to 16 beats from ' + gcmBeatPattern.length);
                Logging.logStorage(µthis.timeIntervals.length + ' beats were tapped normalized to ' + gcmBeatPattern.length + ' beats and we trimmed them down to ' + postGcmBeatPattern.length);
              }

              console.log('gcm: ', gcm);
              console.log('songTotalTimeDuration: ', songTotalTimeDuration);
              console.log('totalTimeMeasurePlaysInMilliseconds: ', gcmBeatTimesPattern.length * gcm);
              Logging.logStorage('Tapped song in Milliseconds: ' + songTotalTimeDuration + ' and total time recording plays in milliseconds: ' + gcmBeatTimesPattern.length * gcm);
              Logging.logStorage('Recording of song Greatest Common Multiple GCM is: ' + gcm);

              var bpm = 1000 / µthis.average * 60;
              console.log('bpm: ' + bpm);
              µthis.stopRecording();
              µthis.trigger('instrumentTempoRecorded', {
                instrument: µthis.get('instrumentTypeBeingRecorded'),
                beatPattern: postGcmBeatPattern,
                beatTimesPattern: gcmBeatTimesPattern,
                bpm:bpm,
                totalTimeMeasurePlaysInMilliseconds: gcmBeatTimesPattern.length * gcm
              });

              µthis.isTapping = false;
              µthis.countIn = 1;
              µthis.set('tempo', bpm);
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

              //show the BPM
              var bpm = 1000 / µthis.average * 60;

              µthis.isTapping = false;
              µthis.countIn = 1;
              µthis.set('tempo', bpm);
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
    analyze: function(e){
      var time = e.timeStamp;
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

      // Let the measureRepView know that we are stopping so the view can update the microphone button
      this.trigger('recordingComplete');

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