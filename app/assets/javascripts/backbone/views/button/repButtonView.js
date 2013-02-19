// Filename: views/button/repButtonView
define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'backbone/models/repButton',
  'text!backbone/templates/button/repButton.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, Bootstrap, RepButtonModel, repButtonTemplate, dispatch, log){

  var RepButtonView = Backbone.View.extend({
    el : $("#rep-button"), // Specifies the DOM element which this view handles

    events : {
      "click .btn" : "cycle"
    },

    initialize: function() {
      this.repButtonModel = new RepButtonModel;

    },

    cycle: function(button) {
      var newState = $(button.target).data('state');
      this.repButtonModel.set('buttonState', newState);
      dispatch.trigger('representation.event', newState);


      log.sendLog([[2, "representation changed to: "+newState]]);
    },

    render: function() {
      $(this.el).html(repButtonTemplate);
      return this;
    }
  });
  return new RepButtonView();
});