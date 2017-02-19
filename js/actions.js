// actions.js
function Target(o){
	if (o === undefined){
		o = {};
	}
	this.cost = 2;
	this.minimum = o.minimum !== undefined ? o.minimum : 2;
	this.attackName = o.attackName ? o.attackName : 'attack';
	this.splitAttack = o.splitAttack ? o.splitAttack : false;
	this.hudMsg = o.hudMsg ? o.hudMsg : 'Select Target';
}

var action = {
	error: function(msg){
		if (msg === undefined){
			msg = "Not enough production!";
		}
		Msg(msg, 1.5);
		my.clearHud();
		showTarget(DOM['land' + my.tgt]);
	},
	target: function(o){
		my.targetData = o;
		// console.info(my.attackOn, my.tgt, game.tiles[my.tgt].player, my.player);
		if (game.tiles[my.tgt].player !== my.player){
			return;
		}
		if (my.attackOn && o.attackName === my.attackName){
			my.attackOn = false;
			my.attackName = '';
			my.clearHud();
			showTarget(DOM['land' + my.tgt]);
			return;
		}
		if (my.moves < o.cost){
			action.error('Not enough energy!');
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
			$DOM.head.append('<style>.land{ cursor: crosshair; }</style>');
			// set target line
			my.targetLine[0] = DOM['unit' + my.tgt].getAttribute('x')*1 - 10;
			my.targetLine[1] = DOM['unit' + my.tgt].getAttribute('y')*1 - 10;
			showTarget(my.lastTarget, true);
		}
	},
	attack: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
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
		if ((my.moves < 2 && !my.splitAttack) ||
			(my.moves < 1 && my.splitAttack) ){
			action.error('Not enough energy!');
			return;
		}
		showTarget(that);
		my.clearHud();
		// send attack to server
		$.ajax({
			url: 'php/attackTile.php',
			data: {
				attacker: attacker,
				defender: defender,
				split: my.splitAttack ? 1 : 0
			}
		}).done(function(data){
			//console.info('attackTile', data);
			// animate attack
			if (game.tiles[defender].player !== my.player){
				/*
				if (!game.tiles[defender].units){
					audio.move();
				}
				*/
			} else {
				//audio.move();
			}
			// barbarian message
			if (data.rewardMsg){
				game.chat({ message: '<span class="chat-news">' + data.rewardMsg + '</span>' });
				setResources(data);
				if (data.sumFood){
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
					animate.upgrade(defender, 'production', data.productionReward +'%');
				} else if (data.cultureReward){
					animate.upgrade(defender, 'culture', data.cultureReward +'%');
				}
			}
			setMoves(data); 
			// reset target if lost
			if (!data.victory){
				showTarget(DOM['land' + attacker]);
			}
			// process barbarian reward messages
			game.reportMilestones(data);
		}).fail(function(data){
			//console.info('attackTile', data);
			audio.play('error');
			Msg(data.statusText, 1.5);
			// set target attacker
			showTarget(DOM['land' + attacker]);
		});
	},
	deploy: function(){
		var t = game.tiles[my.tgt];
		if (t.player !== my.player){
			return;
		}
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
				url: 'php/deploy.php',
				data: {
					target: my.tgt
				}
			}).done(function(data) {
				//console.info("deploy: ", data);
				/*
				if (data.production !== undefined){
					audio.move();
				}
				*/
			}).fail(function(e){
				audio.play('error');
			}).always(function(data){
				game.tiles[tgt].units = data.units;
				my.manpower = data.manpower;
				setResources(data);
				setTileUnits(tgt, '#00ff00');
			});
			TweenMax.set('#manpower', {
			  color: '#fff'
			});
		}
	},
	rush: function(){
		var t = game.tiles[my.tgt],
			tgt = my.tgt;
		if (t.player !== my.player){
			return;
		}
		if (my.moves < my.rushCost){
			action.error('Not enough energy!');
			return;
		}
		if (!my.manpower){
			action.error("No troops available to rush!");
			return;
		}
		if (t.units <= 254){
			$.ajax({
				url: 'php/rush.php',
				data: {
					target: tgt
				}
			}).done(function(data) {
				/*
				if (data.production !== undefined){
					audio.move();
				}
				*/
			}).fail(function(e){
				audio.play('error');
			}).always(function(data){
				setMoves(data);
				game.tiles[tgt].units = data.units;
				//setProduction(data);
				setTileUnits(tgt, '#00ff00');
				
				// my.manpower = data.manpower;
				setResources(data);
			});
		}
	},
	upgradeTileDefense: function(){
		var oldTgt = my.tgt;
		var t = game.tiles[my.tgt],
			ind = t.defense - t.capital ? 1 : 0;
		if (t.player !== my.player){
			return;
		}
		if (ind > 2){
			return;
		}
		if (my.production < (g.upgradeCost[ind] * my.buildCost)){
			action.error();
			return;
		}
		$.ajax({
			url: 'php/upgradeTileDefense.php',
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
		if (my.production < 40 * my.weaponCost){
			action.error();
			return;
		}
		my.clearHud();
		showTarget(DOM['land' + attacker]);
		// send attack to server
		$.ajax({
			url: 'php/fireCannons.php',
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
		}).always(function(data){
			console.info('always: ', data);
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
		if (my.production < 60 * my.weaponCost){
			action.error();
			return;
		}
		my.clearHud();
		showTarget(DOM['land' + attacker]);
		// send attack to server
		$.ajax({
			url: 'php/launchMissile.php',
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
					url: 'php/launchMissileHit.php',
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
		if (my.production < 400 * my.weaponCost){
			action.error();
			return;
		}
		my.clearHud();
		showTarget(DOM['land' + attacker]);
		// send attack to server
		$.ajax({
			url: 'php/launchNuke.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			var e1 = DOM['land' + defender],
				box = e1.getBBox();
			setTimeout(function(){
				$.ajax({
					url: 'php/launchNukeHit.php',
					data: {
						defender: defender
					}
				});
			}, 6000);
			console.info('launchNuke', data);
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
		DOM.researchEngineering.style.display = my.tech.engineering ? 'none' : 'block';
		DOM.researchGunpowder.style.display = my.tech.gunpowder ? 'none' : 'block';
		DOM.researchRocketry.style.display = my.tech.rocketry || !my.tech.gunpowder ? 'none' : 'block';
		DOM.researchAtomicTheory.style.display = my.tech.atomicTheory || !my.tech.gunpowder || !my.tech.rocketry || !my.tech.engineering ? 'none' : 'block';
		// all techs must be finished for future tech
		var display = 'block';
		if (!my.tech.engineering || 
			!my.tech.gunpowder || 
			!my.tech.rocketry || 
			!my.tech.atomicTheory){
			display = 'none';
		}
		DOM.researchFutureTech.style.display = display;
		if (!game.tiles[my.tgt].defense){
			// zero defense
			DOM.upgradeTileDefense.style.display = 'block';
		} else {
			// wall or fortress
			var capValue = game.tiles[my.tgt].capital ? 1 : 0,
				dMinusPalace = game.tiles[my.tgt].defense - capValue,
				display = 'none';
			if (!my.tech.engineering){
				// bunker max possible
				if (!dMinusPalace){
					display = 'block';
				}
			} else {
				if (dMinusPalace < 3){
					display = 'block';
				}
			}
			DOM.upgradeTileDefense.style.display = display;
		}
		DOM.fireCannons.style.display = my.tech.gunpowder ? 'block' : 'none';
		DOM.launchMissile.style.display = my.tech.rocketry ? 'block' : 'none';
		DOM.launchNuke.style.display = my.tech.atomicTheory ? 'block' : 'none';
	}
}

// key bindings
function toggleChatMode(bypass){
	g.chatOn = g.chatOn ? false : true;
	if (g.chatOn){
		$DOM.chatInput.focus();
		DOM.chatInput.className = 'fw-text noselect nobg chatOn';
	} else {
		var msg = $DOM.chatInput.val().trim();
		if (bypass && msg){
			// send ajax chat msg
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
				$.ajax({
					url: 'php/insertChat.php',
					data: {
						message: msg
					}
				});
			}
		}
		$DOM.chatInput.val('').blur();
		DOM.chatInput.className = 'fw-text noselect nobg';
	}
}

$("#gameWrap").on("mousedown", '#attack', function(e){
	if (e.which === 1){
		var o = new Target({});
		action.target(o);
	}
}).on('mousedown', '#deploy', function(e){
	if (e.which === 1){
		action.deploy();
	}
}).on('mousedown', '#splitAttack', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 1,
			splitAttack: true
		});
		action.target(o);
	}
}).on('mousedown', '#rush', function(e){
	if (e.which === 1){
		action.rush();
	}
}).on('mousedown', '#upgradeTileDefense', function(e){
	if (e.which === 1){
		action.upgradeTileDefense();
	}
}).on('mousedown', '#researchGunpowder', function(e){
	if (e.which === 1){
		research.gunpowder();
	}
}).on('mousedown', '#researchEngineering', function(e){
	if (e.which === 1){
		research.engineering();
	}
}).on('mousedown', '#researchRocketry', function(e){
	if (e.which === 1){
		research.rocketry();
	}
}).on('mousedown', '#researchAtomicTheory', function(e){
	if (e.which === 1){
		research.atomicTheory();
	}
}).on('mousedown', '#researchFutureTech', function(e){
	if (e.which === 1){
		research.futureTech();
	}
}).on('mousedown', '#fireCannons', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 60,
			minimum: 0,
			attackName: 'cannons',
			hudMsg: 'Fire Cannons'
		});
		action.target(o);
	}
}).on('mousedown', '#launchMissile', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 120,
			minimum: 0,
			attackName: 'missile',
			hudMsg: 'Launch Missile'
		});
		action.target(o);
	}
}).on('mousedown', '#launchNuke', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 600,
			minimum: 0,
			attackName: 'nuke',
			hudMsg: 'Launch Nuclear Weapon'
		});
		action.target(o);
	}
});

var research = {
	gunpowder: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchGunpowder.php'
		}).done(function(data) {
			my.tech.gunpowder = 1;
			research.report(data, "Gunpowder");
		}).fail(function(data){
			console.info('gunpowder: ', data);
		});
	},
	engineering: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchEngineering.php'
		}).done(function(data) {
			my.tech.engineering = 1;
			research.report(data, "Engineering");
		});
	},
	rocketry: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchRocketry.php'
		}).done(function(data) {
			my.tech.rocketry = 1;
			research.report(data, "Rocketry");
		}).fail(function(data){
			console.info('rocketry: ', data);
		});
	},
	atomicTheory: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchAtomicTheory.php'
		}).done(function(data) {
			my.tech.atomicTheory = 1;
			research.report(data, "Atomic Theory");
		}).fail(function(data){
			console.info('atomic: ', data);
		});
	},
	futureTech: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchFutureTech.php'
		}).done(function(data) {
			research.report(data, "Future Tech");
		}).fail(function(data){
			console.info('future: ', data);
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