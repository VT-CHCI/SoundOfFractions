// Filename: views/button/systemLabelView.js
/*
  This is the RepButtonView.
  This renders the four-state radio button
  that controls which representation is displayed
  on the side of each component.  
*/  
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/labels',
  'text!backbone/templates/label/systemLabel.html',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, SystemLabelCollection, SystemLabelTemplate, dispatch, log){

  var SystemLabelView = Backbone.View.extend({
    el : $("#system-label"), // Specifies the DOM element which this view handles

    // events : {
    //   "click .btn" : "cycle"
    // },

    //simply creates the model.
    initialize: function() {
      this.systemLabelCollection = new SystemLabelCollection();

      var minNumerator = 0;
      var maxNumerator = 16;
      var minDenominator = 1;
      var maxDenominator = 16;
      // whole numbers
      for( i=0 ; i < maxDenominator ; i++ ) {
        this.systemLabelCollection.add({
          label: String(i),
          type: 'whole-number-label'
        })
      }
    },

    render: function() {
      $(this.el).html( SystemLabelTemplate );

      // JQuery-UI draggable
      $(this.el).draggable({ axis: "y",containment: "#middle-right-column" });

      //we have to render each one of our components.
      _.each(this.systemLabelArray.labels, function(lbl) {

        console.warn(lbl);
        // var compiledTemplate = _.template( ComponentTemplate, {component: component, type: component.get('type')} );
        // $(this.el).append( compiledTemplate );

        // //create a component view.
        // var componentView = new ComponentView({
        //   collection:component,
        //   el:'#component-container'+component.cid, 
        //   gainNode:this.muteGainNodeList[counter],
        //   defaultMeasureRepresentation: this.defaultMeasureRepresentation,
        //   defaultFractionRepresentation: this.defaultFractionRepresentation,
        //   unusedInstrumentsModel: this.unusedInstrumentsModel
        // });
      }, this);

      return this;
    }
  });
  return new SystemLabelView();
});