// Filename: views/home/main.js
/*
  This is the HomeView.

  This is responsible for allowing users to log in.
*/
define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'text!templates/home/main.html',
  'app/log'
], function($, _, Backbone, Bootstrap, mainHomeTemplate, log){
  var mainHomeView = Backbone.View.extend({
    el: $('.navbar-form button'),

    //setting up backbone's click event to call our saveLogin() method.
    events : {
      'click' : 'saveLogin'
    },

    render: function(){
      //the html elements for this view are created in index.html
      return this;
    },

    /* 
        This is called when the user clicks on the login button.
    */
    saveLogin: function (e) {
      //we trigger an alert thanking the user for logging in.
      $('#drum-kit').before('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">×</button><strong>Thanks for logging in!</strong></div>');

      //the user's userId is stored in local storage.
      sessionStorage.setItem("userId", $('.navbar-form input').val());

      //clear the login form.
      $('.navbar-form input').val('');

      //creating a string representation of the entire
      //component structure.
      name = '';
      $('.component').each( function() {
        name = name + $(this).attr('id') + '.';

        $(this).children('.measure').each( function() {
          name = name + $(this).attr('id') + '.';

            $(this).children('.beat').each( function() {
              name = name + $(this).attr('id') + '.';
            });
        });

        //sending the component structure to the logging system.
        log.sendLog([[1, "Component structure: "+name]]);
        name = '';
      });

      if (e.preventDefault) {
       e.preventDefault();
      }
      e.returnValue = false; // for IE
    }

  });
  return new mainHomeView();
});
