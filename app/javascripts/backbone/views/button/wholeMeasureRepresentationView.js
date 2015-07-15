// Filename: views/button/wholeMeasureRepresentationView.js
/*
  This is the RepButtonView.
  This renders the four-state radio button
  that controls which representation is displayed
  on the side of each hTrack.  
*/  
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/models/repButton',
  'backbone/models/representation',
  'backbone/models/conductor',
  'backbone/collections/stage',
  'text!backbone/templates/button/wholeMeasureRepresentation.html',
  'logging'
], function($, _, Backbone, RepButtonModel, RepresentationModel, ConductorModel, StageCollection, wholeMeasureRepresentationTemplate, Logging){

  var WholeMeasureRepresentationView = Backbone.View.extend({
    el : $("#measure-representation"), // Specifies the DOM element which this view handles

    firstRep: true,

    events : {
      'click .representation' : 'addOrTransition'
    },

    //simply creates the model.
    initialize: function() {
      this.repButtonModel = new RepButtonModel;

      // manually clicking
      _.bindAll(this, 'manuallPress');
      $(document).bind('keypress', this.manuallPress);

      this.render();
    },

    //no need to compile the template for this one.
    render: function() {
      $(this.el).html(wholeMeasureRepresentationTemplate);

      return this;
    },
    addOrTransition: function(e){
      var csLength = $('.cs').length;
      var trLength = $('.transition-rep').length;
      if (csLength == 1) {
        this.addRep(e);
      } else if (trLength == 1) {
        this.transitionRep(e);
      } else {
        // Just clicked with no transition or add clicked prior
        var newRepType = $(e.target).closest('.representation').attr('data-state');
        Logging.logStorage("Clicked a wmrv without clicking add or transition first.  Clicked: " + newRepType);
      }
    },
    addRep: function(e) {
      var newRepType = $(e.target).closest('.representation').attr('data-state');
      // find the plus sign with the class '.cs' and return the id of its hTrack
      var csLength = $('.cs').length;
      var trLength = $('.transition-rep').length;
      var oldRep = $('.transition-rep').closest('.measureRep').attr('data-representation');
      var hTrackID = $('.cs').closest('.hTrack').attr('id');
      var cid = hTrackID.slice(7);
      $('.cs').removeClass('cs'); 
      $('.spinner').remove(); 
      //trigger the Measure representation addition
      var beatsCollection = StageCollection.get(cid).get('measures').models[0].get('beatsCollection');
      var representationModel = new RepresentationModel({currentRepresentationType: newRepType, beatsCollection: beatsCollection});
      console.log('adding to the instrument/measure/measureRep');
      // updating the awaitingAdd to false, so the timeout reset of the cs doesn't get called
      StageCollection.get(cid).set('awaitingAdd', false);   
      // Currently forcing it to add to the first measure
      StageCollection.get(cid).get('measures').models[0].get('measureRepresentations').add(representationModel);   
      // dispatch.trigger('addMeasureRepresentation.event', { newRepType: newRepType, hTrackID: hTrackID, hTrack: cid} );
      // this.isFirstRep();
    },
    transitionRep: function(e){
      if(ConductorModel.get('isPlaying')) {
        ConductorModel.stop();
      }
      console.log('wmrv transitioning');
      var newRepType = $(e.target).closest('.representation').attr('data-state');
      // find the plus sign with the class '.cs' and return the id of its hTrack
      var hTrackID = $('.transition-rep').closest('.hTrack').attr('id');
      var hTrackCID = hTrackID.slice(7);//var HT_IDX = "whateverstring".length
      var measureRepIndex = $('.transition-rep').closest('.measureRep').index();//TODO: remove?
      var measureRepID = $('.transition-rep').closest('.measureRep').attr('id');
      var measureRepCID = measureRepID.slice(12);
      $('.transition-rep').removeClass('transition-rep');
      var numberOfBeats = StageCollection.get(hTrackCID).get('measures').models[0].get('beatsCollection').length;

      // //TODO: change measure 0 to dynamic
      StageCollection.get(hTrackCID).get('measures').models[0].get('measureRepresentations').get(measureRepCID).transition(newRepType, numberOfBeats);
    },
    // g:103 b:98 l:108 i:105 r:114
    manuallPress: function(e) {
      if (e.keyCode == 103) {
        var newRepType = 'audio';
      } else if (e.keyCode == 98) {
        var newRepType = 'bead';
      } else if (e.keyCode == 108) {
        var newRepType = 'line';
      } else if (e.keyCode == 105) {
        var newRepType = 'pie';
      } else if (e.keyCode == 114) {
        var newRepType = 'bar';
      } else {
        $('.cs').removeClass('cs');
        return;
      }
      if ($('.cs').length) {      
        var hTrackID = $('.cs').closest('.hTrack').attr('id');
        var cid = hTrackID.slice(7);
        $('.cs').removeClass('cs'); 
        var beatsCollection = StageCollection.get(cid).get('measures').models[0].get('beatsCollection');
        var representationModel = new RepresentationModel({currentRepresentationType: newRepType, beatsCollection: beatsCollection});
        console.log('MANUALLY adding to the instrument/measure/measureRep');
        // Currently forcing it to add to the first measure
        StageCollection.get(cid).get('measures').models[0].get('measureRepresentations').add(representationModel);
      }
      if ($('.transition-rep').length) {
        console.log('MANUALLY transitioning');
        var hTrackID = $('.transition-rep').closest('.hTrack').attr('id');
        var hTrackCID = hTrackID.slice(7);
        var measureRepIndex = $('.transition-rep').closest('.measureRep').index();
        var measureRepID = $('.transition-rep').closest('.measureRep').attr('id');
        var measureRepCID = measureRepID.slice(12);
        $('.transition-rep').removeClass('transition-rep');
        var measureRepColl = StageCollection.get(hTrackCID).get('measures').models[0].get('measureRepresentations').get(measureRepCID).transition(newRepType);

      }
    },
  });

  return new WholeMeasureRepresentationView();
});
