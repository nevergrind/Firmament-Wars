// actions.js
function Target(o){
	if (o === undefined){
		o = {};
	}
	this.cost = o.cost !== undefined ? o.cost : 2;
	this.minimum = o.minimum !== undefined ? o.minimum : 2;
	this.attackName = o.attackName ? o.attackName : 'attack';
	this.splitAttack = o.splitAttack ? o.splitAttack : false;
	this.hudMsg = o.hudMsg ? o.hudMsg : 'Attack: Select Target';
}

var action = {
	error: function(msg){
		if (msg === undefined){
			msg = "Not enough production!";
		}
		Msg(msg, 1.5);
		my.clearHud();
		ui.showTarget(DOM['land' + my.tgt]);
	},
	target: function(o){
		my.targetData = o;
		my.checkSelectLastTarget();
		if (my.attackOn && o.attackName === my.attackName){
			my.attackOn = false;
			my.attackName = '';
			my.clearHud();
			ui.showTarget(DOM['land' + my.tgt]);
			return;
		}
		if (game.tiles[my.tgt].units < o.minimum){
			Msg("You need at least " + o.minimum + " troops to attack!", 1.5);
			my.clearHud();
			return;
		}
		if (my.player === game.tiles[my.tgt].player){
			my.attackOn = true;
			my.attackName = o.attackName;
			my.splitAttack = o.splitAttack;
			my.hud(o.hudMsg);
			// set cursor
			$("#style-land-crosshair").remove();
			$DOM.head.append('<style id="style-land-crosshair">.land{ cursor: crosshair; }</style>');
			// set target line
			my.targetLine[0] = DOM['unit' + my.tgt].getAttribute('x')*1 - 10;
			my.targetLine[1] = DOM['unit' + my.tgt].getAttribute('y')*1 - 10;
			ui.showTarget(my.lastTarget, true);
		}
	},
	attack: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		if (game.tiles[attacker].adj.indexOf(defender) === -1){
			action.targetNotAdjacent('You can only attack adjacent territories.', attacker);
			return;
		}
		// can't move to maxed friendly tile
		if (game.tiles[defender].player === my.player){
			if (game.tiles[defender].units >= 255){
				Msg("That territory has the maximum number of units!", 1.5);
				my.clearHud();
				return;
			}
		}
		
		my.attackOn = false;
		my.attackName = '';
		if (game.tiles[my.tgt].units === 1){
			Msg("You need at least 2 troops to move/attack!", 1.5);
			my.clearHud();
			return;
		}
		if (my.government === 'Despotism' && game.tiles[defender].player === my.player){
			// nothing
		} else {
			if ((my.moves < 2 && !my.splitAttack) ||
				(my.moves < 1 && my.splitAttack) ){
				action.error('Not enough energy!');
				return;
			}
		}
		ui.showTarget(that);
		my.clearHud();
		if (g.teamMode && game.tiles[defender].player){
			if (my.account !== game.tiles[defender].account){
				if (my.team === game.player[game.tiles[defender].player].team){
					Msg("Friendly fire! That's your teammate!");
				}
			}
		}
		// send attack to server
		$.ajax({
			url: app.url + 'php/attackTile.php',
			data: {
				attacker: attacker,
				defender: defender,
				split: my.splitAttack ? 1 : 0,
				randomTile: action.getRandomDemocracyTile(defender, game.tiles[defender].player),
				defGovernment: game.player[game.tiles[defender].player].government
			}
		}).done(function(data){
			//console.info('attackTile', data);
			// animate attack
			if (game.tiles[defender].player !== my.player){
				if (!game.tiles[defender].units){
					audio.move();
				}
			} else {
				audio.move();
			}
			// barbarian message
			if (data.rewardMsg){
				game.chat({ message: '<span class="chat-news">' + data.rewardMsg + '</span>' });
				setResources(data);
				if (data.foodReward && data.productionReward && data.cultureReward){
					// all +%
					animate.upgrade(defender, 'food', data.foodReward +'%');
					setTimeout(function(){
						animate.upgrade(defender, 'production', data.productionReward +'%');
					}, 500);
					setTimeout(function(){
						animate.upgrade(defender, 'culture', data.cultureReward +'%');
					}, 1000);
				} else if (data.sumFood){
					animate.upgrade(defender, 'food', data.sumFood);
				} else if (data.sumProduction){
					animate.upgrade(defender, 'production', data.sumProduction);
				} else if (data.sumCulture){
					animate.upgrade(defender, 'culture', data.sumCulture);
				} else if (data.sumMoves){
					animate.upgrade(defender, 'energy', data.sumMoves);
				} else if (data.foodReward){
					// food %
					animate.upgrade(defender, 'food', data.foodReward +'%');
				} else if (data.productionReward){
					// production %
					animate.upgrade(defender, 'production', data.productionReward +'%');
				} else if (data.cultureReward){
					// culture %
					animate.upgrade(defender, 'culture', data.cultureReward +'%');
				}
			}
			setMoves(data); 
			// reset target if lost
			if (!data.victory){
				ui.showTarget(DOM['land' + attacker]);
			}
			// process barbarian reward messages
			game.reportMilestones(data);
		}).fail(function(data){
			action.targetNotAdjacent(data.statusText, attacker);
		});
	},
	getRandomDemocracyTile: function(tile, player){
		var a = [],
			i = 0;
		game.tiles.forEach(function(t, index){
		  if (t.player === player && index !== tile){
			a[i++] = index;
		  }
		});
		var len = a.length;
		return a[~~(Math.random() * len)];
	},
	targetNotAdjacent: function(msg, attacker){
		audio.play('error');
		Msg(msg, 1.5);
		// set target attacker
		ui.showTarget(DOM['land' + attacker]);
	},
	deploy: function(){
		if (my.government === 'Communism' && !game.tiles[my.tgt].player && !game.tiles[my.tgt].units){
			// skip for commie bonus
		} else {
			my.checkSelectLastTarget();
		}
		var t = game.tiles[my.tgt];
		if (my.production < my.deployCost){
			action.error();
			return;
		}
		if (!my.manpower){
			action.error("No troops available for deployment!");
			return;
		}
		if (t.units <= 254){
			// do it
			var tgt = my.tgt;
			$.ajax({
				url: app.url + 'php/deploy.php',
				data: {
					target: tgt
				}
			}).done(function(data) {
				//console.info(data);
				audio.deploy();
				game.tiles[tgt].units = data.units;
				my.manpower = data.manpower;
				setResources(data);
			}).fail(function(e){
				audio.play('error');
			}).always(function(data){
				setTileUnits(tgt, '#00ff00');
			});
			TweenMax.set('#manpower', {
			  color: '#fff'
			});
		}
	},
	rush: function(){
		my.checkSelectLastTarget();
		var t = game.tiles[my.tgt],
			tgt = my.tgt;
		if (my.moves < my.rushCost){
			action.error('Not enough energy!');
			return;
		}
		if (t.units <= 254){
			$.ajax({
				url: app.url + 'php/rush.php',
				data: {
					target: tgt
				}
			}).done(function(data) {
				audio.deploy();
				setMoves(data);
				game.tiles[tgt].units = data.units;
				//setProduction(data);
				setTileUnits(tgt, '#00ff00');
			}).fail(function(e){
				audio.play('error');
			}).always(function(data){
				// my.manpower = data.manpower;
				setResources(data);
			});
		}
	},
	upgradeTileDefense: function(){
		my.checkSelectLastTarget();
		var t = game.tiles[my.tgt],
			ind = t.defense - t.capital ? 1 : 0;
		if (ind > 2){
			return;
		}
		if (my.production < (g.upgradeCost[ind] * my.buildCost)){
			action.error();
			return;
		}
		$.ajax({
			url: app.url + 'php/upgradeTileDefense.php',
			data: {
				target: my.tgt
			}
		}).done(function(data) {
			setProduction(data);
		}).fail(function(e){
			console.info(e.responseText);
			Msg(e.statusText);
			audio.play('error');
		});
	},
	fireCannons: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		if (game.tiles[my.tgt].units === 0){
			return;
		}
		my.attackOn = false;
		my.attackName = '';
		if (my.production < Math.ceil(24 * my.weaponCost)){
			action.error();
			return;
		}
		my.clearHud();
		ui.showTarget(DOM['land' + attacker]);
		// send attack to server
		$.ajax({
			url: app.url + 'php/fireCannons.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			setProduction(data);
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				Msg(e.statusText, 1.5);
			}
		});
	},
	launchMissile: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		if (game.tiles[my.tgt].units === 0){
			return;
		}
		my.attackOn = false;
		my.attackName = '';
		if (my.production < Math.ceil(50 * my.weaponCost)){
			action.error();
			return;
		}
		my.clearHud();
		ui.showTarget(DOM['land' + attacker]);
		// send attack to server
		$.ajax({
			url: app.url + 'php/launchMissile.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			console.info('launchMissile', data);
			// animate attack
			if (data.production !== undefined){
				setProduction(data);
			}
			setTimeout(function(){
				$.ajax({
					url: app.url + 'php/launchMissileHit.php',
					data: {
						attacker: attacker,
						defender: defender
					}
				}).fail(function(e){
					console.info('error: ', e);
					if (e.statusText){
						Msg(e.statusText, 1.5);
					}
				});
			}, 1000);
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				Msg(e.statusText, 1.5);
			}
		});
		
	},
	launchNuke: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		if (game.tiles[my.tgt].units === 0){
			return;
		}
		my.attackOn = false;
		my.attackName = '';
		if (my.production < Math.ceil(150 * my.weaponCost)){
			action.error();
			return;
		}
		my.clearHud();
		ui.showTarget(DOM['land' + attacker]);
		// send attack to server
		$.ajax({
			url: app.url + 'php/launchNuke.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			setTimeout(function(){
				$.ajax({
					url: app.url + 'php/launchNukeHit.php',
					data: {
						defender: defender
					}
				});
			}, 6000);
			setProduction(data);
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				Msg(e.statusText, 1.5);
			}
		});
		
	},
	// updates currently visible buttons after research/targeting
	setMenu: function(){
		// show/hide research
		if (my.tech.masonry){
		}
		DOM.researchMasonry.style.display = !my.tech.masonry ? 'block' : 'none';
		DOM.researchConstruction.style.display = my.tech.masonry && !my.tech.construction ? 'block' : 'none';
		DOM.researchEngineering.style.display = my.tech.construction && !my.tech.engineering ? 'block' : 'none';
		DOM.researchGunpowder.style.display = !my.tech.gunpowder ? 'block' : 'none';
		DOM.researchRocketry.style.display = my.tech.gunpowder && !my.tech.rocketry ? 'block' : 'none';
		DOM.researchAtomicTheory.style.display =
			my.tech.rocketry && my.tech.engineering && !my.tech.atomicTheory ? 'block' : 'none';
		DOM.researchFutureTech.style.display = my.tech.atomicTheory ? 'block' : 'none';
		if (my.tech.masonry){
			// masonry unlocked
			if (!game.tiles[my.tgt].defense){
				// zero defense
				DOM.upgradeTileDefense.style.display = 'block';
			} else {
				// bunker built
				var capValue = game.tiles[my.tgt].capital ? 1 : 0,
					dMinusPalace = game.tiles[my.tgt].defense - capValue,
					display = 'none';
				
				console.info('dMinusPalace ', dMinusPalace);
				if (my.tech.engineering){
					if (dMinusPalace < 3){
						display = 'block';
					}
				} else if (my.tech.construction){
					if (!dMinusPalace){
						// nothing built
						display = 'block';
					}
				}
				DOM.upgradeTileDefense.style.display = display;
			}
		} else {
			DOM.upgradeTileDefense.style.display = 'none';
		}
		DOM.fireCannons.style.display = my.tech.gunpowder ? 'block' : 'none';
		DOM.launchMissile.style.display = my.tech.rocketry ? 'block' : 'none';
		DOM.launchNuke.style.display = my.tech.atomicTheory ? 'block' : 'none';
	},
	endTurn: function(){
		if (my.moves){
			audio.play('click');
			$.ajax({
				type: 'GET',
				url: app.url + 'php/endTurn.php',
			}).done(function(data){
				setMoves(data);
			});
		}
	}
}

// key bindings
function toggleChatMode(bypass){
	g.chatOn = g.chatOn ? false : true;
	if (g.chatOn){
		// show chat
		$DOM.chatInputOpen.css('visibility', 'hidden');
		$DOM.chatInputWrap.css('visibility', 'visible');
		$DOM.chatInput.focus();
	} else {
		// hide chat
		var msg = $DOM.chatInput.val().trim();
		if (bypass && msg){
			// send ajax chat msg
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
				if (msg.charAt(0) === '/' && msg.indexOf('/me') !== 0){
					// skip
				} else {
					$.ajax({
						url: app.url + 'php/insertChat.php',
						data: {
							message: msg
						}
					});
				}
			}
		}
		$DOM.chatInput.val('').blur();
		$DOM.chatInputOpen.css('visibility', 'visible');
		$DOM.chatInputWrap.css('visibility', 'hidden');
	}
}

$("#gameWrap").on(ui.click, '#attack', function(){
	var o = new Target({});
	action.target(o);
}).on(ui.click, '#deploy', function(){
	action.deploy();
}).on(ui.click, '#splitAttack', function(){
	var o = new Target({
		cost: 1,
		attackName: 'splitAttack',
		hudMsg: 'Split Attack: Select Target',
		splitAttack: true
	});
	action.target(o);
}).on(ui.click, '#rush', function(){
	action.rush();
}).on(ui.click, '#upgradeTileDefense', function(){
	action.upgradeTileDefense();
}).on(ui.click, '#researchMasonry', function(){
	research.masonry();
}).on(ui.click, '#researchConstruction', function(){
	research.construction();
}).on(ui.click, '#researchGunpowder', function(){
	research.gunpowder();
}).on(ui.click, '#researchEngineering', function(){
	research.engineering();
}).on(ui.click, '#researchRocketry', function(){
	research.rocketry();
}).on(ui.click, '#researchAtomicTheory', function(){
	research.atomicTheory();
}).on(ui.click, '#researchFutureTech', function(){
	research.futureTech();
}).on(ui.click, '#fireCannons', function(){
	var o = new Target({
		cost: 0,
		minimum: 0,
		attackName: 'cannons',
		hudMsg: 'Fire Cannons'
	});
	action.target(o);
}).on(ui.click, '#launchMissile', function(){
	var o = new Target({
		cost: 0,
		minimum: 0,
		attackName: 'missile',
		hudMsg: 'Launch Missile'
	});
	action.target(o);
}).on(ui.click, '#launchNuke', function(){
	var o = new Target({
		cost: 0,
		minimum: 0,
		attackName: 'nuke',
		hudMsg: 'Launch Nuclear Weapon'
	});
	action.target(o);
});

var research = {
	masonry: function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchMasonry.php'
		}).done(function(data) {
			my.tech.masonry = 1;
			research.report(data, "Masonry");
		});
	},
	construction: function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchConstruction.php'
		}).done(function(data) {
			my.tech.construction = 1;
			research.report(data, "Construction");
		});
	},
	gunpowder: function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchGunpowder.php'
		}).done(function(data) {
			my.tech.gunpowder = 1;
			research.report(data, "Gunpowder");
		});
	},
	engineering: function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchEngineering.php'
		}).done(function(data) {
			my.tech.engineering = 1;
			research.report(data, "Engineering");
		});
	},
	rocketry: function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchRocketry.php'
		}).done(function(data) {
			my.tech.rocketry = 1;
			research.report(data, "Rocketry");
		});
	},
	atomicTheory: function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchAtomicTheory.php'
		}).done(function(data) {
			my.tech.atomicTheory = 1;
			research.report(data, "Atomic Theory");
		});
	},
	futureTech: function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchFutureTech.php'
		}).done(function(data) {
			research.report(data, "Future Tech");
		});
	},
	report: function(data, tech){
		setProduction(data);
		var o = {
			message: 'You have finished researching ' + tech + '.'
		}
		game.chat(o);
		if (data.cultureMsg){
			var o = {
				message: data.cultureMsg
			};
			game.chat(o);
		}
		audio.play('research');
		action.setMenu();
	}
};