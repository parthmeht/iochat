var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
var socketsObject = {};

server.listen(process.env.PORT || 3000);
console.log('Server Running ....');

app.use('/static', express.static(__dirname + '/public'));

app.get('/',function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection',function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets Connected',connections.length);
	io.sockets.emit('all users', users);

	// Disconnect
	socket.on('disconnect',function(data){
		users.splice(users.indexOf(socket.username), 1);
		console.log(socket.username+' Disconnected');
		updateUsernames();
		dropdown();
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets Connected',connections.length);
	});

	//send message
	socket.on('send message all',function (data) {
		console.log(socket.username+' : '+data);
		io.sockets.emit('new message',{msg:data,user:socket.username,flag:'public'});
	});

	socket.on('send message', function (message, to) {
		socketsObject[to].emit('new message',{msg:message,user:socket.username,flag:'private'});
		socketsObject[socket.username].emit('new message',{msg:message,user:socket.username,flag:'private'});
	});

	// New User
	socket.on('new user',function (data, callback) {
		callback(true);
		socket.username = data;
		socketsObject[socket.username] = socket;
		users.push(socket.username);
		console.log(socket.username+' connected');
		updateUsernames();
		dropdown();
	});

	function updateUsernames() {
		io.sockets.emit('get users', users);
	}

	function dropdown() {
		io.sockets.emit('drop down',users);
	}
});
