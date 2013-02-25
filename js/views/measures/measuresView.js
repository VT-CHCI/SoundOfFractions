// Filename: views/measures/measuresView.js
/*
  This is the MeasuresView.

  This is contained in a ComponentsView.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/beats',
  'collections/measures',
  'views/beats/beatsView',
  'text!templates/measures/measures.html',
  'app/dispatch',
  'app/state',
  'app/log'
], function($, _, Backbone, BeatsCollection, MeasuresCollection, BeatsView, measuresTemplate, dispatch, state, log){
  return Backbone.View.extend({
    el: $('.component'),

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
      this.render();
    },

    render: function(){
      $(this.el).html('<div class="addMeasure">+</div>');

      //we create a BeatsView for each measure.
      _.each(this.component.models, function(measure) {
        var compiledTemplate = _.template( measuresTemplate, {measure: measure} );
        $(this.el).find('.addMeasure').before( compiledTemplate );

        new BeatsView({collection:measure.get('beats'), el:'#measure'+measure.cid});
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
      if ($('#measure'+this.component.models[0].cid).parent().hasClass('selected')) {
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
      if ($('#measure'+this.component.models[0].cid).parent().hasClass('selected')) {
        //removing the last measure isn't allowed.
        if(this.component.models.length == 1) {
          console.log('Can\'t remove the last measure!');
          return;
        }
        console.log('remove measure');

        //we remove the measure and get its model.
        var model = this.component.getByCid($(ev.target).parents('.measure').attr('id').replace('measure',''));
        this.component.remove(model);

        //send a log event showing the removal.
        log.sendLog([[3, "Removed a measure: measure"+model.cid]]);

        //re-render the view.
        this.render();

        //trigger a stop request to stop playback.
        dispatch.trigger('stopRequest.event', 'off');
      }
    }
  });
});
