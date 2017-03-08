$(function(){
  var socket = io.connect();
  var $messageForm = $('#messageForm');
  var $message = $('#message');
  var $chat = $('#chat');
  var $messageArea = $('#messageArea');
  var $userFormArea = $('#userFormArea');
  var $userForm = $('#userForm');
  var $users = $('#users');
  var $username = $('#username');
  var $usersDropdown = $('#usersDropdown');
  var $welcome = $('#welcome');
  var globalList=[];

  var s = $('<select class="form-control" name="usersDropdown" id="usersDropdown" /><br>');
  $('<option />', {value: '', text: '----select---'}).appendTo(s);
  $('<option />', {value: 'all', text: 'all'}).appendTo(s);

  $messageForm.submit(function(e) {
    e.preventDefault();
    console.log('Submitted');
    if (document.getElementById('usersDropdown').value=='all') {
      socket.emit('send message all',$message.val());
    }else if (document.getElementById('usersDropdown').value=='') {

    }else {
      socket.emit('send message',$message.val(),document.getElementById('usersDropdown').value);
    }
    $message.val('');
  });

  socket.on('new message',function (data) {
    if (userId==data.user) {
      $chat.append('<div class="col-md-offset-8 col-sm-4 bubble bubble-user"><strong>'+data.user+': </strong>'+data.msg+'</div>');
    } else {
      $chat.append('<div class="col-sm-4 col-md-offset-right-8 bubble bubble-others"><strong>'+data.user+'</strong> <small>('+data.flag+'</small>)<strong>:</strong> '+data.msg+'</div>');
    }
  });

  socket.on('all users',function (data) {
    globalList.push(data);
  });

  $userForm.submit(function(e) {
    e.preventDefault();
    if (globalList.length>0) {
      console.log('inside if condition');
      for (var i = 0; i < globalList[0].length; i++) {
        if (globalList[0][i]!=undefined) {
          if (globalList[0][i].toLowerCase()==$username.val().toLowerCase()) {
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
    var html1 = '';
    for (i = 0; i < data.length; i++) {
      html1 += '<li class="list-group-item">'+data[i]+'<span class="glyphicon glyphicon-asterisk pull-right" style="color: green;" aria-hidden="true"></span></li>';
    }
    $users.html(html1);
  });

  socket.on('drop down',function(data) {
    var optionsAsString = "";
    optionsAsString += "<option value=''>---Select---</option>";
    optionsAsString += "<option value='all'>all</option>";
    for(var i = 0; i < data.length; i++) {
      if (data[i]!=userId) {
        optionsAsString += "<option value='" + data[i] + "'>" + data[i] + "</option>";
      }
    }
    $usersDropdown.html(optionsAsString);
  });

  $("input").on("keypress", function(e) {
    if (e.which === 32 && !this.value.length)
        e.preventDefault();
  });

  socket.on('new connect',function (data) {
    $chat.append('<div class="col-md-offset-4 col-md-4" style="color:green;"><strong>'+data+' Connected</strong></div>');
  });

  socket.on('new disconnect',function (data) {
    $chat.append('<div class="col-md-offset-4 col-md-4" style="color:red;"><strong>'+data+' Disconnected</strong></div>');
  });
});
