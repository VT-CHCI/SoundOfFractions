// Filename: views/button/repButtonView
define([
  'jquery',
  'underscore',
  'backbone',
  'models/repButton',
  'text!templates/button/repButton.html',
  'app/dispatch',
], function($, _, Backbone, RepButtonModel, repButtonTemplate, dispatch){

  var RepButtonView = Backbone.View.extend({
    el : $("#rep-button"), // Specifies the DOM element which this view handles

    events : {
      "click" : "cycle"
    },

    initialize: function() {
      this.repButtonModel = new RepButtonModel;

    },

    cycle: function(button) {
      var newState = $(button.target).data('state');
      $('.btn').removeClass('active');
      $(button.target).addClass('active');
      this.repButtonModel.set('buttonState', newState);
      dispatch.trigger('representation.event', newState);

    },

    render: function() {
      $(this.el).html(repButtonTemplate);
      return this;
    }
  });
  return new RepButtonView();
});