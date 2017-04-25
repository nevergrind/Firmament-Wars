// core.js
$.ajaxSetup({
	type: 'POST',
	timeout: 5000
});
if (location.host !== 'localhost'){
	console.info("Disabling log, info");
	//console.log = function(){};
	//console.info = function(){};
};
TweenMax.defaultEase = Quad.easeOut;
var g = {
	gameDuration: 0,
	spectateStatus: 0,
	modalSpeed: isMobile ? 0 : .5,
	friends: [],
	ignore: [],
	color: [
		"#02063a",
		"#bb0000",
		"#0077ff",
		"#a5a500",
		"#006000",
		"#b06000",
		"#33ddff",
		"#b050b0",
		"#5500aa",
		"#660000",
		"#0000bb",
		"#663300",
		"#33dd33",
		"#222222",
		"#00ff99",
		"#ff6666",
		"#ff00ff",
		'#e4e4e4',
		'#220088',
		'#404000',
		'#888888'
	],
	rankedMode: 0,
	teamMode: 0,
	joinedGame: false,
	searchingGame: false,
	defaultTitle: 'Firmament Wars',
	titleFlashing: false,
	name: "",
	password: "",
	speed: 15,
	focusUpdateNationName: false,
	focusGameName: false,
	view: "title",
	resizeX: 1,
	resizeY: 1,
	sfxFood: false,
	sfxCulture: false,
	chatOn: false,
	overlay: document.getElementById("overlay"),
	over: 0,
	showSpectateButton: 1,
	victory: false,
	startTime: Date.now(),
	keyLock: false,
	loadAttempts: 0,
	upgradeCost: [40, 80, 120],
	isModalOpen: false,
	lock: function(clear){
		g.overlay.style.display = "block";
		clear ? g.overlay.style.opacity = 0 : g.overlay.style.opacity = 1;
		g.keyLock = true;
	},
	unlock: function(clear){
		g.overlay.style.display = "none";
		clear ? g.overlay.style.opacity = 0 : g.overlay.style.opacity = 1;
		g.keyLock = false;
	},
	unlockFade: function(d){
		if (!d){
			d = 1;
		}
		TweenMax.to(g.overlay, d, {
			startAt: {
				opacity: 1,
			},
			ease: Power3.easeIn,
			opacity: 0,
			onComplete: function(){
				g.overlay.style.display = 'none';
			}
		});
	},
	TDC: function(){
		return new TweenMax.delayedCall(0, '');
	},
	screen: {
		resizeMap: function(){
			// set worldWrap CSS
			$("#mapStyle").remove();
			var css = 
				'<style id="mapStyle">#worldWrap{ '+
					'position: absolute; '+
					'top: 0%; '+
					'left: 0%; '+
					'width: ' + ((g.map.sizeX / window.innerWidth) * 100) + '%; '+
					'height: ' + ((g.map.sizeY / window.innerHeight) * 100) + '%; '+
				'}</style>';
			$DOM.head.append(css);
		}
	},
	mouse: {
		zoom: 100,
		mouseTransX: 50,
		mouseTransY: 50
	},
	map: {
		sizeX: 3200,
		sizeY: 1500,
		name: 'Earth Omega',
		key: 'EarthOmega',
		tiles: 85
	},
	updateUserInfo: function(){
		if (location.host !== 'localhost' && !guest){
			$.ajax({
				async: true,
				type: 'GET',
				dataType: 'jsonp',
				url: 'https://geoip-db.com/json/geoip.php?jsonp=?'
			}).done(function(data){
				data.latitude += '';
				data.longitude += '';
				g.geo = data;
				$.ajax({
					url: 'php/updateUserInfo.php',
					data: {
						location: g.geo
					}
				}).done(function(){
					localStorage.setItem('geo', JSON.stringify(g.geo));
					localStorage.setItem('geoSeason', 1);
					localStorage.setItem('geoTime', Date.now());
				});
				//console.info('loc: ', g.geo);
			});
		}
	},
	checkPlayerData: function(){
		if (my.account.indexOf('guest_') !== 0){
			// not a guest
			var geo = localStorage.getItem(my.account+ '_geo');
			var geoTime = localStorage.getItem(my.account+ '_geoTime');
			var geoSeason = localStorage.getItem(my.account+ '_geoSeason');
			if (geoTime !== null || geoSeason === null){
				// longer than 90 days?
				if ((Date.now() - geoTime) > 7776000 || geoSeason === null){
					g.updateUserInfo();
				}
			} else if (geo === null){
				g.updateUserInfo();
			}
			// ignore list
			var ignore = localStorage.getItem('ignore');
			if (ignore !== null){
				g.ignore = JSON.parse(ignore);
			} else {
				var foo = []; 
				localStorage.setItem('ignore', JSON.stringify(foo));
			}
			title.friendGet();
		}
	},
	config: {
		audio: {
			musicVolume: 10,
			soundVolume: 50
		}
	},
	geo: {},
	keepAlive: function(){
		$.ajax({
			type: 'GET',
			url: "php/keepAlive.php"
		}).always(function() {
			setTimeout(g.keepAlive, 120000);
		});
	},
	removeContainers: function(){
		$("#firmamentWarsLogoWrap, #mainWrap").remove();
	},
	notification: {},
	sendNotification: function(data){
		if (!document.hasFocus() && g.view !== 'game' && typeof Notification === 'function'){
			
			Notification.requestPermission().then(function(permission){
				if (permission === 'granted'){
					// it's a player message
					var type = ' says: ';
					if (data.flag && (data.msg || data.message)){
						// sent by a player
						if (data.type === 'chat-whisper'){
							type = ' whispers: ';
						}
						var prefix = data.account + type;
						var flagFile = data.flag.replace(/-/g, ' ') + (data.flag === 'Nepal' ? '.png' : '.jpg');
						g.notification = new Notification(prefix, {
							icon: 'images/flags/' + flagFile,
							tag: "Firmament Wars",
							body: data.msg ? data.msg : data.message
						});
						g.notification.onclick = function(){
							window.focus();
						}
						// title flash
						if (!g.titleFlashing){
							g.titleFlashing = true;
							(function repeat(toggle){
								if (!document.hasFocus()){
									if (toggle % 2 === 0){
										document.title = prefix;
									} else {
										document.title = g.defaultTitle;
									}
									setTimeout(repeat, 3000, ++toggle);
								}
							})(0);
						}
						audio.play('chat');
					}
				}
			});
		}
	},
	chat: function(msg, type){
		var o = {
			message: msg,
			type: type
		};
		if (g.view === 'title'){
			title.chat(o);
		} else if (g.view === 'lobby'){
			lobby.chat(o);
		} else {
			game.chat(o);
		}
	},
	getRandomFlag: function(){
		var a = [],
			i = 0;
		for (var key in g.flagData){
			g.flagData[key].name.forEach(function(flag){
				a[i++] = flag;
			});
		}
		var len = a.length,
			ind = ~~(Math.random() * len);
		return a[ind];
	},
	flagData: {
		Africa: {
			group: "Africa",
			name: ['Algeria', 'Botswana', 'Cameroon', 'Cape Verde', 'Ivory Coast', 'Egypt', 'Ghana', 'Kenya', 'Liberia', 'Morocco', 'Mozambique', 'Namibia', 'Nigeria', 'South Africa', 'Uganda']
		},
		Asia: {
			group: "Asia",
			name: ['Bangladesh', 'Cambodia', 'China', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Japan', 'Malaysia', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Pakistan', 'Philippines', 'Singapore', 'South Korea', 'Sri Lanka', 'Suriname', 'Taiwan', 'Thailand', 'Vietnam']
		},
		Europe: {
			group: "Europe",
			name: ['Albania', 'Austria', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'England', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Lithuania', 'Macedonia', 'Montenegro', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'Scotland', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City']
		},
		Eurasia: {
			group: "Eurasia",
			name: ['Armenia', 'Azerbaijan', 'Georgia', 'Kazakhstan', 'Uzbekistan']
		},
		Historic: {
			group: "Historic",
			name: ['Benin Empire', 'Byzantine Empire', 'Confederate Flag', 'Flanders', 'Gadsden Flag', 'Holy Roman Empire', 'Isle of Man', 'Rising Sun Flag', 'NSDAP Flag', 'NSDAP War Ensign', 'Ottoman Empire', 'Rhodesia', 'Shahanshahi', 'USSR', 'Veneto', 'Welsh']
		},
		MiddleEast: {
			group: "Middle East",
			name: ['Israel', 'Jerusalem', 'Jordan', 'Kurdistan', 'Lebanon', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Turkey']
		},
		NorthAmerica: {
			group: "North America",
			name: ['Bahamas', 'Barbados', 'Canada', 'Costa Rica', 'Cuba', 'Haiti', 'Honduras', 'Mexico', 'Saint Lucia', 'Trinidad and Tobago', 'United States']
		},
		Oceania: {
			group: "Oceania",
			name: ['Australia', 'New Zealand']
		},
		US_States: {
			group: "US States",
			name: ['Alaska', 'Alabama', 'Arkansas', 'Arizona', 'California', 'Maryland', 'Mississippi', 'Montana', 'South Carolina', 'Texas', 'Virginia']
		},
		Miscellaneous: {
			group: "Miscellaneous",
			name: ['Anarcho-Capitalist', 'Anarcho-Syndicalist', 'Cascadia', 'Christian', 'Edgemaster', 'European Union', 'High Energy', 'ISIS', 'Jefferson State', 'Jolly Roger', 'Kekistan', 'Northwest Front', 'Pan-African Flag', 'pol', 'Rainbow Flag', 'Sicily', 'United Nations']
		},
		SouthAmerica: {
			group: "South America",
			name: ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela']
		},
	}
};
g.init = (function(){
	// console.info("Initializing game...");
	if (!isMobile){
		$('[title]').tooltip({
			animation: false
		});
	}
	// build map drop-down 
	// <li><a class='flagSelect'>Default</a></li>
	var s = "";
	for (var key in g.flagData){
		s += "<li class='dropdown-header'>" + g.flagData[key].group + "</li>";
		g.flagData[key].name.forEach(function(e){
			s += "<li><a class='flagSelect' href='#'>" + e + "</a></li>";
		});
	}
	document.getElementById("flagDropdown").innerHTML = s;
	// TODO separate this confusing logic a bit
	if ((location.hostname === 'localhost' && location.hash !== '#stop') || 
		localStorage.getItem('resync') && 
		localStorage.getItem('reload') !== false){
		localStorage.setItem('resync', 0);
		$.ajax({
			type: "GET",
			url: 'php/rejoinGame.php' // check if already in a game
		}).done(function(data) {
			//console.info('rejoin ', data.gameId, data.team);
			if (data.gameId > 0){
				my.player = data.player;
				my.playerColor = data.player;
				g.teamMode = data.teamMode;
				g.rankedMode = data.rankedMode;
				my.team = data.team;
				game.id = data.gameId;
				g.map = data.mapData;
				g.speed = data.speed;
				// join lobby in progress
				setTimeout(function(){
					lobby.init(data);
					lobby.join(0); // autojoin
					initResources(data); // setResources(data);
					my.government = data.government;
					lobby.updateGovernmentWindow(my.government);
					socket.joinGame();
				}, 111);
			}
		}).fail(function(data){
			Msg(data.responseText);
		}).always(function(){
			g.unlock();
		});
	}
})();
var game = {
	name: '',
	tiles: [],
	initialized: false,
	ribbonTitle: ['',
		'National Combat Medal',
		'Outstanding Communications Ribbon',
		'Presidential Citation Ribbon',
		'Ceremonial Commendation Ribbon',
		'Civic Service Ribbon',//5
		'Bronze Campaign Medal',
		'Bronze Service Medal',
		'Bronze Expeditionary Medal',
		'Bronze Cross',
		'Silver Cross',//10
		'Golden Cross',
		'Platinum Cross',
		'Outstanding Volunteer Ribbon',
		'Distinguished Resolve Citation',
		'Combat Service Award',
		'Combat Gallantry Award',
		'Neverworks Campaign Medal',
		"Global Commendation Ribbon",
		'Holy Trips Ribbon',
		'Sweet Quads Ribbon',//20
		'Double Dubs Ribbon',
		'Glorious Pents Ribbon',
		'Wicked Sexts Ribbon',
		'Triple Dubs Ribbon',
		'Righteous Septs Ribbon',
		'Almighty Octs Ribbon',
		'Quad Dubs Ribbon',
		"Champion's Medal",
		"Conqueror's Medal",
		"Commander's Medal",//30
		"Meritorious Service Medal",
		'Global War Expeditionary Medal',
		'Silver Expeditionary Medal',
		'Silver Campaign Medal',
		'Silver Service Medal',
		'Good Conduct Medal',
	],
	ribbonDescription: ['', // 0
		'Established a new nation',
		'Confirmed your email address',
		'Beat the developer of Firmament Wars',
		'Selected a national flag',
		'Named your nation',//5
		'Won 10 ranked games',
		'Won 10 team games',
		'Won 10 FFA games',
		'Achieved 1800+ rating',
		'Achieved 2100+ rating',//10
		'Achieved 2400+ rating',
		'Achieved 2700+ rating',
		'Reported a significant bug or exploit', //13
		'Recorded a video of Firmament Wars and shared it online',
		'Won 10+ games in a row', // 15
		'Won 25+ games in a row',
		'Referred a player to the Discord server',// 17
		'Provided your real country code',
		'Scored holy trips',
		'Scored sweet quads',//20
		'Scored double dubs',
		'Scored glorious pents',
		'Scored wicked sexts',
		'Scored a triple double',
		'Scored righteous septs',//25
		'Scored almighty octs',
		'Scored sick quad dubs',
		"Hit #1 on the leaderboard",
		"Hit top #100 on the leaderboard",
		"Hit top #1000 on the leaderboard",//30
		"Refer a friend that plays 25 games",
		'Win an 8-player FFA game',
		'Won 100 FFA games',
		'Won 100 ranked games',
		'Won 100 team games',
		'Played 200 games and maintained a disconnect rate below 5%',
	],
	toggleGameWindows: function(){
		var x = $("#targetWrap").css('display') === 'block';
		TweenMax.set(DOM.gameWindows, {
			display: x ? 'none' : 'block'
		});
		TweenMax.to('#hotkey-ui', 5, {
			startAt: {
				opacity: 1,
				visibility: x ? 'visible' : 'hidden'
			},
			opacity: 1
		});
	},
	player: [0,0,0,0,0,0,0,0,0], // cached values on client to reduce DB load
	initMap: function(){
		(function(d, len){
			for (var i=0; i<len; i++){
				DOM['land' + i] = d.getElementById('land' + i);
				DOM['flag' + i] = d.getElementById('flag' + i);
				DOM['unit' + i] = d.getElementById('unit' + i);
			}
		})(document, game.tiles.length);
	},
	chat: function(data){
		while (DOM.chatContent.childNodes.length > 10) {
			DOM.chatContent.removeChild(DOM.chatContent.firstChild);
		}
		var z = document.createElement('div');
		if (data.type){
			z.className = data.type;
		}
		z.innerHTML = data.message;
		DOM.chatContent.appendChild(z);
		setTimeout(function(){
			if (z !== undefined){
				if (z.parentNode !== null){
					TweenMax.to(z, ui.delay(.125), {
						alpha: 0,
						onComplete: function(){
							if (z.parentNode !== null){
								z.parentNode.removeChild(z);
							}
						}
					});
				}
			}
		}, 12000);
	},
	eliminatePlayer: function(data){
		// player eliminated
		var i = data.player,
			playerCount = 0,
			cpuCount = 0,
			teams = [];
		game.player[i].alive = false;
		// count alive players remaining
		game.player.forEach(function(e, index){
			if (e.account){
				if (e.alive){
					if (!e.cpu){
						// only counts human players
						//console.info('Human player found at: '+ index);
						playerCount++;
						if (teams.indexOf(e.team) === -1){
							teams.push(e.team);
						}
					}
					if (e.cpu){
						//console.info('CPU player found at: '+ index);
						cpuCount++;
					}
				}
			}
		});
		// found 2 players on diplomacy panel
		$("#diplomacyPlayer" + i).removeClass('alive');
		// console.info(playerCount, cpuCount, teams);
		if (g.teamMode){
			if (teams.length <= 1){
				// disables spectate button
				g.showSpectateButton = 0;
			}
		} else {
			if (playerCount <= 1){
				// disables spectate button
				g.showSpectateButton = 0;
			}
		}
		// game over - insurance check to avoid multiples somehow happening
		if (!g.over){
			// it's not over... check with server
			//console.info('ELIMINATED: ', count, teams.length);
			if (i === my.player){
				gameDefeat();
			} else {
				// check if I won
				// cpus must be dead
				if (g.teamMode){
					if (teams.length <= 1){
						setTimeout(function(){
							gameVictory();
						}, 1000);
					}
				} else {
					if (playerCount <= 1 && !cpuCount){
						setTimeout(function(){
							gameVictory();
						}, 1000);
					}
				}
			}
		}
		// remove
		TweenMax.to('#diplomacyPlayer' + i, 1, {
			autoAlpha: 0,
			onComplete: function(){
				$("#diplomacyPlayer" + i).css('display', 'none');
			}
		});
		TweenMax.to('#diplomacyPlayer' + i, 1, {
			startAt: { 
				transformPerspective: 400,
				transformOrigin: '50% 0',
				rotationX: 0
			},
			paddingTop: 0,
			paddingBottom: 0,
			height: 0,
			rotationX: -90
		});
		game.removePlayer(i);
	},
	removePlayer: function(p){
		game.tiles[p].account = '';
		game.tiles[p].nation = '';
		game.tiles[p].flag = '';
		for (var i=0, len=game.tiles.length; i<len; i++){
			if (game.tiles[i].player === p){
				game.tiles[i].account = '';
				game.tiles[i].defense = '';
				game.tiles[i].flag = '';
				game.tiles[i].nation = '';
				game.tiles[i].player = 0;
				game.tiles[i].units = 0;
				game.tiles[i].tile = i;
				game.updateTile(game.tiles[i]);
			}
		}
	},
	getGameState: function(){
		// this is now a reality check in case zmq messes up?
		// or check that players are still online?
		$.ajax({
			type: 'GET',
			url: "php/getGameState.php"
		}).done(function(data){
			// get tile data
			for (var i=0, len=data.tiles.length; i<len; i++){
				var d = data.tiles[i],
					updateTargetStatus = false;
				// check player value
				if (d.player !== game.tiles[i].player){
					// player value has changed
					if (!game.tiles[i].units){
						// set text visible if uninhabited
						// this confuses me still...
						TweenMax.set(DOM['unit' + i], {
							visibility: 'visible'
						});
					}
					// only update client data
					game.tiles[i].player = d.player;
					game.tiles[i].account = game.player[d.player].account;
					game.tiles[i].nation = game.player[d.player].nation;
					game.tiles[i].flag = game.player[d.player].flag;
					
					if (my.tgt === i){
						// current target was updated
						updateTargetStatus = true;
					}
					var newFlag = !game.player[d.player].flag ? 
						'blank.png' : 
						game.player[d.player].flag;
					if (DOM['flag' + i] !== null){
						DOM['flag' + i].href.baseVal = "images/flags/" + newFlag;
					}
					TweenMax.set(DOM['land' + i], { 
						fill: g.color[game.player[d.player].playerColor],
						stroke: d.player ? g.color[game.player[d.player].playerColor] : '#aaa',
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
				// check unit value
				if (d.units !== game.tiles[i].units){
					var unitColor = d.units > game.tiles[i].units ? '#00ff00' : '#ff0000';
					game.tiles[i].units = d.units;
					if (my.tgt === i){
						// defender won
						updateTargetStatus = true;
					}
					setTileUnits(i, unitColor);
				}
				
				updateTargetStatus && ui.showTarget(DOM['land' + i]); 
			}
		}).fail(function(data){
			console.info(data.responseText);
		});
	},
	updateDefense: function(data){
		var i = data.tile;
		game.tiles[i].defense = data.defense;
		animate.updateMapBars(i);
		if (my.tgt === i){
			ui.showTarget(DOM['land' + my.tgt]);
		}
	},
	updateTile: function(d){
		var i = d.tile * 1,
			p = d.player;
		// only update client data
		game.tiles[i].player = p;
		game.tiles[i].account = game.player[p].account;
		game.tiles[i].nation = game.player[p].nation;
		game.tiles[i].flag = game.player[p].flag;
		// set flag
		var newFlag = !game.player[p].flag ? 
			game.tiles[i].units ? 'Player0.jpg' : 'blank.png' 
			: game.player[p].flag;
		// change flag
		if (DOM['flag' + i] !== null){
			DOM['flag' + i].href.baseVal = "images/flags/" + newFlag;
		}
		// land color
		TweenMax.set(DOM['land' + i], {
			fill: g.color[game.player[p].playerColor],
			stroke: p ? g.color[game.player[p].playerColor] : '#aaa',
			strokeWidth: 1,
			onComplete: function(){
				if (p){
					TweenMax.set(this.target, {
						stroke: "hsl(+=0%, +=0%, "+ (my.tgt === i ? "+=15%)" : "-=30%)")
					});
				}
			}
		});
		
		// check unit value
		if (d.units){
			if (d.units !== game.tiles[i].units){
				var unitColor = d.units > game.tiles[i].units ? '#00ff00' : '#ff0000';
				game.tiles[i].units = d.units;
				setTileUnits(i, unitColor);
			}
			// set text visible
			TweenMax.set(DOM['unit' + i], {
				visibility: 'visible'
			});
		} else {
			// dead/surrender
			game.tiles[i].units = 0;
			// hide mapBars and unit values
			TweenMax.set(DOM['unit' + i], {
				visibility: 'hidden'
			});
		}
		
		my.tgt === i && ui.showTarget(DOM['land' + i]);
	},
	setSumValues: function(){
		var o = {
			food: 0,
			production: 0,
			culture: 0
		}
		for (var i=0; i<g.tileCount; i++){
			if (my.player === game.tiles[i].player){
				o.food += game.tiles[i].food;
				o.production += game.tiles[i].production;
				o.culture += game.tiles[i].culture;
			}
		}
		DOM.sumFood.textContent = o.food;
		DOM.sumProduction.textContent = o.production;
		DOM.sumCulture.textContent = o.culture;
	},
	energyTimer: 0,
	startGameState: function(){
		// add function to get player data list?
		game.getGameState();
		game.energyTimer = setInterval(game.updateResources, g.speed * 1000);
		animate.energyBar();
		delete game.startGameState;
	},
	countAlivePlayers: function(){
		// count alive players remaining
		var x = 0;
		game.player.forEach(function(e){
			if (e.alive && e.account){ 
				x++;
			}
		});
		return x;
	},
	
	triggerNextTurn: function(data){ 
		//console.info("TRIGGERING NEXT TURN!", data);
		clearInterval(game.energyTimer);
		game.energyTimer = setInterval(game.updateResources, g.speed * 1000);
		game.updateResources();
		animate.energyBar();
	},
	updateResources: function(){
		if (!g.over){
			var firstPlayer = 0,
				pingCpu = 0;
			game.player.forEach(function(d){
				if (d.alive){
					if (d.cpu){
						ai.takeTurn(d);
					} else if (d.cpu === 0){
						// 0 means player, null means barb
						if (!firstPlayer){
							firstPlayer = 1;
							if (d.account === my.account){
								// so only one players updates
								pingCpu = 1;
							}
						}
					}
				}
			});
			//console.info('getGameState ', firstPlayer, pingCpu);
			$.ajax({
				url: "php/updateResources.php",
				data: {
					pingCpu: pingCpu,
					resourceTick: g.resourceTick 
				}
			}).done(function(data){
				g.resourceTick = data.resourceTick;
				setResources(data);
				ui.setCurrentYear(data.resourceTick);
				game.reportMilestones(data);
				animate.energyBar();
			}).fail(function(data){
				console.info(data.responseText);
				serverError(data);
			});
		}
	},
	reportMilestones: function(data){
		if (data.cultureMsg !== undefined){
			if (data.cultureMsg){
				var o = {
					message: data.cultureMsg
				};
				game.chat(o);
				audio.play('culture');
				audio.play('cheer3');
				// rush bonus changes
				initOffensiveTooltips();
			}
		}
	}
};
// player data values
var my = {
	lastReceivedWhisper: '',
	account: '',
	channel: '',
	player: 0,
	playerColor: 0,
	team: 0,
	gameName: 'Earth Alpha',
	max: 8,
	tgt: 1,
	lastTgt: 1,
	capital: 0,
	lastTarget: {},
	units: 0,
	food: 0,
	production: 25,
	culture: 0,
	oBonus: -1,
	dBonus: -1,
	productionBonus: -1,
	foodBonus: -1,
	cultureBonus: -1,
	sumProduction: 10,
	foodMax: 25,
	cultureMax: 300,
	manpower: 0,
	focusTile: 0,
	moves: 4,
	sumMoves: 4,
	sumFood: 0,
	sumProduction: 0,
	sumCulture: 0,
	flag: "",
	targetLine: [0,0,0,0,0,0],
	motionPath: [0,0,0,0,0,0],
	attackOn: false,
	splitAttack: false,
	splitAttackCost: 1,
	attackCost: 2,
	deployCost: 10,
	rushCost: 2,
	weaponCost: 1,
	maxDeployment: 12,
	buildCost: 1,
	targetData: {},
	selectedFlag: "Default",
	selectedFlagFull: "Default.jpg",
	government: 'Despotism',
	tech: {
		masonry: 0,
		construction: 0,
		engineering: 0,
		gunpowder: 0,
		rocketry: 0,
		atomicTheory: 0
	},
	hud: function(msg, d){
		timer.hud.kill();
		DOM.hud.style.visibility = 'visible';
		DOM.hud.textContent = msg;
		if (d){
			timer.hud = TweenMax.to(DOM.hud, 5, {
				onComplete: function(){
					DOM.hud.style.visibility = 'hidden';
				}
			});
		}
	},
	clearHud: function(){
		timer.hud.kill();
		DOM.hud.style.visibility = 'hidden';
		TweenMax.set([DOM.targetLine, DOM.targetLineShadow, DOM.targetCrosshair], {
			visibility: 'hidden',
			strokeDashoffset: 0
		});
		$("#style-land-pointer").remove();
		$DOM.head.append('<style id="style-land-pointer">.land{ cursor: pointer; }</style>');
	},
	checkSelectLastTarget: function(){
		if (game.tiles[my.tgt].player !== my.player){
			if (game.tiles[my.lastTgt].player === my.player){
				my.nextTarget(false, my.lastTgt);
			} else {
				my.nextTarget(false);
			}
		}
		
	},
	nextTarget: function(backwards, setTgt){
		if (!g.spectateStatus){
			my.lastTgt = my.tgt;
			var count = 0,
				len = game.tiles.length;
			if (setTgt === undefined){
				// TAB targeting
				backwards ? my.tgt-- : my.tgt++;
			} else {
				my.tgt = setTgt;
			}
			if (my.tgt < 0){
				my.tgt = len-1;
			}
			while (count < 255 && my.player !== game.tiles[my.tgt % len].player){
				backwards ? my.tgt-- : my.tgt++;
				if (my.tgt < 0){
					my.tgt = len-1;
				}
				count++;
			}
			if (setTgt === undefined){
				// TAB targeting
				if (!backwards){
					my.tgt = my.tgt % len;
				} else {
					my.tgt = Math.abs(my.tgt);
				}
			} else {
				my.tgt = setTgt;
			}
			my.focusTile(my.tgt, .1);
			animate.selectTile(my.lastTgt, my.tgt);
		}
	},
	// shift camera to tile
	focusTile: function(tile, d){
		var e = DOM['land' + tile];
		if (e !== null){
			var box = e.getBBox();
			if (d === undefined){
				d = .5;
			}
			// init map position & check max/min values
			var x = -box.x + 512;
			if (x > 0){ 
				x = 0;
			}
			var xMin = (g.map.sizeX - window.innerWidth) * -1;
			if (x < xMin){ 
				x = xMin;
			}
			
			var y = -box.y + 234; // 384 is dead center
			if (y > 0){ 
				y = 0;
			}
			var yMin = (g.map.sizeY - window.innerHeight) * -1;
			if (y < yMin){ 
				y = yMin;
			}
			TweenMax.to(DOM.worldWrap, ui.delay(d), {
				force3D: false,
				x: x * g.resizeX,
				y: y * g.resizeY
			});
			ui.showTarget(DOM['land' + tile], false, 1);
			my.flashTile(tile);
		}
	},
	// flash text in land
	flashTile: function(tile){
		if (!my.attackOn){
			// flag unit text
			if (game.tiles[tile].units){
				TweenMax.set(DOM['unit' + tile], {
					visibility: 'visible'
				});
			}
		}
	}
};
var timer = {
	hud: g.TDC()
};
// DOM caching
var DOM;
function initDom(){
	var d = document;
	DOM = {
		endTurn: d.getElementById('endTurn'),
		energyIndicator: d.getElementById('energyIndicator'),
		currentYear: d.getElementById('currentYear'),
		currentYearBG: d.getElementById('currentYearBG'),
		//targetTargetWrap: d.getElementById('targetTargetWrap'),
		targetFlag: d.getElementById('targetFlag'),
		targetCapStar: d.getElementById('targetCapStar'),
		targetResources: d.getElementById('targetResources'),
		targetNameWrap: d.getElementById('targetNameWrap'),
		targetBarsWrap: d.getElementById('targetBarsWrap'),
		targetNameAnchor: d.getElementById('targetNameAnchor'),
		//targetTargetFlag: d.getElementById('targetTargetFlag'),
		//targetTargetCapStar: d.getElementById('targetTargetCapStar'),
		//targetTargetNameWrap: d.getElementById('targetTargetNameWrap'),
		//targetTargetBarsWrap: d.getElementById('targetTargetBarsWrap'),
		landWrap: d.getElementById('landWrap'),
		gameWindows: d.getElementsByClassName('gameWindow'),
		sumMoves: d.getElementById('sumMoves'),
		moves: d.getElementById('moves'),
		gameWrap: d.getElementById('gameWrap'),
		gameTableBody: d.getElementById('gameTableBody'),
		food: d.getElementById('food'),
		production: d.getElementById('production'),
		culture: d.getElementById('culture'),
		Msg: d.getElementById('Msg'),
		hud: d.getElementById("hud"),
		sumFood: d.getElementById("sumFood"),
		foodMax: d.getElementById("foodMax"),
		cultureMax: d.getElementById("cultureMax"),
		manpower: d.getElementById("manpower"),
		sumProduction: d.getElementById("sumProduction"),
		sumCulture: d.getElementById("sumCulture"),
		chatContent: d.getElementById("chat-content"),
		chatInput: d.getElementById("chat-input"),
		lobbyChatInput: d.getElementById("lobby-chat-input"),
		titleChatInput: d.getElementById("title-chat-input"),
		worldWrap: d.getElementById('worldWrap'),
		motionPath: d.getElementById('motionPath'),
		targetLine: d.getElementById('targetLine'),
		targetLineShadow: d.getElementById('targetLineShadow'),
		targetCrosshair: d.getElementById('targetCrosshair'),
		target: d.getElementById('target'),
		avatarWrap: d.getElementById('avatarWrap'),
		avatar: d.getElementById('avatar'),
		//ribbonWrap: d.getElementById('ribbonWrap'),
		targetName: d.getElementById('targetName'),
		oBonus: d.getElementById('oBonus'),
		dBonus: d.getElementById('dBonus'),
		productionBonus: d.getElementById('productionBonus'),
		foodBonus: d.getElementById('foodBonus'),
		cultureBonus: d.getElementById('cultureBonus'),
		foodBar: d.getElementById('foodBar'),
		cultureBar: d.getElementById('cultureBar'),
		world: d.getElementById('world'),
		bgmusic: d.getElementById('bgmusic'),
		tileName: d.getElementById('tileName'),
		tileActions: d.getElementById('tileActions'),
		tileActionsOverlay: d.getElementById('tileActionsOverlay'),
		buildWord: d.getElementById('buildWord'),
		buildCost: d.getElementById('buildCost'),
		cannonsCost: d.getElementById('cannonsCost'),
		missileCost: d.getElementById('missileCost'),
		nukeCost: d.getElementById('nukeCost'),
		masonryCost: d.getElementById('masonryCost'),
		constructionCost: d.getElementById('constructionCost'),
		gunpowderCost: d.getElementById('gunpowderCost'),
		engineeringCost: d.getElementById('engineeringCost'),
		rocketryCost: d.getElementById('rocketryCost'),
		atomicTheoryCost: d.getElementById('atomicTheoryCost'),
		futureTechCost: d.getElementById('futureTechCost'),
		upgradeTileDefense: d.getElementById('upgradeTileDefense'),
		screenFlash: d.getElementById('screenFlash'),
		fireCannons: d.getElementById('fireCannons'),
		launchMissile: d.getElementById('launchMissile'),
		launchNuke: d.getElementById('launchNuke'),
		researchMasonry: d.getElementById('researchMasonry'),
		researchConstruction: d.getElementById('researchConstruction'),
		researchEngineering: d.getElementById('researchEngineering'),
		researchGunpowder: d.getElementById('researchGunpowder'),
		researchRocketry: d.getElementById('researchRocketry'),
		researchAtomicTheory: d.getElementById('researchAtomicTheory'),
		researchFutureTech: d.getElementById('researchFutureTech'),
		lobbyChatLog: d.getElementById('lobbyChatLog'),
		titleChatLog: d.getElementById('titleChatLog'),
		mapAnimations: d.getElementById('mapAnimations'),
		mapCapitals: d.getElementById('mapCapitals'),
		mapUpgrades: d.getElementById('mapUpgrades'),
		mapBars: d.getElementById('mapBars'),
		titleChatBody: d.getElementById('titleChatBody')
	}
};
initDom();

var $DOM = {
	head: $("#head"),
	chatInputOpen: $("#chat-input-open"),
	chatInputWrap: $("#chat-input-wrap"),
	chatInput: $("#chat-input"),
	lobbyChatInput: $("#lobby-chat-input"),
	titleChatInput: $("#title-chat-input")
};
// team colors
var worldMap = [];


var video = {
	cache: {},
	load: {
		game: function(){
			var x = [
				'smoke.png'
			];
			for (var i=0, len=x.length; i<len; i++){
				var z = x[i];
				video.cache[z] = new Image();
				video.cache[z].src = "images/" + z;
			}
		}
	}
}

function Msg(msg, d) { 
	DOM.Msg.innerHTML = msg;
	if (d === 0){
		TweenMax.set(DOM.Msg, {
			overwrite: 1,
			startAt: {
				opacity: 1
			}
		});
	} else {
		if (!d || d < .5){
			d = 2;
		}
		TweenMax.to(DOM.Msg, ui.delay(d), {
			overwrite: 1,
			startAt: {
				opacity: 1
			},
			onComplete: function(){
				TweenMax.to(this.target, .2, {
					opacity: 0
				});
			}
		});
	}
	// split text animation
	if (!isMobile){
		var tl = new TimelineMax();
		var split = new SplitText(DOM.Msg, {
			type: "words,chars"
		});
		var chars = split.chars;
		tl.staggerFromTo(chars, .01, {
			immediateRender: true,
			alpha: 0
		}, {
			delay: .1,
			alpha: 1
		}, .01);
	}
}

function playerLogout(){
    g.lock();
	socket.removePlayer(my.account);
    $.ajax({
		type: 'GET',
		url: 'php/deleteFromFwtitle.php'
	});
    $.ajax({
		type: 'GET',
		url: 'php/logout.php'
    }).done(function(data){
		localStorage.removeItem('token');
        location.reload();
    }).fail(function(){
        Msg("Logout failed. Is the server on fire?");
    });
}

function exitGame(bypass){
	if (g.view === 'game'){
		var r = confirm("Are you sure you want to surrender?");
	}
	if (r || bypass || g.view !== 'game'){
		g.lock(1);
		$.ajax({
			url: 'php/exitGame.php',
			data: {
				view: g.view
			}
		}).always(function(){
			location.reload();
		});
	}
}
function surrenderMenu(){
	document.getElementById('surrenderScreen').style.display = 'block';
	audio.play('click');
}
function surrender(){
	document.getElementById('surrenderScreen').style.display = 'none';
	$.ajax({
		type: 'GET',
		url: 'php/surrender.php',
	});
	audio.play('click');
	
}

function serverError(data){
	// Msg('The server reported an error.');
	console.error('The server reported an error.', data);
}