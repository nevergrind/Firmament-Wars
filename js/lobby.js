// lobby.js
var lobby = {
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
	startClassOn:  "btn btn-info btn-md btn-block btn-responsive shadow4 lobbyButtons",
	startClassOff: "btn btn-default btn-md btn-block btn-responsive shadow4 lobbyButtons",
	totalPlayers: function(){
		var count = 0;
		for (var i=0, len=lobby.data.length; i<len; i++){
			if (lobby.data[i].account){
				count++;
			}
		}
		return count;
	},
	updateGovernmentWindow: function(government){
		// updates government description
		var str = '';
		if (government === "Despotism"){
			str = '<div id="lobbyGovName" class="text-primary">Despotism</div>\
				<div id="lobbyGovPerks">\
					<div>3x starting crystals</div>\
					<div>+50% starting armies</div>\
					<div>Start With a Bunker</div>\
					<div>Free Split Attack</div>\
				</div>';
		} else if (government === "Monarchy"){
			str = '<div id="lobbyGovName" class="text-primary">Monarchy</div>\
				<div id="lobbyGovPerks">\
					<div>3x starting culture</div>\
					<div>+50% culture bonus</div>\
					<div>Start with two Great Tacticians</div>\
					<div>1/2 cost structures</div>\
				</div>';
		} else if (government === "Democracy"){
			str = '<div id="lobbyGovName" class="text-primary">Democracy</div>\
				<div id="lobbyGovPerks">\
					<div>Unlimited Army Deployment</div>\
					<div>+50% crystal bonus</div>\
					<div>More great people</div>\
					<div>Start with a wall</div>\
				</div>';
		} else if (government === "Fundamentalism"){
			str = '<div id="lobbyGovName" class="text-primary">Fundamentalism</div>\
				<div id="lobbyGovPerks">\
					<div>Overrun ability</div>\
					<div>Infiltration</div>\
					<div>Faster growth</div>\
					<div>1/2 cost Recruit</div>\
				</div>';
		} else if (government === "Fascism"){
			str = '<div id="lobbyGovName" class="text-primary">Fascism</div>\
				<div id="lobbyGovPerks">\
					<div>Fervor doubles bonus troops</div>\
					<div>3x Starting Oil</div>\
					<div>Start with Great General</div>\
					<div>1/2 cost Deploy</div>\
				</div>';
		} else if (government === "Republic"){
			str = '<div id="lobbyGovName" class="text-primary">Republic</div>\
				<div id="lobbyGovPerks">\
					<div>+50% plunder bonus</div>\
					<div>2x starting food</div>\
					<div>+50% food bonus</div>\
					<div>Combat medics</div>\
				</div>';
		} else if (government === "Communism"){
			str = '<div id="lobbyGovName" class="text-primary">Communism</div>\
				<div id="lobbyGovPerks">\
					<div>2x discovery bonus</div>\
					<div>1/2 cost research</div>\
					<div>1/2 cost weapons</div>\
					<div>Start with a great person</div>\
				</div>';
		}
		document.getElementById('lobbyGovernment' + my.player).innerHTML = government;
		document.getElementById('lobbyGovernmentDescription').innerHTML = str;
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
		g.sendNotification(data.message);
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
				if (msg.indexOf('/unfriend ') === 0){
					var account = msg.slice(10);
					title.removeFriend(account);
				} else if (msg === '/friend'){
					title.listFriends();
				} else if (msg.indexOf('/friend ') === 0){
					var account = msg.slice(8);
					title.addFriend(account);
				} else if (msg.indexOf('/unignore ') === 0){
					var account = msg.slice(10);
					title.removeIgnore(account);
				} else if (msg === '/ignore'){
					title.listIgnore();
				} else if (msg.indexOf('/ignore ') === 0){
					var account = msg.slice(8);
					title.addIgnore(account);
				} else if (msg.indexOf('/whisper ') === 0){
					title.sendWhisper(msg, '/whisper ');
				} else if (msg.indexOf('/w ') === 0){
					title.sendWhisper(msg, '/w ');
				} else if (msg.indexOf('@') === 0){
					title.sendWhisper(msg , '@');
				} else if (msg.indexOf('/who ') === 0){
					title.who(msg);
				} else {
					// send ajax chat msg
					$.ajax({
						url: 'php/insertLobbyChat.php',
						data: {
							message: msg
						}
					});
				}
			}
			$DOM.lobbyChatInput.val('');
		}
	},
	init: function(x){
		// build the lobby DOM
		console.info("Initializing lobby...", x.rating);
		var e1 = document.getElementById("lobbyGameName");
		if (e1 !== null){
			if (x.rating){
				document.getElementById('lobbyRankedMatch').style.display = 'block';
				document.getElementById('lobbyGameNameWrap').style.display = 'none';
			}
			e1.innerHTML = x.name;
			document.getElementById('lobbyGameMode').textContent = x.gameMode;
			g.speed = g.speeds[x.speed];
			document.getElementById("lobbyGameSpeed").innerHTML = x.speed;
			document.getElementById("lobbyGameMap").innerHTML = x.map;
			document.getElementById("lobbyGameMax").innerHTML = x.max;
			var z = x.player === 1 ? "block" : "none";
			document.getElementById("startGame").style.display = z;
			if (!x.startGame){
				document.getElementById('mainWrap').style.display = "block";
			}
			var str = '<div id="lobbyWrap" class="container">';
			for (var i=1; i<=8; i++){
				str += 
				'<div id="lobbyRow' +i+ '" class="row lobbyRow">\
					<div class="col-xs-2">\
						<img id="lobbyFlag' +i+ '" data-placement="right" class="lobbyFlags block center" src="images/flags/blank.png">\
					</div>\
					<div class="col-xs-6 lobbyDetails">\
						<div class="lobbyAccounts">\
							<span>\
							<div id="lobbyTeam'+ i +'" class="lobbyTeams dropdown-toggle';
							if (i === my.player){
								str += ' pointer2';
							}
							str += '" data-placement="right" data-toggle="dropdown">';
							if (i === my.player){
								str += '<i class="fa fa-flag pointer2 lobbyTeamFlag"></i> <span id="lobbyTeamNumber'+ i +'">' + i +'</span>';
							} else {
								str += '<i class="fa fa-flag lobbyTeamFlag"></i> <span id="lobbyTeamNumber'+ i +'">' + i +'</span>';
							}
							str += '</div>';
							if (i === my.player){
								str += 
								'<ul id="teamDropdown" class="dropdown-menu">\
									<li class="header text-center selectTeamHeader">Team</li>';
									for (var j=1; j<=8; j++){
										str += '<li class="teamChoice">Team '+ j +'</li>';
									}
								str += '</ul></span>';
							}
							str += '<span><i id="lobbyPlayerColor'+ i +'" class="fa fa-square player'+ i +' lobbyPlayer dropdown-toggle';
							if (i === my.player){
								str += ' pointer2';
							}
							str += '" data-placement="right" data-toggle="dropdown"></i>';
							if (i === my.player && fwpaid){
								str += 
								'<ul id="teamColorDropdown" class="dropdown-menu">\
									<li class="header text-center selectTeamHeader">Player Color</li>';
								for (var j=1; j<=20; j++){
									str += '<i class="fa fa-square player'+ j +' playerColorChoice" data-playercolor="'+ j +'"></i>';
								}
								str += '</ul></span>';
							}
							str += '<span id="lobbyAccountName'+ i +'" class="lobbyAccountName chat-warning"></span>\
						</div>\
						<div id="lobbyName' +i+ '" class="lobbyNames nowrap"></div>\
					</div>\
					<div class="col-xs-4">';
					if (i === x.player){
						// me
						str += 
						'<div class="dropdown govDropdown">\
							<button class="btn btn-primary btn-responsive dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">\
								<span id="lobbyGovernment' +i+ '">Despotism</span>\
								<i class="fa fa-caret-down text-warning lobbyCaret"></i>\
							</button>\
							<ul id="governmentDropdown" class="dropdown-menu">\
								<li class="governmentChoice"><a href="#">Despotism</a></li>\
								<li class="governmentChoice"><a href="#">Monarchy</a></li>\
								<li class="governmentChoice"><a href="#">Democracy</a></li>\
								<li class="governmentChoice"><a href="#">Fundamentalism</a></li>\
								<li class="governmentChoice"><a href="#">Fascism</a></li>\
								<li class="governmentChoice"><a href="#">Republic</a></li>\
								<li class="governmentChoice"><a href="#">Communism</a></li>\
							</ul>\
						</div>';
					} else {
						// not me
						str += 
						'<div class="dropdown govDropdown">\
							<button style="cursor: default" class="btn btn-primary dropdown-toggle shadow4 fwDropdownButton fwDropdownButtonEnemy" type="button">\
								<span id="lobbyGovernment' +i+ '" class="pull-left">Despotism</span>\
								<i class="fa fa-caret-down text-disabled lobbyCaret"></i>\
							</button>\
						</div>';
					}
					str += '</div></div>';
			}
			str += '</div>';
			document.getElementById("lobbyPlayers").innerHTML = str;
		}
		delete lobby.init;
	},
	join: function(d){
		// console.info("Joining lobby...");
		var loadTime = Date.now() - g.startTime;
		if (loadTime < 1000){
			d = 0;
		}
		if (d === undefined){
			d = 1;
		}
		g.view = "lobby";
		var titleMain = document.getElementById('titleMain'),
			titleMenu = document.getElementById ('titleMenu'),
			titleChat = document.getElementById ('titleChat');
		title.closeModal();
		TweenMax.to(titleChat, d, {
			x: '100%',
			ease: Quad.easeIn
		});
		TweenMax.to(titleMenu, d, {
			x: '-100%',
			ease: Quad.easeIn,
			onComplete: function(){
				titleMain.parentNode.removeChild(titleMain);
				g.unlock(1);
				TweenMax.fromTo('#joinGameLobby', d, {
					autoAlpha: 0
				}, {
					autoAlpha: 1
				});
			}
		});
		if (!d){
			// load game
			loadGameState(); // page refresh
		} else {
			// load lobby
			(function repeat(){
				if (g.view === "lobby"){
					$.ajax({
						type: "GET",
						url: "php/updateLobby.php"
					}).done(function(x){
						if (g.view === "lobby"){
							// reality check of presence data every 5 seconds
							var hostFound = false
							for (var i=1; i<=8; i++){
								var data = x.playerData[i];
								if (data !== undefined){
									// server defined
									if (data.account !== lobby.data[i].account){
										lobby.updatePlayer(data);
									}
									// check if host
									if (data.gameHost === 1){
										hostFound = true;
									}
								} else {
									// not defined on server
									if (lobby.data[i].account){
										var o = {
											message: lobby.data[i].account + " has disconnected",
											type: 'chat-warning'
										};
										lobby.chat(o)
										var o = {
											player: i
										}
										lobby.updatePlayer(o);
									}
								}
							}
							// make sure host didn't disconnect
							if (!hostFound){
								lobby.hostLeft();
							}
							setTimeout(repeat, 5000);
						}
					}).fail(function(data){
						serverError(data);
					});
				}
			})();
			delete lobby.join;
		}
	},
	hostLeft: function(){
		setTimeout(function(){
			Msg("The host has left the lobby.");
			setTimeout(function(){
				exitGame(true);
			}, 1000);
		}, 500);
	},
	// add/remove players from lobby
	updatePlayer: function(data){
		var i = data.player;
		if (data.account !== undefined){
			// add
			console.info("ADD PLAYER: ", data);
			document.getElementById("lobbyRow" + i).style.display = 'block';
			// different player account
			document.getElementById("lobbyAccountName" + i).innerHTML = data.account;
			document.getElementById("lobbyName" + i).innerHTML = data.nation;
			var flag = data.flag === 'Default.jpg' ? 
				'Player'+ i +'.jpg' : 
				data.flag;
			document.getElementById("lobbyFlag" + i).src = 'images/flags/'+ flag;
			$('#lobbyFlag' + i)
				.attr('title', data.flag.split(".").shift())
				.tooltip({
					container: 'body'
				});
			if (my.player === i){
				$("#lobbyPlayerColor" + i).attr('title', fwpaid ? 
					'Select Player Color' : 
					'Unlock the complete game to choose player color')
					.tooltip({ container: 'body' });
				$("#lobbyTeam" + i).attr('title', 'Select Team')
					.tooltip({ container: 'body' });
			}
			lobby.updateGovernment(data);
			lobby.data[i] = data;
			lobby.updatePlayerColor(data);
		} else {
			// remove
			console.info("REMOVE PLAYER: ", data);
			document.getElementById("lobbyRow" + i).style.display = 'none';
			lobby.data[i] = { account: '' };
		}
		lobby.styleStartGame();
	},
	// update player's team number
	updateTeamNumber: function(data){
		console.info("UPDATE TEAM NUMBER: ", data);
		var i = data.player;
		document.getElementById('lobbyTeamNumber' + i).textContent = data.team;
	},
	// update player's color only
	updatePlayerColor: function(data){
		console.info("UPDATE PLAYER COLOR ", data);
		var i = data.player;
		var str = my.player === i ? 
			'fa fa-square lobbyPlayer dropdown-toggle pointer2 player' + data.playerColor :
			'fa fa-square lobbyPlayer dropdown-toggle player' + data.playerColor;
		$("#lobbyPlayerColor" + i).removeClass()
			.addClass(str)
			.data('playerColor', data.playerColor);
		lobby.data[i].playerColor = data.playerColor;
		if (data.flag === 'Default.jpg'){
			document.getElementById('lobbyFlag' + i).src = 'images/flags/Player' + data.playerColor + '.jpg';
		}
	},
	// update player's government only
	updateGovernment: function(data){
		// update button & window
		var i = data.player;
		document.getElementById('lobbyGovernment' + i).innerHTML = data.government;
		lobby.data[i].government = data.government;
	},
	styleStartGame: function(){
		if (my.player === 1){
			// set start game button
			var e = document.getElementById("startGame");
			if (lobby.totalPlayers() === 1){
				e.className = lobby.startClassOff;
			} else {
				e.className = lobby.startClassOn;
			}
		}
	},
	countdown: function(data){
		socket.unsubscribe('title:refreshGames');
		// still in the lobby?
		if (!lobby.gameStarted){
			lobby.gameStarted = true;
			new Audio('sound/beepHi.mp3');
			// normal countdown
			var e = document.getElementById('countdown');
			e.style.display = 'block';
			(function repeating(secondsToStart){
				e.textContent = "Starting game in " + secondsToStart--;
				if (secondsToStart >= 0){
					audio.play('beep');
					setTimeout(repeating, 1000, secondsToStart);
				} else {
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
							loadGameState();
						}
					});
					audio.fade();
				}
			})(5);
		}
	},
	governmentIcon: function(government){
		var icon = {
			Despotism: 'fa fa-gavel', //  glyphicon glyphicon-screenshot
			Monarchy: 'glyphicon glyphicon-king',
			Democracy: 'fa fa-institution', // fa-institution fa fa-balance-scale
			Fundamentalism: 'fa fa-book',
			Fascism: 'glyphicon glyphicon-fire',
			Republic: 'glyphicon glyphicon-grain', 
			Communism: 'fa fa-flask'
		};
		return icon[government];
	},
	initRibbons: function(data){
		for (var key in data){
			var str = '',
				arr = [];
			for (var i=0, len=data[key].length; i<len; i++){
				var ribbonNum = data[key][i];
				str += '<div class="ribbon ribbon'+ ribbonNum +'" title="'+ game.ribbonTitle[ribbonNum] +'"></div>';
				arr.push(ribbonNum);
			}
			game.player[key].ribbons = str;
			game.player[key].ribbonArray = arr;
		}
	},
	startGame: function(){
		if (lobby.totalPlayers() >= 2 && my.player === 1){
			startGame.style.display = "none";
			g.lock(1);
			audio.play('click');
			$.ajax({
				type: "GET",
				url: "php/startGame.php"
			}).done(function(data){
				g.unlock();
			}).fail(function(data){
				Msg(data.statusText);
				startGame.style.display = "block";
			}).always(function(){
				g.unlock();
			});
		}
	}
};

function initOffensiveTooltips(){
	$('#fireCannons')
		.attr('title', 'Fire cannons at an adjacent enemy tile. Kills ' + (2 + my.oBonus) + ' + 4% of armies.')
		.tooltip('fixTitle');
	$('#launchMissile')
		.attr('title', 'Launch a missile at any enemy territory. Kills ' + (5 + (my.oBonus * 2)) + ' + 15% of armies.')
		.tooltip('fixTitle');
	$('#recruit')
		.attr('title', 'Recruit ' + (3 + ~~(my.cultureBonus / 30)) + ' armies. Boosted by culture.')
		.tooltip('fixTitle');
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
	DOM.sumFood.textContent = d.sumFood;
	DOM.sumProduction.textContent = d.turnProduction;
	DOM.sumCulture.textContent = d.sumCulture;
	// bonus values
	DOM.oBonus.textContent = d.oBonus;
	DOM.dBonus.textContent = d.dBonus;
	DOM.turnBonus.textContent = d.turnBonus;
	DOM.foodBonus.textContent = d.foodBonus;
	DOM.cultureBonus.textContent = d.cultureBonus;
	setBars(d);
}
function setMoves(d){
	if (d.moves !== undefined){
		my.moves = d.moves;
		DOM.moves.textContent = d.moves;
		if (d.sumMoves){
			DOM.sumMoves.textContent = d.sumMoves;
		}
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
		}
	}
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
	if (d.sumFood !== undefined){
		if (d.sumFood && d.sumFood !== my.sumFood){
			DOM.sumFood.textContent = d.sumFood;
			my.sumFood = d.sumFood;
		}
	}
	if (d.sumProduction !== undefined){
		if (d.sumProduction && d.sumProduction !== my.sumProduction){
			DOM.sumProduction.textContent = d.sumProduction;
			my.sumProduction = d.sumProduction;
		}
	}
	if (d.sumCulture !== undefined){
		if (d.sumCulture && d.sumCulture !== my.sumCulture){
			DOM.sumCulture.textContent = d.sumCulture;
			my.sumCulture = d.sumCulture;
		}
	}
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
	if (d.turnBonus !== undefined){
		if (my.turnBonus !== d.turnBonus){
			DOM.turnBonus.textContent = d.turnBonus;
			my.turnBonus = d.turnBonus;
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
			// recruit bonus changes
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

function Nation(){
	this.account = "";
	this.nation = "";
	this.flag = "";
	this.playerColor = 0;
	this.alive = true;
	return this;
}

function loadGameState(){
	g.lock(1);
	var e1 = document.getElementById("mainWrap");
	if (e1 !== null){
		TweenMax.to(e1, .5, {
			alpha: 0
		});
	}
	// load map
	// console.warn("Loading: " + g.map.key + ".php");
	$.ajax({
		type: 'GET',
		url: 'maps/' + g.map.key + '.php'
	}).done(function(data){
		DOM.worldWrap.innerHTML = data;
		
		var loadGameDelay = location.host === 'localhost' ? 0 : 1000;
		setTimeout(function(){
			
		$.ajax({
			type: "GET",
			url: "php/loadGameState.php"
		}).done(function(data){
			// set map data
			g.map.sizeX = data.mapData.sizeX;
			g.map.sizeY = data.mapData.sizeY;
			g.map.name = data.mapData.name;
			g.map.tiles = data.mapData.tiles;
			
			// console.warn(data.tiles.length, g.map.tiles);
			if (data.tiles.length < g.map.tiles){
				if (g.loadAttempts < 10){
					setTimeout(function(){
						g.loadAttempts++;
						loadGameState();
					}, 1000);
				} else {
					Msg("Failed to load game data");
					setTimeout(function(){
						window.onbeforeunload = null;
						location.reload();
					}, 3000);
				}
				return;
			}
			initDom();
			g.screen.resizeMap();
			
			audio.gameMusicInit();
			// console.info('loadGameState ', data);
			// only when refreshing page while testing
			audio.load.game();
			video.load.game();
			// done
			my.player = data.player;
			my.team = data.team;
			my.account = data.account;
			my.oBonus = data.oBonus;
			my.dBonus = data.dBonus;
			my.cultureBonus = data.cultureBonus;
			my.tech = data.tech;
			my.capital = data.capital;
			my.flag = data.flag;
			my.nation = data.nation;
			my.foodMax = data.foodMax;
			my.production = data.production;
			my.turnProduction = data.turnProduction;
			my.cultureMax = data.cultureMax;
			my.moves = data.moves;
			my.government = data.government;
			my.buildCost = data.buildCost;
			lobby.updateGovernmentWindow(my.government);
			// global government bonuses
			if (my.government === 'Despotism'){
				document.getElementById('splitAttackCost').textContent = 0;
				my.splitAttackCost = 0;
			} else if (my.government === 'Monarchy'){
				my.buildCost = .5;
			} else if (my.government === 'Democracy'){
				my.maxDeployment = 254;
			} else if (my.government === 'Fundamentalism'){
				my.recruitCost = 2;
				document.getElementById('recruitCost').textContent = my.recruitCost;
			} else if (my.government === 'Fascism'){
				document.getElementById('moves').textContent = 12;
				my.deployCost = 10;
				document.getElementById('deployCost').textContent = my.deployCost;
			} else if (my.government === 'Communism'){
				// research
				DOM.gunpowderCost.textContent = 40;
				DOM.engineeringCost.textContent = 60;
				DOM.rocketryCost.textContent = 100;
				DOM.atomicTheoryCost.textContent = 125;
				DOM.futureTechCost.textContent = 500;
				// weapons
				DOM.cannonsCost.textContent = 20;
				DOM.missileCost.textContent = 30;
				DOM.nukeCost.textContent = 200;
				my.weaponCost = .5;
			}
			// initialize player data
			game.initialized = true;
			for (var z=0, len=game.player.length; z<len; z++){
				// initialize diplomacy-ui
				game.player[z] = new Nation();
			}
			
			g.removeContainers();
			g.unlock();
			g.view = "game";
			var e = document.getElementById("gameWrap");
			TweenMax.fromTo(e, 1, {
				autoAlpha: 0
			}, {
				autoAlpha: 1
			});
			// init game player data
			for (var i=0, len=data.players.length; i<len; i++){
				var d = data.players[i];
				game.player[d.player].account = d.account;
				game.player[d.player].flag = d.flag;
				game.player[d.player].nation = d.nation;
				game.player[d.player].player = d.player;
				game.player[d.player].playerColor = d.playerColor;
				game.player[d.player].team = d.team;
				game.player[d.player].government = d.government;
			}
			
			// initialize client tile data
			var mapCapitals = document.getElementById('mapCapitals'),
				mapUpgrades = document.getElementById('mapUpgrades'),
				mapBars = document.getElementById('mapBars');
			for (var i=0, len=data.tiles.length; i<len; i++){
				var d = data.tiles[i];
				game.tiles[i] = {
					name: d.tileName,
					account: d.account,
					player: d.player,
					nation: d.nation,
					flag: d.flag,
					capital: data.capitalTiles.indexOf(i) > -1 && d.flag ? true : false,
					units: d.units,
					food: d.food,
					culture: d.culture,
					defense: d.defense
				}
				// init flag unit values
				var zig = document.getElementById('unit' + i);
				if (zig !== null){
					zig.textContent = d.units === 0 ? 0 : d.units;
					if (d.units){
						zig.style.visibility = 'visible';
					}
				}
				if (d.player){
					TweenMax.set(document.getElementById('land' + i), {
						fill: g.color[game.player[d.player].playerColor]
					});
				}
			}
			// init map flags
			var a = document.getElementsByClassName('unit'),
				mapBars = document.getElementById('mapBars'),
				mapFlagWrap = document.getElementById('mapFlagWrap');
			for (var i=0, len=a.length; i<len; i++){
				// set flag position and value
				var t = game.tiles[i];
				var x = a[i].getAttribute('x') - 24;
				var y = a[i].getAttribute('y') - 24;
				var flag = 'blank.png';
				if (t !== undefined){
					if (!t.flag && t.units){ // FIX TODO??
						flag = "Player0.jpg";
					} else if (t.flag){
						flag = t.flag;
					}
				}
				// dynamically add svg flag image to the map
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
				svg.id = 'flag' + i;
				svg.setAttributeNS(null, 'height', 24);
				svg.setAttributeNS(null, 'width', 24);
				svg.setAttributeNS(null,"x",x);
				svg.setAttributeNS(null,"y",y + 5);
				svg.setAttributeNS(null,"class","mapFlag");
				svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/flags/' + flag);
				mapFlagWrap.appendChild(svg);
				// add star for capital to map
				if (game.tiles[i].capital){
					var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
					svg.id = 'mapCapital' + i;
					svg.setAttributeNS(null, 'height', 30);
					svg.setAttributeNS(null, 'width', 30);
					svg.setAttributeNS(null,"x",x - 15);
					svg.setAttributeNS(null,"y",y + 17);
					svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/capital.png');
					mapCapitals.appendChild(svg);
					TweenMax.set(svg, {
						transformOrigin: '50% 50%',
						rotation: 45,
						repeat: -1,
						ease: Linear.easeNone
					});
				}
			}
			// init map DOM elements
			game.initMap();
				// food, culture, def bars
			for (var i=0; i<len; i++){
				animate.initMapBars(i);
			}
			var str = '<div id="diploHead">\
				<span id="options" class="pointer options">Options</span>&nbsp;|&nbsp;\<span id="surrender" class="pointer">Surrender</span><span id="exitSpectate" class="pointer">Exit Game</span>\
			</div><hr class="fancyhr">';
			// init diplomacyPlayers
			function teamIcon(team){
				return '<span data-toggle="tooltip" data-placement="right" class="diploTeam" title="Team '+ team +'">'+ team +'</span>';
			}
			for (var i=0, len=game.player.length; i<len; i++){
				var p = game.player[i],
					_flagArr = p.flag.split("."),
					_flag = _flagArr[0],
					_flagClass = _flagArr[0].replace(/ /g, "-");
				if (p.flag){
					// console.info(game.player[i]);
					if (p.flag === 'Default.jpg'){
						str += 
						'<div id="diplomacyPlayer' + p.player + '" class="diplomacyPlayers alive">\
							<div class="flag player' + game.player[p.player].playerColor + '" data-toggle="tooltip" data-container="#diplomacy-ui" data-placement="right" title="'+ _flag +'"></div>'+ 
							teamIcon(p.team) +
							'<i class="' + lobby.governmentIcon(p.government)+ ' diploSquare player'+ game.player[p.player].playerColor +'" data-placement="right" data-toggle="tooltip" title="' + p.government + '"></i>\
							<span class="diploNames large" data-toggle="tooltip" data-placement="right" title="'+ p.account +'">' + p.nation + '</span></div>';
					} else {
						str += 
						'<div id="diplomacyPlayer' + p.player + '" class="diplomacyPlayers alive">\
							<div class="flag '+ _flagClass +'" data-toggle="tooltip" data-container="#diplomacy-ui" data-placement="right" title="'+ _flag + '"></div>'+ 
							teamIcon(p.team) +
							'<i class="' + lobby.governmentIcon(p.government)+ ' diploSquare player'+ game.player[p.player].playerColor +'" data-placement="right" data-toggle="tooltip" title="' + p.government + '"></i>\
							<span class="diploNames large" data-toggle="tooltip" data-placement="right" title="'+ p.account +'">' + p.nation + '</span></div>';
					}
				}
			}
			
			document.getElementById('diplomacy-ui').innerHTML = str;
			
			$('[data-toggle="tooltip"]').tooltip({
				delay: {
					show: 0,
					hide: 0
				}
			});
			initResources(data);
			lobby.initRibbons(data.ribbons);
			setTimeout(function(){
				// init draggable map
				worldMap = Draggable.create(DOM.worldWrap, {
					type: 'x,y',
					bounds: "#gameWrap"
				});
				
				initOffensiveTooltips();
				TweenMax.set(DOM.targetLine, {
					stroke: g.color[game.player[my.player].playerColor]
				});
				TweenMax.set(DOM.targetLine, {
					stroke: "hsl(+=0%, +=0%, +=15%)"
				});
				
				function triggerAction(that){
					if (my.attackOn){
						var o = my.targetData;
						if (o.attackName === 'attack'){
							action.attack(that);
						} else if (o.attackName === 'cannons'){
							action.fireCannons(that);
						} else if (o.attackName === 'missile'){
							action.launchMissile(that);
						} else if (o.attackName === 'nuke'){
							action.launchNuke(that);
						}
					} else {
						showTarget(that);
					}
				}
				var zug = $('.land');
				// map events
				if (isMSIE || isMSIE11){
					zug.on("click", function(){
						triggerAction(this);
						TweenMax.set(this, {
							fill: "hsl(+=0%, +=0%, +=15%)"
						});
					});
				} else {
					zug.on("click", function(e){
						console.info(this.id);
						triggerAction(this);
					});
				}
				zug.on("mouseenter", function(){
					my.lastTarget = this;
					if (my.attackOn){
						showTarget(this, true);
					}
					TweenMax.set(this, {
						fill: "hsl(+=0%, +=0%, +=15%)"
					});
				}).on("mouseleave", function(){
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
				if (location.host !== 'localhost'){
					window.onbeforeunload = function(){
						return "To leave the game use the surrender flag instead!";
					}
				}
				game.startGameState();
			}, 250);
			animate.water();
		}).fail(function(data){
			serverError(data);
		}).always(function(){
			g.unlock();
		});
		
		}, loadGameDelay);
	});
};