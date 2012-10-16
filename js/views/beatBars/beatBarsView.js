// Filename: views/beatBars/beatBarsView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'views/beatBars/beatBarView',
  'collections/beatBars',
  'text!templates/beatBars/beatBars.html',
  'app/dispatch'
], function($, _, Backbone, beatBarView, beatBarsCollection, beatBarsTemplate, dispatch){
  var beatBarsView = Backbone.View.extend({
    el: $('#beat-pallet'),

    initialize: function(){
      this.collection = beatBarsCollection;
      this.collection = beatBarsCollection.add({ width: 1});
      this.collection = beatBarsCollection.add({ width: 0.5});
      this.collection = beatBarsCollection.add({ width: 0.25});
      this.collection = beatBarsCollection.add({ width: 0.125});

      // console.log(this.collection);

      dispatch.on('app.event', function () {
        beatBarsCollection.reset();
        // console.log(beatBarsCollection.length);
        beatBarsCollection.add({width: 0.5});

        //Logic to create beat bars based on number
      });
    },

    render: function(){
      $(this.el).append(beatBarsTemplate);

      _.each(this.collection.models, function(beatBar) {
        $('#visual-beats').append(beatBarView.render(beatBar));
      });
      return this;
    }
    
  });
  return new beatBarsView();
});
