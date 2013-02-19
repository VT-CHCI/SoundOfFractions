//app.js/App
console.log('MF.js started');
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone/routers/router', // Request router.js
], function($, _, Backbone, Router){
  var initialize = function(){
    console.log("app init _ follows");
    console.log(_);
    // Pass in our Router module and call it's initialize function
    Router.initialize();
  }

  return {
    initialize: initialize
  };
});