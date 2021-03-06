//filename: models/representation.js
/*
  This is the representation model.
  It keeps track of what type of representation it is and was, and how many times it has been transitioned
*/
define([
  'jquery',
  'underscore',
  'bbone',
  'colors',
  'logging'
], function($, _, Backbone, COLORS, Logging) {
  var RepresentationModel = Backbone.Model.extend({
    defaults: {
      // Constant Variables throughout the representations
      // General
        divHeight: 217,
        currentScale: 1,
        vertDivPadding: 10,
        horzDivPadding: 15,
      // Beat Factory
        beatFactoryAreaHeight: 250,
      // Circular
        initialCircularMeasureR: 51,  // 8 pxs per bead plus 1 px border = 10 ||| 10 * 16 = 160/pi = 51
        cX: 100,
        cY: 100,
      // Transition
        marginTop: 20,
        marginLeft: 60,
        transitions: 0,
        animationIntervalDuration: 200, // 1000 is normal
      // Audio
        //Measure
        audioMeasureCx: 50,
        audioMeasureCy: 40,
        audioMeasureR: 12,
        //Beat
        audioBeatCx: 50,
        audioBeatCy: 40,
        audioBeatR: 12,
        colorForAudio: COLORS.hexColors[4],
      // Pie
        //Measure
        measureStartAngle: 0,
        //Beat
        beatStartAngle: null,
        beatEndAngle: null,
        beatFactoryR: 30,
      // Bead
        circularBeadBeatRadius: 8,
      //Number Line
        lineHashHeight: 30,
      // Bar
        //Measure
        lbbMeasureLocationX: 15, // ~5%
        // lbbMeasureLocationY: 40,
        lbbMeasureHeight: 25,
        //Beat
        linearBeatXPadding: 0,
        linearBeatYPadding: 0,
        beatFactoryBarWidth: 30,
        beatFactoryBarHeight: 15,
    },
    initialize: function(options){
      // console.log('init representation model');
      this.setDefaults();
      this.set('previousRepresentationType', 'not_yet_defined');
      this.set('currentRepresentationType', options.currentRepresentationType);
      this.set('beatsCollection', options.beatsCollection);
      this.computeRemainingAttributes();

      // When the sister collection of beats changes in length (ie the add or remove a beat in the collection), we need to redo all of the calculations
      this.listenTo(this.get('beatsCollection'), 'add remove', this.updateInformation)
      console.log(options); 
      if(options.parentMeasureModel){
// debugger;
        this.set('parentMeasureModel', options.parentMeasureModel);
        this.listenTo(this.get('parentMeasureModel'), 'change:currentScale', this.updateScale)
      }
    },
    addParentMeasureModelAfter: function(parentMeasureModel){
// debugger;
      this.set('parentMeasureModel', parentMeasureModel);
      this.listenTo(this.get('parentMeasureModel'), 'change:currentScale', this.updateScale)
    },
    updateScale: function(){
// debugger;
      this.set('currentScale', this.get('parentMeasureModel').get('currentScale'));
      this.set('divHeight', this.get('parentMeasureModel').get('divHeight'));
      
      this.computeRemainingAttributes();
    },
    updateInformation: function(){
      this.set('currentScale', this.get('parentMeasureModel').get('currentScale'));
      if(this.get('parentMeasureModel').get('divHeight')){      
        this.set('divHeight', this.get('parentMeasureModel').get('divHeight'));
      }
      this.computeRemainingAttributes();
    },
    computeRemainingAttributes: function(){
      // TODO number of beats....
      this.calculateNumberOfPoints(this.get('beatsCollection').length);
      this.set({
        //Circular
        circularMeasureCx: (this.get('cX')+this.get('horzDivPadding'))*this.get('currentScale'),
        circularMeasureCy: (this.get('cY')+this.get('vertDivPadding'))*this.get('currentScale'),
        circularMeasureR: this.get('initialCircularMeasureR')*this.get('currentScale'),
        // Pie
        beatAngle: 360/this.get('beatsCollection').length,
        // Transition
        firstBeatStart: 0, // in s
        timeIncrement: 500, // in ms
        transitionDuration: 1500/this.get('transitionNumberOfPoints'), // 3000 is default
        // Number Line
                  // var y =  µthis.get('circularMeasureCy') - µthis.get('circularMeasureR');
        beatHeight: this.get('lbbMeasureHeight') - 2*this.get('linearBeatYPadding'),
        beatBBY: this.get('linearBeatYPadding') + this.get('lbbMeasureLocationY')
      });
      this.set({
        // Linear
        linearLineLength: 2 * this.get('circularMeasureR') * Math.PI,
        numberLineY: this.get('circularMeasureCy')-this.get('circularMeasureR'),
        lbbMeasureLocationY: this.get('circularMeasureCy')-this.get('circularMeasureR')
      });

      this.set({
        // Line
        lineBeatY1: this.get('numberLineY') - this.get('lineHashHeight')/2,
        lineBeatY2: this.get('numberLineY') + this.get('lineHashHeight')/2
      });

      // These have to be set after the above as they have dependencies, and I am unsure if they fire in order....
      this.set({
        //                 |---- Diameter --------------|   |- horizontal padding on sides ---|  |- center X offset ---|
        circularDivWidth:  2*this.get('circularMeasureR') + 2*this.get('horzDivPadding') +       this.get('cX')*this.get('currentScale'), 
        //Circular
        //                 |---- Diameter --------------|   |- horizontal padding on sides ---|
        // circularDivHeight: 2*this.get('circularMeasureR') + this.get('vertDivPadding'),
        circularDivHeight: 2*this.get('circularMeasureR') + this.get('vertDivPadding') +         this.get('cY')*this.get('currentScale'),
        // Linear
                                                      // It needs a bit more, hence the 2x
        linearDivWidth: this.get('linearLineLength') + 2*this.get('horzDivPadding'),
        linearDivHeight: 200,
        // linearDivHeight: 25 + this.get('vertDivPadding'),
        lineDivision: this.get('linearLineLength')/this.get('transitionNumberOfPoints'),
        // Transition
        // Line
        lbbMeasureWidth: this.get('linearLineLength'),

        // TODO number of beats
        // TODO, set up a listener for this when it changes
        // beatWidth: this.get('linearLineLength')/this.model.get('beats').length;
        beatWidth: this.get('linearLineLength')/this.get('beatsCollection').length

      });
      // Has to be at the end for all the stuff it uses...
      this.calculateCircleStates();
    },
    setDefaults: function() {
        this.set({
          "divHeight": this.defaults.divHeight,
          "currentScale": this.defaults.currentScale,
          "vertDivPadding": this.defaults.vertDivPadding,
          "horzDivPadding": this.defaults.horzDivPadding,
          "initialCircularMeasureR": this.defaults.initialCircularMeasureR,
          "cX": this.defaults.cX,
          "cX": this.defaults.cX,
          "marginTop": this.defaults.marginTop,
          "marginLeft": this.defaults.marginLeft,
          "transitions": this.defaults.transitions,
          "animationIntervalDuration": this.defaults.animationIntervalDuration,
          "audioMeasureCx": this.defaults.audioMeasureCx,
          "audioMeasureCy": this.defaults.audioMeasureCy,
          "audioMeasureR": this.defaults.audioMeasureR,
          "audioBeatCx": this.defaults.audioBeatCx,
          "audioBeatCy": this.defaults.audioBeatCy,
          "audioBeatR": this.defaults.audioBeatR,
          "audioBeatR": this.defaults.audioBeatR,
          "measureStartAngle": this.defaults.measureStartAngle,
          "beatStartAngle": this.defaults.beatStartAngle,
          "beatEndAngle": this.defaults.beatEndAngle,
          "beatFactoryR": this.defaults.beatFactoryR,
          "circularBeadBeatRadius": this.defaults.circularBeadBeatRadius,
          "lineHashHeight": this.defaults.lineHashHeight,
          "lbbMeasureLocationX": this.defaults.lbbMeasureLocationX,
          // "lbbMeasureLocationY": this.defaults.lbbMeasureLocationY,
          "lbbMeasureHeight": this.defaults.lbbMeasureHeight,
          "linearBeatXPadding": this.defaults.linearBeatXPadding,
          "linearBeatYPadding": this.defaults.linearBeatYPadding,
          "beatFactoryBarWidth": this.defaults.beatFactoryBarWidth,
          "beatFactoryBarHeight": this.defaults.beatFactoryBarHeight,
          "beatFactoryAreaHeight": this.defaults.beatFactoryAreaHeight
        });
    },
    // This is what calculates the different states of circles and lines throughout an animation of a circle to a line or a line to a circle
    calculateCircleStates: function(){
      var circleStates = [];
      // var transitionNumberOfPoints = this.get('transitionNumberOfPoints');
      // var tNOP = this.get('transitionNumberOfPoints');

      for (i=0; i<this.get('transitionNumberOfPoints'); i++){
        // circle portion
        µthis = this;
        var circleState = $.map(Array(this.get('transitionNumberOfPoints')), function (d, j) {
          var x = µthis.get('circularMeasureCx') + µthis.get('lineDivision')*i + µthis.get('circularMeasureR') * Math.sin(2 * j * Math.PI / (µthis.get('transitionNumberOfPoints') - 1));
          var y =  µthis.get('circularMeasureCy') - µthis.get('circularMeasureR') * Math.cos(2 * j * Math.PI / (µthis.get('transitionNumberOfPoints') - 1));
          return { x: x, y: y};
        });
        circleState.splice(this.get('transitionNumberOfPoints')-i);
        //line portion
        var lineState = $.map(Array(this.get('transitionNumberOfPoints')), function (d, j) {
          var x = µthis.get('circularMeasureCx') + µthis.get('lineDivision')*j;
          var y =  µthis.get('circularMeasureCy') - µthis.get('circularMeasureR');
          return { x: x, y: y};
        })
        lineState.splice(i);
        //together
        var individualState = lineState.concat(circleState);
        circleStates.push(individualState);
      }
      // for (i=0; i<transitionNumberOfPoints; i++){
      //   // circle portion
      //   var circleState = $.map(Array(transitionNumberOfPoints), function (d, j) {
      //     var x = this.get('circularMeasureCx') + this.get('lineDivision')*i + this.get('circularMeasureR') * Math.sin(2 * j * Math.PI / (transitionNumberOfPoints - 1));
      //     var y =  this.get('circularMeasureCy') - this.get('circularMeasureR') * Math.cos(2 * j * Math.PI / (transitionNumberOfPoints - 1));
      //     return { x: x, y: y};
      //   })
      //   circleState.splice(transitionNumberOfPoints-i);
      //   //line portion
      //   var lineState = $.map(Array(transitionNumberOfPoints), function (d, j) {
      //     var x = this.get('circularMeasureCx') + this.get('lineDivision')*j;
      //     var y =  this.get('circularMeasureCy') - this.get('circularMeasureR');
      //     return { x: x, y: y};
      //   })
      //   lineState.splice(i);
      //   //together
      //   var individualState = lineState.concat(circleState);
      //   circleStates.push(individualState);
      // }
      this.set({ 'circleStates': circleStates});
    },
    // We need to calculate the number of points for animation transitions
    // We want to be above 30 for fluidity, but below 90 to avoid computational and animation delay
    calculateNumberOfPoints: function(n) {
      // this.set({'transitionNumberOfPoints': 80});
      switch (n){
        case 1:
          this.set({'transitionNumberOfPoints': 40});
          break;
        case 2:
          this.set({'transitionNumberOfPoints': 40});
          break;
        case 3:
          this.set({'transitionNumberOfPoints': 42});
          break;
        case 4:
          this.set({'transitionNumberOfPoints': 40});
          break;
        case 5:
          this.set({'transitionNumberOfPoints': 40});
          break;
        case 6:
          this.set({'transitionNumberOfPoints': 42});
          break;
        case 7:
          this.set({'transitionNumberOfPoints': 42});
          break;
        case 8:
          this.set({'transitionNumberOfPoints': 40});
          break;
        case 9:
          this.set({'transitionNumberOfPoints': 45});
          break;
        case 10:
          this.set({'transitionNumberOfPoints': 40});
          break;
        case 11:
          this.set({'transitionNumberOfPoints': 44});
          break;
        case 12:
          this.set({'transitionNumberOfPoints': 48});
          break;
        case 13:
          this.set({'transitionNumberOfPoints': 39});
          break;
        case 14:
          this.set({'transitionNumberOfPoints': 42});
          break;
        case 15:
          this.set({'transitionNumberOfPoints': 45});
          break;
        case 16:
          this.set({'transitionNumberOfPoints': 48});
          break;
      }
    },
    transition: function(newRep, numberOfBeats){
      console.log('rep model new repType', newRep);
      this.set('previousRepresentationType', this.get('currentRepresentationType'));
      this.set('currentRepresentationType', newRep);
      this.set({
        transitions: this.get('transitions')+1
      });
      this.computeRemainingAttributes({numberOfBeats: numberOfBeats});
      Logging.logStorage("Transitioned a rep from " + this.get('previousRepresentationType') + " to " + this.get('currentRepresentationType'));
    }
  });

  return RepresentationModel;
});