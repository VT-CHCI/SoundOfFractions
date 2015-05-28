define([
  'jquery', 'underscore', 'bbone',
  'crypto-js'
], function($, _, Backbone, CryptoJS){

// http://localhost:3000/api/login/specialorange/912ec803b2ce49e4a541068d495ab570
// console.log('Logging in...')
$('#login-submit').click(function(){
  // TODO Check that the inputs are valid
  var uname = $('#login-name').val();
  var pwd = $('#pwd').val();
  // var pwdHash = CryptoJS.MD5(pwd);
  // console.log(pwdHash); // this is a word grouping of 4 words, and needs to be converted to a string
  // console.log(pwdHash.toString(CryptoJS.enc.Hex)); // 912ec803b2ce49e4a541068d495ab570

  var chbox = $('#login-checkbox').is(':checked');

  // JQ AJAX method to send the data to the approriate url with appropriate HTTP method
  if (!chbox) {
    $.ajax({
      url: '/api/login/',
      // method: get/post/etc...
      type: 'POST',
      data: {    
        // uname ie: specialorange
        // pwd      : asdf
        // pwd hash : 912ec803b2ce49e4a541068d495ab570
        uname: uname,
        pwd: pwd
        }
    })
      .done(function(data){
        console.log('Successful Login! Returned `data`: ', data);
        // dismiss the modal
        // store the data (locally)
        // make a cookie,
          
      })
      .fail(function(data){
        console.error('!Failed Login! Returned `data`: ', data);
      })
  } else {
    $.ajax({
      url: '/api/loginwithbox/',
      // method: get/post/etc...
      type: 'POST',
      data: {    
        // uname ie: specialorange
        uname: uname,
        // pwd     : asdf
        // pwd hash: 912ec803b2ce49e4a541068d495ab570
        pwd: pwd,
        chbox: chbox
      }
    })
      .done(function(data){
        if (data.text) {
          console.log('Successfull Box login!  Data: ', data);
        } else { // It appears that we should never actually get here? -> Because !chbox will activate if body, chbox should always activate above body...
          console.error('fail: you didn\'t check the box! `data`: ', data);
        }
        // dismiss the modal
        // store the data (locally)
        // make a cookie,
          
      })
      .fail(function(data){
        console.error('!Failed Login with checkbox! Returned `data`: ', data);
      })
  }
});

});
