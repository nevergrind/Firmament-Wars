// title.js
var title = {
	players: [],
	games: [],
	init: (function(){
		console.info("Initializing title screen...");
		// prevents auto scroll while scrolling
		$("#titleChatLog").on('mousedown', function(){
			title.chatDrag = true;
		}).on('mouseup', function(){
			title.chatDrag = false;
		});
		$("#title-chat-input").on('focus', function(){
			title.chatOn = true;
		}).on('blur', function(){
			title.chatOn = false;
		});
		$(".createGameInput").on('focus', function(){
			title.createGameFocus = true;
		}).on('blur', function(){
			title.createGameFocus = false;
		});
		$("#titleChatSend").on('click', function(){
			title.sendMsg(true);
		});
		$.ajax({
			type: 'GET',
			url: 'php/initChatId.php'
		}).done(function(data){
			my.account = data.account;
			my.flag = data.flag;
			title.updatePlayers();
		});
		setTimeout(function(){
			var str = '';
			for (var key in title.mapData){
				str += "<li><a class='mapSelect' href='#'>" + title.mapData[key].name + "</a></li>";
			}
			var e1 = document.getElementById('mapDropdown');
			if (e1 !== null){
				e1.innerHTML = str;
			}
			$('[title]').tooltip();
			title.animateLogo();
		}, 200);
		// init game refresh
		Notification.requestPermission();
		// initial refresh of games
		$.ajax({
			type: 'GET',
			url: 'php/refreshGames.php'
		}).done(function(data) {
			var e = document.getElementById('gameTableBody');
			if (e === null){
				return;
			}
			// head
			var str = '';
			// body
			for (var i=0, len=data.length; i<len; i++){
				var d = data[i];
				title.games[d.id] = d.players * 1;
				str += 
				"<tr id='game_"+ d.id +"' class='wars no-select' data-name='" + d.name + "'>\
					<td class='warCells'>"+ d.name + "</td>\
					<td class='warCells'>" + d.map + "</td>\
					<td class='warCells'><span id='game_players_"+ d.id +"'>" + d.players + "</span>/" + d.max + "</td>\
				</tr>";
			}
			e.innerHTML = str;
			$(".wars").filter(":first").trigger("click");
		}).fail(function(e){
			console.info(e.responseText);
			Msg("Server error.");
		});
		setTimeout(function(){
			g.keepAlive();
		}, 300000);
	})(),
	updatePlayers: function(data){
		title.titleUpdate = $("#titleChatPlayers").length; // player is logged in
		if (title.titleUpdate){
			// title chat loop
			(function repeat(){
				if (g.view === 'title'){
					var start = Date.now();
					$.ajax({
						type: "POST",
						url: "php/titleUpdate.php",
						data: {
							channel: my.channel
						}
					}).done(function(data){
						// report chat messages
						console.log("Ping: ", Date.now() - start);
						// set title players
						if (data.playerData !== undefined){
							var p = data.playerData,
								foundPlayers = [];
							for (var i=0, len=p.length; i<len; i++){
								// add new players
								var account = p[i].account,
									flag = p[i].flag;
								if (title.players[account] === undefined){
									// console.info("ADDING PLAYER: " + account);
									title.addPlayer(account, flag);
								} else if (title.players[account].flag !== flag){
									// replace player flag
									var flagElement = document.getElementById("titlePlayerFlag_" + account);
									if (flagElement !== null){
										flagElement.src = 'images/flags/' + flag;
									}
								}
								foundPlayers.push(account);
							}
							// remove missing players
							for (var key in title.players){
								if (foundPlayers.indexOf(key) === -1){
									var x = {
										account: key
									}
									// console.info("REMOVING PLAYER: " + x.account);
									title.removePlayer(x);
								}
							}
						}
						document.getElementById('titleChatHeaderCount').textContent = len;
						// game data sanity check
						var serverGames = [];
						if (data.gameData !== undefined){
							var p = data.gameData;
							for (var i=0, len=p.length; i<len; i++){
								serverGames[p[i].id] = {
									players: p[i].players * 1,
									max: p[i].max * 1
								}
							}
						}
						// remove games if they're not found in server games
						title.games.forEach(function(e, ind){
							// console.info(serverGames[ind]);
							if (serverGames[ind] === undefined){
								// game timed out, not found
								var o = {
									id: ind
								}
								// console.info("REMOVING: ", o);
								title.removeGame(o);
							} else {
								// found game
								if (serverGames[ind].players !== title.games[ind]){
									// player count does not match... fixing
									// console.info("PLAYER COUNT WRONG!");
									var o = {
										id: ind,
										players: serverGames[ind].players,
										max: serverGames[ind].max
									}
									title.setToGame(o);
								}
							}
						});
					}).always(function(){
						setTimeout(repeat, 5000);
					});
				}
			})();
		} else {
			// not logged in
			$("#titleChat, #titleMenu").remove();
		}
	},
	// adds player to chat room
	addPlayer: function(account, flag){
		title.players[account] = {
			flag: flag
		}
		var e = document.createElement('div');
		e.className = "titlePlayer";
		e.id = "titlePlayer" + account;
		var flagName = flag.split(".");
		e.innerHTML = '<img id="titlePlayerFlag_' + account + '" class="inlineFlag" src="images/flags/' + flag +'"> ' + account;
		if (title.titleUpdate){
			DOM.titleChatBody.appendChild(e);
		}
	},
	removePlayer: function(data){
		// fix this
		delete title.players[data.account];
		var z = document.getElementById('titlePlayer' + data.account);
		if (z !== null){
			z.parentNode.removeChild(z);
		}
	},
	updateGame: function(data){
		if (data.type === 'addToGame'){
			title.addToGame(data);
		} else if (data.type === 'removeFromGame'){
			title.removeFromGame(data);
		} else if (data.type === 'addGame'){
			title.addGame(data);
		} else if (data.type === 'removeGame'){
			title.removeGame(data);
		}
	},
	updatePlayerText: function(id){
		var e = document.getElementById('game_players_' + id);
		if (e !== null){
			e.textContent = title.games[id];
		}
	},
	setToGame: function(data){
		// refreshGames corrects player values
		// console.info("setToGame", data);
		var id = data.id;
		title.games[id] = data.players;
		title.updatePlayerText(id);
	},
	addToGame: function(data){
		// player joined or left
		// console.info("addToGame", data);
		var id = data.id;
		if (title.games[id] !== undefined){
			if (title.games[id] + 1 > data.max){
				title.games[id] = data.max;
			} else {
				title.games[id]++;
			}
		} else {
			title.games[id] = 1;
		}
		title.updatePlayerText(id);
	},
	removeFromGame: function(data){
		// player joined or left
		// console.info("removeFromGame", data);
		var id = data.id;
		if (title.games[id] !== undefined){
			if (title.games[id] - 1 < 1){
				title.games[id] = 1;
			} else {
				title.games[id]--;
			}
		} else {
			title.games[id] = 1;
		}
		title.updatePlayerText(id);
	},
	addGame: function(data){
		// created game
		// console.info("addGame", data);
		title.games[data.id] = 1;
		var e = document.createElement('tr');
		e.id = 'game_' + data.id;
		e.className = 'wars no-select';
		e.setAttribute('data-name', data.name);
		e.innerHTML = 
			"<td class='warCells'>"+ data.name + "</td>\
			<td class='warCells'>" + data.map + "</td>\
			<td class='warCells'><span id='game_players_" + data.id + "'>1</span>/" + data.max + "</td>";
		DOM.gameTableBody.insertBefore(e, DOM.gameTableBody.childNodes[0]);
	},
	removeGame: function(data){
		// game countdown started or exited
		// console.info("removeGame", data);
		delete title.games[data.id];
		var e = document.getElementById('game_' + data.id);
		if (e !== null){
			e.parentNode.removeChild(e);
		}
	},
	animateLogo: function(){
		var globeDelay = 1,
			globeYoyo = 6;
		// animate stars
		TweenMax.to('#firmamentWarsStars1', 240, {
			backgroundPosition: '-800px 0px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		TweenMax.to('#firmamentWarsStars2', 150, {
			startAt: {
				backgroundPosition: '250px 250px', 
			},
			backgroundPosition: '-1050px 250px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		TweenMax.to('#firmamentWarsStars3', 70, {
			startAt: {
				backgroundPosition: '600px 500px', 
			},
			backgroundPosition: '-200px 500px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		TweenMax.to('#firmamentWarsStars4', 30, {
			startAt: {
				backgroundPosition: '400px 600px', 
			},
			backgroundPosition: '-400px 600px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		// logo
		TweenMax.to('#firmamentWarsLogo', globeDelay, {
			startAt: {
				visibility: 'visible',
				alpha: 0
			},
			alpha: 1,
			ease: Quad.easeIn
		});
		TweenMax.to('#firmamentWarsLogo', globeDelay, {
			startAt: {
				yPercent: -50,
				y: '-15%'
			},
			y: '0%',
			onComplete: function(){
				TweenMax.to('#titleMain', .5, {
					startAt: {
						visibility: 'visible'
					},
					opacity: 1
				});
			}
		});
		// globe
		TweenMax.to('#titleGlobe', globeDelay, {
			startAt: {
				y: '15%'
			},
			y: '0%'
		});
	},
	mapData: {
		EarthAlpha: {
			name: 'Earth Alpha',
			tiles: 83,
			players: 8
		},
		FlatEarth: {
			name: 'Flat Earth',
			tiles: 78,
			players: 8
		}
	},
	chatDrag: false,
	chatOn: false,
	chat: function (msg, type, skip){
		if (g.view === 'title' && msg){
			while (DOM.titleChatLog.childNodes.length > 500) {
				DOM.titleChatLog.removeChild(DOM.titleChatLog.firstChild);
			}
			var z = document.createElement('div');
			if (type){
				z.className = type;
			}
			z.innerHTML = msg;
			DOM.titleChatLog.appendChild(z);
			if (!title.chatDrag){
				DOM.titleChatLog.scrollTop = DOM.titleChatLog.scrollHeight;
			}
			if (!skip){
				g.sendNotification(msg);
			}
		}
	},
	chatReceive: function(data){
		if (g.view === 'title'){
			// title
			if (data.type === 'remove'){
				title.removePlayer(data);
			} else if (data.type === 'add'){
				// console.info(data);
				title.addPlayer(data.account, data.flag);
			} else {
				if (data.message !== undefined){
					title.chat(data.message, data.type);
				}
			}
		} else if (g.view === 'lobby'){
			// lobby
			// console.info('lobby receive: ', data);
			if (data.type === 'hostLeft'){
				lobby.hostLeft();
			} else if (data.type === 'government'){
				lobby.updateGovernment(data);
			} else if (data.type === 'countdown'){
				lobby.countdown(data);
			} else if (data.type === 'update'){
				lobby.updatePlayer(data);
			} else {
				if (data.message !== undefined){
					lobby.chat(data.message, data.type);
				}
			}
		} else {
			// game
			// console.info('game receive: ', data);
			if (data.type === 'cannons'){
				animate.cannons(data.tile, false);
				game.updateTile(data);
			} else if (data.type === 'missile'){
				animate.missile(data.attacker, data.defender, true);
			} else if (data.type === 'nuke'){
				setTimeout(function(){
					animate.nuke(data.tile);
				}, 5000);
			} else if (data.type === 'nukeHit'){
				game.updateTile(data);
				game.updateDefense(data);
			} else if (data.type === 'gunfire'){
				// defender tile update
				animate.gunfire(data.tile, data.attacker === my.account);
				game.updateTile(data);
			} else if (data.type === 'updateTile'){
				// attacker tile update
				game.updateTile(data);
			} else if (data.type === 'food'){
				if (data.account.indexOf(my.account) > -1){
					audio.play('food');
				}
			} else if (data.type === 'upgrade'){
				// fetch updated tile defense data
				game.updateDefense(data);
				animate.upgrade(data.tile);
			} else if (data.type === 'eliminated'){
				game.eliminatePlayer(data);
			} else if (data.type === 'disconnect'){
				game.eliminatePlayer(data);
			}
			
			if (data.message){
				if (data.type === 'gunfire'){
					if (data.defender === my.account){
						game.chat(data.message, data.type);
					}
				} else {
					game.chat(data.message, data.type);
				}
			}
			if (data.sfx){
				audio.play(data.sfx);
			}
		}
	},
	sendWhisper: function(msg, splitter){
		// account
		var arr = msg.split(splitter);
		var account = arr[1].split(" ").shift();
		// message
		var splitLen = splitter.length;
		var accountLen = account.length;
		var msg = msg.substr(splitLen + accountLen + 1);
		$.ajax({
			url: 'php/insertWhisper.php',
			data: {
				account: account,
				message: msg,
				action: 'send'
			}
		});
	},
	receiveWhisper: function(msg, type){
		// console.info(msg, type);
		if (g.view === 'title'){
			title.chat(msg, type);
		} else if (g.view === 'lobby'){
			lobby.chat(msg, type);
		} else {
			game.chat(msg, type);
		}
	},
	changeChannel: function(msg, splitter){
		var arr = msg.split(splitter);
		socket.setChannel(arr[1]);
	},
	sendMsg: function(bypass){
		var msg = $DOM.titleChatInput.val().trim();
		// bypass via ENTER or chat has focus
		if (bypass || title.chatOn){
			if (msg){
				// is it a command?
				if (msg.indexOf('/join ') === 0){
					title.changeChannel(msg, '/join ');
				} else if (msg.indexOf('/j ') === 0){
					title.changeChannel(msg, '/j ');
				} else if (msg.indexOf('/whisper ') === 0){
					title.sendWhisper(msg , '/whisper ');
				} else if (msg.indexOf('/w ') === 0){
					title.sendWhisper(msg , '/w ');
				} else {
					$.ajax({
						url: 'php/insertTitleChat.php',
						data: {
							message: msg
						}
					});
				}
			}
			$DOM.titleChatInput.val('');
		}
	},
	hideBackdrop: function(){
		var e = document.getElementById("configureNation"),
			e2 = document.getElementById("titleViewBackdrop"),
			e3 = document.getElementById('createGameWrap')
			e4 = document.getElementById('optionsModal');
		TweenMax.to([e,e2,e3,e4], .2, {
			alpha: 0,
			ease: Linear.easeNone,
			onComplete: function(){
				// console.info(this.target.id);
				TweenMax.set(this.target, {
					visibility: 'hidden'
				});
			}
		});
		g.isModalOpen = false;
	},
	createGameFocus: false,
	createGame: function(){
		var name = $("#gameName").val(),
			pw = $("#gamePassword").val(),
			max = $("#gamePlayers").val() * 1;
		if (name.length < 1 || name.length > 32){
			Msg("Game name must be at least 4-32 characters.");
		} else if (max < 2 || max > 8 || max % 1 !== 0){
			Msg("Game must have 2-8 players.");
		} else {
			title.hideBackdrop();
			g.lock(1);
			audio.play('click');
			$.ajax({
				url: 'php/createGame.php',
				data: {
					name: name,
					pw: pw,
					map: title.mapData[g.map.key].name,
					max: max
				}
			}).done(function(data) {
				console.info(data);
				socket.removePlayer(my.account);
				my.player = data.player;
				game.id = data.gameId;
				game.name = data.gameName;
				// console.info("Creating: ", data);
				lobby.init(data);
				lobby.join(); // create
				socket.joinGame();
				lobby.styleStartGame();
			}).fail(function(e){
				console.info(e.responseText);
				Msg(e.statusText);
				g.unlock(1);
			});
		}
	},
	joinGame: function(){
		g.name = $("#joinGameName").val();
		if (!g.name){
			Msg("Game name is not valid!", 1.5);
			return;
		}
		g.password = $("#joinGamePassword").val();
		g.lock();
		audio.play('click');
		$.ajax({
			url: 'php/joinGame.php',
			data: {
				name: g.name,
				password: g.password
			}
		}).done(function(data){
			socket.removePlayer(my.account);
			// console.info(data);
			my.player = data.player;
			game.id = data.id;
			game.name = data.gameName;
			g.map = data.mapData;
			lobby.init(data);
			lobby.join(); // normal join
			socket.joinGame();
		}).fail(function(data){
			console.info(data);
			Msg(data.statusText, 1.5);
		}).always(function(){
			g.unlock();
		});
	},
	submitNationName: function(){
		var x = $("#updateNationName").val();
		g.lock();
		audio.play('click');
		$.ajax({
			url: 'php/updateNationName.php',
			data: {
				name: x
			}
		}).done(function(data) {
			$("#nationName").text(data);
			animate.nationName();
		}).fail(function(e){
			Msg(e.statusText);
		}).always(function(){
			g.unlock();
		});
	}
}