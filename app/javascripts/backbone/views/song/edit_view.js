// // Filename: views/songs/edit_view
// console.log("new_view");
// define([
//   'jquery',
//   'underscore',
//   'backbone',
//   // Pull in the Collection module from above
//   'backbone/collections/songsCollection',
//   'backbone/views/songs/new_view',
//   'text!backbone/templates/songs/new.html',
//   'app/dispatch',
//   'backbone/models/state'
// ], function($, _, Backbone, SongsCollection, SongsView, songsTemplate, dispatch, state){
//   return Backbone.View.extend({
//     el: $('.measure'),

//     initialize: function(options){
//       if (options) {
//         this.collection = options.collection;
//         this.el = options.el;
//       } else {
//         this.collection = new BeatsCollection;
//       }

//       dispatch.on('signatureChange.event', this.reconfigure, this);
//       this.render();
//       this.calcBeatWidth(state.get('signature'));
//     },

//     events: function(){ 
//       "submit #new-song": "save";
//     },

//     update: function(e){
//       e.preventDefault();
//       e.stopPropagation();
//       return this.collection.create(this.model.toJSON(), {
//         success: function(song) {
//           _this.model = song;
//           return window.location.hash = "/" + _this.model.id;
//         },
//       });
//     },

//     render: function(){
//       $(this.el).html('');
//       $(this.el).append('<span class="title">Measure <span class="number"></span> - <span class="delete">[X]</span></span>');

//       _.each(this.collection.models, function(beat) {
//         var compiledTemplate = _.template( beatsTemplate, {beat: beat} );
//         $(this.el).append( compiledTemplate );

//         new BeatView({model:beat, el:'#beat'+beat.cid});
//       }, this);

//       var measureCount = 1;
//       $('.hTrack-container').each(function() {
//         $(this).find('.number').each(function() {
//           $(this).text(measureCount);
//           measureCount++;
//         });
//         measureCount = 1;
//       });

//       return this;
//     }
//   });
// });