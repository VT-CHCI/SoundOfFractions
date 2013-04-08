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
  'text!backbone/templates/measures/circularBeadMeasures.html',
  'app/dispatch',
  'app/state',
  'app/log'
], function($, _, Backbone, MeasureModel, BeatsCollection, MeasuresCollection, beatView, audioMeasuresTemplate, linearBarMeasuresTemplate, linearBarSVGMeasuresTemplate, circularPieMeasuresTemplate, circularBeadMeasuresTemplate, dispatch, state, log){
  return Backbone.View.extend({
    // el: $('.component'),

    // The different representations
    representations: {
      "audio": audioMeasuresTemplate,
      "linear-bar": linearBarMeasuresTemplate,
      "linear-bar-svg": linearBarSVGMeasuresTemplate,
      "circular-pie": circularPieMeasuresTemplate,
      "circular-bead": circularBeadMeasuresTemplate,
    },
    currentMeasureRepresentation: 'linear-bar',
      measureColors: {
      0: "#FF0000",   //red
      1: "#802A2A",   //brown
      2: "#EE4000",   //dark orange
      3: "#FF7722",   //light orange
      4: "#FFD700",   //yellow
      5: "#808000",   //olive
      6: "#80ff00",   //light green
      7: "#00ff00",   //bright green
      8: "#00ff80",   //Turquoise
      9: "#00ffff",  //light blue
      10: "#0080ff",  //med blue
      11: "#0000ff",  //blue
      12: "#8000ff",  //purple
      13: "#ff00ff",  //magenta
      14: "#ff0080",  //hot pink
      15: "#4B0082"   //indigo
    },

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

      var centerX = 150;
      var centerY = 50;
      var measureStartAngle = 0;
      var beatStartAngle;
      var beatEndAngle;
      var radius = 40;
      var beatBBX = 35;
      var beatBBY = 15;
      var beatWidth = 40;
      var beatHeight = 15;
      var firstBeatStart = 0; //in s
      var timeIncrement = 500; //in ms
      var lbbMeasureWidth = 250;
      var lbbMeasureHeight = 25;
      var xPadding = 25;
      var yPadding = 10;
      var beatHolderWidth = lbbMeasureWidth-(2*xPadding);

      // console.log(this.representations[this.currentMeasureRepresentation]);

      // for each measure in measuresCollection
      _.each(this.measuresCollection.models, function(measure, index) {
        // (when representation button changes, the current representation template will get updated)
        // compile the template for a measure
        var measureTemplateParamaters = {
          measure: measure,
          beatHolder:"beatHolder"+measure.cid,
          measureCount:index+1,
          measureAngle: 360.0,
          measureWidth: lbbMeasureWidth,
          measureHeight: lbbMeasureHeight,
          xMeasureLocation: xPadding,
          yMeasureLocation: yPadding,
          beatHolderWidth: beatHolderWidth,
          cx: centerX,
          cy: centerY,
          r: radius,
          measureColor:this.measureColors[11]
        };

        var compiledTemplate = _.template( this.representations[this.currentMeasureRepresentation], measureTemplateParamaters );

        // find the plus sign we put in there, and right before it, put in the rendered template
        $(this.el).find('.addMeasure').before( compiledTemplate );

        // for each beat in this measure
        _.each(measure.get('beats').models, function(beat, index) {

          // create a beatview
          var measurePassingToBeatViewParamaters = {
            //General
            model:beat,
            parentElHolder:'#beatHolder'+measure.cid,
            parent:measure,
            parentCID:measure.cid,
            singleBeat:"#beat"+beat.cid,
            measureRepresentation:this.currentMeasureRepresentation,
            beatsInMeasure: this.measuresCollection.models[0].attributes.beats.length,
              // To use the range of colors
              color: index,
              // To use one color
              // color: x,
            timeIncrement: timeIncrement,
            //Linear
            beatBBX: beatBBX,
            beatBBY: beatBBY,
            beatWidth: beatHolderWidth/this.measuresCollection.models[0].attributes.beats.length,
            beatHeight: beatHeight,
            // Circular Pie
            cx: centerX,
            cy: centerY,
            measureR: radius,
            beatAngle: 360/this.measuresCollection.models[0].attributes.beats.length,
            beatStartAngle: -90+((360/this.measuresCollection.models[0].attributes.beats.length)*index),
            beatStartTime: firstBeatStart+(index)*(timeIncrement/1000),
            // Circular Pie
            beatR: 5
          };

          // manipulate linear-bar-svg beat parameters
          measurePassingToBeatViewParamaters.beatBBX = beatBBX+(beatWidth*index);
          measurePassingToBeatViewParamaters.opacity = beat.get('selected');

          // manipulate circular-pie beat parameters
          // 

          new beatView(measurePassingToBeatViewParamaters);
        }, this);
      }, this);

      // TODO, we need to refresh the svg
      // $('#component'+this.parent.cid).html($('#component'+this.parent.cid).html());


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

      window.csf = this;
      if ($(this.el).hasClass('selected')) {
        dispatch.trigger('stopRequest.event', 'off');
        this.measuresCollection.models[0].get('beats').reset();

        for (var i = 0; i < signature; i++) {
          this.measuresCollection.models[0].add();
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
