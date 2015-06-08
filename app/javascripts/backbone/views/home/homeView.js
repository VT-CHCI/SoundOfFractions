// Filename: views/home/main.js
/*
  This is the HomeView.

  This is responsible for allowing users to log in.
*/
define([
  'jquery',
  'underscore',
  'bbone',
  'text!backbone/templates/home/main.html'
], function($, _, Backbone, mainHomeTemplate){
  var mainHomeView = Backbone.View.extend({
    el: $('.navbar-form button'),

    initialize: function(){
      this.render();
    },

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
      $('#sof-stage-area').before('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">×</button><strong>Thanks for logging in!</strong></div>');

      //the user's userId is stored in local storage.
      sessionStorage.setItem("userId", $('.navbar-form input').val());

      //clear the login form.
      $('.navbar-form input').val('');

      //creating a string representation of the entire hTrack structure.
      name = '';
      $('.hTrack').each( function() {
        name = name + $(this).attr('id') + '.';

        $(this).children('.measure').each( function() {
          name = name + $(this).attr('id') + '.';

            $(this).children('.beat').each( function() {
              name = name + $(this).attr('id') + '.';
            });
        });

        //sending the hTrack structure to the logging system.
        log.sendLog([[1, "hTrack structure: "+name]]);
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
