// ws.js 
// client-side web sockets
var socket = {
	receive: {
		title: function(data) {
			if (data.type === 'remove'){
				title.presence.remove(data.account);
			}
			else if (data.type === 'add'){
				title.presence.add(data);
			}
			else if (data.type === 'hb'){
				title.presence.hb(data);
			}
			else {
				if (data.message !== undefined){
					title.chat(data);
				}
			}
		},
		lobby: function(data) {
			if (data.type === 'hostLeft'){
				lobby.hostLeft();
			}
			else if (data.type === 'lobby-set-cpu-difficulty'){
				lobby.updateDifficulty(data);
			}
			else if (data.type === 'updateGovernment'){
				lobby.updateGovernment(data);
			}
			else if (data.type === 'updatePlayerColor'){
				lobby.updatePlayerColor(data);
			}
			else if (data.type === 'updateTeamNumber'){
				lobby.updateTeamNumber(data);
			}
			else if (data.type === 'countdown'){
				lobby.countdown(data);
			}
			else if (data.type === 'updateLobbyPlayer'){
				lobby.updatePlayer(data);
			}
			else if (data.type === 'updateLobbyCPU') {
				lobby.updateCPU(data);
			}
			else if (data.type === 'loadGameState'){
				my.player !== 1 && loadGameState();
			}
			else {
				if (data.message !== undefined){
					lobby.chat(data);
				}
			}
		},
		game: function(data) {
			if (data.type === 'statUpdate') {
				stats.update(data);
			}
			else if (data.type === 'cannons'){
				animate.cannons(data.attackerTile, data.tile, true);
				game.updateTile(data);
			} else if (data.type === 'missile'){
				animate.missile(data.attacker, data.defender, true);
			} else if (data.type === 'nuke'){
				setTimeout(function(){
					animate.nuke(data.tile, data.attacker);
				}, 5000);
			} else if (data.type === 'nukeHit'){
				game.updateTile(data);
				game.updateDefense(data);
			} else if (data.type === 'gunfire'){
				// defender tile update
				var volume = data.player === my.player || data.playerB === my.player ?
					.7 : .2;
				animate.gunfire(data.attackerTile, data.tile, volume);
				game.updateTile(data);
				if (data.rewardUnits){
					animate.upgrade(data.tile, 'troops', data.rewardUnits);
				}
			}
			else if (data.type === 'updateTile'){
				// attacker tile update
				game.updateTile(data);
				game.setSumValues();
				if (data.rewardUnits){
					animate.upgrade(data.tile, 'troops', data.rewardUnits);
				}
				if (data.sfx === 'sniper0'){
					animate.upgrade(data.tile, 'culture');
				}
			}
			else if (data.type === 'democracy-units') {
				my.player === data.player && action.democracyUnits();
			}
			else if (data.type === 'food'){
				if (data.account.indexOf(my.account) > -1){
					audio.play('hup2');
				}
			}
			else if (data.type === 'upgrade'){
				// fetch updated tile defense data
				game.updateDefense(data);
				animate.upgrade(data.tile, 'shield');
			}
			else if (data.type === 'eliminated'){
				game.eliminatePlayer(data);
			}
			else if (data.type === 'endTurnCheck'){
				game.triggerNextTurn(data);
			}
			else if (data.type === 'disconnect'){
				game.eliminatePlayer(data);
			}

			if (data.message){
				if (data.type === 'gunfire'){
					// ? when I'm attacked?
					if (data.defender === my.account){
						// display msg?
						game.chat(data);
					}
					// lost attack
				} else {
					game.chat(data);
				}
			}
			if (data.sfx){
				audio.play(data.sfx);
			}
		}
	},
	publish: {
		title: {
			remove: function(account) {
				socket.zmq.publish('title:' + my.channel, {
					type: 'remove',
					account: account
				});
				title.players[account] = void 0;
			}
		}
	},
	initialConnection: true,
	unsubscribe: function(channel){
		try {
			socket.zmq.unsubscribe(channel);
		} catch(err){
			// console.info(err);
		}
	},
	setChannel: function(channel, bypass){
		// change channel on title screen
		if (g.view === 'title'){
			// remove from channel
			channel = channel.trim();
			console.info("CHANNEL: ", channel);
			// first character must be alphanumeric
			if (!channel) {
				g.chat("That channel name is not valid. Channel names may only contain alphanumeric values.");
			}
			else if (bypass || channel !== my.channel){
				socket.publish.title.remove(my.account);
				$.ajax({
					type: "POST",
					url: app.url + "php/titleChangeChannel.php",
					data: {
						channel: channel
					}
				}).done(function(data){
					// removes id
					title.presence.remove(my.account);
					// unsubs
					socket.unsubscribe('title:' + my.channel);
					// set new channel data
					my.channel = data.channel;
					title.presence.reset();
					data.skip = true;
					data.message = lang[my.lang].joinedChannel + data.channel;
					data.type = "chat-warning";
					// send message to my chat log
					title.chat(data);
					socket.zmq.subscribe('title:' + my.channel, function(topic, data) {
						if (g.ignore.indexOf(data.account) === -1){
							socket.receive[g.view](data);
						}
					});
					// update display of channel
					if (g.view === 'title'){
						document.getElementById('titleChatHeaderChannel').textContent = data.channel;
						document.getElementById('titleChatBody').innerHTML = '';
					}
					// update browser hash
					location.hash = my.channel;
				}).fail(function() {
					g.chat("That channel name is not valid.");
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
						url: app.url + 'php/insertWhisper.php',
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
					data.message = data.chatFlag + data.account + lang[my.lang].whispers + data.message;
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
						data.message = data.chatFlag + lang[my.lang].to + data.account + ': ' + data.message;
						data.type = 'chat-whisper';
						title.receiveWhisper(data);
					}
				}
			}
		});
	},
	enableHeartbeat: function() {
		socket.zmq.subscribe('fw:hb:' + my.account, function(topic, data) {
			if (data.msg){
				g.chat(data.msg, data.type);
			}
		});
	},
	sendHeartbeatInterval: 0,
	socketSendTime: 0,
	sendHeartbeat: function() {
		socket.socketSendTime = Date.now();
		if (socket.zmq !== null) {
			if (g.view === 'title') {

				socket.zmq.publish('title:' + my.channel, {
					type: 'hb',
					account: my.account,
					flag: my.flag,
					rating: my.rating
				});

			}
		}
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
						socket.receive[g.view](data);
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
		socket.zmq = new ab.Session('wss://' + app.socketUrl + '/wss2/',
			socket.connectionSuccess,
			socket.reconnect, {
			// options
			'skipSubprotocolCheck': true
		});
	},
	connectionSuccess: function(){
		socket.enabled = true;
		console.info("Socket connection established with server");
		// chat updates
		if (g.view === 'title'){
			socket.zmq.subscribe('title:refreshGames', function(topic, data) {
				console.info("title:refreshGames");
				title.updateGame(data);
			});
			socket.zmq.subscribe('admin:broadcast', function(topic, data) {
				if (data.msg){
					g.chat(data.msg, data.type);
				}
				else if (data.category === 'close-app') {
					title.exitGame();
				}
			});
			(function repeat(){
				if (my.account){
					// do this stuff once we detect account data
					socket.enableWhisper();
					socket.enableHeartbeat();
					setInterval(console.clear, 300000); // 5 min
					// so it happens after the object initializes
					setTimeout(function() {
						clearInterval(socket.sendHeartbeatInterval);
						socket.sendHeartbeatInterval = setInterval(socket.sendHeartbeat, 1000);
					})
				}
				else {
					setTimeout(repeat, 100);
				}
			})();
			socket.setChannel(my.channel, true); // should be usa-1
		}
		else if (g.view === 'lobby') {

		}
		else if (g.view === 'game'){
			game.getGameState();
		}
		g.unlock();
	},
	connectionTries: 0,
	connectionRetryDuration: 100,
	reconnect: function(){
		console.warn('WebSocket connection failed. Retrying...');
		socket.zmq = void 0;
		socket.enabled = false;
		setTimeout(socket.init, socket.connectionRetryDuration);
	}
}