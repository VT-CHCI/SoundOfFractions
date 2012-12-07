// Filename: views/home/main
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

    events : {
      'click' : 'saveLogin'
    },

    render: function(){

      return this;
    },

    saveLogin: function (e) {
      $('#drum-kit').before('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">×</button><strong>Thanks for logging in!</strong></div>');

      sessionStorage.setItem("userId", $('.navbar-form input').val());

      $('.navbar-form input').val('');

      name = '';
      $('.component').each( function() {
        name = name + $(this).attr('id') + '.';

        $(this).children('.measure').each( function() {
          name = name + $(this).attr('id') + '.';

            $(this).children('.beat').each( function() {
              name = name + $(this).attr('id') + '.';
            });
        });

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
