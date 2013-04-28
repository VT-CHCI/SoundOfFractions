//SOF.js
console.log('SOF.js started');
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/routers/router',  // Request router.js
  'app/d3.v3.min',             // d3 library
  'app/d3.superformula'       // d3.superformula library  
], function($, _, Backbone, Router, D3, Superformula){
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