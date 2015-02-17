// Filename: views/measure/measureView.js
/*
  This is the MeasureView.
  This is contained in a HTrackView.
*/
define([
  'jquery',
  'underscore',
  'backbone',
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
  'app/log'
], function($, _, Backbone, BeatsCollection, StageCollection, RepresentationsCollection, MeasureModel, StateModel, RepresentationModel, BeatView, MeasureRepView, MeasureTemplate, COLORS, log){
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
      // TODO this is buggy. we need to figure out how to delete properly via backbone views
      this.childViews = [];

      //Dispatch listeners
      // TODO Replace these events
      // dispatch.on('signatureChange.event', this.reconfigure, this);
      // dispatch.on('measureRepresentation.event', this.changeMeasureRepresentation, this);
      // dispatch.on('unroll.event', this.unroll, this);
      // dispatch.on('tempoChange.event', this.adjustRadius, this);
      // dispatch.on('reRenderMeasure.event', this.render, this);

      // this bindall method is thor the remainging listeners, per StackOverflow suggestions
      _.bindAll(this, 'render');
      // when we add or delete a meauserRep
      this.listenTo(this.model.get('measureRepresentations'), 'remove', _.bind(this.render, this));  
      this.listenTo(this.model.get('measureRepresentations'), 'add', _.bind(this.addChild, this));  
      this.listenTo(this.model, 'signatureChange', _.bind(this.reconfigure, this));  
      // this.listenTo(this.model, 'signatureChange', this.reconfigure);  
      this.model.on('change:scale', _.bind(this.render, this));

      // This is for version2, when we add or delete a measure
      this.parentHTrackModel.get('measures').on('add', _.bind(this.render, this));
      this.parentHTrackModel.get('measures').on('remove', _.bind(this.render, this));

      this.render();

      this.makeChildren();
    },
    render: function(){
      // Make a template for the measure and append the MeasureTemplate to the measure area in the hTrack
      // Get some parameters for the template
      var measureTemplateParameters = {
        mCID: this.model.cid,
        measureCount: this.parentHTrackModel.get('measures').models.length,
        measureNumberOfBeats: this.model.get('beats').length
      };
      
      // compile the template
      var compiledMeasureTemplate = _.template( MeasureTemplate, measureTemplateParameters );
      // clear the html
      $(this.el).html('');
      // append the new completed compiled template
      $(this.el).append( compiledMeasureTemplate );

      return this;
    },
    addChild: function(options){
      // If we are creating the children from the models already present, ie, initial load
      if(options.repIndex > -1) {      
        var addedModel = this.model.get('measureRepresentations').models[options.repIndex];
      // If we are just adding one, from when a new model is added to the collection, ie they create one
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
        parent: this,
        measureRepContainer: '#measure-rep-container-'+this.model.cid,
        model: addedModel,
        measureRepModel: addedModel
      };
      //This part is the hack      This is where we create a measureRepView for each one using the paramaters
      var newView = new MeasureRepView(measureRepViewParameters);
      this.childViews.push(newView);
    },
    makeChildren: function(options){
      // for each rep in the measuresCollection
      var µthis = this;
      _.each(this.model.get('measureRepresentations').models, function(rep, repIndex) {
        µthis.addChild({rep: rep, repIndex: repIndex});
      }, this);
    },

    /*
      Version 1 should not support multiple measures, but we have it for when we will

      This is called when the user clicks on the plus to add a new measure.

      It creates a new measure and adds it to the hTrack.
      It generates a string representing the id of the measure and the ids of
      its beats and logs the creation.

      Lastly, it triggers a stopRequest, because we can't continue playing until
      all the durations get recalculated to reflect this new measure.
    */
    addMeasure: function(){
        console.log('add a measure');
        var newMeasure = new BeatsCollection;

        for (var i = 0; i < this.parentHTrackModel.get('signature'); i++) {
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
        // TODO Replace these events
        // dispatch.trigger('stopRequest.event', 'off');
    },

    /*
      Again, Version 1 should not support multiple measures, but we have it for when we will
      This is called when the user clicks on the minus to remove a measure.
    */
    removeMeasure: function(ev){
      console.error('here');
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
        // TODO Replace these events
        // dispatch.trigger('stopRequest.event', 'off');
        // dispatch.trigger('signatureChange.event', this.parentHTrackModel.get('signature'));
      }
    },
    // This is called when the signature of a measure is changed
    reconfigure: function(options) {
      console.log('!!!!!! - in measureView re-render - !!!!!!!');
      this.closeChildren();
      this.render();
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
    }
  });
});