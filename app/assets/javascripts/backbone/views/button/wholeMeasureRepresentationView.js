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
  'text!backbone/templates/button/wholeMeasureRepresentation.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, RepButtonModel, wholeMeasureRepresentationTemplate, dispatch, log){

  var WholeMeasureRepresentationView = Backbone.View.extend({
    el : $("#measure-representation"), // Specifies the DOM element which this view handles

    //registering backbone's click event to our cycle() method.
    events : {
      'click .btn' : 'cycle',
      'click .addRepresentation' : 'addRep'
    },

    //simply creates the model.
    initialize: function() {
      this.repButtonModel = new RepButtonModel;
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
      var newRepType = e.srcElement.getAttribute('data-state');
      var hTrackID = $('.cs').closest('.hTrack').attr('id');
      var cid = hTrackID.slice(7);
      $('.cs').removeClass('cs'); 
      //trigger the Measure representation addition
      dispatch.trigger('addMeasureRepresentation.event', { newRepType: newRepType, hTrackID: hTrackID, hTrack: cid} );
      // dispatch.on('addMeasureRepresentation.event', this.addRepToMeasure, this);
    }
  });
  return new WholeMeasureRepresentationView();
});