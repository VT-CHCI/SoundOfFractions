// Filename: views/button/instrumentDropDownView.js
/*
  This is the instrumentDropDownView.
  This renders the dropdown menu to change a line's instrument
*/  
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/models/remainingInstrumentGenerator',
  'text!backbone/templates/menu/instrumentDropDown.html'
], function($, _, Backbone, RemainingInstrumentGeneratorModel, instrumentDropDownTemplate){
  return Backbone.View.extend({
    //registering backbone's change event to our instrumentChanged() method.
    events : {
      'change .unused-instruments-selector': 'instrumentChanged'
    },

    //simply creates the model.
    initialize: function(options) {
      this.collection = options.collection;
      this.parent = options.parent;

      this.render();
      console.error(this.$el);
      // dispatch.on('instrumentChanged.event', this.instrumentChanged, this);
      // dispatch.on('reRenderInstrumentDropDown.event', this.render, this);

      // dispatch.on('instrumentAddedToCompostionArea.event', this.updateRemove, this);
      dispatch.on('instrumentDeletedFromCompositionArea.event', this.render, this);
    },

    instrumentChanged: function(){
      console.log('in remainingInstrumentGeneratorModel instrumentChanged()');

      var oldInstrument = $(this.el).closest('.hTrack-container').data().state;
      var newInstrument = $(this.el).find(':selected').val();
      console.log('oI: '+ oldInstrument + ' | nI: '+ newInstrument);
      // this.remainingInstrumentGeneratorModel.addInstrument(newInstrument);
      this.updateAddRemove(oldInstrument,newInstrument);
      // this.updateAdd(oldInstrument);
    },
    /*
      This is called when a user adds a instrument form the selector.
      A log message is sent reflecting the instrument change.
    */
    updateAddRemove: function(add, remove) {
      console.log('in instrumentDropDownView updateAddRemove()');
      dispatch.trigger('addInstrumentToGeneratorModel.event', add);
      dispatch.trigger('removeInstrumentFromGeneratorModel.event', remove);
      dispatch.trigger('reRenderInstrumentGenerator.event', this)
      dispatch.trigger('reRenderInstrumentDropDown.event', this)
    },
 
    updateRemove: function(removedInstrument) {
      console.log('in remainingInstrumentGeneratorModel updateRemove()');

      // Update the model that the instrument is not available
      dispatch.trigger('removeInstrumentFromGeneratorModel.event', removedInstrument);
      this.render();
    },

    //no need to compile the template for this one.
    render: function() {
      //compiling our template.
      var compiledTemplate = _.template( instrumentDropDownTemplate, { 
        unusedInstruments: RemainingInstrumentGeneratorModel.get('unusedInstruments'),
        cid: this.parent.cid
      });
      $(this.el).html( compiledTemplate );

      // $(this.el).html(remainingInstrumentGeneratorTemplate);

      // JQuery-UI draggable
      // $(this.el).draggable({ axis: "y", containment: "#middle-left-column" });

      return this;
    }
  });
});

// });  