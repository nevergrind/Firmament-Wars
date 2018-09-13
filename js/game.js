// game state and methods
var game = {
	name: '',
	tiles: [],
	initialized: false,
	presence: {
		list: {},
		hb: function(data) {
			data.timestamp = Date.now();
			/*console.log('%c gameHeartbeat: ', 'background: #0f0; color: #f00');
			console.info(data);*/
			this.update(data);
			this.audit(data.timestamp);
		},
		update: function(data) {
			this.list[data.account] = data;
		},
		remove: function(data) {
			console.log("remove: ", data.account, data.player);

			var tiles = game.getPlayersTiles(data.player);
			console.info('disconnected tiles: ', tiles, data);
			$.ajax({
				url: app.url + 'php/surrender.php',
				data: {
					player: data.player,
					account: data.account,
					eliminateType: 'disconnected',
					tiles: JSON.stringify(tiles)
				}
			});


		},
		reset: function() {
			this.list = {};
		},
		audit: function(now) {
			for (var key in this.list) {
				this.list[key] !== void 0 &&
					!this.list[key].cpu && // cpu cannot disconnect
					now - this.list[key].timestamp > 8000 &&
					this.remove(this.list[key]);
			}
		}
	},
	toggleGameWindows: function(){
		var x = $("#ui2-head").css('visibility') === 'visible';
		TweenMax.set(DOM.gameWindows, {
		  	visibility: x ? 'hidden' : 'visible'
		});
		if (x) {
			TweenMax.to('#hotkey-ui', .5, {
				startAt: {
					opacity: 0,
					visibility: 'visible'
				},
				opacity: 1
			});
		}
		else {
			TweenMax.set('#hotkey-ui', {
				visibility: 'hidden'
			});
		}
	},
	toggleFlags: function(){
		var x = $("#diplomacy-body").css('display') === 'block';
		TweenMax.set('#diplomacy-body', {
		  	display: x ? 'none' : 'block'
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
					TweenMax.to(z, .125, {
						alpha: 0,
						onComplete: function(){
							z.parentNode !== null && z.parentNode.removeChild(z);
						}
					});
				}
			}
		}, 12000);
	},
	publishEliminatePlayer: function(player) {
		socket.zmq.publish('game:' + game.id, {
			type: 'eliminated',
			sfx: 'chat',
			player: player,
			eliminateType: 'byPlayer',
			message: [
				'<span class="chat-warning">',
				game.player[player].nation,
				' has been eliminated</span>'
			].join('')
		});
		/*$.post(app.url + 'php/eliminated.php', {
			player: player,
			message: [
				'<span class="chat-warning">',
				game.player[player].nation,
				' has been eliminated</span>'
			].join('')
		});*/
	},
	eliminatePlayer: function(data){
		// player eliminated
		var i = data.player,
			playerCount = 0,
			cpuCount = 0,
			teams = [];

		// avoid calling multiple times
		console.info("eliminatePlayer: ", i, 'alive? ', game.player[i].alive);
		if (!game.player[i].alive) return;
		game.player[i].alive = 0;
		// count alive players remaining
		game.player.forEach(function(e, index){
			if (e.account && e.alive){
				if (e.cpu){
					// console.info('CPU player found at: '+ index);
					cpuCount++;
				}
				else {
					// only counts human players
					// console.info('Human player found at: '+ index);
					playerCount++;
				}
				if (teams.indexOf(e.team) === -1){
					// get a unique array of teams
					teams.push(e.team);
				}
			}
		});

		// found 2 players on diplomacy panel
		$("#diplomacyPlayer" + i).removeClass('alive');
		console.info(playerCount, cpuCount, teams);
		if (g.teamMode){
			if (teams.length <= 1){
				// disables spectate button
				g.showSpectateButton = 0;
			}
		}
		else {
			if (playerCount <= 1){
				// disables spectate button
				g.showSpectateButton = 0;
			}
		}
		// game over - insurance check to avoid multiples somehow happening
		if (!g.over){
			// it's not over... check with server
			console.info('ELIMINATED: ', i, playerCount, teams.length);
			if (i === my.player){
				console.info('I was eliminated!!!! ', i, my.player);
				gameDefeat();
			}
			else {
				// check if I won
				// cpus must be dead
				if (g.teamMode){
					if (teams.length <= 1){
						setTimeout(function(){
							gameVictory();
						}, 1000);
					}
				}
				else {
					if (playerCount <= 1 && !cpuCount){
						setTimeout(function(){
							gameVictory();
						}, 1000);
					}
				}
			}
		}
		// remove
		TweenMax.set('#diplomacyPlayer' + i, {
			autoAlpha: 0,
			onComplete: function(){
				$("#diplomacyPlayer" + i).css('display', 'none');
			}
		});
		TweenMax.set('#diplomacyPlayer' + i, 0, {
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
		// remove player??? always???
		data.eliminateType !== 'byPlayer' && game.removePlayer(i);
		game.chat(data);
	},
	removePlayer: function(p){
		/*game.tiles[p].account = '';
		game.tiles[p].nation = '';
		game.tiles[p].flag = '';*/
		var timestamp = Date.now();
		for (var i=0, len=game.tiles.length; i<len; i++){
			if (game.tiles[i].player === p){
				game.tiles[i].tile = i;
				game.tiles[i].account = '';
				game.tiles[i].flag = '';
				game.tiles[i].nation = '';
				game.tiles[i].defense = 0;
				game.tiles[i].player = 0;
				game.tiles[i].playerColor = 0;
				game.tiles[i].team = 0;
				game.tiles[i].units = 0;
				game.tiles[i].timestamp = 0;
				game.updateTile(game.tiles[i], timestamp);
			}
		}
	},
	getGameState: function(){
		// this is now a reality check in case zmq messes up?
		// or check that players are still online?
		$.ajax({
			type: 'GET',
			url: app.url + "php/getGameState.php"
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
						'blank.png' : game.player[d.player].flag;
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
					game.tiles[i].units = d.units;
					if (my.tgt === i){
						// defender won
						updateTargetStatus = true;
					}
					ui.setTileUnits(i);
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
	updateTile: function(d, localTimestampBypass){
		var i = d.tile * 1,
			attackPlayer = d.player * 1,
			timestamp = d.timestamp * 10000;

		// this update happened on the server earlier than most recent update... ignore!
		if (timestamp < game.tiles[i].timestamp) {
			if (localTimestampBypass) {
				timestamp = localTimestampBypass;
			}
			else {
				console.warn('did not update', i, timestamp, game.tiles[i].timestamp, timestamp < game.tiles[i].timestamp);
				return;
			}
		}
		// only update client data
		var tileObj = JSON.parse(JSON.stringify(game.tiles[i])),
			defendPlayer = tileObj.player,
			defendingFlag = tileObj.flag,
			playerChanged = tileObj.player === attackPlayer;

		// console.info('updateTile: ', d);
		game.tiles[i].player = attackPlayer;
		game.tiles[i].account = game.player[attackPlayer].account;
		game.tiles[i].nation = game.player[attackPlayer].nation;
		game.tiles[i].flag = game.player[attackPlayer].flag;
		game.tiles[i].timestamp = timestamp;
		var newFlag = game.player[attackPlayer].flag;
		// change flag
		//if (DOM['flag' + i] !== null && newFlag){
			// check barb
			if (newFlag === 'blank.png' && d.units) {
				newFlag = 'Barbarian.jpg';
			}
			//console.info('newFlag', newFlag, d.units);
			DOM['flag' + i].href.baseVal = "images/flags/" + newFlag;
		//}
		// land color
		TweenMax.set(DOM['land' + i], {
			fill: g.color[game.player[attackPlayer].playerColor],
			stroke: attackPlayer ? g.color[game.player[attackPlayer].playerColor] : '#aaa',
			strokeWidth: 1,
			onComplete: function(){
				if (attackPlayer){
					TweenMax.set(this.target, {
						stroke: "hsl(+=0%, +=0%, "+ (my.tgt === i ? "+=15%)" : "-=30%)")
					});
				}
			}
		});

		// check unit value
		if (d.units){
			if (d.units !== game.tiles[i].units){
				game.tiles[i].units = d.units;
				ui.setTileUnits(i);
			}
		}
		else {
			// dead/surrender
			game.tiles[i].units = 0;
			TweenMax.set(DOM['unit' + i], {
				visibility: 'hidden'
			});
		}

		my.tgt === i && ui.showTarget(DOM['land' + i]);
		ui.drawDiplomacyPanel();
		location.host === 'localhost' &&
			localStorage.setItem('fwtiles', JSON.stringify(game.tiles));
	},
	isMineOrAdjacent: function(tile) {
		if (game.tiles[tile].player === my.player) return 1;
		if (!game.tiles[tile].units) return 0;
		var foo = 0;
		game.tiles[tile].adj.forEach(function(v) {
			if (game.tiles[v].player === my.player) {
				foo = 1;
			}
		});
		return foo;
	},
	setVisibilityAll: function() {
		game.tiles.forEach(function(o, i) {
			//tile.adj.forEach(function(v) {
				ui.setUnitVisibility(i);
			//});
		});
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
		//DOM.sumFood.textContent = o.food;
		//DOM.sumProduction.textContent = o.production;
		//DOM.sumCulture.textContent = o.culture;
	},
	energyTimer: 0,
	startGameState: function(){
		// add function to get player data list?
		// game.getGameState();
		game.energyTimer = setInterval(game.updateResources, g.speed * 1000);
		animate.energyBar();
	},
	triggerNextTurn: function(){
		console.info("TRIGGERING NEXT TURN!");
		// clearInterval(game.energyTimer);
		// game.energyTimer = setInterval(game.updateResources, g.speed * 1000);
		game.updateResources();
	},
	lowestPlayerIsMe: function() {
		var lowestId = my.player;
		game.player.forEach(function(v) {
			if (!v.cpu &&
				v.alive &&
				v.player < lowestId) {
				lowestId = v.player;
			}
		});
		return lowestId === my.player;
	},
	playerActivatesCpuTurn: function(cpu) {
		var count = 0,
			alivePlayers = [];

		game.player.forEach(function(v, i) {
			//console.info('alivePlayers status: ', v.alive, v.cpu);
			if (v.alive && v.cpu === 0) {
				// add human players only
				//console.info('alivePlayers PUSH: ', i);
				alivePlayers.push(i);
				count++;
			}
		});
		var result = alivePlayers[cpu % count];
		/*console.info('alivePlayers: ', alivePlayers);
		console.info('cpu: ', cpu);
		console.info('count: ', count);*/
		console.info('Player '+ result + ' taking turn for cpu ' + cpu);
		return result === my.player;
	},
	getResourceSums: function() {
		var o = {
			food: 0,
			production: 0,
			culture: 0
		};
		game.tiles.forEach(function(v) {
			if (v.player === my.player) {
				if (v.food) {
					o.food += v.food;
				}
				if (v.production) {
					o.production += v.production;
				}
				if (v.culture) {
					o.culture += v.culture;
				}
			}
		});
		return o;
	},
	updateResources: function(){
		if (!g.over){
			var firstPlayer = 0,
				pingCpu = 0;
			game.player.forEach(function(d){
				if (d.alive){
					if (d.cpu){
						// game.lowestPlayerIsMe() && ai.takeTurn(d);
						game.playerActivatesCpuTurn(d.player) && ai.takeTurn(d);
					}
					else {
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

			var res = game.getResourceSums();
			$.ajax({
				url: app.url + "php/updateResources.php",
				data: {
					pingCpu: pingCpu,
					resourceTick: g.resourceTick,
					food: res.food,
					production: res.production,
					culture: res.culture,
					revTile: game.getRevolutionTile()
				}
			}).done(game.updateResourcesDone)
			.fail(function(data){
				console.info(data.responseText);
			});
		}
	},
	getRevolutionTile: function() {
		var tile = -1,
			units = 0;
		game.tiles.forEach(function(v, i) {
			if (g.teamMode) {
				if (v.team !== my.team &&
					v.flag &&
					!v.capital) {
					if (v.units > units) {
						tile = i;
						units = v.units;
					}
				}
			}
			else {
				if (v.player !== my.player &&
					v.flag &&
					!v.capital) {
					if (v.units > units) {
						tile = i;
						units = v.units;
					}
				}
			}
		});
		return tile;
	},
	updateResourcesDone: function(data) {
		console.info('updateResources.php', data);
		g.resourceTick = data.resourceTick;
		setResources(data);
		game.reportMilestones(data);
		animate.energyBar(data.resourceTick);
		// game.lowestPlayerIsMe() && game.triggerNextTurn();
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
	},
	getPlayersTiles: function(player) {
		var arr = [];
		if (player === undefined) {
			return;
		}
		game.tiles.forEach(function(v, i) {
			player === v.player && arr.push(i);
		});
		return arr;
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
		diplomacyBody: d.getElementById("diplomacy-body"),
		targetUiWrap: d.getElementById('target-ui-wrap'),
		endTurn: d.getElementById('endTurn'),
		energyIndicator: d.getElementById('energyIndicator'),
		currentYear: d.getElementById('currentYear'),
		currentYearWrap: d.getElementById('currentYearWrap'),
		//targetTargetWrap: d.getElementById('targetTargetWrap'),
		targetFlag: d.getElementById('targetFlag'),
		//targetCapStar: d.getElementById('targetCapStar'),
		targetResources: d.getElementById('targetResources'),
		targetNameWrap: d.getElementById('targetNameWrap'),
		targetBarsWrap: d.getElementById('targetBarsWrap'),
		targetNameAnchor: d.getElementById('targetNameAnchor'),
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
		troopIcon: d.getElementById('troop-icon'),
		targetLine: d.getElementById('targetLine'),
		targetLineBorder: d.getElementById('targetLineBorder'),
		arrowheadTip: d.getElementById('arrowhead-tip'),
		arrowhead: d.getElementById('arrowhead'),
		arrowheadBorder: d.getElementById('arrowhead-border'),
		targetLineShadow: d.getElementById('targetLineShadow'),
		targetCrosshair: d.getElementById('targetCrosshair'),
		target: d.getElementById('target'),
		//avatar: d.getElementById('avatar'),
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

function playerLogout(){

    g.lock();
	socket.publish.title.remove(my.account);
    /*$.ajax({
		type: 'GET',
		url: app.url + 'php/deleteFromFwtitle.php'
	});*/

	try {
		FB.getLoginStatus(function(ret) {
			ret.authResponse && FB.logout(function(response) {});
		});
	} catch (err){
		console.info('Facebook error: ', err);
	}

	try {
		var auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(function(){});
	} catch (err){
		console.info('Google error: ', err);
	}

	localStorage.removeItem('email');
	localStorage.removeItem('token');

	setTimeout(function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/logout.php'
		}).done(function() {
			localStorage.removeItem('token');
			location.reload();
			g.msg(lang[my.lang].logoutSuccess);
		}).fail(function() {
			g.msg(lang[my.lang].logoutFailed);
		});
	}, 1000);
}

function exitGame(bypass){
	/*if (g.view === 'game'){
		var r = confirm("Are you sure you want to surrender?");
	}*/
	if (bypass || g.view !== 'game'){
		g.lock(1);
		$.ajax({
			url: app.url + 'php/exitGame.php',
			data: {
				player: my.player,
				account: my.account,
				eliminateType: 'surrendered',
				view: g.view
			}
		}).always(function() {
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
	var tiles = game.getPlayersTiles(my.player);
	console.info('surrender tiles: ', tiles);
	$.ajax({
		url: app.url + 'php/surrender.php',
		data: {
			player: my.player,
			account: my.account,
			eliminateType: 'surrendered',
			tiles: JSON.stringify(tiles)
		}
	});
	audio.play('click');

}