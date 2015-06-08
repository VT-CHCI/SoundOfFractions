define([
  'jquery', 'underscore', 'bbone'
], function($, _, Backbone){
  consoleLog = {
    log_level: "warn",
    order: {
      "verbose": 0,
      "debug": 1,
      "normal": 2,
      "lite": 3,
      "production": 4
    },
    verbose: function (arguments, options) {
      if(options){
        if (this.order[this.log_level] <= this.order["verbose"]) {
          console.options(arguments);
        }        
      } else {      
        if (this.order[this.log_level] <= this.order["verbose"]) {
          console.log(arguments);
        }
      }
    },
    debug: function (arguments) {
      if (this.order[this.log_level] <= this.order["debug"]) {
        console.log(arguments);
      }
    },
    normal: function (arguments) {
      if (this.order[this.log_level] <= this.order["normal"]) {
        console.log(arguments);
      }
    },
    lite: function (arguments) {
      if (this.order[this.log_level] <= this.order["lite"]) {
        console.log(arguments);
      }
    },
    production: function (arguments) {
      if (this.order[this.log_level] <= this.order["production"]) {
        console.log(arguments);
      }
    }
  }
});

// consoleLog.verbose("This is verbose"); // doesn't print
// consoleLog.debug("This is debug");     // doesn't print
// consoleLog.warn("This is warn");       // prints

// consoleLog.log_level = "verbose";      // change what level of messages we want

// consoleLog.verbose("This is verbose"); // prints
// consoleLog.debug("This is debug");     // prints
// consoleLog.warn("This is warn");       // prints