$(function(){
  var socket = io.connect();
  var $messageForm = $('#messageForm');
  var $message = $('#message');
  var $messageArea = $('#messageArea');
  var $userFormArea = $('#userFormArea');
  var $userForm = $('#userForm');
  var $users = $('#users');
  var $username = $('#username');
  var $usersDropdown = $('#usersDropdown');
  var $welcome = $('#welcome');
  var globalList=[];
  var chatDivList;
  var flag = "chatAll";
  var dropdownValue;

  $messageForm.submit(function(e) {
    e.preventDefault();
    $message.val(($message.val()).replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    console.log('Submitted');
    dropdownValue = document.getElementById('usersDropdown').value;
    if (dropdownValue=='All') {
      socket.emit('send message all',$message.val());
    }else if (dropdownValue=='') {

    }else {
      socket.emit('send message',$message.val(),dropdownValue);
    }
    $message.val('');
  });

  socket.on('new message',function (data) {

    if (userId==data.user) {
      if (data.flag=='private') {
        $('#chat'+dropdownValue.replace(/\s+/g, '-')).append('<div class="col-md-offset-8 col-sm-4 bubble bubble-user"><strong>'+data.user+': </strong>'+data.msg+'<span class="timestamp">'+data.time+'</span></div>');
        autoScrollDown(dropdownValue.replace(/\s+/g, '-'));
      }else{
        $('#chatAll').append('<div class="col-md-offset-8 col-sm-4 bubble bubble-user"><strong>'+data.user+': </strong>'+data.msg+'<span class="timestamp">'+data.time+'</span></div>');
        autoScrollDown('All');
      }  
    } else {
      if (data.flag=='private') {
        $('#chat'+data.user.replace(/\s+/g, '-')).append('<div class="col-sm-4 col-md-offset-right-8 bubble bubble-others"><strong>'+data.user+':</strong> '+data.msg+'<span class="timestamp">'+data.time+'</span></div>');
        autoScrollDown(data.user.replace(/\s+/g, '-'));
      }else{
        $('#chatAll').append('<div class="col-sm-4 col-md-offset-right-8 bubble bubble-others"><strong>'+data.user+':</strong> '+data.msg+'<span class="timestamp">'+data.time+'</span></div>');
        autoScrollDown('All');
      }
    }
  });

  socket.on('all users',function (data) {
    globalList.push(data);
  });

  $userForm.submit(function(e) {
    e.preventDefault();
    $username.val(($username.val()).replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    if ($username.val()==null || $username.val()=='' || $username.val()=='group') {
      return false;
    }
    if (globalList.length>0) {
      console.log('inside if condition');
      for (var i = 0; i < globalList[0].length; i++) {
        if (globalList[0][i]!=undefined) {
          if (globalList[0][i]==$username.val()) {
            alert("This username is already present try something else....");
            $username.val('');
            return false;
          }
        }
      }
    }
    console.log('Username');
    socket.emit('new user',$username.val(),function(data) {
      if(data){
        $userFormArea.hide();
        $messageArea.show();
        $welcome.html('<h3 style="margin-left: 20px;">Welcome - '+userId+'</h3>');
        console.log('entered if condition');
      }
    });
    userId = $username.val();
    $username.val('');
  });

  socket.on('get users',function(data){
    var getUsers = '';
    chatDivList=new Array()
    chatDivList.push('chatAll');
    for (i = 0; i < data.length; i++) {
      if (data[i]!=userId) {
        getUsers += '<div class="list-group-item"><button class="btn btn-primary" data-value="chat'+data[i].replace(/\s+/g, '-')+'" id="btn'+data[i].replace(/\s+/g, '-')+'" >'+data[i]+'</button><span class="glyphicon glyphicon-asterisk pull-right" style="color: green;" aria-hidden="true"></span></div>';
        chatDivList.push('chat'+data[i].replace(/\s+/g, '-'));
      }
    }
    $users.html(getUsers);
  });

  socket.on('drop down',function(data) {
    var optionsAsString = "";
    optionsAsString += "<option value='All'>All</option>";
    for(var i = 0; i < data.length; i++) {
      if (data[i]!=userId) {
        optionsAsString += "<option value='" + data[i] + "'>" + data[i] + "</option>";
      }
    }
    $usersDropdown.html(optionsAsString);
  });

  socket.on('new chatDiv',function(data){
    var chatDiv = '';
    chatDiv += '<div class="chat well chat-window" id="chatAll"></div>';
    for (i = 0; i < data.length; i++) {
      if (data[i]!=userId) {
        chatDiv += '<div class="chat well chat-window" id="chat'+data[i].replace(/\s+/g, '-')+'"></div>';
        $( "#chat"+data[i].replace(/\s+/g, '-')).toggle();
      }
    }
    $('#chat').html(chatDiv);
    for (i = 0; i < data.length; i++){
      if (data[i]!=userId){
        $( "#chat"+data[i].replace(/\s+/g, '-')).toggle();
      }
    }
  });

  $('#message').on("keypress", function(e) {
    if (e.which === 32 && !this.value.length)
        e.preventDefault();
  });

  $('#username').on("keypress", function(e) {
    if (e.which === 32 && !this.value.length)
        e.preventDefault();
  });

  socket.on('new connect',function (data) {
    $('#chatAll').append('<div class="col-md-offset-4 col-md-4" style="color:green;"><strong>'+data+' Connected</strong></div>');
  });

  socket.on('new disconnect',function (data) {
    $('#chatAll').append('<div class="col-md-offset-4 col-md-4" style="color:red;"><strong>'+data+' Disconnected</strong></div>');
  });

  /*socket.on('ip present',function () {
    $('#username').prop('readonly', true);
    $('#ipError').append('This ip address is already logged in...you cannot loggin again');
  });*/

  $(document).on('click','button', function(){
    var value = $(this).data('value');
    for (var i = 0; i < chatDivList.length; i++) {
      if (chatDivList[i]==value) {
        $('#'+flag).toggle();
        $('#'+chatDivList[i]).toggle();
        $("#usersDropdown").val(chatDivList[i].replace('chat', ''));
        flag = chatDivList[i];
      }
    }
  });

  function autoScrollDown(data) {
    $('#chat'+data).animate({
      scrollTop: $('#chat'+data).get(0).scrollHeight}, 2000);
  }

});
