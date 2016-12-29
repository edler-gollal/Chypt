var fs = require('fs');

exports = module.exports = function(io) {

  var clientAmount = 0;
  var chatNSP = io.of('/Chat');

  chatNSP.on('connection', function(socket){

    clientAmount++;
    socket.name = "Anonymous";
    sendInfoMessage(socket.name + " connected");

    socket.on('chat_message', function(data) {
      sendChatMessage(socket,data.message,false);
    });

    socket.on('name_change', function(data) {
      var oldName = socket.name;
      socket.name = data.newname;
      sendInfoMessage(oldName + " renamed to " + socket.name);
    })

    socket.on('disconnect', function(){
      sendInfoMessage(socket.name + " disconnected");
      clientAmount--;
    })

  });

  function runCommand(socket, line) {
    var args = line.split(" ");
    var cmd = args[0].toLowerCase();

    line = line.substr(cmd.length + 1);
    args.shift();

    if(cmd == "rename") {
      chatNSP.to(socket.id).emit('name_change', {newname: args[0]});
    } else if(cmd == "hack") {
      sendChatMessage(socket,line,true);
    } else if(cmd == "users") {
      chatNSP.to(socket.id).emit('info_message', {message: "Online users: " + clientAmount});
    } else if(cmd == "tts") {
      line = "<script> var msg = new SpeechSynthesisUtterance('" + socket.name + " said " + line + "'); window.speechSynthesis.speak(msg)</script>" + line;
      sendChatMessage(socket,line,true);
    }
  }

  function sendChatMessage (socket,msg,enableTags){
    if(msg.charAt(0) == "."){
      msg = msg.substr(1);
      runCommand(socket,msg);
    } else {
      if(!enableTags) {
        msg = msg.replace(/</g, "&lt;");
        msg = msg.replace(/>/g, "&gt;");
      }
      chatNSP.emit('chat_message', {
        sender: socket.name,
        message: msg
      });
    }
  }

  function sendInfoMessage(msg) {
    chatNSP.emit('info_message', {message: msg});
  }

}
