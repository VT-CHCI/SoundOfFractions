//SOF.js
console.log('SOF.js started');
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/routers/router',  // Request router.js
  'd3',
  'jquery-ui'
], function($, _, Backbone, Router, d3, $){
  var initialize = function(options){

    console.log('SOF => In Initialize, initializing Router:');
    // Pass in the Initialized Router module and call it's
    // initialize function, giving it the (options) application.js,
    // which is 'App.songs' from assets.js.erb
    Router.initialize(options);
    console.log('SOF.js finished');
  }
  return {
    initialize: initialize
  };
});