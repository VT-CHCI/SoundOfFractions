// Filename: views/label/systemLabelContainerView.js
/*
*/  
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/collections/labels',
  'backbone/views/label/systemLabelView',
  'text!backbone/templates/label/systemLabelContainerGroup.html',
  'text!backbone/templates/label/systemLabel.html',
  'text!backbone/templates/label/tempHolder.html',
  'log'
], function($, _, Backbone, SystemLabelCollection, SystemLabelView, SystemLabelContainerGroup, SystemLabelTemplate, TempHolderTemplate, log){

  var SystemLabelContainerView = Backbone.View.extend({
    el : $('#system-label-container'), // Specifies the DOM element which this view handles
    initialize: function() {
      this.render();
      this.makeChildren();
    },

    render: function() {
      this.systemLabelCollection = new SystemLabelCollection;

      var minNumerator = 0;
      var maxNumerator = 16;
      var minDenominator = 1;
      var maxDenominator = 9;
      
      // Symbols
      this.systemLabelCollection.add({
        label: '/',
        type: 'symbol-label system-label'
      })

      // whole numbers
      for( i=0 ; i < maxDenominator+1 ; i++ ) {
        this.systemLabelCollection.add({
          label: String(i),
          type: 'whole-number-label system-label'
        })
      }
      // proper fractions
      // for( i=minNumerator ; i <= maxNumerator ; i++ ) {
      //   for( j=minDenominator ; j <= maxDenominator ; j++ ) {
      //     if (i <= j) {          
      //       this.systemLabelCollection.add({
      //         label: String(i) + '/' + String(j),
      //         type: 'proper-fraction-label system-label'
      //       })
      //     }
      //   }
      // }

      $(this.el).html(SystemLabelContainerGroup);  
      return this;

    },
    makeChildren: function(){
      // //we have to render each one of our labels
      _.each(this.systemLabelCollection.models, function(lbl, i) {
        new SystemLabelView({
        // var newLabel = new SystemLabelView({
          label: lbl.get('label'),
          clazz: lbl.get('type'),
          identifier: i
        });
        // $('#system-label-group').append(newLabel);
      }, this);      
    }
  });
  return new SystemLabelContainerView();
});
