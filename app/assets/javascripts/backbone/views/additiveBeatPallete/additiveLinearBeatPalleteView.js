// Filename: views/additiveBeatPallete/additiveLinearBeatPalleteView.js
/*
  This is the additiveLinearBeatPalleteView.
  This is responsible for the beat bar pallete
  on the right side of the main page.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'backbone/collections/additiveBeatPallete',
  'text!backbone/templates/additiveBeatPallete/additiveLinearBeatPallete.html',
  'app/dispatch'
], function($, _, Backbone, additiveBeatPalleteCollection, additiveLinearBeatPalleteTemplate, dispatch){
  var additiveLinearBeatPalleteView = Backbone.View.extend({
    el: $('#beat-pallet #visual-beats'),

    initialize: function(){
      // The collection is initialized for 4 beats per measure.
      this.collection = additiveBeatPalleteCollection;
      this.collection = additiveBeatPalleteCollection.add({ width: 1, label: '4/4'});
      this.collection = additiveBeatPalleteCollection.add({ width: 0.5, label: '2/4'});
      this.collection = additiveBeatPalleteCollection.add({ width: 0.25, label: '1/4'});
      // this.collection = additiveBeatPalleteCollection.add({ width: 0.125, label: '1/8'});

      //registering event handlers.
      // dispatch.on('signatureChange.event', this.reconfigure, this);
      // dispatch.on('sliderChange.event', this.reconfigure, this);
    },

    render: function(){
      console.log("render: additiveLinearBeatPalleteView.js");
      var data = {
        linearBeatBars: this.collection.models,
        _: _
      };
      console.log(data);
      var compiledTemplate = _.template( additiveLinearBeatPalleteTemplate, data );
      $(this.el).html( compiledTemplate );

      return this;
    },

    /*
      This function recalculates the needed beat bars in the pallete
      when a signature change or slider change occurs. In other words,
      whenever the beats per measure changes for a component or a different
      component is selected.
      
      The commented-out commands are needed if we allow the beat to be
      subdivided one extra level.
    */
    reconfigure: function(signature) {
      this.collection.reset();
      this.collection = additiveBeatPalleteCollection.add({ width: 1, label: signature + '/' + signature});

      if (signature == 2) {
        this.collection = additiveBeatPalleteCollection.add({ width: 0.5, label: '1/2'});
        // this.collection = additiveBeatPalleteCollection.add({ width: 0.25, label: '1/4'});
      } else {
        for (var i=2; i <= Math.ceil(signature/2); i++) { 
          if (signature % i == 0) {
            var dividing = true;
            this.divider(signature/i, signature, i);
            // this.collection = additiveBeatPalleteCollection.add({ width: 1/(2*signature), label: '1/' + signature*2});
            break;
          }
          else {
            this.collection = additiveBeatPalleteCollection.add({ width: 1/signature, label: '1/' + signature});
            // this.collection = additiveBeatPalleteCollection.add({ width: 1/(2*signature), label: '1/' + signature*2});
            break;
          }
        }
      }

      this.render();
    },

    /*
      This is a recursive function used by reconfigure to calculate the needed sub-divisions of the
      beat bars.
    */
    divider: function(numerator, denominator, divisor) {
      if (numerator % divisor != 0) {
        if (numerator != 1) {
          this.collection = additiveBeatPalleteCollection.add({ width: numerator/denominator, label: numerator + '/' + denominator});
        }
        this.collection = additiveBeatPalleteCollection.add({ width: 1/denominator, label: '1/' + denominator});
        
        return;
      } else {
        this.collection = additiveBeatPalleteCollection.add({ width: numerator/denominator, label: numerator + '/' + denominator});
        
        numerator = numerator/divisor;
        this.divider(numerator, denominator, divisor);
      }
    }
  });
  return new additiveLinearBeatPalleteView();
});
