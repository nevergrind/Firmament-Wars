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
					title.chat(data.message);
				});
				// update display of channel
				document.getElementById('titleChatHeader').textContent = data.channel;
				document.getElementById('titleChatBody').innerHTML = '';
				title.updatePlayers();
			});
		}
	},
	joinLobby: function(){
		this.zmq.unsubscribe('title:' + my.channel);
		// game updates
		this.zmq.subscribe('lobby:' + game.id, function(topic, data) {
			console.info('lobby: ' + game.id, data);
			// title.chat(data.message);
		});
	},
	joinGame: function(){
		this.zmq.unsubscribe('game:' + game.id);
		// game updates
		this.zmq.subscribe('game:' + game.id, function(topic, data) {
			console.info('game: '+ game.id, data);
			// title.chat(data.message);
		});
	}
}

socket.zmq = new ab.Session('wss://' + location.hostname + '/wss2/', function(){
	console.info("Connection established with server");
	// chat updates
	title.chat("You have joined channel: " + my.channel + ".", "chat-warning");
	socket.zmq.subscribe('title:' + my.channel, function(topic, data) {
		title.chat(data.message);
	});
}, function(){
	console.warn('WebSocket connection closed');
}, {
	'skipSubprotocolCheck': true
});