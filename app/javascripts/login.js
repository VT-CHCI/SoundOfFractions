// http://localhost:3000/api/login/specialorange/912ec803b2ce49e4a541068d495ab570
// console.log('Logging in...')
$('#login-submit').click(function(){
  // TODO Check that the inputs are valid
  $('#login-name').val('specialorange');
  $('#pwd').val('912ec803b2ce49e4a541068d495ab570');
  var uname = $('#login-name').val();
  var pwHash = $('#pwd').val();
  var chbox = $('#login-checkbox').is(':checked');
  // console.log(chbox);

  // JQ AJAX method to send the data to the approriate url with appropriate method
  if (!chbox) {
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
  }
  else {
    $.ajax({
      url: '/api/loginwithbox/',
      // method: get/post/etc...
      type: 'POST',
      data: {    
        // uname ie: specialorange
        uname: uname,
        // pwd hash: 912ec803b2ce49e4a541068d495ab570
        pwHash: pwHash,

        chbox: chbox
      }
    })
      .done(function(data){
        if (data.text) {
          console.log('successbox');
          console.log(data.text);
        }
        else { // It appears that we should never actually get here? -> Because !chbox will activate if body, chbox should always activate above body...
          console.log('fail: you didn\'t check the box!');
          console.log(data)
        }
        // dismiss the modal
        // store the data (locally)
        // make a cookie,
          
      })
      .fail(function(data){
        console.error('fail');
        console.log(data);
      })
  }
});
