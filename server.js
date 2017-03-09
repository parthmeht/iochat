var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
var socketsObject = {};
var flag = false;
server.listen(process.env.PORT || 3000);
console.log('Server Running ....');

app.use('/static', express.static(__dirname + '/public'));

app.get('/',function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection',function(socket){

	console.log('Connected: %s sockets Connected',connections.length);
	var clientIp = socket.request.connection.remoteAddress;
	for (var i = 0; i < connections.length; i++) {
		if (connections[i].request.connection.remoteAddress==clientIp) {
			io.sockets.emit('ip present');
		}
	}
	connections.push(socket);
	io.sockets.emit('all users', users);

	// Disconnect
	socket.on('disconnect',function(data){
		if (socket.username!='null' && socket.username!=undefined) {
			users.splice(users.indexOf(socket.username), 1);
			io.sockets.emit('new disconnect',socket.username);
		}
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
		console.log('Username - '+socket.username+' connected with ip address - '+clientIp);
		updateUsernames();
		dropdown();
		io.sockets.emit('new connect',socket.username);
	});

	function updateUsernames() {
		io.sockets.emit('get users', users);
	}

	function dropdown() {
		io.sockets.emit('drop down',users);
	}
});
