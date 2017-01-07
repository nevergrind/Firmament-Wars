// ws.js 
// client-side web sockets
var socket = {
	initialConnection: true,
	removePlayer: function(account){
		var o = {
			type: 'remove',
			account: my.account
		}
		// removes id
		socket.zmq.publish('title:' + my.channel, o);
		delete title.players[account];
	},
	addPlayer: function(account, flag){
		var o = {
			type: 'add',
			account: my.account,
			flag: my.flag
		}
		socket.zmq.publish('title:' + my.channel, o);
		title.players[account] = {
			flag: flag
		}
	},
	unsubscribe: function(channel){
		try {
			socket.zmq.unsubscribe(channel);
		} catch(err){
			console.warn(err);
		}
	},
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
				// removes id
				socket.removePlayer(my.account);
				// unsubs
				socket.unsubscribe('title:' + my.channel);
				// set new channel data
				my.channel = data.channel;
				for (var key in title.players){
					delete title.players[key];
				}
				title.chat("You have joined channel: " + data.channel + ".", "chat-warning", true);
				socket.zmq.subscribe('title:' + data.channel, function(topic, data) {
					if (g.ignore.indexOf(data.account) === -1){
						title.chatReceive(data);
					}
				});
				// add id
				socket.addPlayer(my.account, my.flag);
				// update display of channel
				document.getElementById('titleChatHeaderChannel').textContent = data.channel;
				document.getElementById('titleChatBody').innerHTML = '';
				title.updatePlayers();
				location.hash = my.channel === 'global' ? '' : my.channel;
			});
		}
	},
	enableWhisper: function(){
		var channel = 'account:' + my.account;
		// console.info("Subscribing to " + channel);
		socket.zmq.subscribe(channel, function(topic, data) {
			if (data.message){
				if (data.action === 'send'){
					console.info(data);
					// message sent to user
					var msg = data.flag + data.account + ' whispers: ' + data.message;
					title.receiveWhisper(msg, 'chat-whisper');
					var flag = my.flag.split(".");
					flag = flag[0].replace(/ /g, "-");
					$.ajax({
						url: 'php/insertWhisper.php',
						data: {
							action: "receive",
							flag: flag,
							player: my.player,
							account: data.account,
							message: data.message
						}
					});
				} else {
					// message receive confirmation to original sender
					console.info(data);
					var msg = data.flag + 'To ' + data.account + ': ' + data.message;
					title.receiveWhisper(msg, 'chat-whisper');
				}
			}
		});
		setInterval(console.clear, 600000); // 10 min
		(function keepAliveWs(){
			socket.zmq.publish(channel, {type: "keepAlive"});
			setTimeout(keepAliveWs, 180000);
		})();
	},
	joinGame: function(){
		(function repeat(){
			if (socket.enabled){
				socket.unsubscribe('title:' + my.channel);
				// game updates
				// console.info("Subscribing to game:" + game.id);
				socket.zmq.subscribe('game:' + game.id, function(topic, data) {
					if (g.ignore.indexOf(data.account) === -1){
						title.chatReceive(data);
					}
				});
			} else {
				setTimeout(repeat, 100);
			}
		})();
	},
	enabled: false,
	connectionTries: 0,
	connectionRetryDuration: 250,
	init: function(){
		// is player logged in?
		var e = document.getElementById('titleMenu');
		if (e !== null){
			socket.zmq = new ab.Session('wss://' + location.hostname + '/wss2/', function(){
				socket.connectionSuccess();
			}, function(){
				socket.connectionFailure();
			}, {
				'skipSubprotocolCheck': true
			});
		}
	},
	connectionSuccess: function(){
		socket.enabled = true;
		console.info("Socket connection established with server");
		// chat updates
		if (g.view === 'title' && socket.initialConnection){
			socket.initialConnection = false;
			if (location.hash.length > 1){
				my.channel = location.hash.slice(1)
				document.getElementById('titleChatHeaderChannel').innerHTML = my.channel;
			}
			socket.setChannel(my.channel);
			socket.zmq.subscribe('title:refreshGames', function(topic, data) {
				title.updateGame(data);
			});
		}
		if (g.view === 'game'){
			game.getGameState();
		}
		socket.zmq.subscribe('admin:broadcast', function(topic, data) {
			console.info('BROADCAST: ', data);
			g.chat(data.msg, data.type);
		});
		(function repeat(){
			if (my.account){
				socket.enableWhisper();
			} else {
				setTimeout(repeat, 200);
			}
		})();
	},
	connectionFailure: function(){
		console.warn('WebSocket connection failed. Retrying...');
		socket.enabled = false;
		if (++socket.connectionTries * socket.connectionRetryDuration < 60000){
			setTimeout(socket.init, socket.connectionRetryDuration);
		}
	}
}
socket.init();