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
	startClassOn: "btn btn-info btn-md btn-block btn-responsive shadow4",
	startClassOff: "btn btn-default btn-md btn-block btn-responsive shadow4",
	updateGovernmentWindow: function(government){
		var str = '';
		if (government === "Despotism"){
			str = '<div id="lobbyGovName" class="text-primary">Despotism</div>\
				<div id="lobbyGovPerks">\
					<div>3x starting energy</div>\
					<div>+50% starting armies</div>\
					<div>Start With a Bunker</div>\
					<div>Free Split Attack</div>\
				</div>';
		} else if (government === "Monarchy"){
			str = '<div id="lobbyGovName" class="text-primary">Monarchy</div>\
				<div id="lobbyGovPerks">\
					<div>3x starting culture</div>\
					<div>+50% culture bonus</div>\
					<div>Start with Great Tactician</div>\
					<div>1/2 cost structures</div>\
				</div>';
		} else if (government === "Democracy"){
			str = '<div id="lobbyGovName" class="text-primary">Democracy</div>\
				<div id="lobbyGovPerks">\
					<div>Unlimited Army Deployment</div>\
					<div>+50% energy bonus</div>\
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
					<div>Attack cost reduced 20%</div>\
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
	chat: function (msg){
		while (DOM.lobbyChatLog.childNodes.length > 200) {
			DOM.lobbyChatLog.removeChild(DOM.lobbyChatLog.firstChild);
		}
		var z = document.createElement('div');
		z.innerHTML = msg;
		DOM.lobbyChatLog.appendChild(z);
		if (!lobby.chatDrag){
			DOM.lobbyChatLog.scrollTop = DOM.lobbyChatLog.scrollHeight;
		}
	},
	chatDrag: false,
	gameStarted: false,
	chatOn: false,
	sendMsg: function(bypass){
		var message = $DOM.lobbyChatInput.val();
		if (bypass || lobby.chatOn){
			// bypass via ENTER or chat has focus
			if (message){
				// send ajax chat msg
				$.ajax({
					url: 'php/insertLobbyChat.php',
					data: {
						message: message
					}
				});
			}
			$DOM.lobbyChatInput.val('');
		}
	},
	init: function(x){
		// build the lobby DOM
		$("#lobby-chat-input").on('focus', function(){
			lobby.chatOn = true;
		}).on('blur', function(){
			lobby.chatOn = false;
		});
		$("#lobbyChatSend").on('click', function(){
			lobby.sendMsg(true);
		});
		// prevents auto scroll while scrolling
		$("#lobbyChatLog").on('mousedown', function(){
			lobby.chatDrag = true;
		}).on('mouseup', function(){
			lobby.chatDrag = false;
		});
		console.info("Initializing lobby...");
		var e1 = document.getElementById("lobbyGameName");
		if (e1 !== null){
			e1.innerHTML = x.name;
			document.getElementById("lobbyGameMax").innerHTML = x.max;
			document.getElementById("lobbyGameMap").innerHTML = x.map;
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
						<img id="lobbyFlag' +i+ '" data-placement="right" class="lobbyFlags w100 block center p' + i + 'b player' +i+ '" src="images/flags/blank.png">\
					</div>\
					<div class="col-xs-6 lobbyDetails">\
						<span id="lobbyAccount' +i+ '"></span>\
					</div>\
					<div class="col-xs-4">';
					if (i === x.player){
						// me
						str += 
						'<div class="dropdown">\
							<button class="btn btn-primary dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">\
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
						'<div class="dropdown">\
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
		console.info("Joining lobby...");
		var loadTime = Date.now() - g.startTime; 
		if (loadTime < 1000){
			d = 0;
		}
		if (d === undefined){
			d = .5;
		}
		g.view = "lobby";
		TweenMax.to("#titleMain", d, {
			autoAlpha: 0,
			onComplete: function(){
				g.unlock(1);
				TweenMax.fromTo('#joinGameLobby', d, {
					autoAlpha: 0
				}, {
					autoAlpha: 1
				});
			}
		});
		
		(function repeat(){
			if (g.view === "lobby"){
				$.ajax({
					type: "GET",
					url: "php/updateLobby.php"
				}).done(function(x){
					if (g.view === "lobby"){
						my.totalPlayers = x.totalPlayers;
						console.info(x);
						for (var i=1; i<=8; i++){
							var data = x.playerData[i-1];
							//console.info(i, lobby.data[i], data);
							// player exists
							if (data !== undefined){
								document.getElementById("lobbyRow" + i).style.display = 'block';
								// different player account
								if (lobby.data[i].account !== data.account){
									document.getElementById("lobbyAccount" + i).innerHTML = data.account;
									if (data.flag !== 'Default.jpg'){
										document.getElementById("lobbyFlag" + i).src = 'images/flags/' + data.flag;
										var flagName = data.flag.split(".");
										$('#lobbyFlag' + i)
											.attr('title', flagName[0])
											.tooltip({
												container: 'body'
											});
									}
								}
								if (lobby.data[i].government !== data.government){
									// update button & window
									document.getElementById('lobbyGovernment' + i).innerHTML = data.government;
								}
								lobby.data[i] = data;
							} else {
								// player left
								document.getElementById("lobbyRow" + i).style.display = 'none';
								lobby.data[i] = { account: '' };
							}
						}
						// check if start button should light up
						//console.info(x);
						if (x.player === 1){
							var e = document.getElementById("startGame");
							if (x.totalPlayers === 1){
								e.className = lobby.startClassOff;
							} else {
								e.className = lobby.startClassOn;
							}
						}
						
						// report chat messages
						var len = x.chat.length;
						if (len > 0){
							for (var i=0; i<len; i++){
								if (x.chat[i]){
									lobby.chat(x.chat[i]);
								}
							}
						}
					}
					// still in the lobby?
					if (x.startGame){
						if (!lobby.gameStarted){
							lobby.gameStarted = true;
							lobbyCountdown(x);
						}
					}
					if (!x.hostFound){
						Msg("The host has left the lobby.");
						setTimeout(function(){
							exitGame(true);
						}, 500);
					}
					setTimeout(repeat, 1000);
				}).fail(function(data){
					serverError(data);
				});
			}
		})();
		delete lobby.join;
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
function setProduction(d){
	TweenMax.to(my, .3, {
		production: d.production,
		ease: Quad.easeIn,
		onUpdate: function(){
			DOM.production.textContent = ~~my.production;
		}
	});
}
function setResources(d){
	setProduction(d);
	TweenMax.to(my, .3, {
		food: d.food,
		culture: d.culture,
		ease: Quad.easeIn,
		onUpdate: function(){
			DOM.food.textContent = ~~my.food;
			DOM.culture.textContent = ~~my.culture;
		}
	});
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
	if (d.foodMax !== undefined){
		if (d.foodMax > my.foodMax){
			DOM.foodMax.textContent = d.foodMax;
			my.foodMax = d.foodMax;
		}
			
		if (d.cultureMax > my.cultureMax){
			DOM.cultureMax.textContent = d.cultureMax;
			my.cultureMax = d.cultureMax;
		}
	}
	if (d.sumFood !== undefined){
		if (d.sumFood !== my.sumFood){
			DOM.sumFood.textContent = d.sumFood;
			my.sumFood = d.sumFood;
		}
		if (d.sumProduction !== my.sumProduction){
			DOM.sumProduction.textContent = d.sumProduction;
			my.sumProduction = d.sumProduction;
		}
		if (d.sumCulture !== my.sumCulture){
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
		if (my.dBonus !== d.dBonus){
			DOM.dBonus.textContent = d.dBonus;
			my.dBonus = d.dBonus;
		}
		if (my.turnBonus !== d.turnBonus){
			DOM.turnBonus.textContent = d.turnBonus;
			my.turnBonus = d.turnBonus;
		}
		if (my.foodBonus !== d.foodBonus){
			DOM.foodBonus.textContent = d.foodBonus;
			my.foodBonus = d.foodBonus;
		}
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
	return this;
}

function loadGameState(x){
	g.lock(1);
	var e1 = document.getElementById("mainWrap");
	if (e1 !== null){
		TweenMax.to(e1, .5, {
			alpha: 0
		});
	}
	console.info(x);
	if (x !== undefined){
		g.map.key = x.map.replace(/ /g, '');
	}
	// load map
	console.warn("Loading: " + g.map.key + ".php");
	$.ajax({
		type: 'GET',
		url: 'maps/' + g.map.key + '.php'
	}).done(function(data){
		document.getElementById('worldWrap').innerHTML = data;
		
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
			
			console.warn(data.tiles.length, g.map.tiles);
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
			// set worldWrap CSS
			var css = '';
			if (g.map.name === "Flat Earth"){
				css = 
				'<style>#worldWrap{ '+
					'position: absolute; '+
					'top: 0%; '+
					'left: 0%; '+
					'width: ' + ((g.map.sizeX / g.screen.width) * 100) + '%; '+
					'height: ' + ((g.map.sizeY / g.screen.height) * 100) + '%; '+
				'}</style>';
			}
			if (css){
				$DOM.head.append(css);
			}
			
			audio.ambientInit();
			console.info('loadGameState ', data);
			// only when refreshing page while testing
			audio.load.game();
			video.load.game();
			// done
			my.player = data.player;
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
				document.getElementById('recruitCost').textContent = 15;
				my.recruitCost = 15;
			} else if (my.government === 'Fascism'){
				document.getElementById('attackCost').textContent = 8;
				my.attackCost = 8;
				document.getElementById('deployCost').textContent = 5;
				my.deployCost = 5;
			} else if (my.government === 'Communism'){
				// research
				DOM.gunpowderCost.textContent = 60;
				DOM.engineeringCost.textContent = 75;
				DOM.rocketryCost.textContent = 125;
				DOM.atomicTheoryCost.textContent = 250;
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
						fill: color[d.player]
					});
				}
			}
			// init game player data
			for (var i=0, len=data.players.length; i<len; i++){
				var d = data.players[i];
				game.player[d.player].account = d.account;
				game.player[d.player].flag = d.flag;
				game.player[d.player].nation = d.nation;
				game.player[d.player].player = d.player;
				game.player[d.player].government = d.government;
			}
			// init mapFlagWrap
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
					svg.setAttributeNS(null, 'height', 30);
					svg.setAttributeNS(null, 'width', 30);
					svg.setAttributeNS(null,"x",x - 15);
					svg.setAttributeNS(null,"y",y + 17);
					svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/capital.png');
					mapCapitals.appendChild(svg);
					TweenMax.to(svg, 60, {
						transformOrigin: '50% 50%',
						rotation: 360,
						repeat: -1,
						ease: Linear.easeNone
					});
				}
				// food, culture, def bars
				animate.initMapBars(i);
			}
			var str = '';
			// init diplomacyPlayers
			for (var i=0, len=game.player.length; i<len; i++){
				var p = game.player[i];
				if (p.flag){
					// console.info(game.player[i]);
					if (p.flag === 'Default.jpg'){
						str += 
						'<div id="diplomacyPlayer' + p.player + '" class="diplomacyPlayers alive">';
								if (my.player === p.player){
									str += '<i id="surrender" class="fa fa-flag pointer" data-placement="right" data-toggle="tooltip" title="Surrender"></i>';
								} else {
									str += '<i class="fa fa-flag surrender"></i>';
								}
								str += '<i class="' + lobby.governmentIcon(p.government)+ ' diploSquare" data-placement="right" data-toggle="tooltip" title="' + p.government + '"></i>' +
								'<img src="images/flags/Player' + p.player + '.jpg" class="player' + p.player + ' inlineFlag diploFlag p' + p.player + 'b" data-toggle="tooltip" title="'+ p.account + '"><span class="diploNames">' + p.nation + '</span>';
					} else {
						str += 
						'<div id="diplomacyPlayer' + p.player + '" class="diplomacyPlayers alive">';
								if (my.player === p.player){
									str += '<i id="surrender" class="fa fa-flag pointer"  data-placement="right" data-toggle="tooltip" title="Surrender"></i>';
								} else {
									str += '<i class="fa fa-flag surrender"></i>';
								}
								str += '<i class="' + lobby.governmentIcon(p.government)+ ' diploSquare" data-placement="right" data-toggle="tooltip" title="' + p.government + '"></i>' +
								'<img src="images/flags/' + p.flag + '" class="inlineFlag diploFlag p' + p.player + 'b" data-toggle="tooltip" title="'+ p.account + '"><span class="diploNames">' + p.nation + '</span>';
					}
					str += '</div>';
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
			setTimeout(function(){
				// init draggable map
				worldMap = Draggable.create(DOM.worldWrap, {
					type: 'x,y',
					bounds: "#gameWrap"
				});
				
				initOffensiveTooltips();
				TweenMax.set(DOM.targetLine, {
					stroke: color[my.player]
				});
				TweenMax.set(DOM.targetLine, {
					stroke: "hsl(+=0%, +=80%, +=25%)"
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
					});
				} else {
					zug.on("mousedown", function(e){
						var box = this.getBBox();
						var x = Math.round(box.x + (box.width/2));
						var y = Math.round(box.y + (box.height/2));
						console.clear();
						console.warn(this.id, x, y, e.which);
						triggerAction(this);
					});
				}
				zug.on("mouseenter", function(){
					my.lastTarget = this;
					if (my.attackOn){
						showTarget(this, true);
					}
					TweenMax.set(this, {
						fill: "hsl(+=0%, +=30%, +=15%)"
					});
				}).on("mouseleave", function(){
					var land = this.id.slice(4)*1;
					// console.info('land: ', land);
					if (game.tiles.length > 0){
						var player = game.tiles[land] !== undefined ? game.tiles[land].player : 0;
						TweenMax.to(this, .25, {
							fill: color[player]
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
				getGameState();
			}, 100);
		}).fail(function(data){
			serverError(data);
		}).always(function(){
			g.unlock();
		});
		
		}, loadGameDelay);
	});
}
function startGame(){
	if (my.totalPlayers >= 2){
		document.getElementById("startGame").style.display = "none";
		g.lock(1);
		audio.play('click');
		$.ajax({
			type: "GET",
			url: "php/startGame.php"
		}).done(function(data){
			console.info('startGame: ', data);
			g.unlock();
		}).fail(function(data){
			serverError(data);
		}).always(function(){
			g.unlock();
		});
	}
}
function lobbyCountdown(x){
	var loadTime = Date.now() - g.startTime;
	if (loadTime < 1000){
		loadGameState(x); // page refresh
	} else {
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
}
$("#joinGameLobby").on('click', '.governmentChoice', function(e){
	var government = $(this).text();
	$.ajax({
		url: "php/changeGovernment.php",
		data: {
			government: government
		}
	}).done(function(){
		lobby.updateGovernmentWindow(government);
	});
});