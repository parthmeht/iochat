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
  chatDivList=new Array();
  chatDivList.push('chatAll');
  var flag = "chatAll";
  var dropdownValue;
  var trigger = true;
  var bagdgeVal = {"All":0};

  /*socket.on('ip present',function () {
    $('#username').prop('readonly', true);
    $('#ipError').append('This ip address is already logged in...you cannot loggin again');
  });*/

  socket.on('all users',function (data) {
    globalList.push(data);
    if (trigger) {
      getUsers();
      dropDown();
      newChatDiv();
      trigger = false;
    }
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

  function getUsers(){
    for (var i = 0; i < globalList[0].length; i++) {
      if (globalList[0][i]!=undefined) {
        $users.append('<div class="list-group-item" id="li'+globalList[0][i].replace(/\s+/g, '-')+'"><button class="btn btn-primary" style="width:80%;" data-value="chat'+globalList[0][i].replace(/\s+/g, '-')+'" id="btn'+globalList[0][i].replace(/\s+/g, '-')+'" >'+globalList[0][i]+' <span class="badge" id="badge'+globalList[0][i].replace(/\s+/g, '-')+'"></span></button></div>');
        chatDivList.push('chat'+globalList[0][i].replace(/\s+/g, '-'));
        bagdgeVal[globalList[0][i].replace(/\s+/g, '-')]=0;
      }
    }
  };

  function dropDown() {
    for (var i = 0; i < globalList[0].length; i++) {
      if (globalList[0][i]!=undefined) {
        $usersDropdown.append("<option value='" + globalList[0][i].replace(/\s+/g, '-') + "'>" + globalList[0][i] + "</option>");
      }
    }
  };

  function newChatDiv(){
    for (var i = 0; i < globalList[0].length; i++) {
      if (globalList[0][i]!=undefined) {
        $('#chat').append('<div class="chat well chat-window" id="chat'+globalList[0][i].replace(/\s+/g, '-')+'"></div>');
      }
    }
    for (var i = 0; i < globalList[0].length; i++) {
      if (globalList[0][i]!=undefined) {
        $( "#chat"+globalList[0][i].replace(/\s+/g, '-')).toggle();
      }
    }
  };

  socket.on('new connect',function (data) {
    $('#chatAll').append('<div class="col-md-offset-4 col-md-4" style="color:green;"><strong>'+data+' Connected</strong></div>');
    if (data!=userId) {
      $users.append('<div class="list-group-item" id="li'+data.replace(/\s+/g, '-')+'"><button class="btn btn-primary" style="width:80%;" data-value="chat'+data.replace(/\s+/g, '-')+'" id="btn'+data.replace(/\s+/g, '-')+'" >'+data+' <span class="badge" id="badge'+data.replace(/\s+/g, '-')+'"></span></button></div>');
      chatDivList.push('chat'+data.replace(/\s+/g, '-'));
      bagdgeVal[data.replace(/\s+/g, '-')]=0;
      $usersDropdown.append("<option value='" + data + "'>" + data + "</option>");
      $('#chat').append('<div class="chat well chat-window" id="chat'+data.replace(/\s+/g, '-')+'"></div>');
      $( "#chat"+data.replace(/\s+/g, '-')).toggle();
    }
  });

  socket.on('new disconnect',function (data) {
    $('#chatAll').append('<div class="col-md-offset-4 col-md-4" style="color:red;"><strong>'+data+' Disconnected</strong></div>');
    if (data!=userId) {
      $('#chat'+data.replace(/\s+/g, '-')).remove();
      $('#btn'+data.replace(/\s+/g, '-')).remove();
      $('#li'+data.replace(/\s+/g, '-')).remove();
    }
  });

  $(document).on('click','button', function(){
    var value = $(this).data('value');
    for (var i = 0; i < chatDivList.length; i++) {
      if (chatDivList[i]==value) {
        $('#'+flag).toggle();
        $('#'+chatDivList[i]).toggle();
        $("#usersDropdown").val(chatDivList[i].replace('chat', ''));
        flag = chatDivList[i];
        $('#badge'+chatDivList[i].replace('chat', '')).html('');
        bagdgeVal[chatDivList[i].replace('chat', '')]=0;
      }
    }
  });

  function autoScrollDown(data) {
    $('#chat'+data).animate({
      scrollTop: $('#chat'+data).get(0).scrollHeight}, 2000);
  }

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
      /*$.notify(data.user+" : "+data.msg,{
        className: 'success',
        position:"top center"
      });*/
      $.notify({
        title: data.user+" : "+data.msg,
        button: 'Reply'
      }, {
        style: 'notification',
        autoHide: true,
        clickToHide: true,
        position:"top center"
      });
      if (data.flag=='private') {
        $('#chat'+data.user.replace(/\s+/g, '-')).append('<div class="col-sm-4 col-md-offset-right-8 bubble bubble-others"><strong>'+data.user+':</strong> '+data.msg+'<span class="timestamp">'+data.time+'</span></div>');
        autoScrollDown(data.user.replace(/\s+/g, '-'));
        $('#badge'+data.user.replace(/\s+/g, '-')).html(++bagdgeVal[data.user.replace(/\s+/g, '-')]);
      }else{
        $('#chatAll').append('<div class="col-sm-4 col-md-offset-right-8 bubble bubble-others"><strong>'+data.user+':</strong> '+data.msg+'<span class="timestamp">'+data.time+'</span></div>');
        autoScrollDown('All');
        $('#badgeAll').html(++bagdgeVal['All']);
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

  //add a new style 'notification'
  $.notify.addStyle('notification', {
    html:
      "<div>" +
        "<div class='clearfix'>" +
          "<div class='title' data-notify-html='title'/>" +
          "<div class='buttons'>" +
            "<button class='yes btn' data-notify-text='button'></button>" +
            "<button class='no btn'>Cancel</button>" +
          "</div>" +
        "</div>" +
      "</div>"
  });

  //listen for click events from this style
  $(document).on('click', '.notifyjs-notification-base .no', function() {
    //programmatically trigger propogating hide event
    $(this).trigger('notify-hide');
  });
  $(document).on('click', '.notifyjs-notification-base .yes', function() {
    //show button text
    alert($(this).text() + " clicked!");
    //hide notification
    $(this).trigger('notify-hide');
  });

});
