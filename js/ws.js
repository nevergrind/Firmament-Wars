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
				var o = {
					type: 'remove',
					account: my.account
				}
				// removes id
				socket.zmq.publish('title:' + my.channel, o);
				// unsubs
				socket.zmq.unsubscribe('title:' + my.channel);
				// set new channel data
				my.channel = data.channel;
				for (var key in title.players){
					delete title.players[key];
				}
				title.chat("You have joined channel: " + data.channel + ".", "chat-warning");
				socket.zmq.subscribe('title:' + data.channel, function(topic, data) {
					title.chatReceive(data);
				});
				var o = {
					type: 'add',
					account: my.account,
					flag: my.flag
				}
				// add id
				socket.zmq.publish('title:' + my.channel, o);
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
				if (data.message){
					if (data.action === 'send'){
						// message sent to user
						var msg = data.flag + data.account + ' whispers: ' + data.message;
						title.receiveWhisper(msg, 'chat-whisper');
						$.ajax({
							url: 'php/insertWhisper.php',
							data: {
								account: data.account,
								message: data.message
							}
						});
					} else {
						// message receive confirmation to original sender
						var msg = data.flag + 'To ' + data.account + ': ' + data.message;
						title.receiveWhisper(msg, 'chat-whisper');
					}
				}
			});
			(function keepAliveWs(){
				socket.zmq.publish(channel, {message: ""});
				setTimeout(keepAliveWs, 180000);
			})();
		}, 500);
	},
	joinLobby: function(){
		socket.zmq.unsubscribe('title:' + my.channel);
		// game updates
		socket.zmq.subscribe('lobby:' + game.id, function(topic, data) {
			// lobby.chat(data.message, data.type);
			title.chatReceive(data);
		});
	},
	joinGame: function(){
		socket.zmq.unsubscribe('game:' + game.id);
		// game updates
		socket.zmq.subscribe('game:' + game.id, function(topic, data) {
			// game.chat(data.message, data.type);
			title.chatReceive(data);
		});
	},
	
}

socket.zmq = new ab.Session('wss://' + location.hostname + '/wss2/', function(){
	console.info("Connection established with server");
	// chat updates
	title.chat("You have joined channel: " + my.channel + ".", "chat-warning");
	socket.zmq.subscribe('title:' + my.channel, function(topic, data) {
		title.chatReceive(data);
	});
}, function(){
	console.warn('WebSocket connection closed');
}, {
	'skipSubprotocolCheck': true
});