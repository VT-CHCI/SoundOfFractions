// Filename: views/button/remainingInstrumentGeneratorView.js
/*
  This is the remainingInstrumentGeneratorView.
  This renders the buttons to select a new instrument to allow for a new line
*/  
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/models/remainingInstrumentGenerator',
  'backbone/views/stage/stageView',
  'text!backbone/templates/button/remainingInstrumentGenerator.html',
  'text!backbone/templates/button/remainingInstrumentButton.html',
  'log'
], function($, _, Backbone, RemainingInstrumentGeneratorModel, StageView, remainingInstrumentGeneratorTemplate, remainingInstrumentButtonTemplate, log){

  var RemainingInstrumentGeneratorView = Backbone.View.extend({
    el: $('#instrument-generator-holder'), // Specifies the DOM element which this view handles

    //registering backbone's click event to our addInstrumentToCompositionArea() method.
    events: {
      "click .new-instrument-btn" : "addInstrumentToCompositionAreaByButton"
    },

    //simply creates the model.
    initialize: function(options) {
      if(options) {
        console.error('shouldnt be in here for creating a song, only for loading a song');
        this.model = options.unusedInstrumentsModel;
      } else {
        this.model = RemainingInstrumentGeneratorModel;
      }

      // manually clicking
      _.bindAll(this, 'manuallPress');
      $(document).bind('keypress', this.manuallPress);

      this.listenTo(this.model, 'addInstrumentToCompositionAreaByCall', this.addInstrumentToCompositionAreaByCall);
      this.listenTo(RemainingInstrumentGeneratorModel, 'removedInstrumentFromUnused', this.render);
      this.listenTo(this.model, 'change:unusedInstruments', this.render);


      // TODO Replace these events
      // dispatch.on('instrumentChanged.event', this.render, this);
      // dispatch.on('reRenderInstrumentGenerator.event', this.render, this);

      this.render();
    },

    /*
      This is called when a click event occurs.

      a log message is sent reflecting the representation change.
    */
    addInstrumentToCompositionAreaByButton: function(e) {
      console.log('in remainingInstrumentGeneratorView addInstrumentToCompositionArea()');
      // Instrument type   'sn'|'hh'|'kd'
      var type = $(e.currentTarget).attr('data-type');
      // this.model.addInstrument({type:type});
      this.model.removeInstrumentFromUnused({type:type});
      // update the dropdown menus in each htrack
      // TODO Replace these events
      // dispatch.trigger('reRenderInstrumentDropDown.event', instrument);
      this.render();

      log.sendLog([[2, "instrument added: "+type]]);
    },
    addInstrumentToCompositionAreaByCall: function(instrument){
      this.model.removeInstrumentFromUnused(instrument);
      this.render();
    },
    render: function() {
      console.log('remainingInstrumentGeneratorView RENDER ()')

      var uI = this.model.get('unusedInstruments');
      //compiling our template.
      this.$el.html('');
      if (uI.length>0){
        var compiledTemplate = _.template(remainingInstrumentGeneratorTemplate);
        this.$el.append( compiledTemplate() );
      } else {
        this.$el.html('');
      }
      for(var i = 0; i<uI.length; i++){
        var unused = uI[i];
        var compiledButtonTemplate = _.template(remainingInstrumentButtonTemplate);
        $('#remaining-instrument-generator').append( compiledButtonTemplate({type: unused.type, label:unused.label}));
      }
      return this;
    },

    // h:104 k:107 s:115 
    manuallPress: function(e) {
      if (e.keyCode == 104) {
        $('#new-instrument-hh').click();
      } else if (e.keyCode == 107) {
        $('#new-instrument-kd').click();
      } else if (e.keyCode == 115) {
        $('#new-instrument-sn').click();
      }
    }

  });
  return new RemainingInstrumentGeneratorView();
});