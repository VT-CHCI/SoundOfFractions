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
  'backbone',
  'bootstrap',
  'backbone/models/repButton',
  'backbone/models/representation',
  'backbone/collections/stage',
  'text!backbone/templates/button/wholeMeasureRepresentation.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, RepButtonModel, RepresentationModel, StageCollection, wholeMeasureRepresentationTemplate, dispatch, log){

  var WholeMeasureRepresentationView = Backbone.View.extend({
    el : $("#measure-representation"), // Specifies the DOM element which this view handles

    events : {
      'click .representation' : 'addOrTransition'
    },

    //simply creates the model.
    initialize: function() {
      this.repButtonModel = new RepButtonModel;

      // manually clicking
      _.bindAll(this, 'manuallPress');
      $(document).bind('keypress', this.manuallPress);
    },

    //no need to compile the template for this one.
    render: function() {
      $(this.el).html(wholeMeasureRepresentationTemplate);

      // JQuery-UI draggable
      $(this.el).draggable();

      return this;
    },
    addOrTransition: function(e){
      var csLength = $('.cs').length;
      var trLength = $('.transition-rep').length;
      if (csLength == 1) {
        this.addRep(e);
      } else if (trLength == 1) {
        this.transitionRep(e);
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
      //trigger the Measure representation addition
      var representationModel = new RepresentationModel({representationType: newRepType});
      console.log('adding to the instrument/measure/measureRep');
      // Currently forcing it to add to the first measure
      var measureRepColl = StageCollection.get(cid).get('measures').models[0].get('measureRepresentations');
      measureRepColl.add(representationModel);
      // dispatch.trigger('addMeasureRepresentation.event', { newRepType: newRepType, hTrackID: hTrackID, hTrack: cid} );
    },
    transitionRep: function(e){
      console.log('wmrv transitioning');
      var newRepType = $(e.target).closest('.representation').attr('data-state');
      // find the plus sign with the class '.cs' and return the id of its hTrack
      var hTrackID = $('.transition-rep').closest('.hTrack').attr('id');
      var hTrackCID = hTrackID.slice(7);
      var measureRepIndex = $('.transition-rep').closest('.measureRep').index();
      var measureRepID = $('.transition-rep').closest('.measureRep').attr('id');
      var measureRepCID = measureRepID.slice(12);
      $('.transition-rep').removeClass('transition-rep');
      var measureRepColl = StageCollection.get(hTrackCID).get('measures').models[0].get('measureRepresentations').get(measureRepCID).transition(newRepType);
      // dispatch.trigger('transition.event', {oldRep: oldRep, newRep:newRepType } );
    },
    // a:97 b:98 l:108 i:105 r:114
    manuallPress: function(e) {
      if (e.keyCode == 97) {
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
        var representationModel = new RepresentationModel({representationType: newRepType});
        // representationModel.representationType = newRepType;

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
    }

  });
  return new WholeMeasureRepresentationView();
});