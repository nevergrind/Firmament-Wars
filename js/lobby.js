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
	startClassOn:  "btn btn-md btn-block btn-responsive shadow4 lobbyButtons",
	startClassOff: "btn btn-md btn-block btn-responsive shadow4 lobbyButtons",
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
	updateGovernmentWindow: function(government){ // key value in
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
			console.warn('lang[my.lang][government]', lang[my.lang][government]);
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
				'<div id="lobby-cpu-row" class="row buffer2">\
					<div class="col-xs-12">\
						<button id="cpu-remove-player" type="button" class="btn fwBlue btn-responsive shadow4 pull-right cpu-button">\
							<img src="images/icons/computer.png" class="fw-icon-sm">'+ lang[my.lang].removeCPU +'\
						</button>\
						<button id="cpu-add-player" type="button" class="btn fwBlue btn-responsive shadow4 pull-right cpu-button">\
							<img src="images/icons/computer.png" class="fw-icon-sm">'+ lang[my.lang].addCPU +'\
						</button>\
					</div>\
				</div>';
			}
			document.getElementById("lobbyPlayers").innerHTML = str;
			lobby.updateGovernmentWindow(my.government);
		}
	},
	initialized: 0,
	getCpuDropdown: function(player){
		var str = 
		'<div id="gov-dropdown-cpu'+ player +'" class="dropdown govDropdown none">\
			<button class="btn btn-primary btn-responsive dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">\
				<img src="images/icons/computer.png" class="fw-icon-sm">\
				<span id="lobby-difficulty-cpu'+ player +'">'+ lang[my.lang].difficulties['Very Easy'] +'</span>\
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
		document.getElementById('lobbyFirmamentWarsLogo').src = 'images/title/firmament-wars-logo-1280.png';
		document.getElementById('worldTitle').src = 'images/FlatWorld90.jpg';
		
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
			var flag = data.flag;
			document.getElementById("lobbyFlag" + i).src = 'images/flags/'+ flag;

			if (my.player === i){
				if (isLoggedIn){
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
			}
			console.info('LOBBY: updatePlayer', data);
			lobby.updateGovernment(data);
			lobby.data[i] = data;
			lobby.updatePlayerColor(data);
			document.getElementById('lobbyGovernment'+ i).innerHTML = data.cpu ?
				('<img src="images/icons/computer.png" class="fw-icon-sm">'+ data.difficulty) : '<img src="images/icons/Despotism.png" class="fw-icon-sm">'+ lang[my.lang].governments.Despotism;
			
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
			document.getElementById('lobby-difficulty-cpu' + i).innerHTML = lang[my.lang].difficulties['Very Easy'];
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
	},
	// update player's government only
	updateGovernment: function(data){
		// update button & window
		var i = data.player;
		console.info('updateGovernment', data.government);
		document.getElementById('lobbyGovernment' + i).innerHTML =
			data.government === 'Random' ?
				lang[my.lang].governments[data.government] :
				'<img src="images/icons/'+ data.government +'.png" class="fw-icon-sm">' + lang[my.lang].governments[data.government];
		lobby.data[i].government = lang[my.lang].governments[data.government];
	},
	updateDifficulty: function(data){
		var i = data.player;
		console.info('updateDifficulty', i, data.difficulty);
		$('#lobby-difficulty-cpu' + i).html(lang[my.lang].difficulties[data.difficulty]);
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
				countdown.textContent = lang[my.lang].startingGame + secondsToStart--;
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
	governmentIcon: function(p){
		// <i class="' + icon + ' diploSquare player'+ game.player[p.player].playerColor +'" data-placement="right"></i>
		var str = '';

		if (p.cpu) {
			str += '<img src="images/icons/computer.png" class="fw-icon-sm">';
		}
		else {
			str += '<img src="images/icons/'+ p.government +'.png" class="fw-icon-sm">';
		}
		return str;
	},
	startGame: function(){
		if (my.player === 1){
			if (lobby.totalPlayers() >= 2){
				startGame.style.display = "none";
				cancelGame.style.display = 'none';
				g.lock();
				audio.play('click');
				$.ajax({
					type: "GET",
					url: app.url +"php/startGame.php"
				}).fail(function(data){
					g.msg(data.statusText);
					startGame.style.display = "block";
					cancelGame.style.display = 'block';
				}).always(function(){
					g.unlock();
				});
			} else {
				g.msg(lang[my.lang].needTwoPlayers);
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

function Nation(){
	this.account = "";
	this.nation = "";
	this.flag = "";
	this.playerColor = 0;
	this.team = 1;
	this.alive = true;
	// this.avatar = '';
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
		DOM.worldWrap.innerHTML =
			'<div id="worldWater"></div>' +
			data;
			
		$.ajax({
			type: "GET",
			url: app.url +"php/loadGameState.php"
		}).done(function(data){
			console.warn("loadGameState", data);
			$("#login-modal").remove();
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
					g.msg(lang[my.lang].failedToLoad);
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
			my.cannonBonus = data.cannonBonus;
			lobby.updateGovernmentWindow(my.government);
			// global government bonuses
			if (my.government === 'Monarchy'){
				my.cannonsBonus = 2;
			} else if (my.government === 'Democracy'){
				my.maxDeployment = 48;
			} else if (my.government === 'Republic'){
				my.sumMoves = data.sumMoves;
				document.getElementById('moves').textContent = my.sumMoves;
				// DOM.sumMoves.textContent = my.sumMoves;
				//console.info('sumMoves ', my.government, my.sumMoves, data.sumMoves);
			} else if (my.government === 'Fascism'){
				document.getElementById('moves').textContent = 8;
				my.deployCost = 1;
				document.getElementById('deployCost').textContent = my.deployCost;
			} else if (my.government === 'Communism'){
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
				// z.avatar = d.avatar;
				z.cpu = d.cpu;
				z.difficulty = d.difficulty;
				z.difficultyShort = d.difficulty.replace(/ /g, '');
			}
			
			// initialize client tile data
			var now = Date.now();
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
					adj: data.adj[i],
					timestamp: now
				}
				// init flag unit values
				var zig = document.getElementById('unit' + i);
				if (zig !== null){
					var unitVal = game.tiles[i].capital ?
						'<tspan class="unit-star">&#10028;</tspan>' + game.tiles[i].units :
						game.tiles[i].units;
					zig.innerHTML = d.units === 0 ? 0 : unitVal;
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
				svg.setAttributeNS(null,"y",y);
				svg.setAttributeNS(null,"class","mapFlag");
				svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/flags/' + flag);
				mapFlagWrap.appendChild(svg);
				// add star for capital to map
				if (game.tiles[i] !== undefined){
					if (game.tiles[i].capital){
						var svg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
						svg.id = 'mapCapital' + i;
						svg.setAttributeNS(null,'class','mapStar');
						svg.setAttributeNS(null,'d','m '+ (x + 20) +','+ y +' 5.79905,17.10796 18.05696,0.50749 -14.47863,10.80187 5.09725,17.33001 -14.74733,-10.43203 -14.90668,10.20304 5.36427,-17.24922 -14.31008,-11.02418 18.06264,-0.22858 z');
					}
				} else {
					console.warn("COULD NOT FIND: ", i);
				}
				var svgTgt = document.getElementById('targetCrosshair');
				TweenMax.to(svgTgt, 10, {
					force3D: true,
					transformOrigin: '50% 50%',
					rotation: 360,
					repeat: -1,
					ease: Linear.easeNone
				});
			}
			// init map DOM elements
			game.initMap();
			// food, culture, def bars
			for (var i=0; i<len; i++){
				animate.initMapBars(i);
			}
			//lobby.initRibbons(data.ribbons);
			ui.drawDiplomacyPanel();
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
				
				function triggerAction(that){
					var id = that.id.slice(4)*1;
					console.info('tile: ', id, game.tiles[id]);
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
				// map events
				$("#gameWrap").on('click', '.land', function(e){
					//location.host === 'localhost' && console.info(this.id, e.offsetX, e.offsetY);
					triggerAction(this);
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
				updateTileInfo(my.lastTgt);
				game.setVisibilityAll();
				// language width adjustment
				document.getElementById('resources-ui').style.width = lang[my.lang].resourceUiWidth;
			}, 350);
			/*TweenMax.set('.land', {
				filter: 'url(#emboss)'
			})*/
		}).fail(function(data){
			setTimeout(function(){
				loadGameState();
			}, 1500);
		}).always(function(){
			g.unlock();
		});
	});
};