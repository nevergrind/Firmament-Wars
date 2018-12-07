// lobby.js
var lobby = {
	reloadGame: false,
	cpuFlag: 'Random',
	data: [
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' },
		{ account: '' }
	],
	startClassOn:  "btn btn-md btn-block btn-responsive shadow4 lobbyButtons",
	startClassOff: "btn btn-md btn-block btn-responsive shadow4 lobbyButtons lobby-gray",
	util: {
		countPlayers: function() {
			var v, key, count = 0;
			for (key in lobby.presence.list) {
				v = lobby.presence.list[key];
				if (typeof v !== 'undefined' && v.account) {
					count++;
					// console.info(count, v, v.account);
				}
			}
			return count;
		},
		countCpuPlayers: function() {
			var v, key, count = 0;
			for (key in lobby.presence.list) {
				v = lobby.presence.list[key];
				if (typeof v !== 'undefined' && v.account && v.cpu) count++;
			}
			return count;
		}
	},
	addCpuPlayer: function(){
		var flag = lobby.cpuFlag === 'Random' ?
			g.getRandomFlag() : lobby.cpuFlag,
			count = lobby.util.countPlayers(),
			player = count + 1;
		console.info('add start: ', flag, count);
		console.info('my.lastDifficulty: ', my.lastDifficulty);
		if (count && count < title.mapData[g.map.key].players) {
			g.lock();
			audio.play('click');
			document.getElementById('lobby-difficulty-cpu'+ player).textContent = my.lastDifficulty;
			$.ajax({
				url: app.url +'php/cpu-add-player.php',
				data: {
					flag: flag,
					lastDifficulty: my.lastDifficulty,
				}
			}).always(function() {
				g.unlock();
			});
		}
	},
	removeCpuPlayer: function() {
		if (lobby.util.countCpuPlayers()) {
			var player = lobby.getHighestCpuPlayer();
			console.info("REMOVING PLAYER: ", player);
			if (player) {
				audio.play('click');
				g.lock();
				// disable cpu presence
				lobby.presence.list['Computer_' + game.id +'-' + player].cpu = 0;
				$.ajax({
					type: 'POST',
					url: app.url + 'php/cpu-remove-player.php',
					data: {
						player: player
					}
				}).done(function() {
					//lobby.presence.list['Computer_' + game.id +'-' + player] = undefined;
					console.warn("//////////////////////////////////////////////////////");
				}).always(function() {
					g.unlock();
				});
			}
		}
	},
	updateGovernmentWindow: function(government){ // key value in
		if (g.view === 'game') return;
		// updates government description
		var str = '';
		console.info('Government selected: ', government);
		if (government === 'Random') {
			document.getElementById('lobbyGovernment' + my.player).innerHTML = lang[my.lang].governments[government];
			document.getElementById('lobbyGovernmentDescription').innerHTML =
				'<div id="lobbyGovName" class="text-primary">Random</div>'+
				'<div id="lobbyGovPerks">'+
					'<div>???</div>'+
					'<div>???</div>'+
					'<div>???</div>'+
					'<div>???</div>'+
				'</div>';
		}
		else {
			str =
			'<div id="lobbyGovName" class="text-primary">' +
				'<img src="images/icons/'+ government +'.png" '+
				'class="fw-icon-sm">'+ lang[my.lang].governments[government] +
			'</div>';
			// perks
			str += '<div id="lobbyGovPerks">';
			// console.warn('lang[my.lang][government]', lang[my.lang][government]);
			for (var key in lang[my.lang][government]) {
				str += '<div>' + lang[my.lang][government][key] + '</div>';
			}
			str += '</div>';

			document.getElementById('lobbyGovernment' + my.player).innerHTML =
				'<img src="images/icons/'+ government +'.png" class="fw-icon-sm">' + lang[my.lang].governments[government];
			document.getElementById('lobbyGovernmentDescription').innerHTML = str;
		}
	},
	chat: function (data){
		while (DOM.lobbyChatLog.childNodes.length > 200) {
			DOM.lobbyChatLog.removeChild(DOM.lobbyChatLog.firstChild);
		}
		var z = document.createElement('div');
		if (data.type){
			z.className = data.type;
		}
		z.innerHTML = data.message;
		DOM.lobbyChatLog.appendChild(z);
		if (!lobby.chatDrag){
			DOM.lobbyChatLog.scrollTop = DOM.lobbyChatLog.scrollHeight;
		}
		// g.sendNotification(data.message);
	},
	chatDrag: false,
	gameStarted: false,
	chatOn: false,
	sendMsg: function(bypass){
		var msg = $DOM.lobbyChatInput.val().trim();
		if (bypass || lobby.chatOn){
			// bypass via ENTER or chat has focus
			if (msg){
				// is it a command?
				if (msg === '/friend'){
					title.listFriends();
				}
				else if (msg.indexOf('/friend ') === 0){
					title.toggleFriend(msg.slice(8));
				}
				else if (msg.indexOf('/unignore ') === 0){
					var account = msg.slice(10);
					title.removeIgnore(account);
				}
				else if (msg === '/ignore'){
					title.listIgnore();
				}
				else if (msg.indexOf('/ignore ') === 0){
					var account = msg.slice(8);
					title.addIgnore(account);
				}
				else if (msg.indexOf('@') === 0){
					title.sendWhisper(msg , '@');
				}
				else if (msg.indexOf('/who ') === 0){
					title.who(msg);
				}
				else {
					// send ajax chat msg
					if (msg.charAt(0) === '/' && msg.indexOf('/me') !== 0){
						// skip
					} else {
						$.ajax({
							url: app.url +'php/insertLobbyChat.php',
							data: {
								message: msg
							}
						});
					}
				}
			}
			$DOM.lobbyChatInput.val('');
		}
	},
	init: function(x){
		// build the lobby DOM
		if (lobby.initialized) return;
		document.getElementById('lobbyChatLog').innerHTML = lang[my.lang].youHaveJoined + x.name;
		lobby.sendMsg();
		var e1 = document.getElementById("lobbyGameName");
		if (e1 !== null){
			if (x.rating){
				document.getElementById('lobbyRankedMatch').style.display = 'block';
				document.getElementById('lobbyGameNameWrap').style.display = 'none';
			}
			e1.innerHTML = x.name;
			document.getElementById('lobbyGameMode').textContent = x.gameMode;
			if (x.password){
				document.getElementById('lobbyGamePasswordWrap').style.display = 'block';
				document.getElementById('lobbyGamePassword').innerHTML = x.password;
			}
			document.getElementById("lobbyGameMap").innerHTML = x.map;
			document.getElementById("lobbyGameMax").innerHTML = x.max;
			document.getElementById("startGame").style.display = x.player === 1 ? "block" : "none";
			if (!x.startGame){
				document.getElementById('mainWrap').style.display = "flex";
			}
			var str = '<div id="lobbyWrap">';
			for (var i=1; i<=8; i++){
				str += 
				'<div id="lobbyRow' +i+ '" class="lobbyRow">\
					<div class="lobby-row-col-1">\
						<img id="lobbyFlag' +i+ '" class="lobbyFlags block center no-select" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">\
					</div>\
					<div class="lobby-row-col-2 lobbyDetails">\
						<div class="lobbyAccounts">';
						
							if (g.teamMode){
								// yes, the span is necessary to group the dropdown
								str += '<span><div id="lobbyTeam'+ i +'" data-placement="right" class="lobbyTeams dropdown-toggle pointer2" data-toggle="dropdown">';
								
								str += '<i class="fa fa-flag pointer2 lobbyTeamFlag"></i> <span id="lobbyTeamNumber'+ i +'" class="lobbyTeamNumbers">' + i +'</span></div>';
								str +=
								'<ul id="teamDropdown" class="dropdown-menu">\
									<li class="header text-center selectTeamHeader">'+ lang[my.lang].team +'</li>';
									for (var j=1; j<=8; j++){
										str += '<li class="teamChoice" data-player="'+ i +'">'+ lang[my.lang].team +' '+ j +'</li>';
									}
								str += '</ul></span>';
							}
							// square
							str += '<span><i id="lobbyPlayerColor'+ i +'" class="fa fa-square player'+ i +' lobbyPlayer dropdown-toggle';
							
							if (i === my.player){
								str += ' pointer2';
							}
							
							str += '" data-placement="right" data-toggle="dropdown"></i>';
							
							if (i === my.player){
								str += 
								'<ul id="teamColorDropdown" class="dropdown-menu">\
									<li class="header text-center selectTeamHeader">'+ lang[my.lang].playerColor +'</li>' +
									'<li id="team-color-flex">';
								for (var j=1; j<=20; j++){
									str += '<div class="pbar'+ j +' playerColorChoice" data-playercolor="'+ j +'"></div>';
								}
								str += '</li></ul></span>';
							}
							
							str += '<span id="lobbyAccountName'+ i +'" class="lobbyAccountName chat-warning"></span>\
						</div>\
						<div id="lobbyName' +i+ '" class="lobbyNames nowrap"></div>\
					</div>\
					<div class="lobby-row-col-3">';
					if (i === x.player){
						// my.player === i || data.cpu && my.player === 1
						// me - gov dropdown
						str += 
						'<div id="gov-dropdown-player'+ i +'" class="dropdown govDropdown">\
							<button class="btn btn-primary btn-responsive dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">\
								<span id="lobbyGovernment' +i+ '">'+ lang[my.lang].governments.Despotism +'</span>\
								<i id="lobbyCaret' +i+ '" class="fa fa-caret-down text-warning lobbyCaret"></i>\
							</button>\
							<ul class="governmentDropdown dropdown-menu no-select">';
								for (var key in lang[my.lang].governments) {
									str +=
									'<li class="governmentChoice" data-government="'+ key +'">'+
										'<a>'+ lang[my.lang].governments[key] +'</a>'+
									'</li>';
								}
							str += '</ul>\
						</div>' + 
						lobby.getCpuDropdown(i);
					}
					else {
						// not me - gov dropdown
						str += 
						'<div id="gov-dropdown-player'+ i +'" class="dropdown govDropdown">\
							<button style="cursor: default" class="btn btn-primary btn-responsive dropdown-toggle shadow4 fwDropdownButton fwDropdownButtonEnemy" type="button">\
								<span id="lobbyGovernment' +i+ '" class="pull-left">'+ lang[my.lang].governments.Despotism +'</span>\
								<i id="lobbyCaret' +i+ '" class="fa fa-caret-down text-disabled lobbyCaret"></i>\
							</button>\
						</div>' + 
						lobby.getCpuDropdown(i);
					}
					str += '</div>\
					</div>';
			}
			str += '</div>';
			if (my.player === 1 && !g.rankedMode){
				str +=
				'<div id="lobby-cpu-row" class="buffer2">\
					<span id="selectCpuFlag" class="dropdown">\
						<button id="cpuSelectWrap" class="btn dropdown-toggle shadow4 fwDropdownButton" \type="button" data-toggle="dropdown">\
							<span id="cpuFlag"></span>\
							<i class="fa fa-caret-down text-warning flex-caret"></i>\
						</button>\
						<ul id="cpuFlagDropdown" class="dropdown-menu fwDropdown"></ul>\
					</span>\
					<button id="cpu-add-player" type="button" class="btn fwBlue btn-responsive shadow4 cpu-button">\
						<img src="images/icons/computer.png" class="fw-icon-sm">'+ lang[my.lang].addCPU +'\
					</button>\
					<button id="cpu-remove-player" type="button" class="btn fwBlue btn-responsive shadow4 cpu-button">\
						<img src="images/icons/computer.png" class="fw-icon-sm">'+ lang[my.lang].removeCPU +'\
					</button>\
				</div>';
			}
			document.getElementById("lobbyPlayers").innerHTML = str;
			// default setting
			$('#cpuFlag').html(lang[my.lang].random);
			title.setFlagDropdown('cpuFlagDropdown', 1);
			lobby.updateGovernmentWindow(my.government);
		}
	},
	initialized: 0,
	getCpuDropdown: function(player){
		var str = 
		'<div id="gov-dropdown-cpu'+ player +'" class="dropdown govDropdown none">\
			<button class="btn btn-primary btn-responsive dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">\
				<img src="images/icons/computer.png" class="fw-icon-sm">\
				<span id="lobby-difficulty-cpu'+ player +'">'+ lang[my.lang].difficulties[my.lastDifficulty] +'</span>\
				<i id="lobby-caret-cpu'+ player +'" class="fa fa-caret-down text-warning lobbyCaret"></i>\
			</button>\
			<ul class="governmentDropdown dropdown-menu no-select">';
				for (var key in lang[my.lang].difficulties){
					str += 
					'<li class="cpu-choice" data-player="'+ player +'" data-difficulty="'+ key +'">'+
						'<a>'+ lang[my.lang].difficulties[key] +'</a>'+
					'</li>';
				}
			str += '</ul>\
		</div>';
		return str;
	},
	presence: {
		list: {},
		hb: function(data) {
			data.timestamp = Date.now();
			console.log('%c lobbyHeartbeat: '+ data.account, 'background: #0f0; color: #f00');
			if (typeof this.list[data.account] === 'undefined') {
				console.info("ADDING NEW:", data.account);
				this.add(data);
			}
			else {
				this.update(data);
			}
			this.audit(data.timestamp);
			/*}*/
		},
		add: function(data) {
			//data
			this.update(data);
			//dom
			lobby.addPlayer(data);
		},
		update: function(data) {
			this.list[data.account] = data;
			// console.info("lobby: ", this.list);
		},
		remove: function(data) {
			// console.log("remove: ", data);
			this.list[data.account] = void 0;
			// dom
			lobby.removePlayer(data, true);

		},
		audit: function(now) {
			var v;
			for (var key in this.list) {
				v = this.list[key];
				typeof v !== 'undefined' &&
					now - v.timestamp > 5000 &&
					this.remove({
						account: v.account,
						player: v.player,
					});
			}
		}
	},
	join: function(d){
		// transition to game lobby
		if (d === undefined){
			d = .5;
		}
		g.lock(1);
		g.view = "lobby";
		title.closeModal();
		TweenMax.to('header', d, {
			y: '-200%',
			ease: Quad.easeIn
		});
		TweenMax.to('#titleChat', d, {
			x: '100%',
			ease: Quad.easeIn
		});

		TweenMax.to('#titleMenu', d, {
			x: '-100%',
			ease: Quad.easeIn,
			onComplete: function(){
				TweenMax.to(['#titleMain', '#logoWrap', '#firmamentWarsLogoWrap'], .5, {
					alpha: 0,
					onComplete: function(){
						$("#titleMain, #title-bg-wrap").remove();
						g.unlock(1);
						TweenMax.fromTo('#joinGameLobby', d, {
							autoAlpha: 0
						}, {
							autoAlpha: 1
						});
						// add cpu automatically in Play Now
						title.addCpu && lobby.addCpuPlayer();
						title.addCpu = 0;

						d !== 0 && my.player !== 1 &&
							$(".lobbyRow:visible").length < 2 &&
							lobby.hostLeft();

						TweenMax.from('#lobbyRightCol', 1, {
							x: '150%'
						});
						TweenMax.from('#lobbyLeftCol', 1, {
							x: '-150%'
						})
					}
				});
			}
		});
		if (!d){
			// rejoin game
			setTimeout(loadGameState, 100); // page refresh
		}
	},
	hostLeft: function(){
		setTimeout(function(){
			g.msg(lang[my.lang].hostLeft);
			setTimeout(function(){
				exitGame(true);
			}, 1000);
		}, 500);
	},
	addPlayer: function(data) {
		data.timestamp = Date.now();
		var i = data.player;
		console.info("ADD PLAYER: ", data);

		document.getElementById("lobbyRow" + i).style.display = 'flex';
		// different player account
		document.getElementById("lobbyAccountName" + i).innerHTML = data.cpu ?
			'Computer' : data.account;
		// nation name
		if (data.cpu) {
			data.nation = data.nation.split('.')[0];
		}
		document.getElementById("lobbyName" + i).innerHTML = data.nation;
		var flag = data.flag.split('.')[0];
		document.getElementById("lobbyFlag" + i).src =
			'images/flags/'+ flag + ui.getFlagExt(flag);

		if (my.player === i && isLoggedIn){
			$("#lobbyPlayerColor" + i).attr('title', lang[my.lang].selectPlayerColor)
				.tooltip({
					container: 'body',
					animation: false
				});
			$("#lobbyTeam" + i).attr('title', lang[my.lang].selectTeam)
				.tooltip({
					container: 'body',
					animation: false
				});
		}
		console.info('LOBBY: updatePlayer', data);
		lobby.presence.list[data.account] = data;
		lobby.updateGovernment(data);
		lobby.updatePlayerColor(data);
		document.getElementById('lobbyGovernment'+ i).innerHTML = data.cpu ?
			('<img src="images/icons/computer.png" class="fw-icon-sm">'+ data.difficulty) :
			'<img src="images/icons/Despotism.png" class="fw-icon-sm">'+ lang[my.lang].governments.Despotism;

		$("#lobbyCaret"+ i)
			.removeClass("text-warning text-disabled")
			.addClass(my.player === i || data.cpu && my.player === 1 ? 'text-warning' : 'text-disabled');

		document.getElementById('gov-dropdown-player'+ data.player).style.display =
			data.cpu ? 'none' : 'block';
		document.getElementById('gov-dropdown-cpu'+ data.player).style.display =
			data.cpu ? 'block' : 'none';
		lobby.styleStartGame();
	},
	removePlayer: function(data, disconnected) {
		console.info("REMOVE PLAYER: ", data);
		var i = data.player,
			account = data.account,
			key,
			v;

		if (!disconnected) {
			// cpu remove
			for (key in lobby.presence.list) {
				v = lobby.presence.list[key];
				if (typeof v !== 'undefined' && v.player === i) {
					account = v.account;
				}
			}
		}
		console.info('removePlayer: ', account);
		if (account) {
			lobby.presence.list[account] = void 0;
			document.getElementById("lobbyRow" + i).style.display = 'none';
			document.getElementById('lobby-difficulty-cpu' + i).innerHTML = lang[my.lang].difficulties[my.lastDifficulty];
			lobby.styleStartGame();
			// remove in case they dropped
			if (disconnected && my.player === 1) {
				// why is this here? it's in cpu-remove-player.php
				$.post(app.url +'php/deletePlayerFromFwplayers.php', {
					player: data.player,
				});
			}
		}
	},
	getHighestCpuPlayer: function() {
		var player = 1, index = 0, v;
		for (var key in lobby.presence.list) {
			v = lobby.presence.list[key];
			index++;
			if (typeof v !== 'undefined' && v.account && v.cpu) {
				player = index;
			}
		}
		return player;
	},/*
	getLowestAvailablePlayer: function() {
		var index = 0;
		for (var key in lobby.presence.list) {
			index++;
		}
		return index;
	},
	getLowestAvailableColor: function() {
		var taken = [0],
			color = 0,
			index = 0,
			v;
		for (var key in lobby.presence.list) {
			v = lobby.presence.list[key];
			index++;
			if (index && v.account) {
				taken.push(v.player);
			}
		}
		g.color.forEach(function(v, i) {
			if (!color && taken.indexOf(i) === -1) {
				color = i;
			}
		});
		return color;
	},*/
	// update player's team number
	updateTeamNumber: function(data){
		//console.info("UPDATE TEAM NUMBER: ", data);
		var i = data.player;
		var e = document.getElementById('lobbyTeamNumber' + i);
		if (e !== null){
			e.textContent = data.team;
		}
	},
	// update player's color only
	updatePlayerColor: function(data){
		//console.info("UPDATE PLAYER COLOR ", data);
		var i = data.player;
		var str = my.player === i ? 
			'fa fa-square lobbyPlayer dropdown-toggle pointer2 player' + data.playerColor :
			'fa fa-square lobbyPlayer dropdown-toggle player' + data.playerColor;
		$("#lobbyPlayerColor" + i).removeClass()
			.addClass(str)
			.data('playerColor', data.playerColor);
		lobby.presence.list[data.account].playerColor = data.playerColor;
	},
	// update player's government only
	updateGovernment: function(data){
		// update button & window
		var i = data.player;
		console.info('updateGovernment', data);
		lobby.presence.list[data.account].government = data.government;
		document.getElementById('lobbyGovernment' + i).innerHTML =
			data.government === 'Random' ?
				lang[my.lang].governments[data.government] :
				'<img src="images/icons/'+ data.government +'.png" class="fw-icon-sm">' + lang[my.lang].governments[data.government];
	},
	updateDifficulty: function(data){
		var i = data.player * 1,
			account = '',
			key,
			v = lobby.presence.list;
		for (key in v) {
			if (v[key].player === i) {
				account = v[key].account;
			}
		}
		if (account) {
			console.info('updateDifficulty', data, data.difficulty);
			$('#lobby-difficulty-cpu' + i).html(lang[my.lang].difficulties[data.difficulty]);
			lobby.presence.list[account].difficulty = data.difficulty;
		}
	},
	styleStartGame: function(){
		if (my.player === 1){
			// set start game button
			if (lobby.util.countPlayers() === 1){
				startGame.className = lobby.startClassOff;
			}
			else {
				startGame.className = lobby.startClassOn;
			}
		}
	},
	countdown: function(data){
		// still in the lobby?
		if (!lobby.gameStarted || my.player === 1){
			$("#lobby-cpu-row").remove();
			lobby.gameStarted = true;
			new Audio('sound/beepHi.mp3');
			// normal countdown
			countdown.style.display = 'block';
			(function repeat(secondsToStart){
				countdown.textContent = lang[my.lang].startingGame + secondsToStart--;
				if (secondsToStart >= 0){
					audio.play('beep');
					setTimeout(repeat, 1000, secondsToStart);
				}
				else {
					audio.play('beepHi');
					audio.load.game();
					video.load.game();
				}
				if (secondsToStart === 1){
					TweenMax.to('#mainWrap', 1.5, {
						delay: 1,
						alpha: 0,
						ease: Linear.easeNone,
						onComplete: function(){
							my.player === 1 && loadGameState();
						}
					});
					audio.fade();
				}
			})(5);
			cancelGame.style.display = 'none';
			$("#teamDropdown").css('display', 'none');
		}
	},
	governmentIcon: function(p){
		var str = '';
		if (p.cpu) {
			str += '<img src="images/icons/computer.png" class="fw-icon-sm">';
		}
		else {
			str += '<img src="images/icons/'+ p.government +'.png" class="fw-icon-sm">';
		}
		return str;
	},
	getFood: function() {
		var foo = 2,
			roll = ~~(Math.random() * 20) + 1;
		if (roll >= 19){
			foo = 4;
		} else if (roll >= 14){
			foo = 3;
		}
		return foo;
	},
	getProduction: function() {
		var foo = 1,
			roll = ~~(Math.random() * 20) + 1;
		if (roll >= 19) {
			foo = ~~(Math.random() * 2) + 3;
		}
		else if (roll >= 16) {
			foo = 2;
		}
		return foo;
	},
	getCulture: function() {
		var foo = 0,
			roll = ~~(Math.random() * 20) + 1;
		if (roll >= 19){
			foo = ~~(Math.random() * 4) + 5;
		} else if (roll >= 16){
			foo = ~~(Math.random() * 2) + 3;
		} else if (roll >= 12){
			foo = 2;
		}
		return foo;
	},
	getPlayers: function() {
		var players = [{
				account: '',
				nation: '',
				flag: "blank.png",
				player: 0,
				playerColor: 0,
				team: 1,
				oBonus: 0,
				dBonus: 0,
				alive: 1,
				government: '',
			}],
			key,
			v;
		for (key in lobby.presence.list) {
			v = lobby.presence.list[key];
			typeof v !== 'undefined' && v.account && players.push(v);
		}
		console.info("getPlayers: ", players);
		return players;
	},
	getGameTiles: function() {
		var tiles = [],
			i = 0,
			key, v, t,
			len = title.mapData[g.map.key].tiles,
			startTiles = title.mapData[g.map.key].startTiles,
			tileNames = title.mapData[g.map.key].names,
			units = 0,
			barbEnabled = ~~(Math.random() * 4),
			bonusType = 0,
			food = 0,
			production = 0,
			culture = 0;

		// fwtiles
		for (; i<len; i++) {
			units = 0;
			if (i % 4 === barbEnabled) {
				units = ~~(Math.random() * 3) + 2;
			}
			food = this.getFood();
			production = this.getProduction();
			culture = this.getCulture();
			// apply barb resource bonus
			if (units) {
				bonusType = ~~(Math.random() * 2);
				if (bonusType) {
					if (culture) {
						culture += ~~(Math.random() * 2) + 2;
					}
					else if (production) {
						production += 1;
					}
					else {
						food += ~~(Math.random() * 3) + 2;
					}
				}
				else {
					food += ~~(Math.random() * 2) + 2;
				}
			}
			tiles[i] = {
				account: '',
				adj: [],
				capital: 0,
				cpu: 0,
				culture: culture,
				defense: 0,
				flag: '',
				food: food,
				name: tileNames[i],
				nation: '',
				player: 0,
				playerColor: 0,
				production: production,
				team: 0,
				units: units,
			}
		}
		// update for capitals etc
		food = 5;
		production = 4;
		culture = 8;
		for (key in lobby.presence.list) {
			v = lobby.presence.list[key];
			if (typeof v !== 'undefined') {
				var startLen = startTiles.length,
					startIndex = ~~(Math.random() * startLen - 1),
					startTile = startTiles[startIndex],
					units = 12,
					defense = 1,
					cpu = 0;

				v.start = startTile;

				startTiles.splice(startIndex, 1);

				if (v.government === 'Despotism') {
					defense = 2;
				}
				if (v.cpu === 1) {
					cpu = 1;
				}
				t = tiles[startTile];
				t.account = v.account;
				t.player = v.player;
				t.playerColor = v.playerColor;
				t.team = v.team;
				t.nation = v.nation;
				t.flag = v.flag;
				t.units = units;
				t.food = food;
				t.production = production;
				t.culture = culture;
				t.defense = defense;
				t.capital = 1;
				t.cpu = cpu;
				console.info("Setting cap: ", v.account, startTile, t);
			}
		}
		console.info("getGameTiles: ", tiles);
		return tiles;
	},
	getMyCapital: function() {
		var capital = 0, key, v;
		for (key in game.player) {
			v = game.player[key];
			if (typeof v !== 'undefined') {
				if (v.start && v.player === my.player) {
					capital = v.start;
				}
			}
		}
		return capital;
	},
	setCapitalData: function() {
		var capitalTiles = [];
		for (var key in game.tiles) {
			if (game.tiles[key].capital &&
				game.tiles[key].player) {
				capitalTiles.push(key * 1);
			}
		}
		my.capital = lobby.getMyCapital();
		$.ajax({
			url: app.url +'php/set-capital-data.php',
			data: {
				capital: my.capital,
				capitalTiles: capitalTiles,
			}
		});
		return capitalTiles;
	},
	rxGameInit: function(data) {
		console.info("rxGameInit", data);
		// game tiles
		game.tiles = data.tiles;
		localStorage.setItem('fwtiles', JSON.stringify(game.tiles));
		// game players
		game.player = data.players;
		localStorage.setItem('fwplayers', JSON.stringify(game.player));
		this.setCapitalData(data);
	},
	startGame: function(){
		if (my.player === 1){
			if (lobby.util.countPlayers() >= 2){
				g.lock();
				audio.play('click');
				lobby.gameStarted = true;
				startGame.style.display = "none";
				cancelGame.style.display = 'none';
				$.ajax({
					type: 'GET',
					url: app.url +"php/startGame.php"
				}).done(function() {
					// send tile data
					setTimeout(function() {
						var players = lobby.getPlayers(),
							tiles = lobby.getGameTiles();
						$.ajax({
							url: app.url +"php/send-game-init.php",
							data: {
								tiles: JSON.stringify(tiles),
							}
						}).done(function(data) {
							console.info("send-game-init.php", data);
						});
						socket.zmq.publish('game:' + game.id, {
							type: 'send-game-init',
							tiles: tiles,
							players: players
						});
					}, 3500);
				}).fail(function(data){
					g.msg(data.statusText);
					startGame.style.display = "block";
					cancelGame.style.display = 'block';
				}).always(g.unlock);
			}
			else {
				g.msg(lang[my.lang].needTwoPlayers, 5);
			}
		}
	}
};

function initOffensiveTooltips(){
	if (isLoggedIn){
		$('#fireCannons')
			.attr('title', ui.cannonTooltip())
			.tooltip('fixTitle')
			.tooltip({ animation: false });
		$('#launchMissile')
			.attr('title', ui.missileTooltip()).tooltip('fixTitle')
			.tooltip({ animation: false });
		$('#rush')
			.attr('title', ui.rushTooltip())
			.tooltip('fixTitle')
			.tooltip({ animation: false });
	}
}
function initResources(d){
	my.food = d.food;
	my.production = d.production;
	my.culture = d.culture;
	// current
	DOM.moves.textContent = d.moves;
	DOM.production.textContent = d.production;
	DOM.food.textContent = d.food;
	DOM.culture.textContent = d.culture;
	// turn
	// max
	DOM.manpower.textContent = my.manpower;
	my.manpower = d.manpower;
	DOM.foodMax.textContent = d.foodMax;
	DOM.cultureMax.textContent = d.cultureMax;
	// sum
	//DOM.sumFood.textContent = d.sumFood;
	//DOM.sumProduction.textContent = d.sumProduction;
	//DOM.sumCulture.textContent = d.sumCulture;
	// bonus values
	DOM.oBonus.textContent = d.oBonus;
	DOM.dBonus.textContent = d.dBonus;
	DOM.productionBonus.textContent = d.productionBonus;
	DOM.foodBonus.textContent = d.foodBonus;
	DOM.cultureBonus.textContent = d.cultureBonus;
	setBars(d);
}
function setMoves(d){
	if (d.moves !== undefined){
		my.moves = d.moves;
		DOM.moves.textContent = d.moves;
		if (d.sumMoves){
			//DOM.sumMoves.textContent = d.sumMoves;
		}
		// DOM.endTurn.style.visibility = my.moves ? 'visible' : 'hidden';
	}
}
function setProduction(d){
	if (d.production !== undefined){
		TweenMax.to(my, .3, {
			production: d.production,
			ease: Quad.easeIn,
			onUpdate: function(){
				DOM.production.textContent = ~~my.production;
			}
		});
	}
}
function setManpower(d) {
	if (d.manpower !== undefined){
		if (d.manpower > my.manpower){
			TweenMax.fromTo('#manpower', .5, {
				color: '#ffaa33'
			}, {
				color: '#ffff00',
				repeat: -1,
				yoyo: true

			});
			TweenMax.to(my, .5, {
				manpower: d.manpower,
				onUpdate: function(){
					DOM.manpower.textContent = ~~my.manpower;
				}
			});
		} else {
			my.manpower = d.manpower;
			DOM.manpower.textContent = my.manpower;
		}
	}
}
function setResources(d){
	//console.info(d);
	setMoves(d);
	setProduction(d);
	TweenMax.to(my, .3, {
		food: d.food === undefined ? my.food : d.food,
		culture: d.culture === undefined ? my.culture : d.culture,
		ease: Quad.easeIn,
		onUpdate: function(){
			DOM.food.textContent = ~~my.food;
			DOM.culture.textContent = ~~my.culture;
		}
	});
	setManpower(d);
	if (d.foodMax !== undefined){
		if (d.foodMax && d.foodMax > my.foodMax){
			DOM.foodMax.textContent = d.foodMax;
			my.foodMax = d.foodMax;
		}
	}
	if (d.cultureMax !== undefined){
		if (d.cultureMax && d.cultureMax > my.cultureMax){
			DOM.cultureMax.textContent = d.cultureMax;
			my.cultureMax = d.cultureMax;
		}
	}
	/*if (d.sumFood !== undefined){
		if (d.sumFood && d.sumFood !== my.sumFood){
			//DOM.sumFood.textContent = d.sumFood;
			my.sumFood = d.sumFood;
		}
	}
	if (d.sumProduction !== undefined){
		if (d.sumProduction && d.sumProduction !== my.sumProduction){
			//DOM.sumProduction.textContent = d.sumProduction;
			my.sumProduction = d.sumProduction;
		}
	}
	if (d.sumCulture !== undefined){
		if (d.sumCulture && d.sumCulture !== my.sumCulture){
			//DOM.sumCulture.textContent = d.sumCulture;
			my.sumCulture = d.sumCulture;
		}
	}*/
	// bonus values
	if (d.oBonus !== undefined){
		if (my.oBonus !== d.oBonus){
			DOM.oBonus.textContent = d.oBonus;
			my.oBonus = d.oBonus;
			initOffensiveTooltips();
		}
	}
	if (d.dBonus !== undefined){
		if (my.dBonus !== d.dBonus){
			DOM.dBonus.textContent = d.dBonus;
			my.dBonus = d.dBonus;
		}
	}
	if (d.productionBonus !== undefined){
		if (my.productionBonus !== d.productionBonus){
			DOM.productionBonus.textContent = d.productionBonus;
			my.productionBonus = d.productionBonus;
		}
	}
	if (d.foodBonus !== undefined){
		if (my.foodBonus !== d.foodBonus){
			DOM.foodBonus.textContent = d.foodBonus;
			my.foodBonus = d.foodBonus;
		}
	}
	if (d.cultureBonus !== undefined){
		if (my.cultureBonus !== d.cultureBonus){
			DOM.cultureBonus.textContent = d.cultureBonus;
			my.cultureBonus = d.cultureBonus;
			// rush bonus changes
			initOffensiveTooltips();
		}
	}
	setBars(d);
}
function setBars(d){
	// animate bars
	TweenMax.to(DOM.foodBar, .3, {
		width: ((d.food / d.foodMax) * 100) + '%'
	});
	TweenMax.to(DOM.cultureBar, .3, {
		width: ((d.culture / d.cultureMax) * 100) + '%'
	});
}

function loadGameState(){
	sessionStorage.setItem('gameDuration', Date.now());
	g.lock(1);
	var e1 = document.getElementById("mainWrap");
	if (e1 !== null){
		TweenMax.to(e1, .5, {
			alpha: 0
		});
	}
	// load map
	DOM.worldWrap.innerHTML = maps.getMap(g.map.key);

	// init map DOM stuff here
	// programmatically set land elements' id and class
	var e = document.querySelectorAll('#landWrap > path');

	for (var i=0, len = e.length; i<len; i++) {
		e[i].setAttributeNS(null, 'id', 'land'+i);
		e[i].setAttributeNS(null, 'class', 'land');
	}

	// programmatically set text elements' id and class
	e = document.querySelectorAll('text');
	for (i=0, len = e.length; i<len; i++) {
	  	e[i].setAttributeNS(null, 'id', 'unit'+i);
	  	e[i].setAttributeNS(null, 'class', 'unit');
	}
	initDom();
	$("#leaderboard, #configureNation, #joinPrivateGameModal, #createGameWrap").remove();

	// console.info("SENDING: ", playerData);
	$.ajax({
		type: 'GET',
		url: app.url +"php/loadGameState.php",
	}).done(function(data){

		if (sessionStorage.getItem('fwstats') === null) {
			stats.initStats();
		}
		else {
			// load if it's there
			stats.data = JSON.parse(sessionStorage.getItem('fwstats'));
		}
		localStorage.setItem('disconnects', 1);

		console.info("loadGameState", data);
		// data.mapData.sizeX data.mapData.sizeX
		document.getElementById('world')
			.setAttribute('viewBox', '0 0 ' + data.mapData.sizeX + ' ' + data.mapData.sizeY);

		$("#login-modal, meta").remove();
		setTimeout($("#title-bg-wrap").remove, 2000);

		g.resourceTick = data.resourceTick;
		g.startGame = data.startGame * 1;
		g.teamMode = data.teamMode;
		g.gameMode = data.gameMode;
		// set map data
		g.map.sizeX = data.mapData.sizeX;
		g.map.sizeY = data.mapData.sizeY;
		g.map.name = title.mapData[g.map.key].name;
		g.map.tiles = title.mapData[g.map.key].tiles;
		g.map.tileNames = title.mapData[g.map.key].names;

		/*if (data.tiles.length < g.map.tiles){
			console.warn(data.tiles.length, g.map.tiles);
			if (g.loadAttempts < 20){
				setTimeout(function(){
					g.loadAttempts++;
					loadGameState(); // try again
				}, 500);
			}
			else {
				g.msg(lang[my.lang].failedToLoad);
				setTimeout(function(){
					window.onbeforeunload = null;
					location.reload();
				}, 3000);
			}
			return;
		}*/
		g.screen.resizeMap();
		audio.gameMusicInit();
		// only when refreshing page while testing
		audio.load.game();
		video.load.game();
		// done
		my.player = data.player;
		my.team = data.team;
		// my.account = data.account;
		my.oBonus = data.oBonus;
		my.dBonus = data.dBonus;
		my.cultureBonus = data.cultureBonus;
		my.tech = data.tech;
		my.flag = data.flag;
		my.nation = data.nation;
		my.foodMax = data.foodMax;
		my.production = data.production;
		my.sumProduction = data.sumProduction;
		my.cultureMax = data.cultureMax;
		my.moves = data.moves;
		my.government = data.government;
		my.cannonBonus = data.cannonBonus;
		lobby.updateGovernmentWindow(my.government);
		// global government bonuses
		if (my.government === 'Monarchy'){
			my.cannonsBonus = 2;
		}
		else if (my.government === 'Democracy'){
			my.maxDeployment = 48;
		}
		else if (my.government === 'Republic'){
			my.sumMoves = data.sumMoves;
			document.getElementById('moves').textContent = my.sumMoves;
			// DOM.sumMoves.textContent = my.sumMoves;
			//console.info('sumMoves ', my.government, my.sumMoves, data.sumMoves);
		}
		else if (my.government === 'Fascism'){
			document.getElementById('moves').textContent = 8;
			my.deployCost = 1;
			document.getElementById('deployCost').textContent = my.deployCost;
		}
		// initialize player data
		game.initialized = true;
		if (g.reloadGame) {
			// did not find lobby data
			game.player = JSON.parse(localStorage.getItem('fwplayers'));
			game.tiles = JSON.parse(localStorage.getItem('fwtiles'));
		}
		my.capital = lobby.getMyCapital();

		g.removeContainers();
		g.unlock();
		g.view = "game";
		TweenMax.fromTo(gameWrap, 1, {
			autoAlpha: 0
		}, {
			autoAlpha: 1
		});

		// initialize client tile data
		var now = Date.now(), d, i;
		for (i=0, len=game.tiles.length; i<len; i++){
			d = game.tiles[i];
			d.adj = data.adj[i];
			d.timestamp = now;

			// init flag unit values
			var zig = document.getElementById('unit' + i);
			if (zig !== null){
				var unitVal = game.tiles[i].capital ?
					'<tspan class="unit-star">&#10028;</tspan>' + d.units :
					d.units;
				zig.innerHTML = d.units === 0 ? 0 : unitVal;
				if (d.units){
					zig.style.visibility = 'visible';
				}
			}
			if (d.player){
				// init map appearance
				console.info('d.player', d.player, game.player[d.player]);
				TweenMax.set('#land' + i, {
					fill: g.color[game.player[d.player].playerColor],
					stroke: g.color[game.player[d.player].playerColor],
					strokeWidth: 1,
					onComplete: function(){
						if (d.player){
							TweenMax.set(this.target, {
								stroke: "hsl(+=0%, +=0%, -=30%)"
							});
						}
					}
				});
			}
		}
		g.tileCount = len;
		var svgTgt = document.getElementById('targetCrosshair');
		TweenMax.to(svgTgt, 10, {
			force3D: true,
			transformOrigin: '50% 50%',
			rotation: 360,
			repeat: -1,
			ease: Linear.easeNone
		});
		//lobby.initRibbons(data.ribbons);
		ui.drawDiplomacyPanel();
		initResources(data);
		// set images
		setTimeout(function(){
			// init draggable map
			worldMap = Draggable.create(DOM.worldWrap, {
				minimumMovement: 6,
				type: 'top,left',
				bounds: DOM.gameWrap,
				edgeResistance: 1,
				throwProps: true,
				onDrag: function(e) {
					setMousePosition(e.offsetX, e.offsetY);
				}
			});

			initOffensiveTooltips();
			TweenMax.set(DOM.targetLine, {
				stroke: g.color[game.player[my.player].playerColor]
			});
			TweenMax.set(DOM.targetLine, {
				stroke: "hsl(+=0%, +=0%, -=5%)"
			});
			TweenMax.set(DOM.arrowheadTip, {
				fill: g.color[game.player[my.player].playerColor]
			});
			TweenMax.set(DOM.arrowheadTip, {
				fill: "hsl(+=0%, +=0%, -=5%)"
			});

			// map events
			$("#gameWrap").on('click', '.land', function(e){
				//location.host === 'localhost' && console.info(this.id, e.offsetX, e.offsetY);
				action.triggerAction(this, e);
			}).on("mouseenter", '.land', function(){
				my.lastTarget = this;
				if (my.attackOn){
					ui.showTarget(this, true);
				}
				TweenMax.set(this, {
					fill: "hsl(+=0%, +=0%, -=5%)"
				});
			}).on("mouseleave", '.land', function(){
				var land = this.id.slice(4)*1;
				if (game.tiles.length > 0){
					var player = game.tiles[land] !== undefined ? game.tiles[land].player : 0,
						fillNum = player ? game.player[player].playerColor : 0;
					TweenMax.set(this, {
						fill: g.color[fillNum]
					});
				}
			});

			// focus on player home
			my.focusTile(my.capital);
			// add warning for players
			game.startGameState();
			ui.setCurrentYear(data.resourceTick);
			animate.paths();
			action.setMenu();
			ui.updateTileInfo(my.lastTgt);
			game.setVisibilityAll();
			// language width adjustment
			document.getElementById('resources-ui').style.width = lang[my.lang].resourceUiWidth;
		}, 350);
		/*TweenMax.set('.land', {
			filter: 'url(#emboss)'
		})*/
		// init map flags
		var a = document.querySelectorAll('#world text'),
			mapFlagWrap = document.getElementById('mapFlagWrap');
		for (var i=0, len=a.length; i<len; i++){
			// set flag position and value
			var t = game.tiles[i],
				x = a[i].getAttribute('x') - 30,
				y = a[i].getAttribute('y') - 40,
				flag = 'blank.png';

			if (t !== undefined){
				if (!t.flag && t.units){
					flag = "Barbarian.jpg";
				}
				else if (t.flag){
					flag = t.flag;
				}
			}
			flag = flag.split('.')[0];
			flag = flag + ui.getFlagExt(flag);
			// dynamically add svg flag image to the map
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
			svg.id = 'flag' + i;
			svg.setAttributeNS(null, 'height', 60);
			svg.setAttributeNS(null, 'width', 60);
			svg.setAttributeNS(null,"x",x);
			svg.setAttributeNS(null,"y",y);
			svg.setAttributeNS(null,"class","mapFlag");
			svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/flags/' + flag);
			mapFlagWrap.appendChild(svg);
		}

		// init map DOM elements
		game.initMap();
		// food, culture, def bars
		for (var i=0; i<len; i++){
			animate.initMapBars(i);
		}
	}).fail(function(data){
		console.info(data);
		setTimeout(loadGameState, 1500);
	}).always(function(){
		g.unlock();
	});
};