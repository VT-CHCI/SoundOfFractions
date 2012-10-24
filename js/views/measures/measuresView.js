// Filename: views/measures/measuresView
define([
  'jquery',
  'underscore',
  'backbone',
  // Pull in the Collection module from above
  'collections/beats',
  'collections/measures',
  'views/beats/beatsView',
  'text!templates/measures/measures.html',
  'app/dispatch',
], function($, _, Backbone, beatsCollection, measuresCollection, BeatsView, measuresTemplate, dispatch){
  var beatsView = Backbone.View.extend({
    el: $('.component'),

    initialize: function(){
      this.measure1 = new beatsCollection;
      this.measure2 = new beatsCollection;

      for (var i = 0; i < 8; i++) {
        this.measure1.add();
        this.measure2.add();
      }

      this.component = measuresCollection;

      console.log(this.measure1, this.measure2);
      this.component = measuresCollection.add({beats: this.measure1});
      this.component = measuresCollection.add({beats: this.measure2});

      console.log(this.component);
    
    },

    render: function(){
      $(this.el).html('<div class="addMeasure">+</div>');

      _.each(this.component.models, function(measure) {
        var compiledTemplate = _.template( measuresTemplate, {measure: measure} );
        $(this.el).find('.addMeasure').before( compiledTemplate );

        console.log(measure); 

        new BeatsView({collection:measure.get('beats'), el:'#measure'+measure.cid});
      }, this);

     return this;
    }

  });

  return new beatsView();
});
