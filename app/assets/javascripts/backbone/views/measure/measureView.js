// Filename: views/measure/measureView.js
/*
  This is the MeasuresView.
  This is contained in a ComponentsView.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/collections/beats',
  'backbone/models/measure',
  'backbone/models/measureRep',
  'backbone/views/beat/beatView',
  'backbone/views/factory/beadFactoryView',
  'text!backbone/templates/measure/audioMeasures.html',
  'text!backbone/templates/measure/linearBarMeasures.html',
  'text!backbone/templates/measure/circularPieMeasures.html',
  'text!backbone/templates/measure/circularBeadMeasures.html',
  'text!backbone/templates/measure/numberLineMeasures.html',
  'colors',
  'app/dispatch',
  'backbone/models/state',
  'app/log'
], function($, _, Backbone, BeatsCollection, MeasureModel, MeasureRepModel, BeatView, BeadFactoryView, audioMeasuresTemplate, linearBarMeasuresTemplate, circularPieMeasuresTemplate, circularBeadMeasuresTemplate, numberLineMeasuresTemplate, COLORS, dispatch, state, log){
  return Backbone.View.extend({
    // el: $('.measure')[0],

    // The different representations
    representations: {
      'audio': audioMeasuresTemplate,
      'linear-bar': linearBarMeasuresTemplate,
      'circular-pie': circularPieMeasuresTemplate,
      'circular-bead': circularBeadMeasuresTemplate,
      'number-line': numberLineMeasuresTemplate
    },
    //grab the current measure representation's data-state
    currentMeasureRepresentation: '', //temp-holder until init
    previousMeasureRepresentation: '', //temp-holder until init

    //registering click events to add and remove measures.
    events : {
      'mouseenter': 'showInteractionButtons',
      'mouseleave': 'hideInteractionButtons',
      'click .addMeasure' : 'addMeasure',
      'click .addRepresentation' : 'addRepresentation',
      'click .delete' : 'removeMeasure',
      'click .measure' : 'toggleSelection',
      'click .remove-measure-btn' : 'removeMeasure'
    },

    initialize: function(options){
      //if we're being created by a componentView, we are
      //passed in options. Otherwise we create a single
      //measure and add it to our collection.
      if (options) {
        if (options.defaultMeasureRepresentation) {
          this.currentMeasureRepresentation = options.defaultMeasureRepresentation;
        }
        if(options.currentMeasureRepresentation) {
          this.currentMeasureRepresentation = options.currentMeasureRepresentation;
        }
        if(options.collectionOfMeasures) {
          this.measuresCollection = options.collectionOfMeasures;
        }
        this.parent = options.parent;
        this.model = options.model;
        this.parentCID = options.parent.CID;
        this.componentEl = options.parentEl;
        this.vis = {};
        this.vis.svg = d3.select(this.componentEl).append('svg');
        this.vis.svg.attr('class', this.currentMeasureRepresentation);
        this.d3 = {};
        this.circlePath = '';
        this.circularMeasureR = 40;
        this.unrolled = MeasureModel.unrolled;
        this.el = $('#measure'+this.model.cid);
      }
      // else {
      //   this.measure = new BeatsCollection;

      //   for (var i = 0; i < 4; i++) {
      //     this.measure.add();
      //   }

      //   this.measuresCollection = new MeasuresCollection;
      //   this.measuresCollection.add({beats: this.measure});
      // }

      if (options['template-key']) {
        this.currentBeatRepresentation = options['template-key'];

      }

      //registering a callback for signatureChange events.
      dispatch.on('signatureChange.event', this.reconfigure, this);
      //Dispatch listeners
      dispatch.on('measureRepresentation.event', this.changeMeasureRepresentation, this);
      dispatch.on('unroll.event', this.unroll, this);
      dispatch.on('tempoChange.event', this.adjustRadius, this);
      this.render();
    },

    changeMeasureRepresentation: function(representation) {
      this.previousMeasureRepresentation = this.currentMeasureRepresentation;
      this.currentMeasureRepresentation = representation;
      // var d3Beats = d3.selectAll($('.d3'));
      // console.warn(d3Beats);
      // for (var i = 0; i<d3Beats.length ; i++){
      //   d3Beats[i].exit();
      // }
      this.render();
    },
    transitionRoll: function(options) {
      if (this.unrolled == false) {
        for(i=0; i<this.measureNumberOfPoints; i++){
            options.circlePath.data([this.circleStates[this.measureNumberOfPoints-1-i]])
                .transition()
                .delay(this.animationDuration*i)
                .duration(this.animationDuration)
                .ease('linear')
                .attr('d', this.pathFunction);
        }
      } else {
        console.log('unroll clicked');
        console.warn(options);
        for(i=0; i<this.measureNumberOfPoints; i++){
            options.circlePath.data([this.circleStates[i]])
                .transition()
                .delay(this.animationDuration*i)
                .duration(this.animationDuration)
                .ease('linear')
                .attr('d', this.pathFunction);
        }
      }
      this.unrolled = !this.unrolled;
    },

    rollup: function() {
      for(i=0; i<this.measureNumberOfPoints; i++){
          circlePath.data([this.circleStates[this.measureNumberOfPoints-1-i]])
              .transition()
              .delay(this.animationDuration*i)
              .duration(this.animationDuration)
              .ease('linear')
              .attr('d', this.pathFunction);
      }
    },

    render: function(){
      window.csf = this.el;
      // REPLACE whatever is already in the measure container with: a plus sign in the measure rendering
      $(this.componentEl).html('<div class="addMeasure pull-right">+</div>');

      //Remove button
      // var removeButtonEl = $('.remove-measure-btn');

      // Circular
      var circularMeasureCx = 100;
      var circularMeasureCy = 50;
      var circularMeasureR = this.circularMeasureR;
      // Linear

      // Pie
      var measureStartAngle = 0;
      var beatStartAngle;
      var beatEndAngle;
      // Bead
      var circularBeadBeatRadius = 8;
      var measureNumberOfPoints = 60; //always add 1 to close the circle AND keep under 91 to avoid computational and animation delay
      this.measureNumberOfPoints = measureNumberOfPoints;
        // Transition
        var margin = {top: 20, left: 60};
        var lineLength = 2 * circularMeasureR * Math.PI;
        var lineDivision = lineLength/measureNumberOfPoints;
        var animationDuration = 3000/measureNumberOfPoints;
      // Linear
      var beatBBX;
      var xMeasureLocation = 15; // 5%
      var yMeasureLocation = 10;
      var lbbMeasureWidth = 272; // 90%
      var lbbMeasureHeight = 25;
      var linearBeatXPadding = 0; // 5% left AND right
      var linearBeatYPadding = 0;  // tiny sliver
      var beatHeight = 25 - 2*linearBeatYPadding;
      var beatBBY = 10 + linearBeatYPadding;
      var beatHolderWidth = lbbMeasureWidth-(2*linearBeatXPadding);
      // Time
      var firstBeatStart = 0; // in s
      var timeIncrement = 500; // in ms
      // Audio
      var audioMeasureCx = 50;
      var audioMeasureCy = 40;
      var audioMeasureR = 12;
      var audioBeatCx = 50;
      var audioBeatCy = 40;
      var audioBeatR = 12;
      var colorForAudio = COLORS.hexColors[5];

      // for each measure in measuresCollection
      // _.each(this.measuresCollection.models, function(measure, index) {

        var ƒthis = this;
        var circleStates = [];
        for (i=0; i<measureNumberOfPoints; i++){
            // circle portion
            var circleState = $.map(Array(measureNumberOfPoints), function (d, j) {
              // margin.left + measureRadius
              var x = circularMeasureCx + lineDivision*i + circularMeasureR * Math.sin(2 * j * Math.PI / (measureNumberOfPoints - 1));
              // margin.top + measureRadius
              var y =  circularMeasureCy - circularMeasureR * Math.cos(2 * j * Math.PI / (measureNumberOfPoints - 1));
              return { x: x, y: y};
            })
            circleState.splice(measureNumberOfPoints-i);
            //line portion
            var lineState = $.map(Array(measureNumberOfPoints), function (d, j) {
               // margin.left + measureRadius
              var x = circularMeasureCx + lineDivision*j;
              // margin.top
              var y =  circularMeasureCy - circularMeasureR;
              return { x: x, y: y};
            })
            lineState.splice(i);
            //together
            var individualState = lineState.concat(circleState);
            circleStates.push(individualState);
        }
        this.circleStates = circleStates;

        // (when representation button changes, the current representation template will get updated)
        // compile the template for a measure
        console.warn(this.model);
        var measureTemplateParamaters = {
          measure: this.model,
          mCID: this.model.cid,
          beatHolder:'beatHolder'+this.model.cid,
          beatFactoryHolder: 'beatFactoryHolder'+this.model.cid,
          measureCount:this.measuresCollection.length,
          measureAngle: 360.0,
          beatHolderWidth: beatHolderWidth,
          // SVG Properties
          measureWidth: lbbMeasureWidth,
          measureHeight: lbbMeasureHeight,
          measureColor: COLORS.hexColors[COLORS.colorIndices.WHITE],
          // Circular
          circularMeasureCx: circularMeasureCx,
          circularMeasureCy: circularMeasureCy,
          circularMeasureR: circularMeasureR,

          xMeasureLocation: xMeasureLocation,
          yMeasureLocation: yMeasureLocation,
          // Bead
          measureNumberOfPoints: measureNumberOfPoints,
          //Audio
          audioMeasureCx: audioMeasureCx,
          audioMeasureCy: audioMeasureCy,
          audioMeasureR: audioMeasureR,
          audioBeatCx: audioBeatCx,
          audioBeatCy: audioBeatCy,
          audioBeatR: audioBeatR,
          colorForAudio: colorForAudio,
          // Transition
          circleStates: circleStates,
          lineData: lineData,
          pathFunction: this.circlePath,

          //Number Line
          xOffset: beatHolderWidth/this.measuresCollection.models[0].attributes.beats.length / 2,
          yOffset: lbbMeasureHeight / 2
        };

        var compiledTemplate = _.template( this.representations[this.currentMeasureRepresentation], measureTemplateParamaters );

        // find the plus sign we put in there, and right before it, put in the rendered template
        $(this.componentEl).find('.addMeasure').before( compiledTemplate )

        if (this.currentMeasureRepresentation == 'circular-bead') {
          var lineData = $.map(Array(measureNumberOfPoints), function (d, i) {
              var y = margin.top;
              var x = margin.left + i * lineLength / (measureNumberOfPoints - 1)
              return {x: x, y: y}
          });
          var pathFunction = d3.svg.line()
              .x(function (d) {return d.x;})
              .y(function (d) {return d.y;})
              .interpolate('basis'); // bundle | basis | linear | cardinal are also options

          //The Circle SVG Path we draw MUST BE AFTER THE COMPILED TEMPLATE
          var svgContainer = d3.select('#svg'+this.model.cid)
              // .call(d3.experiments.dragAll);
          var circlePath = svgContainer
              .insert('path', ':first-child')
              .data([circleStates[0]])
              .attr('d', pathFunction)
              .attr('stroke', 'black')
              .attr('opacity', 1)
              .attr('class', 'circle')
              .attr('class', 'circle-path')

          function transitionRoll(options) {
            if (this.unrolled == false) {
              for(i=0; i<this.measureNumberOfPoints; i++){
                  options.circlePath.data([this.circleStates[this.measureNumberOfPoints-1-i]])
                      .transition()
                      .delay(this.animationDuration*i)
                      .duration(this.animationDuration)
                      .ease('linear')
                      .attr('d', this.pathFunction);
              }
            } else {
              console.log('unroll clicked');
              console.warn(options);
              for(i=0; i<this.measureNumberOfPoints; i++){
                  options.circlePath.data([this.circleStates[i]])
                      .transition()
                      .delay(this.animationDuration*i)
                      .duration(this.animationDuration)
                      .ease('linear')
                      .attr('d', this.pathFunction);
              }
            }
            this.unrolled = !this.unrolled;
          }

          function unroll() {
            for(i=0; i<measureNumberOfPoints; i++){
                circlePath.data([circleStates[i]])
                    .transition()
                    .delay(animationDuration*i)
                    .duration(animationDuration)
                    .ease('linear')
                    .attr('d', pathFunction);
            }
          };
          function reverse() {
            for(i=0; i<measureNumberOfPoints; i++){
                circlePath.data([circleStates[measureNumberOfPoints-1-i]])
                    .transition()
                    .delay(animationDuration*i)
                    .duration(animationDuration)
                    .ease('linear')
                    .attr('d', pathFunction);
            }
          };

          // $('#a'+measure.cid).on('click', dispatch.trigger('unroll.event'), circlePath);
          $('#a'+this.model.cid).on('click', unroll);
          $('#b'+this.model.cid).on('click', reverse);
        }

        // Managing the hover showing of the delete buttons
        // $('#measure' + measure.cid).hover(
        //     function() {
        //         $('.remove-measure-btn').removeClass('visHidden');
        //         $('.resize-measure-pull').removeClass('visHidden');
        //     },
        //     function() {
        //         $('.remove-measure-btn').addClass('visHidden');
        //         $('.resize-measure-pull').addClass('visHidden');
        //     }
        // );

        // console.log(this.currentMeasureRepresentation);
        // for each beat in this measure
        _.each(this.model.get('beats').models, function(beat, index) {

          // create a Beatview
          var measurePassingToBeatViewParamaters = {
            //General
            model: beat,
            parentElHolder: '#beatHolder'+this.model.cid,
            parent: this.model,
            parentCID: this.model.cid,
            singleBeat: '#beat'+beat.cid,
            beatIndex: index,
            margin : margin,
            measureRepresentation: this.currentMeasureRepresentation,
            beatsInMeasure: this.model.attributes.beats.length,
            // To use the range of colors
            color: index,
            // To use one color
            // color: x,
            timeIncrement: timeIncrement,
            //Linear
           // beatBBX: xMeasureLocation + linearBeatXPadding+(this.beatWidth*(index)),
            beatBBY: beatBBY,
            beatHolderWidth: beatHolderWidth,
            linearBeatXPadding: linearBeatXPadding,
            beatWidth: beatHolderWidth/this.measuresCollection.models[0].attributes.beats.length,
            beatHeight: beatHeight,
            // Circular Pie
            circularMeasureCx: circularMeasureCx,
            circularMeasureCy: circularMeasureCy,
            circularMeasureR: circularMeasureR,
            beatAngle: 360/this.measuresCollection.models[0].attributes.beats.length,
            beatStartAngle: -90+((360/this.measuresCollection.models[0].attributes.beats.length)*index),
            beatStartTime: firstBeatStart+(index)*(timeIncrement/1000),
            
            // Circular Bead
            beatRadius: circularBeadBeatRadius,
            circleStates: circleStates,
            measureNumberOfPoints: measureNumberOfPoints,

            // Transition
            animationDuration: animationDuration,

            //Audio
            audioMeasureCx: audioMeasureCx,
            audioMeasureCy: audioMeasureCy,
            audioMeasureR: audioMeasureR,
            audioBeatCx: audioBeatCx,
            audioBeatCy: audioBeatCy,
            audioBeatR: audioBeatR,
            colorForAudio: colorForAudio
          };

          // manipulate linear-bar beat parameters
          measurePassingToBeatViewParamaters.beatBBX = xMeasureLocation + linearBeatXPadding+(measurePassingToBeatViewParamaters.beatWidth*(index));
          measurePassingToBeatViewParamaters.opacity = beat.get('selected');

          // manipulate circular-pie beat parameters
          // 

          new BeatView(measurePassingToBeatViewParamaters);
        }, this);
      // }, this);

      // make a beat factory
      this.measurePassingToBeatFactoryParamaters = {
        // beat, number of beats, each beat's color, location, path
        beatFactoryHolder: '#beatFactoryHolder'+this.model.cid,
        remainingNumberOfBeats: 16-this.model.get('beats').models.length,
        currentMeasureRepresentation: this.currentMeasureRepresentation,
        beadRadius: circularBeadBeatRadius,
        colorIndex: ''
      };
      if (this.currentMeasureRepresentation == 'circular-bead') {
        for (i = 0 ; i < this.measurePassingToBeatFactoryParamaters.remainingNumberOfBeats ; i++){
          var index = 15-i;
          //Base + Math.random() * (max - min) + min;
          this.measurePassingToBeatFactoryParamaters.x = 20 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.y = 100 + (Math.random() * (20) - 10);
          this.measurePassingToBeatFactoryParamaters.colorIndex = index;
          // this.measurePassingToBeatFactoryParamaters.colorIndex = 18;
          new BeadFactoryView(this.measurePassingToBeatFactoryParamaters);
        }
      }

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
    addMeasure: function(){
        console.log('add a measure');
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
        log.sendLog([[3, 'Added a measure: ' + name]]);

        //Render
        this.render();
        //Dispatch
        dispatch.trigger('stopRequest.event', 'off');
    },

    addRepresentation: function(){
        console.log('adding another representation of the measure');
        var sameMeasure = this.measuresCollection;

        this.measuresCollection.add({beats: newMeasure});

        //Logging
        name = 'measure' + _.last(this.measuresCollection.models).cid + '.';
        _.each(newMeasure.models, function(beats) {
          name = name + 'beat'+ beats.cid + '.';
        }, this);
        log.sendLog([[3, 'Added a measure: ' + name]]);

        //Render
        this.render();
        //Dispatch
        dispatch.trigger('stopRequest.event', 'off');
    },

    /*
      This is called when the user clicks on the minus to remove a measure.
    */
    removeMeasure: function(ev){
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
        log.sendLog([[3, 'Removed a measure: measure' + this.cid]]);

        //re-render the view.
        this.render();

        //trigger a stop request to stop playback.
        dispatch.trigger('stopRequest.event', 'off');
        dispatch.trigger('signatureChange.event', this.parent.get('signature'));
      }
    },
    // This is triggered by signatureChange events.
    reconfigure: function(signature) {
      /* if the containing component is selected, this
         triggers a request event to stop the sound.
         
         Then this destroys the beats and creates
         new beats with the number of beats specified
         by the signature parameter.
      */
      if ($(this.componentEl).hasClass('selected')) {
        dispatch.trigger('stopRequest.event', 'off');
        for (var i = 0; i < this.measuresCollection.models.length; i++) {
          while (this.measuresCollection.models[i].get('beats').length < signature) {
            this.measuresCollection.models[i].get('beats').add();
          }
          while (this.measuresCollection.models[i].get('beats').length > signature) {
            // silent:true means to not call another event
            this.measuresCollection.models[i].get('beats').pop({silent:true});
            // when selected beats equals the denominator, and we remove a beat, we need to recalculate
            // the fraction with the new selected beats
            dispatch.trigger('signatureChange.event', this.measuresCollection.models[i].get('beats').length)
          } 
        }
        //re-render the view.
        this.render();
      }
    },
    adjustRadius: function(tempo) {
      if ($(this.componentEl).hasClass('selected')) {
        console.log('here');
        this.circularMeasureR = (tempo/120)*40;
        //re-render the view
        this.render();
      }
    },
    //This is called when the component is clicked anywhere to bring
    //the component into focus as selected.
    toggleSelection: function(e){
      e.stopPropagation();
      $('#measure'+this.measuresCollection.models[0].cid).toggleClass('selected');
    },

    showInteractionButtons: function () {
  console.error('gih');
      $('.remove-measure-btn').css({'visibility' : 'visible'});
      $('.resize-measure-pull').css({'visibility' : 'visible'});
      // resize-measure-pull
    },

    hideInteractionButtons: function () {
  console.error('gih');
      $('.remove-measure-btn').css({'visibility' : 'hidden'});
      $('.resize-measure-pull').css({'visibility' : 'hidden'});
    }



  });
});
