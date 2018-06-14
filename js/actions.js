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
			msg = "Not enough science!";
		}
		g.msg(msg, 1.5);
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
			g.msg("You need at least " + o.minimum + " troops to attack!", 1.5);
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
			if (game.tiles[defender].units >= 65535){
				g.msg("That territory has the maximum number of units!", 1.5);
				my.clearHud();
				return;
			}
		}
		
		my.attackOn = false;
		my.attackName = '';
		if (game.tiles[my.tgt].units === 1){
			g.msg("You need at least 2 troops to move/attack!", 1.5);
			my.clearHud();
			return;
		}
		if (my.government === 'Despotism' &&
			game.tiles[defender].player === my.player){
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
					console.warn(my.team, game.tiles[defender].player, game.player[game.tiles[defender].player].team)
					g.msg("Friendly fire! That's your teammate!");
				}
			}
		}
		var filter = {
			brightness: 200
		}, element = my.splitAttack ? '#splitAttack' : '#attack';
		TweenMax.to(filter, .5, {
			brightness: 100,
			onUpdate: function() {
				animate.brightness(element, filter.brightness);
			}
		});
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
		g.msg(msg, 1.5);
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
		if (my.moves < my.deployCost){
			action.error('Not enough energy!');
			return;
		}
		if (!my.manpower){
			action.error("No troops available for deployment!");
			return;
		}
		if (t.units < 65535){
			// do it
			var tgt = my.tgt,
				filter = {
					brightness: 200
				};

			TweenMax.to(filter, .5, {
				brightness: 100,
				onUpdate: function() {
					animate.brightness('#deploy', filter.brightness);
				}
			});
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
			}).always(function(){
				ui.setTileUnits(tgt);
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
		if (t.units < 65535){
			var filter = {
				brightness: 200
			};
			TweenMax.to(filter, .5, {
				brightness: 100,
				onUpdate: function() {
					animate.brightness('#rush', filter.brightness);
				}
			});
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
				ui.setTileUnits(tgt);
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
		if (my.production < (g.upgradeCost[ind])){
			action.error();
			return;
		}
		var filter = {
				brightness: 200
			};
		TweenMax.to(filter, .5, {
			brightness: 100,
			onUpdate: function() {
				animate.brightness('#upgradeTileDefense', filter.brightness);
			}
		});
		$.ajax({
			url: app.url + 'php/upgradeTileDefense.php',
			data: {
				target: my.tgt
			}
		}).done(function(data) {
			setProduction(data);
		}).fail(function(e){
			console.info(e.responseText);
			g.msg(e.statusText);
			audio.play('error');
		});
	},
	timeoutWeaponButton: function(id, dur) {
		var overlay = document.getElementById(id + 'Overlay'),
			reload = document.getElementById(id + 'Reload');

		TweenMax.set(overlay, {
			opacity: 1
		});
		TweenMax.to(reload, (dur/1000), {
			startAt: {
				opacity: 1,
				width: '0%'
			},
			width: '100%',
			ease: Linear.easeIn,
			onComplete: function() {
				TweenMax.set(reload, {
					opacity: 0
				});
			}
		});
		setTimeout(function() {
			TweenMax.set(overlay, {
				opacity: 0
			});
		}, dur);
	},
	fireCannons: function(that){
		var now = Date.now(),
			dur = 2000;
		if (now - g.cannonTimer < dur) {
			return;
		}
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
		if (my.production < 24){
			action.error();
			return;
		}
		action.timeoutWeaponButton('fireCannons', dur);
		g.cannonTimer = now;
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
				g.msg(e.statusText, 1.5);
			}
		});
	},
	launchMissile: function(that){
		var now = Date.now(),
			dur = 5000;
		if (now - g.missileTimer < dur) {
			return;
		}
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
		if (my.production < 50){
			action.error();
			return;
		}
		action.timeoutWeaponButton('launchMissile', dur);
		g.missileTimer = now;
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
						g.msg(e.statusText, 1.5);
					}
				});
			}, 1000);
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				g.msg(e.statusText, 1.5);
			}
		});
		
	},
	launchNuke: function(that){
		var now = Date.now(),
			dur = 30000;
		if (now - g.nukeTimer < dur) {
			return;
		}
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
		if (my.production < 150){
			action.error();
			return;
		}
		action.timeoutWeaponButton('launchNuke', dur);
		g.nukeTimer = now;
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
				g.msg(e.statusText, 1.5);
			}
		});
		
	},
	// updates currently visible buttons after research/targeting
	setMenu: function(){
		// show/hide research
		DOM.researchMasonry.style.display = !my.tech.masonry ? 'flex' : 'none';
		DOM.researchConstruction.style.display = my.tech.masonry && !my.tech.construction ? 'flex' : 'none';
		DOM.researchEngineering.style.display = my.tech.construction && !my.tech.engineering ? 'flex' : 'none';
		DOM.researchGunpowder.style.display = !my.tech.gunpowder ? 'flex' : 'none';
		DOM.researchRocketry.style.display = my.tech.gunpowder && !my.tech.rocketry ? 'flex' : 'none';
		DOM.researchAtomicTheory.style.display =
			my.tech.rocketry && my.tech.engineering && !my.tech.atomicTheory ? 'flex' : 'none';
		DOM.researchFutureTech.style.display = my.tech.atomicTheory ? 'flex' : 'none';
		action.setBuildButton();
		DOM.fireCannons.style.display = my.tech.gunpowder ? 'flex' : 'none';
		DOM.launchMissile.style.display = my.tech.rocketry ? 'flex' : 'none';
		DOM.launchNuke.style.display = my.tech.atomicTheory ? 'flex' : 'none';
	},
	setBuildButton: function() {
		var t = game.tiles[my.tgt],
			defense = t.defense - (t.capital ? 1 : 0),
			display = 'none';

		if (my.tech.masonry && t.player === my.player){
			// masonry unlocked
			//console.warn("upgradeTileDefense: ", defense, my.tech);
			if (defense === 0 ||
				defense === 1 && my.tech.construction ||
				defense === 2 && my.tech.engineering) {
				// zero defense
				display = 'flex';
				//console.info("SETTING TO FLEX: ", defense, my.tech);
			}
		}
		DOM.upgradeTileDefense.style.display = display;
	},
	/*endTurn: function(){
		if (my.moves){
			audio.play('click');
			$.ajax({
				type: 'GET',
				url: app.url + 'php/endTurn.php',
			}).done(function(data){
				setMoves(data);
			});
		}
	}*/
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
		if (my.production < 40) return;
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchMasonry.php'
		}).done(function(data) {
			setProduction(data);
			animate.research({
				element: 'researchMasonry',
				duration: 20,
				tech: 'Masonry',
				method: 'masonryDone'
			});
		});
	},
	masonryDone: function() {
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchMasonryDone.php'
		}).done(function(data) {
			my.tech.masonry = 1;
			research.report(data, "Masonry");
		})
	},
	construction: function(){
		if (my.production < 60) return;
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchConstruction.php'
		}).done(function(data) {
			setProduction(data);
			animate.research({
				element: 'researchConstruction',
				duration: 30,
				tech: 'Construction',
				method: 'constructionDone'
			});
		});
	},
	constructionDone: function() {
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchConstructionDone.php'
		}).done(function(data) {
			my.tech.construction = 1;
			research.report(data, "Construction");
		})
	},
	gunpowder: function(){
		if (my.production < 60) return;
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchGunpowder.php'
		}).done(function(data) {
			setProduction(data);
			animate.research({
				element: 'researchGunpowder',
				duration: 25,
				tech: 'Gunpowder',
				method: 'gunpowderDone'
			});
		});
	},
	gunpowderDone: function() {
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchGunpowderDone.php'
		}).done(function(data) {
			my.tech.gunpowder = 1;
			research.report(data, "Gunpowder");
		})
	},
	engineering: function(){
		if (my.production < 80) return;
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchEngineering.php'
		}).done(function(data) {
			setProduction(data);
			animate.research({
				element: 'researchEngineering',
				duration: 45,
				tech: 'Engineering',
				method: 'engineeringDone'
			});
		});
	},
	engineeringDone: function() {
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchEngineeringDone.php'
		}).done(function(data) {
			my.tech.engineering = 1;
			research.report(data, "Engineering");
		})
	},
	rocketry: function(){
		if (my.production < 200) return;
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchRocketry.php'
		}).done(function(data) {
			setProduction(data);
			animate.research({
				element: 'researchRocketry',
				duration: 40,
				tech: 'Rocketry',
				method: 'rocketryDone'
			});
		});
	},
	rocketryDone: function() {
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchRocketryDone.php'
		}).done(function(data) {
			my.tech.rocketry = 1;
			research.report(data, "Rocketry");
		})
	},
	atomicTheory: function(){
		if (my.production < 500) return;
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchAtomicTheory.php'
		}).done(function(data) {
			setProduction(data);
			animate.research({
				element: 'researchAtomicTheory',
				duration: 60,
				tech: 'Atomic Theory',
				method: 'atomicTheoryDone'
			});
		});
	},
	atomicTheoryDone: function() {
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchAtomicTheoryDone.php'
		}).done(function(data) {
			my.tech.atomicTheory = 1;
			research.report(data, "Atomic Theory");
		})
	},
	futureTech: function(){
		if (my.production < 800) return;
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchFutureTech.php'
		}).done(function(data) {
			setProduction(data);
			animate.research({
				element: 'researchFutureTech',
				duration: 90,
				tech: 'Future Tech',
				method: 'futureTechDone'
			});
		});
	},
	futureTechDone: function() {
		$.ajax({
			type: 'GET',
			url: app.url + 'php/researchFutureTechDone.php'
		}).done(function(data) {
			research.report(data, "Future Tech");
		})
	},
	report: function(data, tech){
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