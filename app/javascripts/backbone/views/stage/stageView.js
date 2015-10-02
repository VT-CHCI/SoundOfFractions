// Filename: views/stage/stageView.js
/*
  This is the StageView, that represents the entire drum kit.
*/
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/collections/beats',
  'backbone/collections/measures',
  'backbone/collections/representations',
  'backbone/collections/stage',
  'backbone/models/beat',
  'backbone/models/measure',
  'backbone/models/hTrack',
  'backbone/models/representation',
  'backbone/models/state',
  'backbone/models/conductor',
  'backbone/models/remainingInstrumentGenerator',
  'backbone/views/button/remainingInstrumentGeneratorView',
  'backbone/views/hTrack/hTrackView',
  'general/lookupInstrument',
  'logging',
  'text!backbone/templates/hTrack/hTrack.html'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, RepresentationsCollection, StageCollection, BeatModel, MeasureModel, HTrackModel, RepresentationModel, StateModel, ConductorModel, RemainingInstrumentGeneratorModel, RemainingInstrumentGeneratorView, HTrackView, LookupInstrument, Logging, HTrackTemplate){
  var StageView = Backbone.View.extend({
    el: $('#sof-stage-area'),

    initialize: function(){
      console.info('stage view initialize')
      this.stageCollection = StageCollection;
      // set the song's conductor
      Logging.initialize();
      this.conductor = ConductorModel;
      this.masterAudioContext = new AudioContext();
      
      // Dispatch handlers

      // TODO Replace these events
      // dispatch.on('instrumentDeletedFromCompositionArea.event', this.deleteInstrument, this);
      StateModel.on('instrumentTempoRecorded', this.replaceInstrumentWithRecordedPattern, this);
      // StateModel.on('instrumentTempoRecorded', this.addInstrumentWithRecordedPattern, this);

      StateModel.set('stageCollection', this.stageCollection);
      
      // Per SO? http://stackoverflow.com/questions/9522845/backbone-js-remove-all-sub-views
      this.childViews = [];

      this.render();

      // Listeners
      // When an instrument is clicked in the Genrerator, we call this function to compile and add it
      this.listenTo(RemainingInstrumentGeneratorModel, 'removedInstrumentFromUnused', this.addFromGeneratorModel);

      this.listenTo(this.stageCollection, 'add remove', this.turnPlayingOff);

      // allow the letter t to click the first transition
      $(document).bind('keypress', this.manualPress);

      // This kicks off and adds the snare to the 
      RemainingInstrumentGeneratorModel.removeInstrumentFromUnused({type:'sn'});
      // RemainingInstrumentGeneratorModel.removeInstrumentFromUnused({type:'hh'});
      // this.makeInstrumentFromScratch({type:'sn'});
      // RemainingInstrumentGeneratorModel.removeInstrumentFromUnused({type:'sn'});
      
      this.makeChildrenHTracks();
    },
    turnPlayingOff: function(){
      if(ConductorModel.get('isPlaying')){
        ConductorModel.stop();
        Logging.logStorage('The music was playing when the HTrack was added/deleted');
      }
    },

    render: function(){
      console.info('StageView render start');
      this.$el.append('<div id="instruments-collection"></div>');
    },
    makeChildHTrack: function(hTrack){
      console.info('hTrack: ', hTrack);
      //create a hTrack view.
      var hTrackChildView = new HTrackView({
        model: hTrack,
        masterAudioContext: this.masterAudioContext
      });
      this.childViews.push(hTrackChildView)
    },
    makeChildrenHTracks: function() {
      //we have to render each one of our hTrack's.
      _.each(this.stageCollection.models, function(hTrack) {
        this.makeChildHTrack(hTrack);
      }, this);
    },
    replaceInstrumentWithRecordedPattern: function(options) {
      var µthis = this;
      _.each(this.stageCollection.collection.models, function(htrackModel){
        if(htrackModel.get('type') === options.instrument){
          // Make a beatsCollection
          htrackModel.get('measures').models[0].set('beatsCollection', µthis.setUpManualBeatsCollection(options) );
          htrackModel.trigger('resetRepresentations');
        }
      })
    },
    // addInstrument With Pattern
    addInstrumentWithRecordedPattern: function(options) {
      // 
    },
    makeInstrumentFromScratch: function(options) {
      console.info('makeInstrumentFromScratch options: ', options)
      // set up the measures, measureReps, and beats for an instruments-collection
      this.setUpMMB();

      // Add an instrument model to the stage Collection
      var newInstrumentToAdd = {
        label: LookupInstrument.getDefault(options.type, 'label'),
        type: LookupInstrument.getDefault(options.type, 'type'),
        img: LookupInstrument.getDefault(options.type, 'image'),
        gain: LookupInstrument.getDefault(options.type, 'gain'),
        sample: LookupInstrument.getDefault(options.type, 'sample'),
        measures: this.manuallyCreatedMeasuresCollection,
        signature: this.manuallyCreatedMeasuresCollection.models[0].get('beats').length,
        active: true,
        tempo: 120 //bpm
      };
      this.stageCollection = StageCollection.add(newInstrumentToAdd);
      this.makeChildHTrack(StageCollection.last());
    },
    addFromGeneratorModel: function(options){
      // Add an instrument model to the stage Collection
      this.setUpMMB();
      if(RemainingInstrumentGeneratorModel.get('unusedInstruments').length == 2){
        var insertedMeasuresCollection = this.manuallyCreatedMeasuresCollection;
      } else {
        var insertedMeasuresCollection = this.secondManuallyCreatedMeasuresCollection;
      }
      var newInstrumentToAdd = {
        label: LookupInstrument.getDefault(options.type, 'label'),
        type: LookupInstrument.getDefault(options.type, 'type'),
        img: LookupInstrument.getDefault(options.type, 'image'),
        gain: LookupInstrument.getDefault(options.type, 'gain'),
        sample: LookupInstrument.getDefault(options.type, 'sample'),
        measures: insertedMeasuresCollection,
        signature: insertedMeasuresCollection.models[0].get('beatsCollection').length,
        active: true,
        tempo: 120 //bpm
      };

      this.stageCollection = StageCollection.add(newInstrumentToAdd);

      this.makeChildHTrack(StageCollection.last());
    },
    setUpMMB: function(){
      // This is for the initial instrument to be set up
        // this creates 1 measure, and addes beats and the representations to itself
        this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
        //for each beat - also change signature below
        for (var i = 0; i < 15; i++) {
          if (i == 0 || i == 2 || i == 4 || i == 6 || i == 8 || i == 10 || i == 12 || i == 14 ){
            this.manuallyCreatedMeasureBeatsCollection.add([{selected: true}]);
          } else {
            this.manuallyCreatedMeasureBeatsCollection.add([{selected: false}]);
            // this.manuallyCreatedMeasureBeatsCollection.add();
          }
        }
        //make a collection
        this.manuallyCreatedMeasureRepresentationCollection = new RepresentationsCollection;
        // add an audio rep
        this.manuallyCreatedRepresentationModel = new RepresentationModel({
          currentRepresentationType:'audio', 
          beatsCollection:this.manuallyCreatedMeasureBeatsCollection
        });
        this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
        // add a bead rep
        this.secondManuallyCreatedRepresentationModel = new RepresentationModel({
          currentRepresentationType:'bead',
          beatsCollection:this.manuallyCreatedMeasureBeatsCollection
        });
        this.manuallyCreatedMeasureRepresentationCollection.add(this.secondManuallyCreatedRepresentationModel);
        // // add a line rep
        // this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'line', beatsCollection:this.manuallyCreatedMeasureBeatsCollection});
        // this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
        // // add a pie rep
        // this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'pie', beatsCollection:this.manuallyCreatedMeasureBeatsCollection});
        // this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
        // // add a bar rep
        // this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'bar', beatsCollection:this.manuallyCreatedMeasureBeatsCollection});
        // this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);

        // Create a Measures Collection, and add the beats and representations
        this.manuallyCreatedMeasuresCollection = new MeasuresCollection;
        this.parentMeasureModel = new MeasureModel({
          beatsCollection: this.manuallyCreatedMeasureBeatsCollection,
          measureRepresentations: this.manuallyCreatedMeasureRepresentationCollection          
        });
        this.manuallyCreatedMeasuresCollection.add(this.parentMeasureModel);
        this.manuallyCreatedRepresentationModel.addParentMeasureModelAfter(this.parentMeasureModel);
        this.secondManuallyCreatedRepresentationModel.addParentMeasureModelAfter(this.parentMeasureModel);
      // This is for subsequent instruments when added
        this.secondManuallyCreatedMeasureBeatsCollection = new BeatsCollection;
        //for each beat - also change signature below
        for (var i = 0; i < 4; i++) {
          if (i == 0 || i == 2 || i == 4 || i == 6 || i == 7){
            this.secondManuallyCreatedMeasureBeatsCollection.add([{selected: true}]);
          } else {
            this.secondManuallyCreatedMeasureBeatsCollection.add([{selected: false}]);
            // this.secondManuallyCreatedMeasureBeatsCollection.add();
          }
        }
        this.secondManuallyCreatedMeasuresCollection = new MeasuresCollection;
        this.secondManuallyCreatedMeasuresCollection.add({
          beatsCollection: this.secondManuallyCreatedMeasureBeatsCollection, measureRepresentations: this.manuallyCreatedMeasureRepresentationCollection});

    },
    // This is for replacing a beats collection when it is recorded
    setUpManualBeatsCollection: function(options){
      // this creates 1 measure, and adds beats and the representations to itself
      this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
      //for each beat - also change signature below
      for (var i = 0; i < options.beatPattern.length; i++) {
        if (options.beatPattern[i] == 'ON'){
          this.manuallyCreatedMeasureBeatsCollection.add([{selected: true}]);
        } else {
          this.manuallyCreatedMeasureBeatsCollection.add([{selected: false}]);
          // this.manuallyCreatedMeasureBeatsCollection.add();
        }
      }
      return this.manuallyCreatedMeasureBeatsCollection;
    },
    // We want to delete an instrument from the view, as well as add it to the instrument generator
    deleteInstrument: function(instrument) {
    },
    subRender: function() {
      // used if we want to render a portion of this view...
      $('#sample-messages').html('subre');
    },
    close: function(){
      console.info('in stageView close function');
      $(document).unbind('keypress', this.manualPress);
      this.remove();
      this.unbind();
      this.closeChildren();
    },
    closeChildren: function(){
      // handle other unbinding needs, here
      _.each(this.childViews, function(childView){
        console.log('in measureView close function, CLOSING CHILDREN');
        // If the childView has a close() method, then use it, to close it's children
        if (childView.close){
          childView.close();
        }
      })
    },
    manualPress: function(e) {
      // t = 116, d = 100, w = 119, o = 111
      if(!$('.modal-content:visible').length){
        if (e.keyCode === 116) {
          if(!$('.measureRep:nth-child(2)').hasClass('transition-rep')){      
            $('.measureRep:nth-child(2)').addClass('transition-rep')
          } else {
            $('.measureRep:nth-child(2)').removeClass('transition-rep')
          }
        }
      }
    }
  });
  // A singleton
  return new StageView();
});


