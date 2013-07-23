// Filename: views/button/deleteInstrumentView.js
/*
  This is the delete instrument button
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'app/dispatch',
  'app/log',
  'text!backbone/templates/button/deleteInstrument.html'
], function($, _, Backbone, dispatch, log, deleteInstrumentTemplate){
  return Backbone.View.extend({
    events : {
      'click' : 'deleteInstrumentFromCompositionArea'
    },

    initialize: function(options) {
      if (options) {
        this.collection = options.collection;
        this.parent = options.parent;
        this.el = options.el;
        this.parentCID = options.parentCID;
      }

      this.render();
    },

    render: function() {
      var compiledTemplate = _.template( deleteInstrumentTemplate);
      $(this.el).append( compiledTemplate );

      return this;
    },

    /*
      This is called when a click event occurs.

      a log message is sent reflecting the representation change.
    */
    deleteInstrumentFromCompositionArea: function(e) {
      var instrument = $(e.currentTarget).closest('.htrack-container').data().state;
      console.log('in deleteInstrumentView deleteInstrumentFromCompositionArea() of ' + instrument);
      dispatch.trigger('addInstrumentToGeneratorModel.event', instrument);
      dispatch.trigger('instrumentDeletedFromCompositionArea.event', { instrument:instrument, model:this.parentCID });
      dispatch.trigger('reRenderInstrumentGenerator.event', instrument);

    }
  });
  // return new DeleteInstrumentView;
});