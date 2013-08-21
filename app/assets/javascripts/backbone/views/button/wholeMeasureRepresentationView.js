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
      'click .addRepresentation' : 'addRep'
    },

    //simply creates the model.
    initialize: function() {
      this.repButtonModel = new RepButtonModel;

      // manually clicking
      _.bindAll(this, 'manuallPress');
      $(document).bind('keypress', this.manuallPress);
    },

    /*
      This is called when a click event occurs.

      It sets the state to the state the user selected.
      It then triggers a representationChange event.

      a log message is sent reflecting the representation change.
    */
    cycle: function(e) {
      //Grab the data-state from the clicked button
      var newState = $(e.currentTarget).data('state');
      this.repButtonModel.set('buttonState', newState);
      //trigger the Measure representation change
      dispatch.trigger('measureRepresentation.event', newState);
      //trigger the Beat representation change
      dispatch.trigger('beatRepresentation.event', newState);

      log.sendLog([[2, "representation changed to: "+newState]]);
    },

    //no need to compile the template for this one.
    render: function() {
      $(this.el).html(wholeMeasureRepresentationTemplate);

      // JQuery-UI draggable
      $(this.el).draggable();

      return this;
    },
    addRep: function(e) {
      // find the plus sign with the class '.cs' and return the id of its hTrack
      var newRepType = $(e.target).closest('.addRepresentation').attr('data-state');
      if ($('.cs').length) {      
        var hTrackID = $('.cs').closest('.hTrack').attr('id');
        var measureContainer; 
        var cid = hTrackID.slice(7);
        $('.cs').removeClass('cs'); 
        //trigger the Measure representation addition
        var representationModel = new RepresentationModel({representationType: newRepType});
        console.log('adding to the instrument/measure/measureRep');
        // Currently forcing it to add to the first measure
        StageCollection.get(cid).get('measures').models[0].get('measureRepresentations').add(representationModel);
        // dispatch.trigger('addMeasureRepresentation.event', { newRepType: newRepType, hTrackID: hTrackID, hTrack: cid} );
      }
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
        console.log(hTrackID, cid, newRepType, representationModel);

        console.log(' MANUALLY adding to the instrument/measure/measureRep');
        // Currently forcing it to add to the first measure
        StageCollection.get(cid).get('measures').models[0].get('measureRepresentations').add(representationModel);
        window.csf = StageCollection;
      }
    }

  });
  return new WholeMeasureRepresentationView();
});