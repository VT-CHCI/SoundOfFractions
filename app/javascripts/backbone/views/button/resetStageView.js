// Filename: views/button/resetStageView.js
/*
  This is the resetStageView
  This clears the Stage and starts over again
  it is a singleton View
*/  
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/views/stage/stageView',
  'text!backbone/templates/button/resetStageButton.html',
  'logging'
], function($, _, Backbone, StageView, resetStageButtonTemplate, Logging){

  var ResetStageView = Backbone.View.extend({
    el: $('#reset-stage-container'), // Specifies the DOM element which this view handles

    //registering backbone's click event to our addInstrumentToCompositionArea() method.
    events: {
      "click #reset-stage" : "resetTheStage"
    },

    //simply creates the model.
    initialize: function(options) {
      if(options) {
        console.error('shouldnt be in here for creating a reset button');
      }

      this.render();
    },
    render: function() {
      var compiledTemplate = _.template(resetStageButtonTemplate);
      this.$el.append( compiledTemplate() ); // No options {} within the compiledTemplate({}) call.
    },
    resetTheStage: function(e) {
      Logging.logStorage('RESETTING the entire rhythm! OH NO! What happened?');
      this.trigger('resetStage');
    }
  });
  return new ResetStageView();
});