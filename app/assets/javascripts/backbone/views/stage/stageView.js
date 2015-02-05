// Filename: views/stage/stageView.js
/*
  This is the StageView, that represents the entire drum kit.
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
  'backbone/models/state',
  'backbone/models/conductor',
  'backbone/views/button/remainingInstrumentGeneratorView',
  'backbone/views/hTrack/hTrackView',
  'text!backbone/templates/hTrack/hTrack.html'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, RepresentationsCollection, StageCollection, BeatModel, MeasureModel, HTrackModel, RepresentationModel, StateModel, ConductorModel, RemainingInstrumentGeneratorView, HTrackView, HTrackTemplate){
  var StageView = Backbone.View.extend({
    el: $('#sof-stage-area'),

    initialize: function(){
      this.stage = StageCollection;
      // set the song's conductor
      this.conductor = ConductorModel;

      //this is creating the snare hTrack.

      // this creates 1 measure, and addes beats and the representations to itself
      this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
      //for each beat - also change signature below
      for (var i = 0; i < 6; i++) {
        // this.manuallyCreatedMeasureBeatsCollection.add([{selected: true}]);
        if (i == 0){
          this.manuallyCreatedMeasureBeatsCollection.add([{selected: true}]);
        } else {
          this.manuallyCreatedMeasureBeatsCollection.add([{selected: false}]);
          // this.manuallyCreatedMeasureBeatsCollection.add();
        }
      }
      //make a collection
      this.manuallyCreatedMeasureRepresentationCollection = new RepresentationsCollection;
      // add an audio rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'audio', numberOfBeats: this.manuallyCreatedMeasureBeatsCollection.length});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // add a bead rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'bead', numberOfBeats: this.manuallyCreatedMeasureBeatsCollection.length});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // add a line rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'line', numberOfBeats: this.manuallyCreatedMeasureBeatsCollection.length});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // add a pie rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'pie', numberOfBeats: this.manuallyCreatedMeasureBeatsCollection.length});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);
      // add a bar rep
      this.manuallyCreatedRepresentationModel = new RepresentationModel({currentRepresentationType:'bar', numberOfBeats: this.manuallyCreatedMeasureBeatsCollection.length});
      this.manuallyCreatedMeasureRepresentationCollection.add(this.manuallyCreatedRepresentationModel);

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
        gain: 1,
        measures: this.manuallyCreatedMeasuresCollection,
        signature: this.manuallyCreatedMeasuresCollection.models[0].get('beats').length,
        active: true,
        tempo: 120 //bpm
      });

      // Dispatch handlers

      // TODO Replace these events
      // dispatch.on('instrumentAddedToCompositionArea.event', this.addInstrument, this);
      // dispatch.on('instrumentDeletedFromCompositionArea.event', this.deleteInstrument, this);
      // dispatch.on('newInstrumentTempoRecorded', this.addInstrument, this);

      StateModel.set('stage', this.stage);
      this.masterAudioContext = new AudioContext();

      // Per SO? http://stackoverflow.com/questions/9522845/backbone-js-remove-all-sub-views
      this.childViews = [];
      
      this.render();

      //we have to render each one of our hTrack's.
      _.each(this.stage.collection.models, function(hTrack) {

        //create a hTrack view.
        var hTrackChildView = new HTrackView({
          model: hTrack,
          // this.$() ONLY searches down the dom from this view
          el: '#instruments-collection', 
          masterAudioContext: this.masterAudioContext
        });
        this.childViews.push(hTrackChildView)
      }, this);

    },

    render: function(){
      console.log('StageView render start');
      this.$el.append('<div id="instruments-collection"></div>');
    },

    // addInstrumentWithPattern
    addInstrument: function(options) {
    },
    // We want to delete an instrument form the view, as well as from the instrument generator
    deleteInstrument: function(instrument) {
    },
    subRender: function() {
      // used if we want to render a portion of this view...
      $('#sample-messages').html('subre')
    },
    close: function(){
      console.log('in stageView close function');
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


