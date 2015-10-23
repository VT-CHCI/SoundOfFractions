// Application.js
// this sets up the paths to our vendor scripts
// that we use in our require statements.

// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
    // 'jquery': 'vendor/jquery-2.1.3.min',

console.info('Application.js: Started');

require.config({
  paths: {
    'jquery': ['vendor/jquery-2.1.3.min', 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min'],
    'bootstrap': ['vendor/bootstrap.min', '//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min'],
    'underscore': 'vendor/underscore-min',
    'bbone': 'vendor/backbone-min',
    'login': 'general/login',
    'logging': 'general/logging',
    'crypto-js': 'vendor/crypto-js/crypto-js',
    'node-uuid': 'vendor/node-uuid/uuid',
    'js-cookie': 'vendor/js-cookie/src/js.cookie',
    'colors': 'general/colors',
    'text': 'general/text',
    'consoleLog': 'general/consoleLog'
  },
  shim: {
    'bootstrap':            { deps: ['jquery'] },
    'login':                { deps: ['jquery'] },
    'bootstrap/affix':      { deps: ['jquery'], exports: '$.fn.affix' }, 
    'bootstrap/alert':      { deps: ['jquery'], exports: '$.fn.alert' },
    'bootstrap/button':     { deps: ['jquery'], exports: '$.fn.button' },
    'bootstrap/carousel':   { deps: ['jquery'], exports: '$.fn.carousel' },
    'bootstrap/collapse':   { deps: ['jquery'], exports: '$.fn.collapse' },
    'bootstrap/dropdown':   { deps: ['jquery'], exports: '$.fn.dropdown' },
    'bootstrap/modal':      { deps: ['jquery'], exports: '$.fn.modal' },
    'bootstrap/popover':    { deps: ['jquery'], exports: '$.fn.popover' },
    'bootstrap/scrollspy':  { deps: ['jquery'], exports: '$.fn.scrollspy' },
    'bootstrap/tab':        { deps: ['jquery'], exports: '$.fn.tab' },
    'bootstrap/tooltip':    { deps: ['jquery'], exports: '$.fn.tooltip' },
    'bootstrap/transition': { deps: ['jquery'], exports: '$.fn.transition' }
  }
});

require([
  'jquery',
  'underscore',
  'bbone',
  // Load our "app" module and pass it to our definition function
  'SOF'
  // Some plugins have to be loaded in order due to their non AMD compliance
  // Because these scripts are not "modules" they do not pass any values to the definition function below
], function($, _, Backbone, SOF_Application){
  console.info("Application.js: initializing SOF_Application...");

  // The "app" dependency 'SOF' is passed in as "SOF_Application"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  // SOF_Application.initialize(personResults);
  SOF_Application.initialize();

  console.log("Application.js: SOF_Application Fully initialized");
  console.error('-----BREAK LINE FOR TESTING-----');
});