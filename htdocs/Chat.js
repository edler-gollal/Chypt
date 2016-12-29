var joinedChat = false;

$(document).ready(function(){
  $('form').submit(function(){
    if(!joinedChat) {
      var msg = $('#m').val()
      if(msg != "") {
        document.getElementById("messages").innerHTML = "";
        loadWithAnimation(function(){
          joinChat(msg);
        });
        $('#m').val('');
      }
      return false;
    }
  });
});

function loadWithAnimation(runFunction) {
  var percentage = 0;
  var key = "";

  $('#messages').append("<li>Generating Key...</li>");
  $('#messages').append("<li><div id='key'></div></li>");

  var interval = setInterval(function() {
    key += randomSymbol();
    document.getElementById("key").innerHTML = key;
    if(Math.random() > 0.005) {
      key = key.slice(0,-1);
    }

    percentage = key.length / 40 * 100;
    $('#loadingField').css('width', percentage + '%');

    if(key.length >= 40) {
      clearInterval(interval);
      //document.getElementById("messages").innerHTML = "";
      runFunction();
      $('#loadingField').css('width', '0%');
    }
  },1);
}

function joinChat(name) {
  joinedChat = true;
  var socket = io('/Chat');
  changeName(name);

  $('form').submit(function(){
    var msg = $('#m').val()
    if(msg != "") {
      socket.emit('chat_message', {
        message: msg
      });
      $('#m').val('');
    }
    return false;
  });

  socket.on('chat_message', function(data) {
    $('#messages').append('<li>~ ' + data.sender + ": <span class='message-text'>" + data.message + '</span></li>');
  });

  socket.on('info_message', function(data) {
    $('#messages').append('<li>' + data.message + '</li>');
  });

  socket.on('name_change', function(data) {
    changeName(data.newname);
  })

  function changeName(newname) {
    socket.emit('name_change', {newname: newname});
  }
}

function randomSymbol() {
  var symbol;
  var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz§$%&@#!?ß1234567890";
  var randomNumber = parseInt(Math.random() * symbols.length);
  symbol = symbols.charAt(randomNumber);
  return symbol;
}
