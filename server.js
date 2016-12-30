var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Chat = require('./chat')(io);

app.use(express.static('htdocs'));

var port;
if(process.argv[2] != undefined) {
  port = process.argv[2];
}

http.listen(port, function(){
  console.log('listening on *:' + port);
});
