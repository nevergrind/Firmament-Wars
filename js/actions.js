// actions.js
function Target(o){
	if (o === undefined){
		o = {};
	}
	this.cost = o.cost ? o.cost : 7;
	this.minimum = o.minimum !== undefined ? o.minimum : 2;
	this.attackName = o.attackName ? o.attackName : 'attack';
	this.splitAttack = o.splitAttack ? o.splitAttack : false;
	this.hudMsg = o.hudMsg ? o.hudMsg : 'Select Target';
}

var action = {
	error: function(){
		Msg("Not enough energy!", 1.5);
		my.clearHud();
		audio.play('error');
	},
	target: function(o){
		my.targetData = o;
		console.info(my.attackOn, my.tgt, game.tiles[my.tgt].player, my.player);
		if (game.tiles[my.tgt].player !== my.player){
			return;
		}
		if (my.attackOn){
			my.attackOn = false;
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
		if (game.tiles[my.tgt].units === 1){
			Msg("You need at least 2 armies to move/attack!", 1.5);
			my.clearHud();
			return;
		}
		if ((my.production < 7 && !my.splitAttack) ||
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
		}).done(function(data) {
			console.info('attackTile', data);
			// animate attack
			if (game.tiles[defender].player !== my.player){
				if (!game.tiles[defender].units){
					audio.move();
				} else {
					animate.explosion(defender, true);
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
		}).fail(function(e){
			audio.play('error');
			Msg('You can only attack adjacent territories.', 1.5);
		}).always(function(){
			g.unlock();
		});
	},
	deploy: function(){
		var t = game.tiles[my.tgt];
		if (t.player !== my.player){
			return;
		}
		if (my.production < 20){
			action.error();
			return;
		}
		if (my.manpower && t.units <= 254){
			// determine number
			var deployedUnits = my.manpower < 12 ? my.manpower : 12;
			var rem = 0;
			if (t.units + deployedUnits > 255){
				rem = ~~((t.units + deployedUnits) - 255);
				deployedUnits = ~~(255 - t.units);
			} else {
				rem = my.manpower - deployedUnits;
			}
			console.log('deploy: ', t.units, deployedUnits);
			game.tiles[my.tgt].units = t.units + deployedUnits;
			console.info('deploy: ', game.tiles[my.tgt].units);
			my.manpower = ~~rem;
			// do it
			DOM.manpower.textContent = my.manpower;
			setTileUnits(my.tgt, '#00ff00');
			audio.move();
			$.ajax({
				url: 'php/deploy.php',
				data: {
					deployedUnits: deployedUnits,
					target: my.tgt
				}
			}).done(function(data) {
				console.info("deploy: ", data);
				if (data.production !== undefined){
					setProduction(data);
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
		if (my.production < 50){
			action.error();
			return;
		}
		if (t.units <= 254){
			
			var deployedUnits = 3 + ~~(my.cultureBonus / 30);
			
			if (t.units + deployedUnits > 255){
				game.tiles[my.tgt].units = 255;
			} else {
				game.tiles[my.tgt].units += deployedUnits;
			}
			// do it
			setTileUnits(my.tgt, '#00ff00');
			audio.move();
			
			$.ajax({
				url: 'php/recruit.php',
				data: {
					target: my.tgt
				}
			}).done(function(data) {
				console.info("recruit: ", data);
				if (data.production){
					setProduction(data);
				}
			}).fail(function(e){
				audio.play('error');
			});
		}
	},
	upgradeTileDefense: function(){
		var oldTgt = my.tgt;
		var t = game.tiles[my.tgt],
			cost = [80, 200, 450],
			ind = t.defense - t.capital ? 1 : 0;
		if (t.player !== my.player){
			return;
		}
		if (ind > 2){
			return;
		}
		if (my.production < (cost[ind] * my.buildCost)){
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
			if (data.production){
				setProduction(data);
			}
			if (oldTgt === my.tgt){
				game.tiles[my.tgt].defense++;
				showTarget(document.getElementById('land' + my.tgt));
			}
		}).fail(function(e){
			console.info(e.responseText);
			audio.play('error');
		});
	},
	fireArtillery: function(that){
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
		if (my.production < 60){
			action.error();
			return;
		}
		g.lock(true);
		showTarget(that);
		my.clearHud();
		// send attack to server
		$.ajax({
			url: 'php/fireArtillery.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			console.info('fireArtillery', data);
			animate.artillery(defender, true);
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
		console.info('missile');
		
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
		if (my.production < 150){
			action.error();
			return;
		}
		g.lock(true);
		showTarget(that);
		my.clearHud();
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
		if (my.production < 600){
			action.error();
			return;
		}
		g.lock(true);
		showTarget(that);
		my.clearHud();
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
					// does nothing when finished
				});
			}, 8000);
			setTimeout(function(){
				animate.nuke(defender);
			}, 7000);
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
	setMenu: function(id){
		if (id === undefined){
			id = 'gotoCommand';
		}
		DOM.tileCommand.style.display = 'none';
		DOM.tileResearch.style.display = 'none';
		DOM.tileBuild.style.display = 'none';
		$(".actionTabs").removeClass('activeTab');
		if (id === 'gotoCommand'){
			g.actionMenu = 'command';
			DOM.tileCommand.style.display = 'block';
		} else if (id === 'gotoResearch'){
			g.actionMenu = 'research';
			DOM.tileResearch.style.display = 'block';
			if (!my.tech.engineering){
				DOM.researchEngineering.style.display = 'block';
			} else {
				DOM.researchEngineering.style.display = 'none';
			}
			if (!my.tech.gunpowder){
				DOM.researchGunpowder.style.display = 'block';
			} else {
				DOM.researchGunpowder.style.display = 'none';
			}
			if (!my.tech.rocketry){
				DOM.researchRocketry.style.display = 'block';
			} else {
				DOM.researchRocketry.style.display = 'none';
			}
			if (!my.tech.atomicTheory){
				DOM.researchAtomicTheory.style.display = 'block';
			} else {
				DOM.researchAtomicTheory.style.display = 'none';
			}
			// all techs must be finished
			if (!my.tech.engineering || 
				!my.tech.gunpowder || 
				!my.tech.rocketry || 
				!my.tech.atomicTheory){
				DOM.researchFutureTech.style.display = 'none';
			} else {
				DOM.researchFutureTech.style.display = 'block';
			}
		} else if (id === 'gotoBuild'){
			g.actionMenu = 'build';
			DOM.tileBuild.style.display = 'block';
			if (!game.tiles[my.tgt].defense){
				DOM.upgradeTileDefense.style.display = 'block';
			} else {
				// wall or fortress
				if (!my.tech.engineering){
					DOM.upgradeTileDefense.style.display = 'none';
				} else {
					if (game.tiles[my.tgt].defense < 3){
						DOM.upgradeTileDefense.style.display = 'block';
					}
				}
			}
			if (!my.tech.gunpowder){
				DOM.fireArtillery.style.display = 'none';
			} else {
				DOM.fireArtillery.style.display = 'block';
			}
			if (!my.tech.rocketry){
				DOM.launchMissile.style.display = 'none';
			} else {
				DOM.launchMissile.style.display = 'block';
			}
			if (!my.tech.atomicTheory){
				DOM.launchNuke.style.display = 'none';
			} else {
				DOM.launchNuke.style.display = 'block';
			}
		}
		$("#" + id).addClass('activeTab');
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

$("#actions").on("mousedown", '#attack', function(e){
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
}).on('mousedown', '#fireArtillery', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 60,
			minimum: 0,
			attackName: 'artillery',
			hudMsg: 'Fire Artillery'
		});
		action.target(o);
	}
}).on('mousedown', '#launchMissile', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 150,
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
}).on('mousedown', '.actionTabs', function(e){
	if (e.which === 1){
		action.setMenu(this.id);
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
		action.setMenu('gotoResearch');
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
	//console.info(x);
	if (g.view === 'title'){
		if (x === 13){
			if (g.focusUpdateNationName){
				$("#submitNationName").trigger("mousedown");
			} else if (g.focusGameName){
				$("#createGame").trigger("mousedown");
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
			// any actionMenu mode
			if (x === 13){
				// enter
				toggleChatMode();
			} else if (x === 67 && g.actionMenu !== 'command'){
				// c
				action.setMenu('gotoCommand');
			} else if (x === 82 && g.actionMenu !== 'research'){
				// r
				action.setMenu('gotoResearch');
			} else if (x === 66 && g.actionMenu !== 'build'){
				// c
				action.setMenu('gotoBuild');
			}  else if (x === 27){
				// esc
				my.attackOn = false;
				my.clearHud();
				if (g.chatOn){
					toggleChatMode();
				}
			} else {
				// actionMenu
				if (g.actionMenu === 'command'){
					if (x === 65){
						// a
						var o = new Target();
						console.info(o);
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
						action.deploy();
					} else if (x === 69){
						// e
						action.recruit();
					}
				} else if (g.actionMenu === 'research'){
					if (x === 69){
						// r
						research.engineering();
					} else if (x === 71){
						// g
						research.gunpowder();
					} else if (x === 82){
						// r
						research.rocketry();
					} else if (x === 65){
						// a
						research.atomicTheory();
					} else if (x === 70){
						// f
						research.futureTech();
					}
				} else {
					if (x === 66){
						// b
						action.upgradeTileDefense();
					} else if (x === 65){
						// f
						var o = new Target({
							cost: 60,
							minimum: 0,
							attackName: 'artillery',
							hudMsg: 'Fire Artillery'
						});
						action.target(o);
					} else if (x === 77){
						// c
						var o = new Target({
							cost: 150,
							minimum: 0,
							attackName: 'missile',
							hudMsg: 'Launch Missile'
						});
						action.target(o);
					} else if (x === 78){
						// n
						var o = new Target({
							cost: 600,
							minimum: 0,
							attackName: 'nuke',
							hudMsg: 'Launch Nuclear Weapon'
						});
						action.target(o);
					}
				}
			}
		}
	}
});