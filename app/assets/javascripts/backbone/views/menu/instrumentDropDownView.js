// Filename: views/button/instrumentDropDownView.js
/*
  This is the instrumentDropDownView.
  This renders the dropdown menu to change a line's instrument
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/remainingInstrumentGenerator',
  'text!backbone/templates/menu/instrumentDropDown.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, RemainingInstrumentGeneratorModel, instrumentDropDownTemplate, dispatch, log){
  return Backbone.View.extend({
    //registering backbone's change event to our instrumentChanged() method.
    events : {
      'change .unused-instruments-selector': 'instrumentChanged'
    },

    //simply creates the model.
    initialize: function(options) {
      this.collection = options.collection;
      this.parent = options.parent;
      this.el = options.el; //'#instrument-selector-'+this.component.cid
      this.remainingInstrumentGeneratorModel = new RemainingInstrumentGeneratorModel;
      this.parentCID = options.parentCID;

      this.render();

      dispatch.on('instrumentAdded.event', this.updateRemove, this);
      dispatch.on('instrumentChanged.event', this.instrumentChanged, this);
    },

    instrumentChanged: function(){
      var oldInstrument = $(this.el).closest('.component-container').data().state;
      var newInstrument = $(this.el).find(':selected').val();
      console.log('oI: '+ oldInstrument + ' | nI: '+ newInstrument);
      // this.remainingInstrumentGeneratorModel.addInstrument(newInstrument);
      this.updateAddRemove(oldInstrument,newInstrument);
      // this.updateAdd(oldInstrument);
      dispatch.trigger('reRenderInstrumentGenerator.event', this)
    },
    /*
      This is called when a user adds a instrument form the selector.
      A log message is sent reflecting the instrument change.
    */
    updateAddRemove: function(add, remove) {
      this.remainingInstrumentGeneratorModel.addInstrument(add);
      this.remainingInstrumentGeneratorModel.removeInstrument(remove);
      this.render();
    },
    updateRemove: function(e) {
      // Update the model that the instrument is not available
      this.remainingInstrumentGeneratorModel.removeInstrument(e);
      this.render();
    },
    updateAdd: function(instrument) {
      // Update the model that the instrument is not available
      this.remainingInstrumentGeneratorModel.addInstrument(instrument);
      this.render();
    },

    //no need to compile the template for this one.
    render: function() {

      //compiling our template.
      var compiledTemplate = _.template( instrumentDropDownTemplate, { 
        unusedInstruments: this.remainingInstrumentGeneratorModel.get('unusedInstruments'),
        cid: this.parentCID
      });
      $(this.el).html( compiledTemplate );

      // $(this.el).html(remainingInstrumentGeneratorTemplate);

      // JQuery-UI draggable
      $(this.el).draggable({ axis: "y", containment: "#middle-left-column" });

      return this;
    }
  });
});