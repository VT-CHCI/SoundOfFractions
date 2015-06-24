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
      // debugger;
      Logging.initialize();
      // Logging.initialize(this.stageCollection);
      this.conductor = ConductorModel;
      this.masterAudioContext = new AudioContext();
      
      // Dispatch handlers

      // TODO Replace these events
      // dispatch.on('instrumentDeletedFromCompositionArea.event', this.deleteInstrument, this);
      // dispatch.on('newInstrumentTempoRecorded', this.addInstrument, this);

      StateModel.set('stageCollection', this.stageCollection);
      
      // Per SO? http://stackoverflow.com/questions/9522845/backbone-js-remove-all-sub-views
      this.childViews = [];

      this.render();

      // Listeners
      // When an instrument is clicked in the Genrerator, we call this function to compile and add it
      this.listenTo(RemainingInstrumentGeneratorModel, 'removedInstrumentFromUnused', this.addFromGeneratorModel);

      // This kicks off and adds the snare to the 
      RemainingInstrumentGeneratorModel.removeInstrumentFromUnused({type:'sn'});
      
      this.makeChildrenHTracks();
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
    // addInstrument With Pattern
    addInstrumentWithPattern: function(options) {
    },
    makeInstrumentFromScratch: function(options) {
      console.info('makeInstrumentFromScratch options: ', options)
      // set up the measures, measureReps, and beats for an instruments-collection
      this.setUpMMB();

      // Add an instrument model to the stage Collection
      var newInstrumentToAdd = {
        label: LookupInstrument.getDefault(options.instrument, 'label'),
        type: LookupInstrument.getDefault(options.instrument, 'type'),
        img: LookupInstrument.getDefault(options.instrument, 'image'),
        gain: LookupInstrument.getDefault(options.instrument, 'gain'),
        sample: LookupInstrument.getDefault(options.instrument, 'sample'),
        measures: this.manuallyCreatedMeasuresCollection,
        signature: this.manuallyCreatedMeasuresCollection.models[0].get('beats').length,
        active: true,
        tempo: 120 //bpm
      };
      this.stageCollection = StageCollection.add(newInstrumentToAdd);
    },
    addFromGeneratorModel: function(options){
      // Add an instrument model to the stage Collection
      this.setUpMMB();
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
    setUpMMB: function(){
      // this creates 1 measure, and addes beats and the representations to itself
      this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
      //for each beat - also change signature below
      for (var i = 0; i < 9; i++) {
        if (i == 0 || i == 2 || i == 4 || i == 6 || i == 7){
          this.manuallyCreatedMeasureBeatsCollection.add([{selected: true}]);
        } else {
          this.manuallyCreatedMeasureBeatsCollection.add([{selected: false}]);
          // this.manuallyCreatedMeasureBeatsCollection.add();
        }
      }
      //make a collection
      this.manuallyCreatedMeasureRepresentationCollection = new RepresentationsCollection;
      // add an audio rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'audio', sisterBeatsCollection:this.manuallyCreatedMeasureBeatsCollection});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // add a bead rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'bead', sisterBeatsCollection:this.manuallyCreatedMeasureBeatsCollection});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // // add a line rep
      // this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'line', sisterBeatsCollection:this.manuallyCreatedMeasureBeatsCollection});
      // this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // // add a pie rep
      // this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'pie', sisterBeatsCollection:this.manuallyCreatedMeasureBeatsCollection});
      // this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // // add a bar rep
      // this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'bar', sisterBeatsCollection:this.manuallyCreatedMeasureBeatsCollection});
      // this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);

      // Create a Measures Collection, and add the beats and representations
      this.manuallyCreatedMeasuresCollection = new MeasuresCollection;
      this.manuallyCreatedMeasuresCollection.add({
        beats: this.manuallyCreatedMeasureBeatsCollection, measureRepresentations: this.manuallyCreatedMeasureRepresentationCollection});
    },
    // We want to delete an instrument form the view, as well as from the instrument generator
    deleteInstrument: function(instrument) {
    },
    subRender: function() {
      // used if we want to render a portion of this view...
      $('#sample-messages').html('subre')
    },
    close: function(){
      console.info('in stageView close function');
      this.remove();
      this.unbind();
      // handle other unbinding needs, here
      _.each(this.childViews, function(childView){
        console.log('in measureView close function, CLOSING CHILDREN');
        // If the childView has a close() method, then use it, to close it's children
        if (childView.close){
          childView.close();
        }
      })
    }
  });
  // A singleton
  return new StageView();
});


