var ai = {
	structureDefense: [0, 5, 15, 30],
	scoreTargetAttack: function(o){
		var score = 50;
		// score player
		if (!g.teamMode){
			if (o.defender === 0){
				// barb/empty
				score += 10;
			} else if (o.attacker !== o.defender){
				// another player
				score += 25;
			} else {
				// mine
				score -= 10;
			}
		} else {
			// 
			if (o.defender === 0){
				// barb/empty
				score += 10;
			} else if (game.player[o.attacker].team !== game.player[o.defender].team){
				// enemy
				score += 25;
			} else if (o.attacker === o.defender){
				// mine
				score -= 5;
			} else {
				// ally
				score -= 25;
			}
		}
		// defense
		if (o.attacker !== o.defender){
			score += o.unitDiff;
			/*
			if (o.unitDiff > 20){
				score += 20;
			} else if (o.unitDiff > 5){
				score += 10;
			} else if (o.unitDiff > -5){
				score -= 10;
			} else {
				score -= 20;
			}
			*/
			score -= ai.structureDefense[o.defense];
			score -= o.capital ? 10 : 0;
			// food
			score += ~~((o.food) + Math.random()*10 - 5);
		}
		return score;
	},
	getAttackTarget: function(player){
		var atkTile = -1,
			defTile = -1,
			maxScore = 0;
		
		game.tiles.forEach(function(d, index){
			if (d.player === player && d.units >= 5){
				// cpu's tile
				d.adj.forEach(function(defender){
					var z = game.tiles[defender];
					var score = ai.scoreTargetAttack({
						attacker: player,
						defender: z.player,
						attackerUnits: d.units,
						unitDiff: (d.units - z.units),
						defense: z.defense,
						food: z.food,
						production: z.production,
						culture: z.culture,
						capital: z.capital
					});
					if (score > maxScore){
						maxScore = score;
						atkTile = index;
						defTile = defender;
					}
				});
			}
		});
		//console.info("ATTACKING FROM: ", atkTile, defTile, maxScore);
		return [atkTile, defTile, maxScore];
	},
	scoreTargetWeapon: function(o){
		var score = 50;
		// score player
		if (!g.teamMode){
			if (o.defender === 0){
				// barb/empty
				score += 10;
			} else if (o.attacker !== o.defender){
				// another player
				score += 25;
			} else {
				// mine
				score -= 10;
			}
		} else {
			// 
			if (o.defender === 0){
				// barb/empty
				score -= 10;
			} else if (game.player[o.attacker].team !== game.player[o.defender].team){
				// enemy
				score += 30;
			} else if (o.attacker === o.defender){
				// mine
				score -= 5;
			} else {
				// ally
				score -= 25;
			}
		}
		// defense
		if (o.attacker !== o.defender){
			score -= o.unitDiff;
			// food
			score += ~~((o.food) + Math.random()*10 - 5);
		}
		return score;
	},
	getWeaponTarget: function(player){
		var atkTile = -1,
			defTile = -1,
			maxScore = 0;
		
		game.tiles.forEach(function(d, index){
			if (d.player === player){
				// cpu's tile
				d.adj.forEach(function(defender){
					var z = game.tiles[defender];
					var score = ai.scoreTargetWeapon({
						attacker: player,
						defender: z.player,
						attackerUnits: d.units,
						unitDiff: (d.units - z.units),
						defense: z.defense,
						food: z.food,
						production: z.production,
						culture: z.culture,
						capital: z.capital
					});
					if (score > maxScore){
						maxScore = score;
						atkTile = index;
						defTile = defender;
					}
				});
			}
		});
		//console.info("ATTACKING FROM: ", atkTile, defTile, maxScore);
		return [atkTile, defTile, maxScore];
	},
	getRangedWeaponTarget: function(player){
		var atkTile = -1,
			defTile = -1,
			maxScore = 0;
		
		game.tiles.forEach(function(tile, index){
			if (tile.player !== player){
				var score = 50;
				score += tile.units;
				score += tile.defense * 20;
				if (tile.capital){
					score += 5;
				}
				if (!tile.player){
					score = 0;
				}
				if (score > maxScore){
					maxScore = score;
					defTile = index;
				}
			} else {
				atkTile = index;
			}
		});
		//console.info("ATTACKING FROM: ", atkTile, defTile, maxScore);
		return [atkTile, defTile, maxScore];
	},
	attack: function(d){
		var tiles = ai.getAttackTarget(d.player);
		if (tiles[0] > -1){
			$.ajax({
				url: app.url + 'php/attack-ai.php',
				data: {
					attacker: tiles[0],
					defender: tiles[1],
					player: d.player,
					randomTile: action.getRandomDemocracyTile(tiles[1], game.tiles[tiles[1]].player),
					defGovernment: game.player[game.tiles[tiles[1]].player].government
				}
			});
		}
	},
	getRandomTile: function(player){
		var a = [],
			i = 0;
		game.tiles.forEach(function(d, index){
			if (d.player === player && d.units < 255){
				a[i++] = index;
			}
		});
		var randVal = ~~(Math.random() * i);
		return a[randVal];
	},
	scoreTargetDeploy: function(o){
		var score = 50;
		if (!o.player){
			// barb/empty
			score += 10;
		} else if (!o.sameTeam){
			// enemy player
			score += 25;
			// where are units needed?
			if (o.player && !o.unitDiff){
				score += o.unitDiff * -1;
			}
		} else if (o.sameTeam){
			// my tile
			score -= 10;
		}
		// food
		score += ~~(Math.random()*6 - 3);
		return score;
	},
	getDeployTarget: function(cpuPlayer){
		var tile = -1,
			maxScore = 0;
		
		game.tiles.forEach(function(d, index){
			var cpuUnits = game.tiles[index].units,
				score = 0,
				adjTiles = 0;
			//console.info(index, d.player === cpuPlayer, d.units, d.flag);
			if (d.player === cpuPlayer && d.units < 255 && d.flag){
				// cpu's tile
				// less than 255
				// not a barb or empty
				d.adj.forEach(function(defender){
					adjTiles++;
					var z = game.tiles[defender];
					z.sameTeam = cpuPlayer === z.player;
					z.unitDiff = cpuUnits - z.units;
					score += ai.scoreTargetDeploy(z);
				});
				var sum = ~~(score/adjTiles);
				if (sum > maxScore){
					maxScore = sum;
					tile = index;
				}
			}
		});
		// console.info('DEPLOYING TO: ', game.tiles[tile].name, maxScore);
		return tile;
	},
	getDefenseTarget: function(player){
		var tile = -1,
			maxScore = 0;
		
		game.tiles.forEach(function(d, index){
			var score = 0;
			//console.info(index, d.player === cpuPlayer, d.units, d.flag);
			if (d.player === player && d.units < 255 && d.flag){
				// cpu's tile
				// less than 255
				// not a barb or empty
				score += d.units;
				score += ( (3 - d.defense) * 10);
				if (score > maxScore){
					maxScore = score;
					tile = index;
				}
			}
		});
		//console.info('DEPLOYING TO: ', tile);
		return tile;
	},
	deploy: function(d, o){ 
		var tile = ai.getDeployTarget(d.player);
		if (tile !== undefined){
			$.ajax({
				url: app.url + 'php/deploy-ai.php',
				data: {
					tile: tile,
					food: o.food
				}
			});
		}
	},
	getResourceTotal: function(player){
		var o = {
			food: 0,
			production: 0,
			culture: 0
		}
		game.tiles.forEach(function(tile){
			if (player === tile.player){
				o.food += tile.food;
				o.production += tile.production;
				o.culture += tile.culture;
			}
		}); 
		return o;
	},
	weaponDelay: function(){
		return Math.random()*4000 + 1000;
	},
	fireCannons: function(d){
		var tiles = ai.getWeaponTarget(d.player);
		if (tiles[0] > -1){
			$.ajax({
				url: app.url + 'php/ai-fireCannons.php',
				data: {
					attacker: tiles[0],
					defender: tiles[1]
				}
			});
		}
	},
	launchMissile: function(d){
		var tiles = ai.getRangedWeaponTarget(d.player);
		if (tiles[0] > -1){
			$.ajax({
				url: app.url + 'php/ai-launchMissile.php',
				data: {
					attacker: tiles[0],
					defender: tiles[1]
				}
			}).done(function(){
				setTimeout(function(){
					$.ajax({
						url: app.url + 'php/ai-launchMissileHit.php',
						data: {
							account: d.account,
							attacker: tiles[0],
							defender: tiles[1]
						}
					});
				}, 1000);
			});
		}
	},
	launchNuke: function(d){
		var tiles = ai.getRangedWeaponTarget(d.player);
		if (tiles[0] > -1){
			$.ajax({
				url: app.url + 'php/ai-launchNuke.php',
				data: {
					attacker: tiles[0],
					defender: tiles[1]
				}
			}).done(function(){
				setTimeout(function(){
					$.ajax({
						url: app.url + 'php/ai-launchNukeHit.php',
						data: {
							account: d.account,
							defender: tiles[1]
						}
					});
				}, 6000);
			});
		}
	},
	upgradeTileDefense: function(d){
		var tile = ai.getDefenseTarget(d.player);
		if (tile > -1){
			$.ajax({
				url: app.url + 'php/ai-upgradeTileDefense.php',
				data: {
					target: tile,
					account: d.account
				}
			});
		}
	},
	deployRate: {
		VeryEasy: 6, 
		Easy: 5,
		Normal: 4,
		Hard: 4,
		VeryHard: 3,
		Mania: 2,
		Juggernaut: 1
	},
	deployFood: {
		VeryEasy: 50, 
		Easy: 40,
		Normal: 30,
		Hard: 22,
		VeryHard: 15,
		Mania: 10,
		Juggernaut: 5
	},
	attackFood: {
		VeryEasy: 40,
		Easy: 30,
		Normal: 50,
		Hard: 40,
		VeryHard: 30,
		Mania: 20,
		Juggernaut: 10
	},
	attackMax: {
		VeryEasy: 2,
		Easy: 3,
		Normal: 3,
		Hard: 4,
		VeryHard: 5,
		Mania: 6,
		Juggernaut: 8
	},
	attackBaseTurns: {
		VeryEasy: 0, 
		Easy: 0,
		Normal: 1,
		Hard: 1,
		VeryHard: 1,
		Mania: 2,
		Juggernaut: 3
	},
	unlockNuke: {
		VeryEasy: 250, 
		Easy: 150,
		Normal: 100,
		Hard: 90,
		VeryHard: 80,
		Mania: 60,
		Juggernaut: 20
	},
	unlockMissile: {
		VeryEasy: 100, 
		Easy: 65,
		Normal: 50,
		Hard: 40,
		VeryHard: 30,
		Mania: 20,
		Juggernaut: 10
	},
	unlockCannons: {
		VeryEasy: 50, 
		Easy: 30,
		Normal: 20,
		Hard: 15,
		VeryHard: 10,
		Mania: 5,
		Juggernaut: 0
	},
	missileRate: {
		VeryEasy: .875, 
		Easy: .75,
		Normal: .66,
		Hard: .6,
		VeryHard: .5,
		Mania: .33,
		Juggernaut: 0
	},
	cannonRate: {
		VeryEasy: .75, 
		Easy: .66,
		Normal: .5,
		Hard: .35,
		VeryHard: .2,
		Mania: .1,
		Juggernaut: 0
	},
	unlockStructures: {
		VeryEasy: 30, 
		Easy: 20,
		Normal: 10,
		Hard: 8,
		VeryHard: 5,
		Mania: 2,
		Juggernaut: 0
	},
	updateResources: function(o, player){
		$.ajax({
			url: app.url + 'php/ai-updateResources.php',
			data: {
				player: player,
				moves: (4 + ~~(o.food / 50)), 
				food: o.food,
				production: o.production,
				culture: o.culture
			}
		});
	},
	takeTurn: function(d){
		var o = ai.getResourceTotal(d.player);
		// deploy
		ai.updateResources(o, d.player);
		if (g.resourceTick % ai.deployRate[d.difficultyShort] === 0){
			ai.deploy(d, o); 
			// bonus deploy
			var len = ~~(o.food / ai.deployFood[d.difficultyShort]);
			if (len > 3){
				len = 3;
			}
			for (var i=0; i<len; i++){
				ai.deploy(d, o);
			}
		}
		// attack
		var turns = Math.ceil(o.food / ai.attackFood[d.difficultyShort]) + ai.attackBaseTurns[d.difficultyShort];
		if (turns > ai.attackMax[d.difficultyShort]){
			turns = ai.attackMax[d.difficultyShort];
		}
		for (var i=0; i<turns; i++){
			(function(delay, d){
				setTimeout(function(){
					ai.attack(d); 
				}, ((delay * 500) + 500) );
			})(i, d);
		}
		var usingNuke = 0;
		if (g.resourceTick > ai.unlockNuke[d.difficultyShort]){
			if (Math.random() > .95){
				usingNuke = 1;
				setTimeout(function(){
					ai.launchNuke(d);
				}, ai.weaponDelay());
			}
		}
		if (!usingNuke){
			if (g.resourceTick > ai.unlockMissile[d.difficultyShort]){
				if (Math.random() > ai.missileRate[d.difficultyShort]){
					var len = Math.ceil(o.food / 60);
					for (var i=0; i<len; i++){
						setTimeout(function(){
							ai.launchMissile(d);
						}, ai.weaponDelay());
					}
				}
			} else if (g.resourceTick > ai.unlockCannons[d.difficultyShort]){
				if (Math.random() > ai.cannonRate[d.difficultyShort]){
					var len = Math.ceil(o.food / 30);
					for (var i=0; i<len; i++){
						setTimeout(function(){
							ai.fireCannons(d);
						}, ai.weaponDelay());
					}
				}
			}
		}
		// defense
		if (g.resourceTick > ai.unlockStructures[d.difficultyShort]){
			if (Math.random() > .875){
				setTimeout(function(){
					ai.upgradeTileDefense(d);
				}, ai.weaponDelay());
			}
		}
	}
};