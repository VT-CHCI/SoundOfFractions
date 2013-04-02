// Filename: views/measures/measuresView.js
/*
  This is the MeasuresView.

  This is contained in a ComponentsView.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/measures',
  'backbone/collections/beats',
  'backbone/models/measure',
  'backbone/views/beats/beatView',
  'text!backbone/templates/measures/audioMeasures.html',
  'text!backbone/templates/measures/linearBarMeasures.html',
  'text!backbone/templates/measures/linearBarSVGMeasures.html',
  'text!backbone/templates/measures/circularPieMeasures.html',
  'app/dispatch',
  'app/state',
  'app/log'
], function($, _, Backbone, MeasureModel, BeatsCollection, MeasuresCollection, beatView, audioMeasuresTemplate, linearBarMeasuresTemplate, linearBarSVGMeasuresTemplate, circularPieMeasuresTemplate, dispatch, state, log){
  return Backbone.View.extend({
    // el: $('.component'),

    // The different representations
    representations: {
      "audio": audioMeasuresTemplate,
      "linear-bar": linearBarMeasuresTemplate,
      "linear-bar-svg": linearBarSVGMeasuresTemplate,
      "circular-pie": circularPieMeasuresTemplate
    },

    currentMeasureRepresentation: 'linear-bar',

    //registering click events to add and remove measures.
    events : {
      'click .addMeasure' : 'add',
      'click .delete' : 'remove'
    },

    initialize: function(options){
      //if we're being created by a componentView, we are
      //passed in options. Otherwise we create a single
      //measure and add it to our collection.
      if (options) {
        this.measuresCollection = options.collection;
        this.parent = options.parent;
        this.el = options.el;
      }
      // else {
      //   this.measure = new BeatsCollection;

      //   for (var i = 0; i < 4; i++) {
      //     this.measure.add();
      //   }

      //   this.measuresCollection = new MeasuresCollection;
      //   this.measuresCollection.add({beats: this.measure});
      // }

      if (options["template-key"]) {
        this.currentBeatRepresentation = options["template-key"];
      }

      //registering a callback for signatureChange events.
      dispatch.on('signatureChange.event', this.reconfigure, this);
      //Dispatch listeners
      dispatch.on('measureRepresentation.event', this.changeMeasureRepresentation, this);

      this.render();

      //Determines the intial beat width based on the global signature. Has to be below this.render()
      this.calcBeatWidth(this.parent.get('signature'));
    },

    changeMeasureRepresentation: function(representation) {
      this.currentMeasureRepresentation = representation;
      this.render();      
    },

    render: function(){
      // REPLACE whatever's already in the measure container with: a plus sign in the measure rendering
      $(this.el).html('<div class="addMeasure">+</div>');

      //default to rendering a single measure
      var measureCount = 1;

      // for each measure in measuresCollection
      _.each(this.measuresCollection.models, function(measure) {
        // (when representation button changes, the current representation template will get updated)
        // compile the template for a measure
        var compiledTemplate = _.template( this.representations[this.currentMeasureRepresentation], {measure: measure, beatHolder:"beatHolder"+measure.cid, measureCount:measureCount, measureAngle: 360.0 } );

        // find the plus sign we put in there, and right before it, put in the rendered template
        $(this.el).find('.addMeasure').before( compiledTemplate );

        console.log('measure beats: ');
        console.warn(measure.get('beats').models);

        // for each beat in this measure
        _.each(measure.get('beats').models, function(beat) {
          console.warn("#beat"+beat.cid);

          // create a beatview
          new beatView({model:beat, parentElHolder:'#beatHolder'+measure.cid, parent:measure, parentCID:measure.cid, singleBeat:"#beat"+beat.cid});
        }, this);

        measureCount ++;
      }, this);
      return this;
    },

    /*
      This is called when the user clicks on the plus to add a new measure.

      It creates a new measure and adds it to the component.
      It generates a string representing the id of the measure and the ids of
      its beats and logs the creation.

      Lastly, it triggers a stopRequest, because we can't continue playing until
      all the durations get recalculated to reflect this new measure.
    */
    add: function(){
        console.log('add measure');
        var newMeasure = new BeatsCollection;

        for (var i = 0; i < this.parent.get('signature'); i++) {
          newMeasure.add();
        }

        this.measuresCollection.add({beats: newMeasure});

        //Logging
        name = 'measure' + _.last(this.measuresCollection.models).cid + '.';
        _.each(newMeasure.models, function(beats) {
          name = name + 'beat'+ beats.cid + '.';
        }, this);
        log.sendLog([[3, "Added a measure: "+name]]);

        //Render
        this.render();
        //Dispatch
        dispatch.trigger('stopRequest.event', 'off');
    },

    /*
      This is called when the user clicks on the minus to remove a measure.
    */
    remove: function(ev){
      if ($('#measure'+this.measuresCollection.models[0].cid).parent()) {
        //removing the last measure isn't allowed.
        if(this.measuresCollection.models.length == 1) {
          console.log('Can\'t remove the last measure!');
          return;
        }
        console.log('remove measure');

        //we remove the measure and get its model.
        var model = this.measuresCollection.get($(ev.target).parents('.measure').attr('id').replace('measure',''));
        this.measuresCollection.remove(model);

        //send a log event showing the removal.
        log.sendLog([[3, "Removed a measure: measure"+model.cid]]);

        //re-render the view.
        this.render();

        //trigger a stop request to stop playback.
        dispatch.trigger('stopRequest.event', 'off');
        dispatch.trigger('signatureChange.event', this.parent.get('signature'));
      }
    },
    // This is triggered by signatureChange events.
    reconfigure: function(signature) {
      console.log('MeasureView.reconfigure(signature) : signature=' +signature);
      /* if the containing component is selected, this
         triggers a request event to stop the sound.
         
         Then this destroys the beat collection and creates
         a new collection with the number of beats specified
         by the signature parameter.
      */
      if ($(this.parent).hasClass('selected')) {
        dispatch.trigger('stopRequest.event', 'off');
        this.measure.reset();

        for (var i = 0; i < signature; i++) {
          this.measure.add();
        }
        //re-render the view.
        this.render();

        //recalculate the widths for each beat.
        this.calcBeatWidth(signature);
        dispatch.trigger('signatureChange.event', this.parent.get('signature'));

      }
    },

    //This determines the width of each beat based on the
    //number of beats per measure or 'signature'.
    calcBeatWidth: function(signature) {
      if ($(this.el).hasClass('selected')) {
        var px = 100/$('.measure').css('width').replace(/[^-\d\.]/g, '');
        var beatWidth = (100 - ((signature*1+1)*px))/signature;

        $(this.el).children('.beat').css({
          'width' : beatWidth+'%'
        });
      }
    }
  });
});
