var global = {
  joinedChat: false,
  key: null,
}

$(document).ready(function(){
  $('form').submit(function(){
    if(!global.joinedChat) {
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
    if(Math.random() > 0.05) {
      key = key.slice(0,-1);
    }

    percentage = key.length / 40 * 100;
    $('#loadingField').css('width', percentage + '%');

    if(key.length >= 40) {
      global.key = key;
      clearInterval(interval);
      document.getElementById("messages").innerHTML = "";
      runFunction();
      $('#loadingField').css('width', '0%');
    }
  },1);
}

function joinChat(name) {
  global.joinedChat = true;
  var socket = io('/Chat');
  socket.emit('set_key', {key: global.key});
  changeName(name);
  $('form').submit(function(){
    var msg = $('#m').val()
    if(msg != "") {
      var encrypted = CryptoJS.AES.encrypt(msg, global.key).toString();
      socket.emit('chat_message', {
        message: encrypted
      });
      $('#m').val('');
    }
    return false;
  });
  socket.on('chat_message', function(data) {
    var sender = CryptoJS.AES.decrypt(data.sender, global.key).toString(CryptoJS.enc.Utf8);
    var msg = CryptoJS.AES.decrypt(data.message, global.key).toString(CryptoJS.enc.Utf8);
    $('#messages').append('<li>~ ' + sender + ": <span class='message-text'>" + msg + '</span></li>');
  });
  socket.on('info_message', function(data) {
    var msg = CryptoJS.AES.decrypt(data.message, global.key).toString(CryptoJS.enc.Utf8);
    $('#messages').append('<li>' + msg + '</li>');
  });
  socket.on('name_change', function(data) {
    changeName(data.newname);
  })
  function changeName(newname) {
    socket.emit('name_change', {newname: newname});
  }
}

function randomSymbol() {
  var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  return symbols.charAt(parseInt(Math.random() * symbols.length));
}
