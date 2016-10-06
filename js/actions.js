// actions.js
function Target(o){
	if (o === undefined){
		o = {};
	}
	this.cost = o.cost ? o.cost : 10;
	this.minimum = o.minimum !== undefined ? o.minimum : 2;
	this.attackName = o.attackName ? o.attackName : 'attack';
	this.splitAttack = o.splitAttack ? o.splitAttack : false;
	this.hudMsg = o.hudMsg ? o.hudMsg : 'Select Target';
}

var action = {
	error: function(msg){
		if (msg === undefined){
			msg = "Not enough energy!";
		}
		Msg(msg, 1.5);
		my.clearHud();
		showTarget(document.getElementById('land' + my.tgt));
	},
	target: function(o){
		my.targetData = o;
		console.info(my.attackOn, my.tgt, game.tiles[my.tgt].player, my.player);
		if (game.tiles[my.tgt].player !== my.player){
			return;
		}
		if (my.attackOn && o.attackName === my.attackName){
			my.attackOn = false;
			my.attackName = '';
			my.clearHud();
			return;
		}
		if (my.production < o.cost){
			action.error();
			return;
		}
		if (game.tiles[my.tgt].units < o.minimum){
			Msg("You need at least " + o.minimum + " armies to attack!", 1.5);
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
			var e = document.getElementById('unit' + my.tgt);
			my.targetLine[0] = e.getAttribute('x')*1 - 10;
			my.targetLine[1] = e.getAttribute('y')*1 - 10;
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
			Msg("You need at least 2 armies to move/attack!", 1.5);
			my.clearHud();
			return;
		}
		if ((my.production < my.attackCost && !my.splitAttack) ||
			(my.production < my.splitAttackCost && my.splitAttack)
		){
			action.error();
			return;
		}
		g.lock(true);
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
			console.info('attackTile', data);
			// animate attack
			if (game.tiles[defender].player !== my.player){
				if (!game.tiles[defender].units){
					audio.move();
				} else {
					animate.gunfire(defender, true);
				}
			} else {
				audio.move();
			}
			if (data.rewardMsg !== undefined){
				chat(data.rewardMsg);
			}
			if (data.production !== undefined){
				setProduction(data);
			}
			// reset target if lost
			console.warn(data.victory, attacker, my.tgt);
			if (!data.victory){
				showTarget(document.getElementById('land' + attacker));
			}
		}).fail(function(e){
			audio.play('error');
			Msg('You can only attack adjacent territories.', 1.5);
			// set target attacker
			showTarget(document.getElementById('land' + attacker));
		}).always(function(){
			g.unlock();
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
			action.error("No armies available for deployment!");
			return;
		}
		if (t.units <= 254){
			// determine number
			var deployedUnits = my.manpower < my.maxDeployment ? 
				my.manpower : 
				my.maxDeployment,
				tgt = my.tgt;
			var rem = 0;
			if (t.units + deployedUnits > 255){
				rem = ~~((t.units + deployedUnits) - 255);
				deployedUnits = ~~(255 - t.units);
			} else {
				rem = my.manpower - deployedUnits;
			}
			console.log('deploy: ', tgt, t.units, deployedUnits);
			game.tiles[tgt].units = t.units + deployedUnits;
			//
			// do it
			//
			//
			audio.move();
			$.ajax({
				url: 'php/deploy.php',
				data: {
					deployedUnits: deployedUnits,
					target: tgt
				}
			}).done(function(data) {
				console.info("deploy: ", data);
				if (data.production !== undefined){
					my.manpower = data.manpower;
					DOM.manpower.textContent = my.manpower;
					setProduction(data);
					setTileUnits(tgt, '#00ff00');
				}
			}).fail(function(e){
				audio.play('error');
			});
			TweenMax.set('#manpower', {
			  color: '#fff'
			});
		}
	},
	recruit: function(){
		var t = game.tiles[my.tgt];
		if (t.player !== my.player){
			return;
		}
		if (my.production < my.recruitCost){
			action.error();
			return;
		}
		if (t.units <= 254){
			
			$.ajax({
				url: 'php/recruit.php',
				data: {
					target: my.tgt
				}
			}).done(function(data) {
				console.info("recruit: ", data.production, data);
				if (data.production !== undefined){
					setProduction(data);
				}
			
				var deployedUnits = 3 + ~~(my.cultureBonus / 30);
				
				if (t.units + deployedUnits > 255){
					game.tiles[my.tgt].units = 255;
				} else {
					game.tiles[my.tgt].units += deployedUnits;
				}
				// do it
				setTileUnits(my.tgt, '#00ff00');
				audio.move();
			}).fail(function(e){
				audio.play('error');
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
			console.info("upgradeTileDefense: ", data);
			if (data.production !== undefined){
				setProduction(data);
			}
			if (oldTgt === my.tgt){
				game.tiles[my.tgt].defense++;
				showTarget(document.getElementById('land' + my.tgt));
			}
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
		// can't attack friendly tile
		if (game.tiles[defender].player === my.player){
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
		g.lock(true);
		my.clearHud();
		showTarget(document.getElementById('land' + attacker));
		// send attack to server
		$.ajax({
			url: 'php/fireCannons.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			console.info('fireCannons', data);
			animate.cannons(defender, true);
			if (data.production !== undefined){
				setProduction(data);
			}
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				Msg(e.statusText, 1.5);
			}
		}).always(function(){
			g.unlock();
		});
	},
	launchMissile: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		// can't attack friendly tile
		if (game.tiles[defender].player === my.player){
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
		g.lock(true);
		my.clearHud();
		showTarget(document.getElementById('land' + attacker));
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
				}).done(function(data) {
					console.info('Missile Hit!', data);
				}).fail(function(e){
					console.info('error: ', e);
					if (e.statusText){
						Msg(e.statusText, 1.5);
					}
				});
			}, 2000);
			
			
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				Msg(e.statusText, 1.5);
			}
		}).always(function(){
			g.unlock();
		});
		
	},
	launchNuke: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		// can't attack friendly tile
		if (game.tiles[defender].player === my.player){
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
		g.lock(true);
		my.clearHud();
		showTarget(document.getElementById('land' + attacker));
		// send attack to server
		$.ajax({
			url: 'php/launchNuke.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			var e1 = document.getElementById('land' + defender),
				box = e1.getBBox();
			setTimeout(function(){
				$.ajax({
					url: 'php/launchNukeHit.php',
					data: {
						defender: defender
					}
				}).done(function(data) {
				});
			}, 6000);
			console.info('launchNuke', data);
			if (data.production !== undefined){
				setProduction(data);
			}
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				Msg(e.statusText, 1.5);
			}
		}).always(function(){
			g.unlock();
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
function toggleChatMode(send){
	g.chatOn = g.chatOn ? false : true;
	console.info('CHAT', g.chatOn);
	if (g.chatOn){
		$DOM.chatInput.focus();
		DOM.chatInput.className = 'fw-text noselect nobg chatOn';
	} else {
		var message = $DOM.chatInput.val();
		if (send && message){
			// send ajax chat msg
			$.ajax({
				url: 'php/insertChat.php',
				data: {
					message: message
				}
			}).done(function(data) {
				console.info("data: ", data);
			});
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
			cost: 3,
			splitAttack: true
		});
		action.target(o);
	}
}).on('mousedown', '#recruit', function(e){
	if (e.which === 1){
		action.recruit();
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
		chat('You have finished researching ' + tech + '.');
		if (data.cultureMsg){
			chat(data.cultureMsg);
		}
		audio.play('research');
		action.setMenu();
	}
}

$(document).on('keydown', function(e){
	var x = e.keyCode;
	//console.info(x);
	if (x === 9){
		// tab
		if (g.view === 'game'){
			if (!e.shiftKey){
				my.nextTarget(false);
			} else {
				my.nextTarget(true);
			}
			e.preventDefault();
		}
	}
});
$(document).on('keyup', function(e) {
	var x = e.keyCode;
	console.info(g.view, x);
	if (g.view === 'title'){
		if (x === 13){
			if (g.focusUpdateNationName){
				title.submitNationName();
			} else if (g.focusGameName){
				title.createGame();
			} else if (title.chatOn){
				if (x === 13){
					// enter - sends chat
					title.sendMsg();
				}
			} else if (title.createGameFocus){
				title.createGame();
			}
		} else if (x === 27){
			title.hideBackdrop();
		}
	} else if (g.view === 'lobby'){
		if (lobby.chatOn){
			if (x === 13){
				// enter - sends chat
				lobby.sendMsg();
			}
		}
	} else if (g.view === 'game'){
		if (g.chatOn){
			if (x === 13 || x === 27){
				// enter/esc - sends chat
				toggleChatMode(true);
			} else if (x === 27){
				// esc
				toggleChatMode(true);
			}
		} else {
			// game hotkeys
			if (x === 13){
				// enter
				toggleChatMode();
			}  else if (x === 27){
				// esc
				my.attackOn = false;
				my.attackName = '';
				my.clearHud();
				if (g.chatOn){
					toggleChatMode();
				}
			} else if (x === 65){
				// a
				var o = new Target();
				action.target(o);
			} else if (x === 83){
				// s
				var o = new Target({
					cost: 3, 
					splitAttack: true
				});
				action.target(o);
			} else if (x === 68){
				// d
				if (!g.keyLock){
					action.deploy();
				}
			} else if (x === 82){
				// r
				if (!g.keyLock){
					action.recruit();
				}
			} else if (x === 69){
				// e
				research.engineering();
			} else if (x === 71){
				// g
				research.gunpowder();
			} else if (x === 75){
				// k
				research.rocketry();
			} else if (x === 84){
				// t
				research.atomicTheory();
			} else if (x === 70){
				// f
				research.futureTech();
			} else if (x === 66){
				// b
				action.upgradeTileDefense();
			} else if (x === 67){
				// c
				var o = new Target({
					cost: 40 * my.weaponCost,
					minimum: 0,
					attackName: 'cannons',
					hudMsg: 'Fire Cannons'
				});
				action.target(o);
			} else if (x === 77){
				// m
				var o = new Target({
					cost: 60 * my.weaponCost,
					minimum: 0,
					attackName: 'missile',
					hudMsg: 'Launch Missile'
				});
				action.target(o);
			} else if (x === 78){
				// n
				var o = new Target({
					cost: 400 * my.weaponCost,
					minimum: 0,
					attackName: 'nuke',
					hudMsg: 'Launch Nuclear Weapon'
				});
				action.target(o);
			}
		}
	}
});