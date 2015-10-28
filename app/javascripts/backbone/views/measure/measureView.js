// Filename: views/measure/measureView.js
/*
  This is the MeasureView.
  This is contained in a HTrackView.
*/
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/collections/beats',
  'backbone/collections/stage',
  'backbone/collections/representations',
  'backbone/models/measure',
  'backbone/models/state',
  'backbone/models/representation',
  'backbone/views/beat/beatView',
  'backbone/views/measure/measureRepView',
  'text!backbone/templates/measure/measure.html',
  'colors',
  'logging'
], function($, _, Backbone, BeatsCollection, StageCollection, RepresentationsCollection, MeasureModel, StateModel, RepresentationModel, BeatView, MeasureRepView, MeasureTemplate, COLORS, Logging){
  return Backbone.View.extend({

    //registering click events to add and remove measures.
    events : {
      'click .add-measure' : 'addMeasure',
      'click .delete-measure' : 'removeMeasure'
    },

    initialize: function(options){
      // if we're being created by a HTrackView, we are passed in options.
      // Many variables get passed in.  We attach those variable with this function, so for each variable:
      // this.something = options.something; 
      if (options) {
        for (var key in options) {
          this[key] = options[key];
        }
      // Error catching
      } else {
        console.error('Should not be in here: NO Measure!');
      }
      // We use this to make sure we are deleting all the views later
      this.childViews = [];

      // when we add a meauserRep
      this.listenTo(this.model.get('measureRepresentations'), 'add', _.bind(this.addChildRepresentationView, this));  

      this.listenTo(StateModel, 'instrumentTempoRecorded', this.replaceInstrumentWithRecordedPattern);
      
      // this.model.on('change:currentScale', _.bind(this.reconfigure, this));

      // This is for version2, when we add or delete a measure
      // this.parentHTrackModel.get('measures').on('add', _.bind(this.render, this));
      // this.parentHTrackModel.get('measures').on('remove', _.bind(this.render, this));

      this.render();

      this.makeChildren();
    },
    replaceInstrumentWithRecordedPattern: function(options) {
      if(this.parentHTrackModel.get('type') === options.instrument){
        // Make a beatsCollection and update the model
        this.model.updateBeatsCollection( {beatsCollection: this.setUpManualBeatsCollection(options)} );
        // set the scale so it will redraw again with the correct scale
        this.model.updateTotalTime( {totalTimeMeasurePlaysInMilliseconds: options.totalTimeMeasurePlaysInMilliseconds} );
        // based on 320 : 2*PI*R -> 2*PI*51 => 320 pixels at 100 pps is 3.2 seconds

        // Calling reconfigure doesn't adjust the height's correctly of the mrvs, so we will hold off using that for now
        // this.reconfigure();
      }
    },
    // This is for replacing a beats collection when it is recorded
    setUpManualBeatsCollection: function(options){
      // this creates 1 measure, and adds beats and the representations to itself
      this.manuallyCreatedMeasureBeatsCollection = new BeatsCollection;
      //for each beat - also change signature below
      for (var i = 0; i < options.beatPattern.length; i++) {
        if (options.beatPattern[i] == 'ON'){
          this.manuallyCreatedMeasureBeatsCollection.add([{selected: true}]);
        } else if (options.beatPattern[i] == 'OFF') {
          this.manuallyCreatedMeasureBeatsCollection.add([{selected: false}]);
          // this.manuallyCreatedMeasureBeatsCollection.add();
        } else {
          console.warn('still getting the wrong error.   Must look into why the collection isn\'t getting reset');
        }
      }
      return this.manuallyCreatedMeasureBeatsCollection;
    },
    render: function(){
      // Make a template for the measure and append the MeasureTemplate to the measure area in the hTrack
      // Get some parameters for the template
      var measureTemplateParameters = {
        mCID: this.model.cid,
        measureCount: this.parentHTrackModel.get('measures').models.length,
        measureNumberOfBeats: this.model.get('beatsCollection').length
      };
      
      // compile the template
      var compiledMeasureTemplate = _.template(MeasureTemplate);
      // clear the html
      $(this.el).html('');
      // append the new completed compiled template
      $(this.el).append( compiledMeasureTemplate(measureTemplateParameters) );

      return this;
    },
    // TODO IMPORNTANT This is structured wrong: it should be adding measure Views, not measureRepViews
    addChildRepresentationView: function(options){
      // If we are creating the children from the models already present, ie, initial load
      if(options.repIndex > -1) {      
        var addedModel = this.model.get('measureRepresentations').models[options.repIndex];
      // If we are just adding one, from when a new model is added to the collection, ie they create one [last one]
      } else {
        console.log('Measure View add child');
        var addedModel = this.model.get('measureRepresentations').last();
      }

      // get parameters for the template for a measure
      var measureRepViewParameters = {
        // HTrack
        parentHTrackModel: this.parentHTrackModel,
        parentHTrackView: this.parentHTrackView,
        // Measure
        parentMeasureModel: this.model,
        parentMeasureView: this,
        measureRepContainer: '#measure-rep-container-'+this.model.cid,
        model: addedModel,
        measureRepModel: addedModel
      };
      var newView = new MeasureRepView(measureRepViewParameters);
      // newView.model.addParentMeasureModelAfter(this.model);

      this.childViews.push(newView);
    },
    makeChildren: function(options){
      // for each rep in the measuresCollection
      var µthis = this;
      _.each(this.model.get('measureRepresentations').models, function(rep, repIndex) {
        µthis.addChildRepresentationView({rep: rep, repIndex: repIndex});
      }, this);
    },

    // This is called when the signature of a measure is changed
    reconfigure: function(options) {
      console.log('!!!!!! - in measureView reconfigure - !!!!!!!');
      this.closeChildren();
      // this.render();
      this.makeChildren();
    },
    closeChildren: function(){
      console.log('closing children from measureView');
      // handle other unbinding needs, here
      _.each(this.childViews, function(childView){
        console.log('in measureView close function, CLOSING CHILDREN');
        if (childView.close){
          childView.close();
        }
      })
    },
    close: function(){
      console.log('in measureView close function');
      this.remove();
      // handle other unbinding needs, here
      _.each(this.childViews, function(childView){
        console.log('in measureView close function, CLOSING CHILDREN');
        if (childView.close){
          childView.close();
        }
      })
    },
    /*
      Version 1 will not support multiple measures, but we have it for when we will
    */
    addMeasure: function(){
    },
    removeMeasure: function(){
    }
  });
});