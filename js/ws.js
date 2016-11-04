// client-side web sockets
var socket = {
	joinLobby: {
		
	},
	joinGame: {
		
	}
};

socket.zmq = new ab.Session('wss://' + location.hostname + '/wss2/', function(){
	console.info("Connection established with server");
	// chat updates
	socket.zmq.subscribe('title:' + my.channel, function(topic, data) {
		console.info(data);
		title.chat(data.message);
	});
	
	// game updates
	socket.zmq.subscribe('lobby:game', function(topic, data) {
		console.info('games: ', data);
		// title.chat(data.message);
	});
	
	window.onbeforeunload = function(){
		socket.zmq.close();
	}
}, function(){
	console.warn('WebSocket connection closed');
}, {
	'skipSubprotocolCheck': true
});