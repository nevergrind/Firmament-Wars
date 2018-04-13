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
	addCpuPlayer: function(){
		$.ajax({
			url: app.url +'php/cpu-add-player.php',
			data: {
				flag: g.getRandomFlag()
			}
		});
	},
	updateGovernmentWindow: function(government){
		// updates government description
		var str = '';
		if (government === "Despotism"){
			str = '<div id="lobbyGovName" class="text-primary">Despotism</div>\
				<div id="lobbyGovPerks">\
					<div>Start with 3x production</div>\
					<div>Start with gunpowder</div>\
					<div>Start with a bunker</div>\
					<div>Free movement through own tiles</div>\
				</div>';
		} else if (government === "Monarchy"){
			str = '<div id="lobbyGovName" class="text-primary">Monarchy</div>\
				<div id="lobbyGovPerks">\
					<div>3x capital culture</div>\
					<div>50% starting culture bonus</div>\
					<div>Start with two great tacticians: +2 defense</div>\
					<div>1/2 cost structures</div>\
				</div>';
		} else if (government === "Democracy"){
			str = '<div id="lobbyGovName" class="text-primary">Democracy</div>\
				<div id="lobbyGovPerks">\
					<div>4x maximum troop deployment</div>\
					<div>50% starting production bonus</div>\
					<div>Reduced culture milestone requirement</div>\
					<div>Patriotism: +3 troops when you lose a tile</div>\
				</div>';
		} else if (government === "Fundamentalism"){
			str = '<div id="lobbyGovName" class="text-primary">Fundamentalism</div>\
				<div id="lobbyGovPerks">\
					<div>Overrun ability: Instant win with 4x advantage</div>\
					<div>Infiltration: -3 structure defense</div>\
					<div>Faster growth: Reduced growth milestone requirement</div>\
					<div>+2 troop reward bonus</div>\
				</div>';
		} else if (government === "Fascism"){
			str = '<div id="lobbyGovName" class="text-primary">Fascism</div>\
				<div id="lobbyGovPerks">\
					<div>2x production rewards from barbarians</div>\
					<div>Start with 4 bonus energy</div>\
					<div>Start with great general: +1 attack</div>\
					<div>1/2 cost deploy</div>\
				</div>';
		} else if (government === "Republic"){
			str = '<div id="lobbyGovName" class="text-primary">Republic</div>\
				<div id="lobbyGovPerks">\
					<div>+50% plundered reward bonus from barbarians</div>\
					<div>Start with masonry</div>\
					<div>+1 energy per turn</div>\
					<div>Combat medics: Recover 1/2 of lost troops after victory</div>\
				</div>';
		} else if (government === "Communism"){
			str = '<div id="lobbyGovName" class="text-primary">Communism</div>\
				<div id="lobbyGovPerks">\
					<div>2x discovered reward bonus from barbarians</div>\
					<div>Can deploy troops to uninhabited territory</div>\
					<div>3/4 cost weapons</div>\
					<div>Start with a great person</div>\
				</div>';
		}
		document.getElementById('lobbyGovernment' + my.player).innerHTML = government;
		document.getElementById('lobbyGovernmentDescription').innerHTML = government === 'Random' ?
			'<div id="lobbyGovName" class="text-primary">Random</div>\
				<div id="lobbyGovPerks">\
					<div>???</div>\
					<div>???</div>\
					<div>???</div>\
					<div>???</div>\
				</div>' : str;
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
				} else if (msg.indexOf('/friend ') === 0){
					title.toggleFriend(msg.slice(8));
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
	difficulties: [
		'Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard', 'Mania', 'Juggernaut'
	],
	governments: [
		'Despotism', 'Monarchy', 'Democracy', 'Fundamentalism', 'Fascism', 'Republic', 'Communism', 'Random'
	],
	init: function(x){
		// build the lobby DOM
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
			g.speed = x.speed;
			document.getElementById("lobbyGameSpeed").innerHTML = x.speed;
			document.getElementById("lobbyGameMap").innerHTML = x.map;
			document.getElementById("lobbyGameMax").innerHTML = x.max;
			document.getElementById("startGame").style.display = x.player === 1 ? "block" : "none";
			if (!x.startGame){
				document.getElementById('mainWrap').style.display = "block";
			}
			var str = '<div id="lobbyWrap" class="container">';
			for (var i=1; i<=8; i++){
				str += 
				'<div id="lobbyRow' +i+ '" class="lobbyRow">\
					<div class="lobby-row-col-1">\
						<img id="lobbyFlag' +i+ '" class="lobbyFlags block center" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">\
					</div>\
					<div class="lobby-row-col-2 lobbyDetails">\
						<div class="lobbyAccounts">';
						
							if (g.teamMode){
								// yes, the span is necessary to group the dropdown
								str += '<span><div id="lobbyTeam'+ i +'" data-placement="right" class="lobbyTeams dropdown-toggle pointer2" data-toggle="dropdown">';
								
								str += '<i class="fa fa-flag pointer2 lobbyTeamFlag"></i> <span id="lobbyTeamNumber'+ i +'" class="lobbyTeamNumbers">' + i +'</span></div>';
								str += 
								'<ul id="teamDropdown" class="dropdown-menu">\
									<li class="header text-center selectTeamHeader">Team</li>';
									for (var j=1; j<=8; j++){
										str += '<li class="teamChoice" data-player="'+ i +'">Team '+ j +'</li>';
									}
								str += '</ul></span>';
							}
							
							str += '<span><i id="lobbyPlayerColor'+ i +'" class="fa fa-square player'+ i +' lobbyPlayer dropdown-toggle';
							
							if (i === my.player){
								str += ' pointer2';
							}
							
							str += '" data-placement="right" data-toggle="dropdown"></i>';
							
							if (i === my.player){
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
					<div class="lobby-row-col-3">';
					if (i === x.player){
						// my.player === i || data.cpu && my.player === 1
						// me - gov dropdown
						str += 
						'<div id="gov-dropdown-player'+ i +'" class="dropdown govDropdown">\
							<button class="btn btn-primary btn-responsive dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">\
								<span id="lobbyGovernment' +i+ '">Despotism</span>\
								<i id="lobbyCaret' +i+ '" class="fa fa-caret-down text-warning lobbyCaret"></i>\
							</button>\
							<ul class="governmentDropdown dropdown-menu">';
								for (var z=0, len=lobby.governments.length; z<len; z++){
									str += 
									'<li class="governmentChoice">'+
										'<a>'+ lobby.governments[z] +'</a>'+
									'</li>';
								}
							str += '</ul>\
						</div>' + 
						lobby.getCpuDropdown(i);
					} else {
						// not me - gov dropdown
						str += 
						'<div id="gov-dropdown-player'+ i +'" class="dropdown govDropdown">\
							<button style="cursor: default" class="btn btn-primary btn-responsive dropdown-toggle shadow4 fwDropdownButton fwDropdownButtonEnemy" type="button">\
								<span id="lobbyGovernment' +i+ '" class="pull-left">Despotism</span>\
								<i id="lobbyCaret' +i+ '" class="fa fa-caret-down text-disabled lobbyCaret"></i>\
							</button>\
						</div>' + 
						lobby.getCpuDropdown(i);
					}
					str += '</div>\
					</div>';
			}
			if (my.player === 1 && !g.rankedMode){
				str += 
				'<div id="lobby-cpu-row" class="row buffer2">\
					<div class="col-xs-12">\
						<button id="cpu-remove-player" type="button" class="btn fwBlue btn-responsive shadow4 pull-right cpu-button">\
							<i class="fa fa-minus-circle"></i> Remove CPU\
						</button>\
						<button id="cpu-add-player" type="button" class="btn fwBlue btn-responsive shadow4 pull-right cpu-button">\
							<i class="fa fa-plus-circle"></i> Add CPU\
						</button>\
					</div>\
				</div>';
			}
			str += '</div>';
			document.getElementById("lobbyPlayers").innerHTML = str;
			lobby.updateGovernmentWindow(my.government);
		}
		delete lobby.init;
	},
	getCpuDropdown: function(player){
		var str = 
		'<div id="gov-dropdown-cpu'+ player +'" class="dropdown govDropdown none">\
			<button class="btn btn-primary btn-responsive dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">\
				<span id="lobby-difficulty-cpu'+ player +'">Computer: Very Easy</span>\
				<i id="lobby-caret-cpu'+ player +'" class="fa fa-caret-down text-warning lobbyCaret"></i>\
			</button>\
			<ul class="governmentDropdown dropdown-menu">';
				for (var i=0, len=lobby.difficulties.length; i<len; i++){
					str += 
					'<li class="cpu-choice" data-player="'+ player +'">'+
						'<a>'+ lobby.difficulties[i] +'</a>'+
					'</li>';
				}
			str += '</ul>\
		</div>';
		return str;
	},
	join: function(d){
		// transition to game lobby
		if (d === undefined){
			d = .5;
		}
		g.lock(1);
		g.view = "lobby";
		title.closeModal();
		TweenMax.to('#titleChat', d, {
			x: '100%',
			ease: Quad.easeIn
		});
		if (isMobile){
			document.getElementById('lobbyFirmamentWarsLogo').style.display = 'none';
			document.getElementById('worldTitle').style.display = 'none';
		} else {
			document.getElementById('lobbyFirmamentWarsLogo').src = 'images/title/firmament-wars-logo-1280.png';
			document.getElementById('worldTitle').src = 'images/FlatWorld50-2.jpg';
		}
		
		TweenMax.to('#titleMenu', d, {
			x: '-100%',
			ease: Quad.easeIn,
			onComplete: function(){
				TweenMax.to(['#titleMain', '#logoWrap', '#firmamentWarsLogoWrap'], ui.delay(.5), {
					alpha: 0,
					onComplete: function(){
						$("#titleMain").remove();
						g.unlock(1);
						TweenMax.fromTo('#joinGameLobby', ui.delay(d), {
							autoAlpha: 0
						}, {
							autoAlpha: 1
						});
					}
				});
			}
		});
		if (!d){
			// load game
			//console.info(localStorage.getItem('reload'));
			if (localStorage.getItem('reload') !== false){
				loadGameState(); // page refresh
			}
		} else {
			// load lobby
			(function repeat(){
				if (g.view === "lobby"){
					var pingCpu = 0;
					if (my.player === 1){
						lobby.data.forEach(function(d){
							if (d.cpu){
								pingCpu = 1;
							}
						});
					}
					//console.info('pingCpu ', pingCpu);
					$.ajax({
						url: app.url +"php/updateLobby.php",
						data: {
							pingCpu: pingCpu
						}
					}).done(function(x){
						if (g.view === "lobby"){
							localStorage.setItem('reload', true);
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
			//console.info("ADD PLAYER: ", data);
			document.getElementById("lobbyRow" + i).style.display = 'flex';
			// different player account
			document.getElementById("lobbyAccountName" + i).innerHTML = data.cpu ? 'Computer' : data.account;
			document.getElementById("lobbyName" + i).innerHTML = data.nation;
			var flag = data.flag === 'Default.jpg' ? 
				'Player'+ i +'.jpg' : 
				data.flag;
			document.getElementById("lobbyFlag" + i).src = 'images/flags/'+ flag;
			
			if (!isMobile && isLoggedIn){
				$('#lobbyFlag' + i)
					.attr('title', data.flag.split(".").shift())
					.tooltip({
						animation: false,
						placement: 'right',
						container: 'body'
					});
			}
			
			if (my.player === i){
				if (!isMobile && isLoggedIn){
					$("#lobbyPlayerColor" + i).attr('title', 'Select Player Color')
						.tooltip({
							container: 'body',
							animation: false
						});
					$("#lobbyTeam" + i).attr('title', 'Select Team')
						.tooltip({
							container: 'body',
							animation: false
						});
				}
			}
			
			lobby.updateGovernment(data);
			lobby.data[i] = data;
			lobby.updatePlayerColor(data);
			document.getElementById('lobbyGovernment'+ i).innerHTML = 
				data.cpu ? ('Computer: '+ data.difficulty) : 'Despotism';
			
			$("#lobbyCaret"+ i)
				.removeClass("text-warning text-disabled")
				.addClass(my.player === i || data.cpu && my.player === 1 ? 'text-warning' : 'text-disabled');
			
			document.getElementById('gov-dropdown-player'+ data.player).style.display = 
				data.cpu ? 'none' : 'block';
			document.getElementById('gov-dropdown-cpu'+ data.player).style.display = 
				data.cpu ? 'block' : 'none';
		} else {
			// remove
			//console.info("REMOVE PLAYER: ", data);
			document.getElementById("lobbyRow" + i).style.display = 'none';
			document.getElementById('lobby-difficulty-cpu' + i).innerHTML = 'Computer: Very Easy';
			lobby.data[i] = { account: '', cpu: 0 };
		}
		lobby.styleStartGame();
	},
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
	updateDifficulty: function(data){
		var i = data.player;
		document.getElementById('lobby-difficulty-cpu' + i).innerHTML = 'Computer: '+ data.difficulty;
		lobby.data[i].difficulty = data.difficulty;
	},
	styleStartGame: function(){
		if (my.player === 1){
			// set start game button
			if (lobby.totalPlayers() === 1){
				startGame.className = lobby.startClassOff;
			} else {
				startGame.className = lobby.startClassOn;
			}
		}
	},
	countdown: function(data){
		socket.unsubscribe('title:refreshGames');
		// still in the lobby?
		if (!lobby.gameStarted){
			$("#lobby-cpu-row").remove();
			lobby.gameStarted = true;
			new Audio('sound/beepHi.mp3');
			// normal countdown
			countdown.style.display = 'block';
			(function repeating(secondsToStart){
				countdown.textContent = "Starting game in " + secondsToStart--;
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
							var delay = my.player === 1 ? 0 : 750;
							setTimeout(function(){
								loadGameState(); // countdown down 
							}, delay);
							sessionStorage.setItem('gameDuration', Date.now());
						}
					});
					audio.fade();
				}
			})(5);
			cancelGame.style.display = 'none';
			$("#teamDropdown").css('display', 'none');
		}
	},
	governmentIcon: function(government){
		var icon = {
			Despotism: 'glyphicon glyphicon-bullhorn',
			Monarchy: 'glyphicon glyphicon-king',
			Democracy: 'fa fa-balance-scale',
			Fundamentalism: 'fa fa-book',
			Fascism: 'glyphicon glyphicon-fire',
			Republic: 'glyphicon glyphicon-grain', 
			Communism: 'fa fa-globe'
		};
		return icon[government];
	},
	startGame: function(){
		if (my.player === 1){
			if (lobby.totalPlayers() >= 2){
				startGame.style.display = "none";
				cancelGame.style.display = 'none';
				g.lock(1);
				audio.play('click');
				$.ajax({
					type: "GET",
					url: app.url +"php/startGame.php"
				}).fail(function(data){
					Msg(data.statusText);
					startGame.style.display = "block";
					cancelGame.style.display = 'block';
				}).always(function(){
					g.unlock();
				});
			} else {
				Msg("You need two players to start a game! Wait for players to join or add a computer player to begin.");
			}
		}
	}
};

function initOffensiveTooltips(){
	if (!isMobile && isLoggedIn){
		$('#fireCannons')
			.attr('title', 'Fire cannons at an adjacent tile. Kills ' + (2 + my.oBonus) +'-'+ (4 + my.oBonus) +' troops.')
			.tooltip('fixTitle')
			.tooltip({ animation: false });
		$('#launchMissile')
			.attr('title', 'Launch a missile at any territory. Kills '+ (7 + (my.oBonus * 2)) +'-'+ (12 + (my.oBonus * 2)) +' troops.').tooltip('fixTitle')
			.tooltip({ animation: false });
		$('#rush')
			.attr('title', 'Deploy ' + (2 + ~~(my.cultureBonus / 50)) + ' troops using energy instead of production. Boosted by culture.')
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
	DOM.sumFood.textContent = d.sumFood;
	DOM.sumProduction.textContent = d.sumProduction;
	DOM.sumCulture.textContent = d.sumCulture;
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
			DOM.sumMoves.textContent = d.sumMoves;
		}
		DOM.endTurn.style.visibility = my.moves ? 'visible' : 'hidden';
	}
}
function setProduction(d){
	if (d.production !== undefined){
		TweenMax.to(my, ui.delay(.3), {
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
	TweenMax.to(my, ui.delay(.3), {
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
			TweenMax.to(my, ui.delay(.5), {
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
	TweenMax.to(DOM.foodBar, ui.delay(.3), {
		width: ((d.food / d.foodMax) * 100) + '%'
	});
	TweenMax.to(DOM.cultureBar, ui.delay(.3), {
		width: ((d.culture / d.cultureMax) * 100) + '%'
	});
}

function Nation(){
	this.account = "";
	this.nation = "";
	this.flag = "";
	this.playerColor = 0;
	this.team = 1;
	this.alive = true;
	this.avatar = '';
	this.government = '';
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
		url: app.url +'maps/' + g.map.key + '.php'
	}).done(function(data){
		DOM.worldWrap.innerHTML = data;
			
		$.ajax({
			type: "GET",
			url: app.url +"php/loadGameState.php"
		}).done(function(data){
			setTimeout(function() {
				$("#title-bg-wrap").remove();
			}, 2000);

			g.resourceTick = data.resourceTick;
			g.startGame = data.startGame * 1;
			g.teamMode = data.teamMode;
			g.gameMode = data.gameMode;
			// set map data
			g.map.sizeX = data.mapData.sizeX;
			g.map.sizeY = data.mapData.sizeY;
			g.map.name = data.mapData.name;
			g.map.tiles = data.mapData.tiles;
			//console.warn(data.tiles.length, g.map.tiles);
			if (data.tiles.length < g.map.tiles){
				if (g.loadAttempts < 20){
					setTimeout(function(){
						g.loadAttempts++;
						loadGameState(); // try again
					}, 500);
				} else {
					Msg("Failed to load game data");
					localStorage.setItem('reload', false);
					setTimeout(function(){
						window.onbeforeunload = null;
						location.reload();
					}, 3000);
				}
				return;
			}
			initDom();
			$("meta").remove();
			g.screen.resizeMap();
			
			audio.gameMusicInit();
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
			my.sumProduction = data.sumProduction;
			my.cultureMax = data.cultureMax;
			my.moves = data.moves;
			my.government = data.government;
			my.buildCost = data.buildCost;
			lobby.updateGovernmentWindow(my.government);
			// global government bonuses
			if (my.government === 'Monarchy'){
				my.buildCost = .5;
			} else if (my.government === 'Democracy'){
				my.maxDeployment = 48;
			} else if (my.government === 'Republic'){
				my.sumMoves = data.sumMoves;
				document.getElementById('moves').textContent = my.sumMoves;
				document.getElementById('sumMoves').textContent = my.sumMoves;
				console.info('sumMoves ', my.government, my.sumMoves, data.sumMoves);
			} else if (my.government === 'Fascism'){
				document.getElementById('moves').textContent = 8;
				my.deployCost = 5;
				document.getElementById('deployCost').textContent = my.deployCost;
			} else if (my.government === 'Communism'){
				// weapons
				DOM.cannonsCost.textContent = 18;
				DOM.missileCost.textContent = 38;
				DOM.nukeCost.textContent = 113;
				my.weaponCost = .75;
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
			TweenMax.fromTo(gameWrap, 1, {
				autoAlpha: 0
			}, {
				autoAlpha: 1
			});
			// init game player data
			for (var i=0, len=data.players.length; i<len; i++){
				var d = data.players[i],
					z = game.player[d.player];
				z.account = d.account;
				z.flag = d.flag;
				z.nation = d.nation;
				z.player = d.player;
				z.playerColor = d.playerColor;
				z.team = d.team;
				z.government = d.government;
				z.avatar = d.avatar;
				z.cpu = d.cpu;
				z.difficulty = d.difficulty;
				z.difficultyShort = d.difficulty.replace(/ /g, '');
			}
			
			// initialize client tile data
			var mapCapitals = document.getElementById('mapCapitals'),
				mapUpgrades = document.getElementById('mapUpgrades');
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
					production: d.production,
					culture: d.culture,
					defense: d.defense,
					adj: data.adj[i]
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
					// init map appearance
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
			// init map flags
			var a = document.getElementsByClassName('unit'),
				mapBars = document.getElementById('mapBars'),
				mapFlagWrap = document.getElementById('mapFlagWrap');
			for (var i=0, len=a.length; i<len; i++){
				// set flag position and value
				var t = game.tiles[i];
				var x = a[i].getAttribute('x') - 20;
				var y = a[i].getAttribute('y') - 30;
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
				svg.setAttributeNS(null, 'height', 40);
				svg.setAttributeNS(null, 'width', 40);
				svg.setAttributeNS(null,"x",x);
				svg.setAttributeNS(null,"y",y + 5);
				svg.setAttributeNS(null,"class","mapFlag");
				svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/flags/' + flag);
				mapFlagWrap.appendChild(svg);
				// add star for capital to map
				if (game.tiles[i] !== undefined){
					if (game.tiles[i].capital){
						var svg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
						svg.id = 'mapCapital' + i;
						svg.setAttributeNS(null,'class','mapStar');
						svg.setAttributeNS(null,'d','m '+ x +','+ y +' 5.79905,17.10796 18.05696,0.50749 -14.47863,10.80187 5.09725,17.33001 -14.74733,-10.43203 -14.90668,10.20304 5.36427,-17.24922 -14.31008,-11.02418 18.06264,-0.22858 z');
						mapCapitals.appendChild(svg);
						if (!isMobile){
							TweenMax.to(svg, 60, {
								transformOrigin: '50% 50%',
								rotation: 360,
								repeat: -1,
								ease: Linear.easeNone
							});
						}
					}
				} else {
					console.warn("COULD NOT FIND: ", i);
				}
				if (!isMobile){
					var svgTgt = document.getElementById('targetCrosshair');
					TweenMax.to(svgTgt, 10, {
						transformOrigin: '50% 50%',
						rotation: 360,
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
			//lobby.initRibbons(data.ribbons);
			var str = '';
			// init diplomacyPlayers
			function diploRow(p){
				var account = p.cpu ? ("Computer: "+ p.difficulty) : p.account,
					icon = p.cpu ? 'fa fa-microchip' : lobby.governmentIcon(p.government),
					gov = p.cpu ? 'Computer' : p.government;
				function teamIcon(team){
					return g.teamMode ? 
						'<span class="diploTeam" data-placement="right" title="Team '+ team +'">'+ team +'</span>' :
						'';
				}
				var str = 
				'<div id="diplomacyPlayer' + p.player + '" class="diplomacyPlayers alive">'+
					// bg 
					'<img src="images/flags/'+ p.flagSrc +'" class="diplo-flag" data-placement="right" title="'+ p.flagShort + '">'+
					// row 1
					'<div class="nowrap">'+
						'<i class="' + icon + ' diploSquare player'+ game.player[p.player].playerColor +'" data-placement="right" title="' + gov + '"></i> '+ account + 
					'</div>'+
					// row 2
					'<div class="nowrap">'+ teamIcon(p.team) + p.nation + '</div>'+
					
				'</div>';
				return str;
			}
			var teamArr = [str];
			for (var i=0, len=game.player.length; i<len; i++){
				var p = game.player[i];
				if (p.account){
					p.flagArr = p.flag.split("."),
					p.flagShort = p.flagArr[0],
					p.flagSrc = p.flag === 'Default.jpg' ? 
						'Player'+ game.player[p.player].playerColor +'.jpg' : 
						p.flag;
					if (g.teamMode){
						var foo = diploRow(p);
						// 100 just in case the players/game are increased later
						teamArr[p.team*100 + i] = foo;
					} else {
						str += diploRow(p);
					}
				}
			}
			var diploHead = 
			'<div class="header text-center diplo-head '+ g.gameMode.toLowerCase() +'">'+ g.gameMode +'</div>';
			
			if (g.teamMode){
				document.getElementById('diplomacy-ui').innerHTML = diploHead + teamArr.join("");
			} else {
				document.getElementById('diplomacy-ui').innerHTML = diploHead + str;
			}
			initResources(data);
			// set images
			setTimeout(function(){
				// init draggable map
				worldMap = Draggable.create(DOM.worldWrap, {
					minimumMovement: 4,
					type: 'x,y',
					bounds: "#gameWrap"
				});
				
				initOffensiveTooltips();
				if (!isMobile){
					TweenMax.set(DOM.targetLine, {
						stroke: g.color[game.player[my.player].playerColor]
					});
				}
				TweenMax.set(DOM.targetLine, {
					stroke: "hsl(+=0%, +=0%, +=15%)"
				});
				
				function triggerAction(that){
					if (my.attackOn){
						var o = my.targetData;
						if (o.attackName === 'attack' || o.attackName === 'splitAttack'){
							action.attack(that);
						} else if (o.attackName === 'cannons'){
							action.fireCannons(that);
						} else if (o.attackName === 'missile'){
							action.launchMissile(that);
						} else if (o.attackName === 'nuke'){
							action.launchNuke(that);
						}
					} else {
						ui.showTarget(that);
					}
				}
				var zug = $("#gameWrap");
				// map events
				if (isMSIE || isMSIE11){
					zug.on('mousedown', ".land", function(){
						triggerAction(this);
						TweenMax.set(this, {
							fill: "hsl(+=0%, +=0%, -=5%)"
						});
					});
				} else {
					zug.on('click', ".land", function(e){
						location.host === 'localhost' && console.info(this.id, e.offsetX, e.offsetY);
						triggerAction(this);
					});
				}
				zug.on("mouseenter", ".land", function(){
					my.lastTarget = this;
					if (my.attackOn){
						ui.showTarget(this, true);
					}
					TweenMax.set(this, {
						fill: "hsl(+=0%, +=0%, -=5%)"
					});
				}).on("mouseleave", ".land", function(){
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
				ui.setCurrentYear(data.resourceTick);
			}, 350);
		}).fail(function(data){
			setTimeout(function(){
				loadGameState();
			}, 1500);
		}).always(function(){
			g.unlock();
		});
	});
};