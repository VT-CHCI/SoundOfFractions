// Filename: views/beatBars/beatBarsView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beatBars',
  'text!templates/beatBars/beatBars.html',
  'app/dispatch'
], function($, _, Backbone, beatBarsCollection, beatBarsTemplate, dispatch){
  var beatBarsView = Backbone.View.extend({
    el: $('#beat-pallet #visual-beats'),

    initialize: function(){
      this.collection = beatBarsCollection;
      this.collection = beatBarsCollection.add({ width: 1, label: '4/4'});
      this.collection = beatBarsCollection.add({ width: 0.5, label: '2/4'});
      this.collection = beatBarsCollection.add({ width: 0.25, label: '1/4'});
      // this.collection = beatBarsCollection.add({ width: 0.125, label: '1/8'});

      dispatch.on('signatureChange.event', this.reconfigure, this);
    },

    render: function(){
      var data = {
        beatBars: this.collection.models,
        _: _
      };
      var compiledTemplate = _.template( beatBarsTemplate, data );
      $(this.el).html( compiledTemplate );

      return this;
    },

    reconfigure: function(signature) {
      this.collection.reset();
      this.collection = beatBarsCollection.add({ width: 1, label: signature + '/' + signature});

      if (signature == 2) {
        this.collection = beatBarsCollection.add({ width: 0.5, label: '1/2'});
        // this.collection = beatBarsCollection.add({ width: 0.25, label: '1/4'});
      } else {
        for (var i=2; i <= Math.ceil(signature/2); i++) { 
          if (signature % i == 0) {
            var dividing = true;
            // console.log('lowest divisor: ', i);
            this.divider(signature/i, signature, i);
            // this.collection = beatBarsCollection.add({ width: 1/(2*signature), label: '1/' + signature*2});
            break;
          }
          else {
            // console.log('we have a prime!', signature);
            this.collection = beatBarsCollection.add({ width: 1/signature, label: '1/' + signature});
            // this.collection = beatBarsCollection.add({ width: 1/(2*signature), label: '1/' + signature*2});
            break;
          }
        }
      }

      this.render();
    },

    divider: function(numerator, denominator, divisor) {
      if (numerator % divisor != 0) {
        if (numerator != 1) {
          this.collection = beatBarsCollection.add({ width: numerator/denominator, label: numerator + '/' + denominator});
        }
        this.collection = beatBarsCollection.add({ width: 1/denominator, label: '1/' + denominator});
        
        return;
      } else {
        this.collection = beatBarsCollection.add({ width: numerator/denominator, label: numerator + '/' + denominator});
        
        numerator = numerator/divisor;
        this.divider(numerator, denominator, divisor);
      }
    }
  });
  return new beatBarsView();
});
