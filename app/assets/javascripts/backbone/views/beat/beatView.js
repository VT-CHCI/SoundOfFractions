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
  'text!backbone/templates/beat/circularPieBeats.html',
  'text!backbone/templates/beat/circularBeadBeats.html',
  'text!backbone/templates/beat/numberLineBeats.html',
  'colors',
  'app/dispatch',
  'app/log'
], function($, _, Backbone, BeatModel, audioBeatsTemplate, linearBarBeatsTemplate, circularPieBeatsTemplate,
  circularBeadBeatsTemplate, numberLineBeatsTemplate, COLORS, dispatch, log){
  return Backbone.View.extend({
    // registering backbone's click event to our toggle() function.
     events : {
       'click' : 'toggleModel'
     },

    // The different representations
    representations: {
      'audio': audioBeatsTemplate,
      'bar': linearBarBeatsTemplate,
      'pie': circularPieBeatsTemplate,
      'bead': circularBeadBeatsTemplate,
      'line': numberLineBeatsTemplate
    },
    //grab the current measure representation's data-state
    currentRepresentationType: '',
    previousRepresentationType: '',

    //The constructor takes options because these views are created
    //by measuresView objects.
    initialize: function(options){
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
        this.measureBeatHolder = options.parentElHolder;
        this.el = options.singleBeat;
        this.opacity = this.getOpacityNumber(options.opacity);
        this.beatCenterPosition = {};

        _.bindAll(this, 'toggleModel');
        this.model.bind('change', this.toggleOpacity, this);
      } else {
        console.error('should not be in here!');
        this.model = new BeatModel;
      }
      this.render();
    },

    //We use css classes to control the color of the beat.
    render: function(){
      var ƒthis = this;
      var beatTemplateParameters = {
        beat: this.model,
        selected: this.model.get('selected'),
        beatAngle: this.beatAngle,
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

      //Circular Pie
      beatTemplateParameters.circularMeasureCx = this.circularMeasureCx;
      var centerX = beatTemplateParameters.circularMeasureCx;
      beatTemplateParameters.circularMeasureCy = this.circularMeasureCy;
      var centerY = beatTemplateParameters.circularMeasureCy;
      beatTemplateParameters.circularMeasureR = this.circularMeasureR;
      var measureR = beatTemplateParameters.circularMeasureR;
      var measureStartAngle = -90;
      beatTemplateParameters.measureStartAngle = measureStartAngle;
      var beatStartAngle = this.beatStartAngle;
      beatTemplateParameters.beatStartAngle = beatStartAngle;
      var beatEndAngle = beatStartAngle+this.beatAngle;
      beatTemplateParameters.beatEndAngle = beatEndAngle;

      // x center of a bead or first x of pie piece
      if (this.currentRepresentationType == 'pie') {
        var x1 = centerX + measureR * Math.cos(Math.PI * beatStartAngle/180); 
        beatTemplateParameters.x1 = x1;
      } else if (this.currentRepresentationType == 'bead') {
        beatTemplateParameters.x1 = this.circleStates[0][Math.floor((this.beatIndex/this.beatsInMeasure)*(this.measureNumberOfPoints))].x;
      }
      // y center of a bead or first y of a pie piece
      if (this.currentRepresentationType == 'pie') {
        var y1 = centerY + measureR * Math.sin(Math.PI * beatStartAngle/180);     
        beatTemplateParameters.y1 = y1;
      } else if (this.currentRepresentationType == 'bead') {
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
      beatTemplateParameters.beatRForAudio = this.beatRForAudio;
      beatTemplateParameters.colorForAudio = this.colorForAudio;
      beatTemplateParameters.audioBeatCx = this.audioBeatCx;
      beatTemplateParameters.audioBeatCy = this.audioBeatCy;
      beatTemplateParameters.audioBeatR = this.audioBeatR;


      // compile the template for this beat (respect the current representation)
      // var compiledTemplate = _.template(this.representations[this.currentRepresentationType], beatTemplateParameters );

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

      var dragBead = d3.behavior.drag();
      // to prevent the dragging of a one beat measure
      if (this.beatsInMeasure > 1) {
        ƒthis = this;
        dragBead.on("drag", function() {
          ƒthis = ƒthis;
            // console.log(parseInt(d3.select(this).attr("cx")) + ' <:> ' + parseInt(d3.select(this).attr("cy")));
            // console.log(d3.event.dx + ' : ' + d3.event.dy);
          // Formula for circle beats, utilizing cx and cy
            //                        |-----Current Value--------|   |-----Delta value----\
            var newSettingX = parseInt(d3.select(this).attr("cx")) + parseInt(d3.event.dx);
            var newSettingY = parseInt(d3.select(this).attr("cy")) + parseInt(d3.event.dy);
            d3.select(this).attr("cx", newSettingX);
            d3.select(this).attr("cy", newSettingY);
            var newComputedValX = d3.select(this).attr('cx');
            var newComputedValY = d3.select(this).attr('cy');
            // Inside: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 < radius^2
            // Outside: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 > radius^2
            // On: x and y must satisfy (x - center_x)^2 + (y - center_y)^2 == radius^2
            if ( Math.pow(newComputedValX - ƒthis.circularMeasureCx, 2) + Math.pow(newComputedValY - ƒthis.circularMeasureCy, 2) > Math.pow(ƒthis.circularMeasureR+15,2) ) {
              d3.select(this).remove();
              console.warn('removed beat on measure');
              ƒthis.parentMeasureModel.get('beats').remove(ƒthis.model);
              dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure-1);
            }
        });
      }

      var dragLine = d3.behavior.drag();
      if (this.beatsInMeasure > 1) {
        ƒthis = this;
        dragLine.on('drag', function(d) {
          ƒthis = ƒthis;
          var newSettingX1 = parseInt(d3.select(this).attr("x1")) + parseInt(d3.event.dx);
          var newSettingY1 = parseInt(d3.select(this).attr("y1")) + parseInt(d3.event.dy);
          var newSettingX2 = parseInt(d3.select(this).attr("x2")) + parseInt(d3.event.dx);
          var newSettingY2 = parseInt(d3.select(this).attr("y2")) + parseInt(d3.event.dy);
          d3.select(this).attr("x1", newSettingX1);
          d3.select(this).attr("y1", newSettingY1);
          d3.select(this).attr("x2", newSettingX2);
          d3.select(this).attr("y2", newSettingY2);
          var newCenterX1 = d3.select(this).attr('x1');
          var newCenterY1 = parseInt(d3.select(this).attr('y1')) + parseInt(ƒthis.lineHashHeight/2);
          // Above: newCenterY1 < ƒthis.numberLineY
          // AboveByN: newCenterY1 < ƒthis.numberLineY - N
          // On : newCenterY1 = ƒthis.numberLineY
          // Below: newCenterY1 > ƒthis.numberLineY
          // BelowByN: newCenterY1 > ƒthis.numberLineY + N
          if ((newCenterY1 < ƒthis.numberLineY - 20) || (newCenterY1 > ƒthis.numberLineY + 20)) {
            // make an array to find out where the new beat should be added in the beatsCollection of the measure
            d3.select(this).remove();
            console.warn('removed beat on measure');
            ƒthis.parentMeasureModel.get('beats').remove(ƒthis.model);
            dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure-1);
          }
        });
      }

      var dragSlice = d3.behavior.drag();
      if (this.beatsInMeasure > 1) {
        ƒthis = this;
        dragSlice.on("drag", function() {
          var beatToChange = $('#beat'+ƒthis.cid);
          var transformString = beatToChange.attr('transform').substring(10, beatToChange.attr('transform').length-1);
          var comma = transformString.indexOf(',');
          var newX = parseInt(transformString.substr(0,comma));
          var newY = parseInt(transformString.substr(comma+1));
          newX += d3.event.dx;
          newY += d3.event.dy;
          var relativeSVGX = newX + ƒthis.circularMeasureCx;
          var relativeSVGY = newX + ƒthis.circularMeasureCy;
          d3.select(this).attr('transform', 'translate(' + [ newX, newY ] + ')');
          // x and y must satisfy (x - center_x)^2 + (y - center_y)^2 >= radius^2
          if ( Math.pow(relativeSVGX - ƒthis.circularMeasureCx, 2) + Math.pow(relativeSVGY - ƒthis.circularMeasureCy, 2) >= Math.pow(ƒthis.circularMeasureR, 2) ) {
            d3.select(this).remove();
            ƒthis.parentMeasureModel.get('beats').remove(ƒthis.model);
            dispatch.trigger('signatureChange.event', ƒthis.beatsInMeasure-2);
          }
        });
      }

      if (this.currentRepresentationType == 'bead') {
        console.log(this.beadRadius)
        var beatContainer = d3.select('#beat-holder-'+this.parentMeasureRepModel.cid);
        var beatPath = beatContainer
            .append('circle')
            .attr('cx', beatTemplateParameters.x1)
            .attr('cy', beatTemplateParameters.y1)
            .attr('r', this.beadRadius)
            // Calling the click handler here doesn't work for some reason
            // .on('click', function(){console.log('beat container click handler')})
            .attr('class', 'beat d3')
            .attr('transform', 'translate(0,0)')
            .attr('id', 'beat'+this.cid)
            // This is the path that the beat will follow when un/roll is clicked
            .data([beatUnwindingPaths[0]])
            // .attr('d', pathFunction)
            .attr('fill', COLORS.hexColors[this.color])
            .attr('stroke', 'black')
            .style('opacity', this.getOpacityNumber(this.model.get('selected')))
            .call(dragBead);

        this.beatPath = beatPath;
        this.beatPath.on('click', this.toggleModel);

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

        $('#a'+this.parentMeasureRepModel.cid).on('click', unroll);
        $('#b'+this.parentMeasureRepModel.cid).on('click', reverse);
      } else if (this.currentRepresentationType == 'line'){
        var beatContainer = d3.select('#beat-holder-'+this.parentMeasureRepModel.cid);
        var beatPath = beatContainer
            .append('line')
            .attr('x1', this.X1)
            .attr('y1', this.Y1)
            .attr('x2', this.X2)
            .attr('y2', this.Y2)
            .attr('class', 'beat d3')
            .attr('id', 'beat'+this.cid)
            // This is the path that the beat will follow when un/roll is clicked
            // .attr('d', pathFunction)
            .attr('stroke', COLORS.hexColors[this.color])
            .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
            .attr('stroke-width', 4)
            .call(dragLine);

        this.beatPath = beatPath;
        this.beatPath.on('click', this.toggleModel);
      } else if (this.currentRepresentationType == 'pie'){
        var arc = d3.svg.arc()
          .innerRadius(0)
          .outerRadius(this.circularMeasureR)
          .startAngle(this.beatStartAngle*(Math.PI/180))
          .endAngle((this.beatStartAngle + this.beatAngle)*(Math.PI/180));

        var beatContainer = d3.select('#beat-holder-'+this.parentMeasureRepModel.cid)
          .attr('transform', 'translate('+this.circularMeasureCx+','+this.circularMeasureCy+')')

        var beatPath = beatContainer
          .insert('path', ':first-child')
        // beatPath
          .attr('d', arc)
          .attr('id', 'beat'+this.cid)
          .attr('stroke', 'black')
          .attr('opacity', this.getOpacityNumber(this.model.get('selected')))
          .attr('fill', COLORS.hexColors[this.color])
          .attr('transform', 'translate(0,0)')
          .call(dragSlice);
          // .attr('class', 'pie-beat')

        this.beatPath = beatPath;
        this.beatPath.on('click', this.toggleModel);
      } else if (this.currentRepresentationType == 'audio'){
        var svgContainer = d3.select('#svg-'+this.parentMeasureRepModel.cid)
        var circlePath = svgContainer
            // .insert('circle', ':first-child')
            // .attr('cx', audioMeasureCx)
            // .attr('cy', audioMeasureCy)
            // .attr('r', audioMeasureR)
            // .attr('fill', colorForAudio)
            // .attr('stroke', 'black')
            // .attr('opacity', .2)

      } else if (this.currentRepresentationType == 'bar'){

      }
      return this;
    },

    changeBeatRepresentation: function(representation) {
      this.previousRepresentationType = this.currentRepresentationType;
      this.currentRepresentationType = representation;
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
    toggleModel: function(){
      //switch the selected boolean value on the model
      this.model.set('selected', !this.model.get('selected'));
      // log.sendLog([[1, "beat" + this.model.cid + " toggled: "+!bool]]);
    },
    toggleOpacity: function() {
      // re-rendering all beats, think it should only rerender itself, but w/e
      d3.select('#beat'+this.cid).style('opacity', this.getOpacityNumber(this.model.get('selected')))
    }
  });
});