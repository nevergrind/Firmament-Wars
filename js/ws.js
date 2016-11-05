// client-side web sockets
var socket = {
	setChannel: function(channel){
		// change channel on title screen
		if (g.view === 'title'){
			// remove from channel
			$.ajax({
				type: "POST",
				url: "php/titleChangeChannel.php",
				data: {
					channel: channel
				}
			}).done(function(data){
				console.info("NEW CHANNEL: " + data);
				socket.zmq.unsubscribe('title:' + my.channel);
				my.channel = data.channel;
				for (var key in title.players){
					delete title.players[key];
				}
				title.chat("You have joined channel: " + data.channel + ".", "chat-warning");
				socket.zmq.subscribe('title:' + data.channel, function(topic, data) {
					title.chat(data.message, data.type);
				});
				// update display of channel
				document.getElementById('titleChatHeaderChannel').textContent = data.channel;
				document.getElementById('titleChatBody').innerHTML = '';
				title.updatePlayers();
			});
		}
	},
	enableWhisper: function(){
		setTimeout(function(){
			var channel = 'account:' + my.account;
			socket.zmq.subscribe(channel, function(topic, data) {
				title.receiveWhisper(data.message, 'chat-whisper');
			});
		}, 500);
		/* publish examples topic, event, exclude, eligible
			socket.zmq.sessionid()
			sess.publish(myEvent1Topic, "Hello world!", [], [mySessionId] );
			sess.publish(myEvent1Topic, "Foobar!", [client1SessionId, client23SessionId], [mySessionId]);
		*/
	},
	joinLobby: function(){
		socket.zmq.unsubscribe('title:' + my.channel);
		// game updates
		socket.zmq.subscribe('lobby:' + game.id, function(topic, data) {
			console.info('lobby: ' + game.id, data);
			// lobby.chat(data.message, data.type);
		});
	},
	joinGame: function(){
		socket.zmq.unsubscribe('game:' + game.id);
		// game updates
		socket.zmq.subscribe('game:' + game.id, function(topic, data) {
			console.info('game: '+ game.id, data);
			// game.chat(data.message, data.type);
		});
	}
}

socket.zmq = new ab.Session('wss://' + location.hostname + '/wss2/', function(){
	console.info("Connection established with server");
	// chat updates
	title.chat("You have joined channel: " + my.channel + ".", "chat-warning");
	socket.zmq.subscribe('title:' + my.channel, function(topic, data) {
		title.chat(data.message, data.type);
	});
}, function(){
	console.warn('WebSocket connection closed');
}, {
	'skipSubprotocolCheck': true
});