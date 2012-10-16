// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.

// require.config({
//   baseUrl: 'js',
//   paths: {
//     jquery: 'vendor/jquery-1.8.2.min',
//     underscore: 'vendor/underscore.min',
//     backbone: 'vendor/backbone.min',
//     text: 'vendor/text.min',
//     templates: '../templates'
//   }
// });

require.config({
  paths: {
    jquery: 'vendor/jquery-1.8.2.min',
    underscore: 'vendor/underscore.min',
    backbone: 'vendor/backbone.min',
    text: 'vendor/text.min',
    templates: '../templates',
    bootstrap: 'vendor/bootstrap.min'
  },

  shim: {
    'underscore': {
      deps: ['jquery'], //dependencies
      exports: '_' //the exported symbol
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
});

require([

  // Load our app module and pass it to our definition function
  'app'

  // Some plugins have to be loaded in order due to their non AMD compliance
  // Because these scripts are not "modules" they do not pass any values to the definition function below
], function(App){

  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  App.initialize();
  console.log("App initialized...");
});
