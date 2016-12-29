var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Chat = require('./chat')(io);

app.use(express.static('htdocs'));

http.listen(3004, function(){
  console.log('listening on *:3004');
});
