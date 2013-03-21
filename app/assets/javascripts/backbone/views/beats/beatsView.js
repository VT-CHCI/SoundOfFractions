// Filename: views/beats/beatsView.js
/*
  This is the beatsView object.
  This view is for a single measure contained within a measuresView.
  It is responsible for creating BeatView objects for each beat
  in its BeatsCollection.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'backbone/collections/beats',
  'backbone/views/beats/beatView',
  'text!backbone/templates/beats/linearBarBeats.html',
  'text!backbone/templates/beats/circularPieBeats.html',
  'app/dispatch',
  'app/state'
], function($, _, Backbone, BeatsCollection, BeatView, linearBarBeatsTemplate, circularPieBeatsTemplate, dispatch, state){
  return Backbone.View.extend({
    el: $('.measure'),

    // The different representations
    representations: {
      "linear-bar": linearBarBeatsTemplate,
      "circular-pie": circularPieBeatsTemplate
    },
    currentBeatRepresentation: 'linear-bar',

    /* BeatsView objects get instantiated by a MeasuresView object,
       which passes in the options.
    */
    initialize: function(options){
      if (options) {
        this.collection = options.collection;
        this.el = options.el;
      } else {
        this.collection = new BeatsCollection;
      }

      if (options["template-key"]) {
        this.currentBeatRepresentation = options["template-key"];
      }

      //registering a callback for signatureChange events.
      dispatch.on('signatureChange.event', this.reconfigure, this);
      // dispatch.on('beatRepresentation.event', this.changeBeatRepresentation, this);

      //rendering this view.
      this.render();

      //Determines the intial beat width based on the global signature.
      this.calcBeatWidth(state.get('signature'));
    },

    changeBeatRepresentation: function(representation) {
      console.log('BEAT representation changed to : ' + representation);
      this.currentBeatRepresentation = representation;
      this.render();      
    },

    render: function(){
      //Sets up the spans needed for a measure.
      $(this.el).html('');
      $(this.el).append('<span class="title">Measure <span class="number"></span> - <span class="delete">[X]</span></span>');

      //iterationg through our collection of beats
      //and creating a div for the beat with a unique ID based
      //on the cid.  Then, creating a new BeatView for each,
      //passing in the beat model and the 'el' container for it.
      _.each(this.collection.models, function(beat) {
        // var compiledTemplate = _.template( linearBarBeatsTemplate, {beat: beat, angle: 360.0/this.collection.length} );
        var compiledTemplate = _.template( this.representations[this.currentBeatRepresentation], {beat: beat, beatAngle:360.0/this.collection.length} );
        // console.warn('compiledTemplate : X' + compiledTemplate);
        $(this.el).append( compiledTemplate );

        new BeatView({model:beat, el:$(compiledTemplate).attr('id'), beatAngle:360.0/this.collection.length, "template-key": this.currentBeatRepresentation});
      }, this);

      //This determines which number this measure is.
      var measureCount = 1;
      $('.component-container').each(function() {
        $(this).find('.number').each(function() {
          $(this).text(measureCount);
          measureCount++;
        });
        measureCount = 1;
      });

      return this;
    },

    /*
      This is triggered by signatureChange events.

    */
    reconfigure: function(signature) {
      /* if the containing component is selected, this
         triggers a request event to stop the sound.
         
         Then this destroys the beat collection and creates
         a new collection with the number of beats specified
         by the signature parameter.
      */
      if ($(this.el).parent().hasClass('selected')) {
        dispatch.trigger('stopRequest.event', 'off');
        this.collection.reset();

        for (var i = 0; i < signature; i++) {
          this.collection.add();
        }
        //re-render the view.
        this.render();

        //recalculate the widths for each beat.
        this.calcBeatWidth(signature);
      }
    },

    //This determines the width of each beat based on the
    //number of beats per measure or 'signature'.
    calcBeatWidth: function(signature) {
      if ($(this.el).parent().hasClass('selected')) {
        var px = 100/$('.linear-bars-measure').css('width').replace(/[^-\d\.]/g, '');
        var beatWidth = (100 - ((signature*1+1)*px))/signature;

        $(this.el).children('.beat').css({
          'width' : beatWidth+'%'
        });
      }
    }
  });
});
