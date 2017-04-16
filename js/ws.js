// ws.js 
// client-side web sockets
var socket = {
	initialConnection: true,
	removePlayer: function(account){
		// instant update of clients
		var o = {
			type: 'remove',
			account: my.account
		}
		// removes id
		socket.zmq.publish('title:' + my.channel, o);
		delete title.players[account];
	},
	addPlayer: function(account, flag){
		// instant update of clients
		var o = {
			type: 'add',
			account: my.account,
			flag: my.flag,
			rating: my.rating
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
			console.info(err);
		}
	},
	setChannel: function(channel){
		// change channel on title screen
		if (g.view === 'title'){
			// remove from channel
			channel = channel.trim();
			if (channel !== my.channel){
				$.ajax({
					type: "POST",
					url: "php/titleChangeChannel.php",
					data: {
						channel: channel
					}
				}).done(function(data){
					// removes id
					socket.removePlayer(my.account);
					// unsubs
					socket.unsubscribe('title:' + my.channel);
					// set new channel data
					my.channel = data.channel;
					for (var key in title.players){
						delete title.players[key];
					}
					data.skip = true;
					data.message = "You have joined channel: " + data.channel;
					data.type = "chat-warning";
					title.chat(data);
					socket.zmq.subscribe('title:' + data.channel, function(topic, data) {
						if (g.ignore.indexOf(data.account) === -1){
							title.chatReceive(data);
						}
					});
					// add id
					socket.addPlayer(my.account, my.flag);
					// update display of channel
					if (g.view === 'title'){
						document.getElementById('titleChatHeaderChannel').textContent = data.channel;
						document.getElementById('titleChatBody').innerHTML = '';
					}
					title.updatePlayers(0);
					location.hash = my.channel;
				});
			}
		}
	},
	enableWhisper: function(){
		var channel = 'account:' + my.account;
		socket.zmq.subscribe(channel, function(topic, data) {
			if (data.message){
				if (data.action === 'send'){
					//console.info("SENT: ", data.playerColor, data);
					// message sent to user
					var flag = my.flag.split(".");
					flag = flag[0].replace(/ /g, "-");
					my.lastReceivedWhisper = data.account;
					$.ajax({
						url: 'php/insertWhisper.php',
						data: {
							action: "receive",
							flag: data.flag,
							playerColor: data.playerColor,
							account: data.account,
							message: data.message
						}
					});
					data.type = 'chat-whisper';
					data.msg = data.message;
					data.message = data.chatFlag + data.account + ' whispers: ' + data.message;
					title.receiveWhisper(data);
				} else {
					// message receive confirmation to original sender
					// console.info("CALLBACK: ", data);
					if (data.timestamp - title.lastWhisper.timestamp < 500 &&
						data.account === title.lastWhisper.account &&
						data.message === title.lastWhisper.message){
						// skip message
					} else {
						// reference values to avoid receiving double messages when a player is in the lobby multiple times
						// this causes multiple response callbacks
						title.lastWhisper.account = data.account;
						title.lastWhisper.timestamp = data.timestamp;
						title.lastWhisper.message = data.message;
						// send message
						data.msg = data.message;
						data.message = data.chatFlag + 'To ' + data.account + ': ' + data.message;
						data.type = 'chat-whisper';
						title.receiveWhisper(data);
					}
				}
			}
		});
		if (location.host !== 'localhost'){
			setInterval(console.clear, 600000); // 10 min
		}
		(function keepAliveWs(){
			socket.zmq.publish('admin:broadcast', {});
			setTimeout(keepAliveWs, 20000);
		})();
	},
	joinGame: function(){
		(function repeat(){
			if (socket.enabled){
				socket.unsubscribe('title:' + my.channel);
				socket.unsubscribe('game:' + game.id);
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
	init: function(){
		// is player logged in?
		socket.zmq = new ab.Session('wss://' + location.hostname + '/wss2/', function(){
			// on open
			socket.connectionSuccess();
		}, function(){
			// on close/fail
			socket.reconnect();
		}, {
			// options
			'skipSubprotocolCheck': true
		});
	},
	connectionSuccess: function(){
		socket.enabled = true;
		console.info("Socket connection established with server");
		// chat updates
		if (g.view === 'title'){
			if (socket.initialConnection){
				socket.zmq.subscribe('title:refreshGames', function(topic, data) {
					title.updateGame(data);
				});
				socket.zmq.subscribe('admin:broadcast', function(topic, data) {
					if (data.msg){
						g.chat(data.msg, data.type);
					}
				});
				(function repeat(){
					if (my.account){
						socket.enableWhisper();
					} else {
						setTimeout(repeat, 200);
					}
				})();
			}
			socket.initialConnection = false;
			document.getElementById('titleChatHeaderChannel').innerHTML = my.channel;
			socket.setChannel(initChannel);
		}
		if (g.view === 'game'){
			game.getGameState();
		}
	},
	connectionTries: 0,
	connectionRetryDuration: 100,
	reconnect: function(){
		console.warn('WebSocket connection failed. Retrying...');
		socket.enabled = false;
		setTimeout(socket.init, socket.connectionRetryDuration);
	}
}
socket.init();