// core.js
$.ajaxSetup({
	type: 'POST',
	timeout: 5000
});
if (location.host !== 'localhost'){
	console.log = function(){};
	console.info = function(){};
}
TweenMax.defaultEase = Quad.easeOut;
var g = {
	modalSpeed: .5,
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
		"#333333",
		"#00ff99",
		"#ff6666",
		"#ff00ff"
	],
	rankedGame: 0,
	joinedGame: false,
	searchingGame: false,
	defaultTitle: 'Firmament Wars | Multiplayer Grand Strategy Warfare',
	titleFlashing: false,
	name: "",
	password: "",
	speed: 10,
	speeds: {
		Slower: 15000,
		Slow: 12000,
		Normal: 10000,
		Fast: 8000,
		Faster: 6000,
		Fastest: 5000
	},
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
	done: 0,
	victory: false,
	startTime: Date.now(),
	keyLock: false,
	loadAttempts: 0,
	upgradeCost: [80, 140, 200],
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
		fullScreen: true,
		width: window.innerWidth,
		height: window.innerHeight,
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
			if (css){
				$DOM.head.append(css);
			}
		}
	},
	mouse: {
		zoom: 100,
		mouseTransX: 50,
		mouseTransY: 50
	},
	map: {
		sizeX: 2000,
		sizeY: 1000,
		name: 'Earth Alpha',
		key: 'EarthAlpha',
		tiles: 83
	},
	updateUserInfo: function(){
		if (location.host !== 'localhost'){
			$.ajax({
				async: true,
				type: 'GET',
				dataType: 'jsonp',
				url: 'https://geoip-db.com/json/geoip.php?jsonp=?'
			}).done(function(data){
				data.latitude += '';
				data.longitude += '';
				g.geo = data;
				localStorage.setItem('geo', JSON.stringify(g.geo));
				localStorage.setItem('geoTime', Date.now());
				$.ajax({
					url: 'php/updateUserInfo.php',
					data: {
						location: g.geo
					}
				});
				
				
			var foo = JSON.parse(geo);
			g.config.location = foo.location;
			console.info('loc: ', g.config.location);
			});
		}
	},
	checkPlayerData: function(){
		var geo = localStorage.getItem('geo');
		var geoTime = localStorage.getItem('geoTime');
		if (geoTime !== null){
			// longer than 90 days?
			if ((Date.now() - geoTime) > 7776000){
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
		var friends = localStorage.getItem('friends');
		if (friends !== null){
			g.friends = JSON.parse(friends);
		} else {
			var friends = [];
			localStorage.setItem('friends', JSON.stringify(friends));
		}
	},
	config: {
		audio: {
			musicVolume: 50,
			soundVolume: 50
		}
	},
	geo: {},
	keepAlive: function(){
		$.ajax({
			type: 'GET',
			url: "php/keepAlive.php"
		}).always(function() {
			setTimeout(g.keepAlive, 300000);
		});
	},
	removeContainers: function(){
		$("#firmamentWarsLogoWrap, #mainWrap").remove();
	},
	notification: {},
	sendNotification: function(data){
		if (!document.hasFocus() && g.view !== 'game'){
			// it's a player message
			var type = ' says: ';
			if (data.flag && data.msg){
				console.info("NOTIFY!", data, data.type);
				// sent by a player
				if (data.type === 'chat-whisper'){
					type = 'whispers: ';
				}
				var prefix = data.account + ' ' + type;
				var flagFile = data.flag + (data.flag === 'Nepal' ? '.png' : '.jpg');
				console.info(flagFile);
				g.notification = new Notification(prefix, {
					icon: 'images/flags/' + flagFile,
					tag: "Firmament Wars",
					body: data.msg
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
	}
}
g.init = (function(){
	// console.info("Initializing game...");
	$('[title]').tooltip();
	// build map drop-down 
	var s = "<li><a class='flagSelect'>Default</a></li>";
	var flagData = {
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
			name: ['Albania', 'Austria', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'England', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Lithuania', 'Macedonia', 'Montenegro', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'Scotland', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom']
		},
		Eurasia: {
			group: "Eurasia",
			name: ['Armenia', 'Azerbaijan', 'Georgia', 'Kazakhstan', 'Uzbekistan']
		},
		Historic: {
			group: "Historic",
			name: ['Confederate Flag', 'Flanders', 'Gadsden Flag', 'Isle of Man', 'Rising Sun Flag', 'NSDAP Flag', 'NSDAP War Ensign', 'Shahanshahi', 'USSR', 'Welsh']
		},
		MiddleEast: {
			group: "Middle East",
			name: ['Israel', 'Jordan', 'Kurdistan', 'Lebanon', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Turkey']
		},
		NorthAmerica: {
			group: "North America",
			name: ['Bahamas', 'Barbados', 'Canada', 'Costa Rica', 'Cuba', 'Haiti', 'Honduras', 'Mexico', 'Saint Lucia', 'Trinidad and Tobago', 'United States']
		},
		Oceania: {
			group: "Oceania",
			name: ['Australia', 'New Zealand']
		},
		Miscellaneous: {
			group: "Miscellaneous",
			name: ['Anarcho-Capitalist', 'Christian', 'Edgemaster', 'European Union', 'High Energy', 'ISIS', 'Northwest Front', 'Pan-African Flag', 'pol', 'Rainbow Flag', 'United Nations']
		},
		SouthAmerica: {
			group: "South America",
			name: ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela']
		},
	}
	for (var key in flagData){
		s += "<li class='dropdown-header'>" + flagData[key].group + "</li>";
		flagData[key].name.forEach(function(e){
			s += "<li><a class='flagSelect' href='#'>" + e + "</a></li>";
		});
	}
	document.getElementById("flagDropdown").innerHTML = s;
	if (location.hostname === 'localhost' && location.hash === ''){
		$.ajax({
			type: "GET",
			url: 'php/rejoinGame.php' // check if already in a game
		}).done(function(data) {
			console.info('rejoin ', data.gameId);
			if (data.gameId > 0){
				// console.info("Auto joined game:" + (data.gameId));
				my.player = data.player;
				my.playerColor = data.player;
				my.team = data.team;
				game.id = data.gameId;
				g.map = data.mapData;
				g.speed = g.speeds[data.speed];
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
	ribbonTitle: [
		'National Combat Medal',
		'Outstanding Communications Ribbon',
		'Presidential Citation Ribbon',
		'Ceremonial Commendation Ribbon',
		'Civic Service Ribbon',
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
		'Vandamor Campaign Medal',
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
	ribbonDescription: [
		'Established a new nation',
		'Confirmed your email address',
		'Backed a Kickstarter campaign',
		'Selected a national flag',
		'Named your nation',
		'Won 10 ranked games',
		'Won 10 team games',
		'Won 10 FFA games',
		'Achieved 1800+ rating',
		'Achieved 2100+ rating',//10
		'Achieved 2400+ rating',
		'Achieved 2700+ rating',
		'Reporting a significant bug, exploit, or suggested an improvement',
		'Acquired a custom flag',
		'Won 10+ games in a row', // 15
		'Won 25+ games in a row',
		'Beat Nevergrind on normal',
		'Provided your real country code',
		'Scored a 777 GET',
		'Scored a quad GET',//20
		'Scored a double dubs GET',
		'Scored a pents GET',
		'Scored a sexts GET',
		'Scored a triple dubs GET',
		'Scored a septs GET',
		'Scored an octs GET',
		'Scored a quad dubs GET',
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
	toggleGameWindows: function(hide){
		TweenMax.set(DOM.gameWindows, {
			visibility: hide ? 'hidden' : 'visible'
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
	updateTopTile: function(i){
		document.getElementById('topTile')
			.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#land' + i);
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
					TweenMax.to(z, .125, {
						alpha: 0,
						onComplete: function(){
							z.parentNode.removeChild(z);
						}
					});
				}
			}
		}, 12000);
	},
	alivePlayers: function(){
		var count = 0;
		for (var i=0, len=game.player.length; i<len; i++){
			if (game.player[i].account){
				if (game.player[i].alive){
					count++;
				}
			}
		}
		return count;
	},
	eliminatePlayer: function(data){
		// player eliminated
		var i = data.player;
		game.player[i].alive = false;
		console.info('eliminatePlayer: ', data);
		if ($(".alive").length > 1){
			// found a player on diplomacy panel
			$("#diplomacyPlayer" + i).removeClass('alive');
			var playerLen = $(".alive").length;
			if (playerLen < 2){
				// game done - used for spectate option
				g.done = 1;
			}
			// game over?
			console.info('eliminate: ', my.player, i);
			if (!g.over){
				if (i === my.player){
					gameDefeat();
				} else if (game.alivePlayers() === 1){
					gameVictory();
				}
			}
			// remove
			TweenMax.to('#diplomacyPlayer' + i, 1, {
				autoAlpha: 0,
				onComplete: function(){
					$("#diplomacyPlayer" + i).css('display', 'none');
				}
			});
			
			TweenMax.to('#diplomacyPlayer' + 1, 1, {
				startAt: { 
					transformPerspective: 400,
					transformOrigin: '50% 0',
					rotationX: 0
				},
				height: 0,
				rotationX: -90
			});
		}
		game.removePlayer(i);
	},
	removePlayer: function(p){
		game.tiles[p].account = '';
		game.tiles[p].nation = '';
		game.tiles[p].flag = '';
		for (var i=0, len=game.tiles.length; i<len; i++){
			if (game.tiles[i].player === p){
				if (game.tiles[i].capital){
					var e1 = document.getElementById('mapCapital' + i);
					if (e1 !== null){
						e1.remove();
					}
				}
				game.tiles[i].capital = false;
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
	startGameState: function(){
		// add function to get player data list?
		game.getGameState();
		setInterval(game.updateResources, g.speed);
		delete game.startGameState;
	},
	getGameState: function(){
		// this is now a reality check in case zmq messes up?
		// or check that players are still online?
		$.ajax({
			type: "GET",
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
					TweenMax.set(document.getElementById('land' + i), {
						fill: g.color[game.player[d.player].playerColor]
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
					if (d.player){
						TweenMax.set(".mapBars" + i, {
							opacity: 1
						});
					}
				}
				if (updateTargetStatus){
					// update this tile within loop cycle?
					showTarget(document.getElementById('land' + i));
					game.updateTopTile(i);
				}
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
			showTarget(document.getElementById('land' + my.tgt));
		}
	},
	updateTile: function(d, override){
		var i = d.tile,
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
		var land = document.getElementById('land' + i);
		TweenMax.set(land, {
			fill: g.color[game.player[p].playerColor]
		});
		
		// check unit value
		if (d.units){
			if (d.units !== game.tiles[i].units){
				var unitColor = d.units > game.tiles[i].units ? '#00ff00' : '#ff0000';
				game.tiles[i].units = d.units;
				setTileUnits(i, unitColor);
				if (p){
					TweenMax.set(".mapBars" + i, {
						opacity: 1
					});
				}
			}
			// set text visible
			TweenMax.set(DOM['unit' + i], {
				visibility: 'visible'
			});
		} else {
			// dead/surrender
			game.tiles[i].units = 0;
			// hide mapBars and unit values
			TweenMax.set(".mapBars" + i, {
				opacity: 0
			});
			TweenMax.set(DOM['unit' + i], {
				visibility: 'hidden'
			});
		}
		
		if (my.tgt === i){
			// update this tile within loop cycle?
			showTarget(land);
			game.updateTopTile(i);
		}
	},
	updateResources: function(){
		if (!g.over){
			$.ajax({
				type: "GET",
				url: "php/updateResources.php"
			}).done(function(data){
				// console.info('resource: ', data);
				setResources(data);
				game.reportMilestones(data);
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
				// recruit bonus changes
				initOffensiveTooltips();
			}
		}
	}
}
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
	turnBonus: -1,
	foodBonus: -1,
	cultureBonus: -1,
	turnProduction: 10,
	foodMax: 25,
	cultureMax: 400,
	manpower: 0,
	focusTile: 0,
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
	deployCost: 20,
	recruitCost: 4,
	weaponCost: 1,
	maxDeployment: 24,
	buildCost: 1,
	targetData: {},
	selectedFlag: "Default",
	selectedFlagFull: "Default.jpg",
	government: 'Despotism',
	tech: {
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
		$DOM.head.append('<style>.land{ cursor: pointer; }</style>');
	},
	nextTarget: function(backwards){
		my.lastTgt = my.tgt;
		var count = 0,
			len = game.tiles.length;
		backwards ? my.tgt-- : my.tgt++;
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
		if (!backwards){
			my.tgt = my.tgt % len;
		} else {
			my.tgt = Math.abs(my.tgt);
		}
		my.focusTile(my.tgt, .1);
		animate.glowTile(my.lastTgt, my.tgt);
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
			var xMin = (g.map.sizeX - g.screen.width) * -1;
			if (x < xMin){ 
				x = xMin;
			}
			
			var y = -box.y + 234; // 384 is dead center
			if (y > 0){ 
				y = 0;
			}
			var yMin = (g.map.sizeY - g.screen.height) * -1;
			if (y < yMin){ 
				y = yMin;
			}
			TweenMax.to(DOM.worldWrap, d, {
				force3D: false,
				x: x * g.resizeX,
				y: y * g.resizeY
			});
			showTarget(document.getElementById('land' + tile), false, 1);
			my.flashTile(tile);
		}
	},
	// flash text in land
	flashTile: function(tile){
		if (!my.attackOn){
			// flag unit text
			if (game.tiles[tile].units){
				TweenMax.to(DOM['unit' + tile], .05, {
					startAt: {
						transformOrigin: '50% 50%',
						fill: '#0ff'
					},
					fill: '#ffffff',
					ease: SteppedEase.config(1),
					repeat: 6,
					yoyo: true
				});
				TweenMax.set(DOM['unit' + tile], {
					visibility: 'visible'
				});
			}
		}
	}
}
var timer = {
	hud: g.TDC()
}
// DOM caching
var DOM;
function initDom(){
	var d = document;
	DOM = {
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
		ribbonWrap: d.getElementById('ribbonWrap'),
		targetFlag: d.getElementById('targetFlag'),
		targetName: d.getElementById('targetName'),
		oBonus: d.getElementById('oBonus'),
		dBonus: d.getElementById('dBonus'),
		turnBonus: d.getElementById('turnBonus'),
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
	chatInput: $("#chat-input"),
	lobbyChatInput: $("#lobby-chat-input"),
	titleChatInput: $("#title-chat-input")
};
// team colors
var worldMap = [];
function checkMobile(){
	var x = false;
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) x = true;
	return x;
};
// browser/environment checks
var isXbox = /Xbox/i.test(navigator.userAgent),
    isPlaystation = navigator.userAgent.toLowerCase().indexOf("playstation") >= 0,
    isNintendo = /Nintendo/i.test(navigator.userAgent),
    isMobile = checkMobile(),
    isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
    isFirefox = typeof InstallTrigger !== 'undefined',
    isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
    isChrome = !!window.chrome && !isOpera,
    isMSIE = /*@cc_on!@*/ false,
    isMSIE11 = !!navigator.userAgent.match(/Trident\/7\./);
// browser dependent
(function($){
	if (isMSIE || isMSIE11){
		alert("Firmament Wars does not support Internet Explorer. Consider using Chrome or Firefox for an enjoyable experience.");
		window.stop();
		// $("head").append('<style> text { fill: #ffffff; stroke-width: 0px; } </style>');
	} else if (isSafari){
		alert("Firmament Wars does not support Safari. Consider using Chrome or Firefox for an enjoyable experience.");
		window.stop();
		// $("head").append('<style> text { fill: #ffffff; stroke: #ffffff; stroke-width: 0px; } </style>');
	}
	if (isMobile){
		window.stop();
		// $("head").append('<style> *{ box-shadow: none !important; } </style>');
		alert("Firmament Wars is currently not available on mobile devices. Sorry about that! It runs like trash on mobile, so I'm probably doing you a favor.");
	}
})($);

function resizeWindow() {
    var e = document.getElementById('body'),
		winWidth = window.innerWidth,
		winHeight = window.innerHeight;
	if (g.screen.fullScreen){
		g.screen.width = winWidth;
		g.screen.height = winHeight;
		g.screen.resizeMap();
	}
    // game ratio
    var widthToHeight = g.screen.width / g.screen.height;
    // current window size
    var w = winWidth > g.screen.width ? g.screen.width : winWidth;
    var h = winHeight > g.screen.height ? g.screen.height : winHeight;
    if(w / h > widthToHeight){
    	// too tall
    	w = h * widthToHeight;
    	e.style.height = h + 'px';
    	e.style.width = w + 'px';
    }else{
    	// too wide
    	h = w / widthToHeight;
    	e.style.width = w + 'px';
    	e.style.height = h + 'px';
    }
	TweenMax.set("body", {
		x: ~~(w/2 + ((winWidth - w) / 2)),
		y: ~~(h/2 + ((winHeight - h) / 2)),
		opacity: 1,
		yPercent: -50,
		xPercent: -50,
		force3D: true
	});
	e.style.visibility = "visible";
	if (typeof worldMap[0] !== 'undefined'){
		worldMap[0].applyBounds();
	}
	g.resizeX = w / g.screen.width;
	g.resizeY = h / g.screen.height;
	TweenMax.set("#worldTitle", {
		xPercent: -50,
		yPercent: -50
	});
	TweenMax.set('#firmamentWarsLogo', {
		top: '50%',
		yPercent: -50
	});
}


var video = {
	cache: {},
	load: {
		game: function(){
			var x = [
				'nuke.png',
				'smoke.png',
				'goldSmoke.png',
				'bulwark.png'
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
		TweenMax.to(DOM.Msg, d, {
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

function playerLogout(){
    g.lock();
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
	audio.play('click');
	document.getElementById('surrenderScreen').style.display = 'block';
}
function surrender(){
	audio.play('click');
	document.getElementById('surrenderScreen').style.display = 'none';
	$.ajax({
		url: 'php/surrender.php',
	});
	
}

function serverError(data){
	// Msg('The server reported an error.');
	console.error('The server reported an error.');
}