//filename: views/beats/beatView.js
/*
  This is the view for a single beat, which
  is contained in a measure view.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/models/beat',
  'text!backbone/templates/beat/audioBeats.html',
  'text!backbone/templates/beat/linearBarBeats.html',
  'text!backbone/templates/beat/linearBarSVGBeats.html',
  'text!backbone/templates/beat/circularPieBeats.html',
  'text!backbone/templates/beat/circularBeadBeats.html',
  'text!backbone/templates/beat/numberLineBeats.html',
  'colors',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, audioBeatsTemplate,
  linearBarBeatsTemplate, linearBarSVGBeatsTemplate, circularPieBeatsTemplate,
  circularBeadBeatsTemplate, numberLineBeatsTemplate, COLORS, dispatch, log){
  return Backbone.View.extend({

    /* TODO still issues with this
      el: '.beat',
      registering backbone's click event to our toggle() function.
    */
     events : {
       'click' : 'toggle'
     },

    // The different representations
    representations: {
      "audio": audioBeatsTemplate,
      "linear-bar": linearBarBeatsTemplate,
      "linear-bar-svg": linearBarSVGBeatsTemplate,
      "circular-pie": circularPieBeatsTemplate,
      "circular-bead": circularBeadBeatsTemplate,
      "number-line": numberLineBeatsTemplate
    },
    //grab the current measure representation's data-state
    currentBeatRepresentation: $('#measure-representation-buttons').children('.active').attr('data-state'),
    previousBeatRepresentation: $('#measure-representation-buttons').children('.active').attr('data-state'),

    //The constructor takes options because these views are created
    //by measuresView objects.
    initialize: function(options){
      if (options) {
        // TODO: need to take in an option about currentBeatRep
        // TODO: maybe need to respond to a representation changed event (change this.currentBeatRepresentation and rerender)
        this.model = options.model;

        // this is the html element into which this class should render its template
        this.measureBeatHolder = options.parentElHolder;
        this.el = options.singleBeat;
        this.parent = options.parent;
        this.currentBeatRepresentation = options.measureRepresentation;
        this.cx = options.cx;
        this.cy = options.cy;
        this.measureR = options.measureR;
        this.beatBBX = options.beatBBX;
        this.beatBBY = options.beatBBY;
        this.beatWidth = options.beatWidth;
        this.beatHeight = options.beatHeight;
        this.opacity = this.getOpacityNumber(options.opacity);
        this.beatsInMeasure = options.beatsInMeasure;
        this.beatAngle = options.beatAngle;
        this.beatStartAngle = options.beatStartAngle;
        this.color = options.color;                             //index number
        this.colorForAudio = options.colorForAudio;
        this.beatStartTime = options.beatStartTime;
        this.timeIncrement = options.timeIncrement;
        this.beatR = options.beatRadius;
        this.beatRForAudio = options.beatRForAudio;
        this.beatHolderWidth = options.beatHolderWidth;
        this.linearBeatXPadding = options.linearBeatXPadding;
        this.circleStates = options.circleStates;
        this.beatNumberOfPoints = 9;
        this.beatIndex = options.beatIndex;
        this.margin = options.margin;
        this.measureNumberOfPoints = options.measureNumberOfPoints;
        this.animationDuration = options.animationDuration;
        this.beatCenterPosition = {};
        // To allow the toggle function to be accesable outside of the nested d3 functions inside render
        // per http://stackoverflow.com/questions/16672862/reference-backbone-functions-from-within-a-nested-d3-function?noredirect=1#comment24003171_16672862
        _.bindAll(this, 'toggle');
      } else {
        console.error('should not be in here!');
        this.model = new BeatModel;
      }

      this.render();
    },

    //We use css classes to control the color of the beat.
    //A beat is essentially an empty div.
    render: function(toggledBeat){
      // the current state of the beat (is it ON or OFF?)
      var state = this.getSelectionBooleanCSS();
      var ƒthis = this;

      // if render is being called from the toggle function, we may want to do something different
      if (toggledBeat) {
        console.log('getting in re-render with toggledBeat');
        //SVG
        if(this.currentBeatRepresentation == 'number-line') {
          // $('#beat'+toggledBeat.cid)[0].setAttribute('fill-opacity', this.getOpacityNumber(toggledBeat.get('selected')));
        }
        else {
          var toggled = d3.select($('#beat'+this.cid));
          toggled[0][0].attr('style', 'opacity: '+this.getOpacityNumber(toggledBeat.get('selected')));
        }
      } else {
        // this is reached during the initial rendering of the page or transition

        var beatTemplateParameters = {
          beat: this.model,
          beatAngle: this.beatAngle,
          state: state,
          color: COLORS.hexColors[this.color],
          beatStartTime: this.beatStartTime,
          timeIncrement: this.timeIncrement,
          beatHolderWidth: this.beatHolderWidth
        };

        //Opacity
        beatTemplateParameters.opacity = this.opacity;        

        //Linear
        var beatBBX = this.beatBBX;
        beatTemplateParameters.beatBBX = beatBBX;
        var beatBBY = this.beatBBY;
        beatTemplateParameters.beatBBY = beatBBY;
        var beatWidth = this.beatWidth;
        beatTemplateParameters.beatWidth = beatWidth;
        var beatHeight = this.beatHeight;
        beatTemplateParameters.beatHeight = beatHeight;

        //Circlular Pie
        var centerX = this.cx;
        beatTemplateParameters.cx = centerX;
        var centerY = this.cy;
        beatTemplateParameters.cy = centerY;
        var measureStartAngle = -90;
        beatTemplateParameters.measureStartAngle = measureStartAngle;
        var beatStartAngle = this.beatStartAngle;
        beatTemplateParameters.beatStartAngle = beatStartAngle;
        var beatEndAngle = beatStartAngle+this.beatAngle;
        beatTemplateParameters.beatEndAngle = beatEndAngle;
        var measureR = this.measureR;
        beatTemplateParameters.measureR = measureR;

        // x center of a bead or first x of pie piece
        if (this.currentBeatRepresentation == 'circular-pie') {
          var x1 = centerX + measureR * Math.cos(Math.PI * beatStartAngle/180); 
          beatTemplateParameters.x1 = x1;
        } else if (this.currentBeatRepresentation == 'circular-bead') {
          beatTemplateParameters.x1 = this.circleStates[0][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.measureNumberOfPoints))].x;
        }
        // y center of a bead
        if (this.currentBeatRepresentation == 'circular-pie') {
          var y1 = centerY + measureR * Math.sin(Math.PI * beatStartAngle/180);     
          beatTemplateParameters.y1 = y1;
        } else if (this.currentBeatRepresentation == 'circular-bead') {
          beatTemplateParameters.y1 = this.circleStates[0][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.measureNumberOfPoints))].y;
        }
        // the second x point of a pie piece
        var x2 = centerX + measureR * Math.cos(Math.PI * beatEndAngle/180);
        beatTemplateParameters.x2 = x2;
        // the second y point of a pie piece
        var y2 = centerY + measureR * Math.sin(Math.PI * beatEndAngle/180);
        beatTemplateParameters.y2 = y2;

        this.beatCenterPosition = {
          x: beatTemplateParameters.x1,
          y: beatTemplateParameters.y1
        };

        //Circular Bead
        var beatR = this.beatR;
        beatTemplateParameters.beatR = beatR;
        //console.log(x1 + ',' + y1);

        var beatUnwindingPaths = [];
        for (i=0; i<ƒthis.circleStates.length; i++){
          // circle portion of unroll
          var computedBeatBeadPath = $.map(Array(this.beatNumberOfPoints), function (d, j) {
            var x = (ƒthis.circleStates[i][Math.floor((ƒthis.beatIndex/ƒthis.beatsInMeasure)*(ƒthis.measureNumberOfPoints))].x) + beatR * Math.sin(2 * j * Math.PI / (ƒthis.beatNumberOfPoints - 1));
            // margin.top + beatR
            var y = (ƒthis.circleStates[i][Math.floor((ƒthis.beatIndex/ƒthis.beatsInMeasure)*(ƒthis.measureNumberOfPoints))].y) - beatR * Math.cos(2 * j * Math.PI / (ƒthis.beatNumberOfPoints - 1));
            return { x: x, y: y };
          });
          beatUnwindingPaths.push(computedBeatBeadPath);
        };
        this.beatUnwindingPaths = beatUnwindingPaths;

        //Audio
        var beatRForAudio = this.beatRForAudio;
        beatTemplateParameters.beatRForAudio = beatRForAudio;
        var colorForAudio = this.colorForAudio;
        beatTemplateParameters.colorForAudio = colorForAudio;
        // compile the template for this beat (respect the current representation)
        var compiledTemplate = _.template(this.representations[this.currentBeatRepresentation], beatTemplateParameters );

        var margin = this.margin;
        var lineData = $.map(Array(this.measureNumberOfPoints), function (d, i) {
            var y = margin.top;
            var x = margin.left + i * this.lineLength / (this.measureNumberOfPoints - 1)
            return {x: x, y: y}
        });
        var pathFunction = d3.svg.line()
            .x(function (d) {return d.x;})
            .y(function (d) {return d.y;})
            .interpolate('basis'); // bundle | basis | linear | cardinal are also options

        var drag = d3.behavior.drag()
        // to prevent the draging of a one beat measure
        if (ƒthis.parent.attributes.beats.length > 1) {
            drag
              .on("drag", function(d,i) {
              // add the 'selected' class when a beat is dragged
              $('#beat'+ƒthis.cid).closest($('.component')).addClass('selected');
              var transformString = $('#beat'+ƒthis.cid).attr('transform').substring(10, $('#beat'+ƒthis.cid).attr('transform').length-1);
              var comma =transformString.indexOf(',');
              d.x = parseInt(transformString.substr(0,comma));
              d.y = parseInt(transformString.substr(comma+1));
              d.x += d3.event.dx;
              d.y += d3.event.dy;
              if (d.x > 100 || d.x < -100) {
                d3.select(this).remove();
                dispatch.trigger('signatureChange.event', ƒthis.parent.attributes.beats.length-1);
              }
              d3.select(this).attr("transform", function(d,i){
                  return "translate(" + [ d.x,d.y ] + ")"
              })
          });
        }

        //The Circle SVG Path we draw MUST BE AFTER THE COMPILED TEMPLATE
        var beatContainer = d3.select('#beatHolder'+this.parent.cid);
        var beatPath = beatContainer //.append('g')
            // .insert('path', ':first-child')
            .append('path')
            // Calling the click handler here doesn't work for some reason
            // .on('click', function(){console.log('beat container click handler')})
            .attr('class', 'beat')
            .attr('class', 'd3')
            .attr('transform', 'translate(0,0)')
            .attr('id', 'beat'+this.cid)
            // This is the path that the beat will follow when un/roll is clicked
            .data([beatUnwindingPaths[0]])
            .attr('d', pathFunction)
            .attr('fill', COLORS.hexColors[this.color])
            .attr('stroke', 'black')
            .style('opacity', this.getOpacityNumber(this.model.get('selected')))
            .call(drag);

        this.beatPath = beatPath;
        this.beatPath.on('click', this.toggle);

        function unroll() {
          console.log('INNER UNROLL');
          for(i=0; i<ƒthis.measureNumberOfPoints; i++){
              beatPath.data([beatUnwindingPaths[i]])
                  .transition()
                  .delay(ƒthis.animationDuration*i)
                  .duration(ƒthis.animationDuration)
                  .ease('linear')
                  .attr('d', pathFunction);
          }
        };
        function reverse() {
          for(i=0; i<ƒthis.measureNumberOfPoints; i++){
              beatPath.data([beatUnwindingPaths[ƒthis.measureNumberOfPoints-1-i]])
                  .transition()
                  .delay(ƒthis.animationDuration*i)
                  .duration(ƒthis.animationDuration)
                  .ease('linear')
                  .attr('d', pathFunction);
          }
        };

        $('#a'+this.parent.cid).on('click', unroll);
        $('#b'+this.parent.cid).on('click', reverse);
     
        if (this.currentBeatRepresentation == 'linear-bar') {
          // append the compiled template to the measureBeatHolder
          $(this.measureBeatHolder).append(compiledTemplate);          
        // SVG rendering
        } else {
          // Notes
          // Rather than appending to the beatHolder directly, we are going to append to a blank <svg>
          // in the $('body') directly, then move into the beatHolder, then add the click handler
          // Kind of hacky, but unaware of other way to do so.   Per SO?:
          // http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element/#13654655

          // make the fake svg using the appropriate svg template
          $('body').append('<svg id="dummy" style="display:none">'+ compiledTemplate +'</svg>');
          // append to beatHolder
          $(this.measureBeatHolder).append($('#dummy .beat'));
          $('#dummy').remove();
        }

        // add click handler to this beat
        $('#beat'+this.model.cid).click($.proxy(this.toggle, this));

        return this;
      }
    },

    changeBeatRepresentation: function(representation) {
      this.previousBeatRepresentation = this.currentBeatRepresentation;
      this.currentBeatRepresentation = representation;
    },

    // Depricated
    // sets the Color based on CSS between selected and not-selected
    getSelectionBooleanCSS: function(){
      if (this.model.get('selected')) {
        return 'ON';
      } else {
        return 'OFF';
      }
    },

    // sets the opacity between selected and not-selected
    getOpacityNumber : function(bool) {
      if (bool == true) {
        // Selected
        return 1;
      } else {
        // Not-Selected
        return 0.2;
      }      
    },

    /*
      This is called when a beat is clicked.
      It does a number of things:
      1. toggles the model's selected field.
      2. re-renders the beat.
      3. prints a console message.
      4. tells log to send a log of the click event.
      5. triggers a beatClicked event.
    */
    toggle: function(){
      //switch the selected boolean value on the model
      console.warn('Here');
      this.model.set('selected', !this.model.get('selected'));
      //re-render it, passing the clicked beat to render()
      d3.select('#beat'+this.cid).style('opacity', this.getOpacityNumber(this.model.get('selected')))
      this.render(this.model);
      // log.sendLog([[1, "beat" + this.model.cid + " toggled: "+!bool]]);
      dispatch.trigger('beatClicked.event');
    }
  });
});