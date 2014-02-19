// Filename: views/stage/stageView.js
/*
  This is the StageView.
  This is the view that represents the entire drum kit.

  This is where the audio is initialized and played.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/beats',
  'backbone/collections/measures',
  'backbone/collections/representations',
  'backbone/collections/stage',
  'backbone/models/beat',
  'backbone/models/measure',
  'backbone/models/hTrack',
  'backbone/models/representation',
  'backbone/models/remainingInstrumentGenerator',
  'backbone/models/state',
  'backbone/models/conductor',
  'backbone/views/button/remainingInstrumentGeneratorView',
  'backbone/views/hTrack/hTrackView',
  'text!backbone/templates/hTrack/hTrack.html',
  'app/dispatch'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, RepresentationsCollection, StageCollection, BeatModel, MeasureModel, HTrackModel, RepresentationModel, RemainingInstrumentGeneratorModel, StateModel, ConductorModel, RemainingInstrumentGeneratorView, HTrackView, HTrackTemplate, dispatch){
  var StageView = Backbone.View.extend({
    el: $('#sof-composition-area'),

    initialize: function(){

      // set the song's unused instruments
      this.unusedInstrumentsModel = RemainingInstrumentGeneratorModel;

      this.stage = StageCollection;
      // set the song's conductor
      this.conductor = ConductorModel;

      //this is creating the snare hTrack.

      // this creates 1 measure, and addes beats and the representations to itself
      this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
      //for each beat - also change signature below
      for (var i = 0; i < 3; i++) {
        if (i == 0){
          this.manuallyCreatedMeasureBeatsCollection.add([{selected: true}]);
        } else {
          this.manuallyCreatedMeasureBeatsCollection.add();
        }
      }
      //make a collection
      this.manuallyCreatedMeasureRepresentationCollection = new RepresentationsCollection;
      // add an audio rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({representationType:'audio'});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // add a bead rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({representationType:'pie'});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // add a line rep
      // this.manuallyCreatedRepresentationModel = new RepresentationModel({representationType:'bead'});
      // this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // add a line rep
      // this.manuallyCreatedRepresentationModel = new RepresentationModel({representationType:'line'});
      // this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);

      // Create a Measures Collection, and add the beats and representations
      this.manuallyCreatedMeasuresCollection = new MeasuresCollection;
      this.manuallyCreatedMeasuresCollection.add({
        beats: this.manuallyCreatedMeasureBeatsCollection, measureRepresentations: this.manuallyCreatedMeasureRepresentationCollection});

      // Add an instrument to the stage
      this.stage = StageCollection.add({
        label: 'Snare',
        type: 'sn',
        img: 'snare.png',
        // mute: false,
        sample: '808_sn.m4a',
        gain: .2,
        measures: this.manuallyCreatedMeasuresCollection,
        signature: this.manuallyCreatedMeasuresCollection.models[0].get('beats').length,
        active: true,
        tempo: 120 //bpm
      });

      // Dispatch handlers
      dispatch.on('instrumentAddedToCompositionArea.event', this.addInstrument, this);
      dispatch.on('instrumentDeletedFromCompositionArea.event', this.deleteInstrument, this);
      dispatch.on('newInstrumentTempoRecorded', this.addInstrument, this);

      StateModel.set('stage', this.stage);
    },

    // This is for building a song from the database, after a user has saved a song
    build: function(song) {
      console.log('starting building...');
      console.log('song');
      console.warn(song);
      song.set('content', JSON.parse(song.get('content')));
      this.stage.reset();
      // console.log('song.get('content').stage');
      var stage = song.get('content').stage;
      console.log('var stage');
      console.warn(stage);
      for(var i = 0; i < stage.length; i++) {
        var hTrack = new HTrackModel();
        hTrack.set('label', stage[i].label);
        hTrack.set('type', stage[i].type);
        hTrack.set('img', stage[i].img);
        // hTrack.set('mute', stage[i].mute);
        hTrack.set('sample', stage[i].sample);
        hTrack.set('active', stage[i].active);
        hTrack.set('signature', stage[i].signature);
        hTrack.set('representation', stage[i].representation);
        var mC = new MeasuresCollection();
        for(var j = 0; j < stage[i].measures.length; j++) {
          var measureObj = stage[i].measures[j];
          var measure = new MeasureModel();
          measure.set('label', measureObj.label);
          measure.set('numberOfBeats', measureObj.numberOfBeats);
          measure.set('divisions', measureObj.divisions);
          var bC = new BeatsCollection();
          for(var k = 0; k < measureObj.beats.length; k++) {
            var beatObj = measureObj.beats[k];
            var beat = new BeatModel();
            beat.set('selected', beatObj.selected);
            bC.add(beat);
          }
          measure.set('beats', bC);
          mC.add(measure);
        }
        hTrack.set('measures', mC);
        console.log(hTrack);
        this.stage.add(hTrack);
      }
      this.render();
      console.log('done building');
      return this.stage;
    },

    render: function(options){
      if(options) {
        console.log('render: stageView.js with options');
        var counter = $('.hTrack').size();

        //compiling our template.
        var compiledTemplate = _.template( HTrackTemplate, {hTrack: this.stage.models[this.stage.models.length-1], type: this.stage.models[this.stage.models.length-1].get('type')} );
        $(this.el).append( compiledTemplate );

        //create a hTrack view.
        var hTrackView = new HTrackView({
          hTrack: this.stage.models[this.stage.models.length-1],
          el: '#hTrack-'+this.stage.models[this.stage.models.length-1].cid, 
          // gainNode: this.muteGainNodeList[counter],
          unusedInstrumentsModel: this.unusedInstrumentsModel,
          type: this.stage.models[this.stage.models.length-1].get('type')
        });
      } else {
        console.log('render: stageView.js');
        $(this.el).empty();

        var counter = 0;

        //we have to render each one of our `hTrack`s.
        _.each(this.stage.models, function(hTrack) {

          //compiling our template.
          var compiledTemplate = _.template( HTrackTemplate, {hTrack: hTrack, type: hTrack.get('type')} );
          $(this.el).append( compiledTemplate );

          //create a hTrack view.
          var hTrackView = new HTrackView({
            hTrack: hTrack,
            el: '#hTrack-'+hTrack.cid, 
            // gainNode: this.muteGainNodeList[counter],
            unusedInstrumentsModel: this.unusedInstrumentsModel,
            type: hTrack.get('type')
          });
          if(!hTrack.get('active')) {
            console.log('found a muted one');
            hTrackView.toggleMute();
          }
          counter++;
        }, this);

        // After all the instruments are rendered
        // Render the RemainingInstrumentGeneratorView
        var instrumentSelectorView = RemainingInstrumentGeneratorView;

        return this;
      }
    },

    // addInstrumentWithPattern
    addInstrument: function(options) {
      var tempo;
      //this is creating the new instrument htrack with a tempo from a recording
      if (options.beatPattern){
        // this creates 1 measure, and adds beats and the representations to itself
        this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
        //for each beat - also change signature below
        for (var i = 0; i < options.beatPattern.length; i++) {
          console.log(options.beatPattern[i])
          var beat = new BeatModel();
          if (options.beatPattern[i] == 'ON') {
            beat.set('selected', true);
          }
          this.manuallyCreatedMeasureBeatsCollection.add(beat);            
        }
        tempo = options.bpm;
      } else {
        //this is creating the new instrument htrack.

        // this creates 1 measure, and addes beats and the representations to itself
        this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
        //for each beat - also change signature below
        for (var i = 0; i < 2; i++) {
          if (i == 0){
            this.manuallyCreatedMeasureBeatsCollection.add([{selected: true}]);
          } else {
            this.manuallyCreatedMeasureBeatsCollection.add();
          }
        }
        tempo = 120;
      }
      // add an instrument rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({representationType:'audio'});
      // this.manuallyCreatedRepresentationModel.set('representationType', 'audio');
      this.manuallyCreatedMeasureRepresentationCollection = new RepresentationsCollection;
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      this.manuallyCreatedRepresentationModel = new RepresentationModel({representationType:'bead'});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);

      // Make a htrack
      this.manuallyCreatedMeasuresCollection = new MeasuresCollection;
      this.manuallyCreatedMeasuresCollection.add({
        beats: this.manuallyCreatedMeasureBeatsCollection, measureRepresentations: this.manuallyCreatedMeasureRepresentationCollection});

      var newInstrumentToAdd = {
        label: this.unusedInstrumentsModel.getDefault(options.instrument, 'label'),
        type: this.unusedInstrumentsModel.getDefault(options.instrument, 'type'),
        img: this.unusedInstrumentsModel.getDefault(options.instrument, 'image'),
        gain: this.unusedInstrumentsModel.getDefault(options.instrument, 'gain'),
        sample: this.unusedInstrumentsModel.getDefault(options.instrument, 'sample'),
        measures: this.manuallyCreatedMeasuresCollection,
        signature: this.manuallyCreatedMeasuresCollection.models[0].get('beats').length,
        active: true,
        tempo: tempo //bpm
      };

      this.stage = StageCollection.add(newInstrumentToAdd);

      this.render(newInstrumentToAdd);
    },

    // We want to delete an instrument form the view, as well as from the instrument generator
    deleteInstrument: function(instrument) {
      console.warn('in StageView deleteInstrument');
      console.log('deleting : ' + instrument.instrument);
      console.log('deleting : ' + instrument.model);
      dispatch.trigger('removeInstrumentToGeneratorModel.event', instrument.instrument);
      console.warn(this.stage);
      this.stage.remove(instrument.model);
      console.warn(this.stage);

      this.render();
    }
  });
  return new StageView();
});
