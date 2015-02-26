$('#login-submit').click(function(){
  // TODO Check that the inputs are valid
  var uname = $('#login-name').val();
  var pwHash = $('#pwd').val();

  // JQ AJAX method to send the data to the approriate url with appropriate method
  $.ajax({
    url: '/api/login/',
    // method: get/post/etc...
    type: 'POST',
    data: {    
      // uname ie: specialorange
      uname: uname,
      // pwd hash: 912ec803b2ce49e4a541068d495ab570
      pwHash: pwHash
    }
  })
    .done(function(data){
      console.log('success');
      console.log(data);
      // dismiss the modal
      // store the data (locally)
      // make a cookie,
        
    })
    .fail(function(data){
      console.error('fail');
      console.log(data);
    })
});
