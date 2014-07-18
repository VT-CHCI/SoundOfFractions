// We need to calculate the number of points for animation transitions
// We want to be above 30 for fluidity, but below 90 to avoid computational and animation delay
define([
], function(){
  return General = {
    transitionNumberOfPoints: function(input){
      switch (input){
        case 1:
          return 40;
        case 2:
          return 40;
        case 3:
          return 42;
        case 4:
          return 40;
        case 5:
          return 40;
        case 6:
          return 42;
        case 7:
          return 42;
        case 8:
          return 40;
        case 9:
          return 45;
        case 10:
          return 40;
        case 11:
          return 44;
        case 12:
          return 48;
        case 13:
          return 39;
        case 14:
          return 42;
        case 15:
          return 45;
        case 16:
          return 48;
      }
    },
    general: function(){
      console.log('in general.js general')
    }
  }
});

