// Filename: views/measures/measuresView.js
/*
  This is the MeasuresView.

  This is contained in a ComponentsView.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'backbone/collections/beats',
  'backbone/collections/measures',
  'backbone/views/beats/beatView',
  'text!backbone/templates/measures/audioMeasures.html',
  'text!backbone/templates/measures/linearBarMeasures.html',
  'text!backbone/templates/measures/linearBarSVGMeasures.html',
  'text!backbone/templates/measures/circularPieMeasures.html',
  'app/dispatch',
  'app/state',
  'app/log'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, BeatView, audioMeasuresTemplate, linearBarMeasuresTemplate, linearBarSVGMeasuresTemplate, circularPieMeasuresTemplate, dispatch, state, log){
  return Backbone.View.extend({
    el: $('.component'),

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
        this.component = options.collection;
        this.parent = options.parent;
        this.el = options.el;
      } else {
        this.measure = new BeatsCollection;

        for (var i = 0; i < 4; i++) {
          this.measure.add();
        }

        this.component = new MeasuresCollection;
        this.component.add({beats: this.measure});
      }

      if (options["template-key"]) {
        this.currentBeatRepresentation = options["template-key"];
      }

      //registering a callback for signatureChange events.
      dispatch.on('signatureChange.event', this.reconfigure, this);

      //Dispatch listeners
      dispatch.on('measureRepresentation.event', this.changeMeasureRepresentation, this);

      this.render();

      //Determines the intial beat width based on the global signature. Has to be below this.render()
      this.calcBeatWidth(state.get('signature'));
    },

    changeMeasureRepresentation: function(representation) {
      this.currentMeasureRepresentation = representation;
      this.render();      
    },

    render: function(){
      $(this.el).html('<div class="addMeasure">+</div>');

      new BeatView({model:this.component.models[0].get('beats').models[0], el:this.el});
      //we create a BeatsView for each measure.
      _.each(this.component.models, function(measure) {
        // when representation button changes, the current representation template will get updated
        var compiledTemplate = _.template( this.representations[this.currentMeasureRepresentation], {measure: measure, measureAngle: 360.0 } );
        $(this.el).find('.addMeasure').before( compiledTemplate );

          console.log('measure beats: ');
          console.warn(measure.get('beats').models);
            // the old beastsView
            _.each(measure.get('beats').models, function(beat) {
              //  el:'#beat'+beat.cid
              // console.warn(that);
              console.warn(beat);
              // new BeatView({model:beat, el:this.el});
              // console.log(checker);
            }, this);
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
      if ($('#measure'+this.component.models[0].cid).parent()) {
        console.log('add measure');
        this.measure = new BeatsCollection;

        for (var i = 0; i < state.get('signature'); i++) {
          this.measure.add();
        }

        this.component.add({beats: this.measure});

        name = 'measure' + _.last(this.component.models).cid + '.';
        _.each(this.measure.models, function(beats) {
          name = name + 'beat'+ beats.cid + '.';
        }, this);

        log.sendLog([[3, "Added a measure: "+name]]);

        this.render();

        dispatch.trigger('stopRequest.event', 'off');
      }
    },

    /*
      This is called when the user clicks on the minus to remove a measure.
    */
    remove: function(ev){
      if ($('#measure'+this.component.models[0].cid).parent()) {
        //removing the last measure isn't allowed.
        if(this.component.models.length == 1) {
          console.log('Can\'t remove the last measure!');
          return;
        }
        console.log('remove measure');

        //we remove the measure and get its model.
        var model = this.component.get($(ev.target).parents('.measure').attr('id').replace('measure',''));
        this.component.remove(model);

        //send a log event showing the removal.
        log.sendLog([[3, "Removed a measure: measure"+model.cid]]);

        //re-render the view.
        this.render();

        //trigger a stop request to stop playback.
        dispatch.trigger('stopRequest.event', 'off');
      }
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
      if ($(this.el).hasClass('selected')) {
        dispatch.trigger('stopRequest.event', 'off');
        this.measure.reset();

        for (var i = 0; i < signature; i++) {
          this.measure.add();
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
