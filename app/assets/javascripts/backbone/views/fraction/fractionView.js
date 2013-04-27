// Filename: views/fraction/fractionView.js
/*
  This is the FractionsView.

  This is contained in a ComponentsView.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'text!backbone/templates/fraction/decimal.html',
  'text!backbone/templates/fraction/fraction.html',
  'text!backbone/templates/fraction/mixedNumber.html',
  'text!backbone/templates/fraction/percent.html',
  'text!backbone/templates/fraction/blank.html',
  'app/dispatch',
  'app/state',
  'app/log'
], function($, _, Backbone, decimalTemplate, fractionTemplate, mixedNumberTemplate, percentTemplate, blankTemplate, dispatch, state, log){
  return Backbone.View.extend({
    // el: $('.count'),

    // The different representations
    representations: {
      "none": blankTemplate,
      "fraction": fractionTemplate,
      "percent": percentTemplate,
      "decimal": decimalTemplate,
      "mixed": mixedNumberTemplate
    },
    //grab the current measure representation's data-state
    currentFractionRepresentation: "", //temp-holder
    previousFractionRepresentation: "", //temp-holder

    initialize: function(options){
      console.warn(options.el);
      //if we're being created by a componentView, we are
      //passed in options. Otherwise we create a single
      //measure and add it to our collection.
      if (options) {
        this.measuresCollection = options.collection;
        this.beatsInMeasure = this.measuresCollection.models[0].attributes.beats.length
        this.parent = options.parent;
        this.el = options.el;
        if (options.defaultFractionRepresentation) {
          this.currentFractionRepresentation = options.defaultFractionRepresentation;
        }
      }

      //Dispatch listeners
      dispatch.on('fractionRepresentation.event', this.changeFractionRepresentation, this);
      dispatch.on('beatClicked.event', this.updateFractionValues, this);
      dispatch.on('signatureChange.event', this.updateFractionValues, this);
      // dispatch.on('bPMSlider.event', this.updateFractionValues, this);

      this.render();
    },

    changeFractionRepresentation: function(representation) {
      this.previousFractionRepresentation = this.currentFractionRepresentation;
      this.currentFractionRepresentation = representation;
      this.render();      
    },

    render: function(val){
      var numerator = 0;
      var denominator;
      if (val){
        denominator = val;
      } else {
        denominator = this.beatsInMeasure;
      }
      var mixedNumerator;
      var wholeNumber;
      // var percent;

      //then, we calculate the numerator by counting selected beats.
      _.each(this.parent.get('measures').models, function(measure) {
        _.each(measure.get('beats').models, function(beat) {
          if(beat.get('selected')) {
            numerator++;
          }
        }, this);
      }, this);

      //Then we convert to mixed numbers
      whole = Math.floor(numerator/denominator);
      mixedNumerator = numerator-(whole*denominator);
      // percent = numerator / denominator * 100;
      decimal = (numerator / denominator).toFixed(2);
      var fractionTemplateParamaters = {
        numerator: numerator,
        denominator: denominator,
        mixedNumerator: mixedNumerator,
        wholeNumber: whole,
        decimal: decimal
      };

      var compiledTemplate = _.template( this.representations[this.currentFractionRepresentation], fractionTemplateParamaters );

      // find the plus sign we put in there, and right before it, put in the rendered template
      console.log(compiledTemplate);
      $(this.el).html( compiledTemplate );

      // TODO, we need to refresh the svg
      // $('#component'+this.parent.cid).html($('#component'+this.parent.cid).html());
      return this;
    },

    updateFractionValues: function(denominator){
      window.csf = $(this.el);
      if ($(this.el).prev().hasClass('selected')) {
        this.render(denominator);
      }
    }
  });
});
