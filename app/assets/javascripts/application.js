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
console.log('Application.js Started');
require([

  // Load our "app" module and pass it to our definition function
  'SOF',
  'jquery',
  'app/draggable'

  // Some plugins have to be loaded in order due to their non AMD compliance
  // Because these scripts are not "modules" they do not pass any values to the definition function below
], function(Application, $, Draggable){
  console.log("Application initializing...");


  // The "app" dependency 'SOF' is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  Application.initialize(App.songs);
  console.log("Application Fully initialized");
  $(document).ready(function() {
    for (i = 0; i < Draggable.size(); i++) {
      // $(Draggable.draggableElementID[i]).draggable();
    }
  });
});


