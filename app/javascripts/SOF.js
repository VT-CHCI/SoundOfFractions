//SOF.js
console.info('SOF.js: Started');
define([
  'jquery',
  'underscore',
  'bbone',
  'backbone/routers/router',  // Request router.js
  'vendor/d3.min',
  'vendor/jquery-ui.min',
  'bootstrap',
  'login',
  'logging'
], function($, _, Backbone, Router, d3, $, bootstrap, login, Logging){
  var initialize = function(options){
    console.info('SOF.js: In Initialize, initializing Router:');
    if(options) {
      console.info('SOF.js: options : ', options);
    }
    // Pass in the Initialized Router module and call it's
    // initialize function, giving it the (options) application.js,
    // which is 'App.songs' from assets.js.erb
    Router.initialize(options);
    console.info('SOF.js: Finished initializing');
  }
  return {
    initialize: initialize
  };
});