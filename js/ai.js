var ai = {
	structureDefense: [1, 1.5, 2, 2.5, 3],
	scoreTargetAttack: function(o){
		// should AI attack this adjacent target?
		var score = 50;
		// score player
		if (!g.teamMode){
			if (o.defender === 0){
				// barb/empty
				score += 50;
			} else if (o.attacker !== o.defender){
				// another player
				score += 25;
			} else {
				// mine
				score -= 10;
			}
			if (o.defender === ui.currentLoser && ui.currentLoser !== o.attacker) {
				score += 250;
			}
		}
		else {
			//
			if (game.player[o.attacker].team === game.player[o.defender].team) {
				score -= 25;
			}
			else {
				if (!o.defenderUnits) {
					// empty
					score += 50;
				}
				else if (o.defender === 0){
					// barb
					score += 10;
				}
				else if (o.attacker === o.defender){
					// mine
					score -= 5;
				}
				if (o.defender === ui.currentLoser && ui.currentLoser !== o.attacker) {
					score += 250;
				}
			}
		}
		// defense
		if (o.attacker !== o.defender){
			score -= o.defenderUnits * (ai.structureDefense[o.defense + o.capital]);
			// food
			score += ~~((o.food) + Math.random() * 10 - 5);
		}
		return score;
	},
	getAttackTarget: function(player){
		var atkTile = -1,
			defTile = -1,
			maxScore = 0;
		
		game.tiles.forEach(function(d, index){
			if (d.player === player && d.units >= 5){
				var tileScore = 0;

				if (d.capital) {
					tileScore -= 20;
				}
				// cpu's tile
				d.adj.forEach(function(defender){
					var z = game.tiles[defender];
					var score = ai.scoreTargetAttack({
						attacker: player,
						defender: z.player,
						attackerUnits: d.units,
						defenderUnits: z.units,
						unitDiff: (d.units - z.units),
						defense: z.defense,
						food: z.food,
						production: z.production,
						culture: z.culture,
						capital: z.capital
					});
					if (z.player === ui.currentLoser && ui.currentLoser !== player) {
						// try to eliminate last place player
						score += 250;
					}
					if (tileScore + score > maxScore){
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
		}
		else {
			if (game.player[o.attacker].team === game.player[o.defender].team) {
				score -= 25;
			}
			else {
				if (o.defender === 0){
					// barb/empty
					score -= 10;
				} else if (game.player[o.attacker].team !== game.player[o.defender].team){
					// enemy
					score += 30;
				} else if (o.attacker === o.defender){
					// mine
					score -= 5;
				}
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
				if (g.teamMode && game.player[tile.player].team === game.player[player].team) {
					score -= 25;
				}
				else {
					score += tile.units;
					score += tile.defense * 20;
					if (tile.capital){
						score += 5;
					}
					if (!tile.player){
						score = 0;
					}
				}
				if (score > maxScore){
					maxScore = score;
					defTile = index;
				}
			}
			else {
				atkTile = index;
			}
		});
		//console.info("ATTACKING FROM: ", atkTile, defTile, maxScore);
		return [atkTile, defTile, maxScore];
	},
	attack: function(i, d, o){
		var tiles = ai.getAttackTarget(d.player);
		if (tiles[0] > -1){
			var obj = {
				loop: i,
				attacker: tiles[0],
				defender: tiles[1],
				player: d.player,
				dBonus: game.player[game.tiles[tiles[1]].player].dBonus,
				defGovernment: game.player[game.tiles[tiles[1]].player].government
			};
			if (i === 0) {
				obj = Object.assign({
					moves: (4 + ~~(o.food / 50)),
					food: o.food,
					production: o.production,
					culture: o.culture
				}, obj);
			}
			if (o.deployTile > -1) {
				obj = Object.assign({
					deployTile: o.deployTile,
					newUnits: o.newUnits,
				}, obj);
			}
			if (game.tiles[obj.attacker].adj.indexOf(obj.defender) === -1){
				console.warn("Uh oh! AI chose a territory that is not adjacent!");
			}
			else {
				// console.info('ai-update: ', obj);
				$.ajax({
					url: app.url + 'php/attack-ai.php',
					data: obj
				});
			}

		}
		else {
			console.warn("Failed to attack! Deploying...");
			var tile = ai.getDeployTarget(d.player);
			$.ajax({
				url: app.url + 'php/deploy-ai.php',
				data: {
					newUnits: 5,
					deployTile: tile
				}
			});
		}
	},
	scoreTargetDeploy: function(o){
		var score = 50;
		if (!o.player){
			// barb/empty
			score += 20;
		}
		else if (!o.sameTeam){
			// enemy player - try to get him!
			score += 10;
			// where are units needed?
			if (o.player && !o.unitDiff){
				score += o.unitDiff * -1;
			}
		}
		else if (o.sameTeam){
			// my tile - don't care about this dude!
			score -= 10;
		}
		if (o.player === ui.currentLoser) {
			score += 150;
		}
		// food
		score += ~~(Math.random()*6 - 3);
		return score;
	},
	getDeployTarget: function(cpuPlayer){
		var tile = -1,
			cpuTeam = g.team ? game.player[cpuPlayer].team : 0,
			maxScore = 0;
		
		game.tiles.forEach(function(d, index){
			var cpuUnits = game.tiles[index].units,
				score = 0,
				tileScore = 0,
				adjTiles = 0,
				tileDefense = d.defense + d.capital;
			//console.info(index, d.player === cpuPlayer, d.units, d.flag);
			if (d.player === cpuPlayer && d.units < 65535 && d.flag){
				// cpu's tile
				// less than 65535
				// not a barb or empty
				// original tile
				if (d.capital && cpuUnits < 24) {
					tileScore += 20;
				}
				d.adj.forEach(function(defender){
					adjTiles++;
					var z = game.tiles[defender];
					z.sameTeam = g.teamMode ?
						cpuTeam === game.player[z.player].team : cpuPlayer === z.player;
					z.unitDiff = cpuUnits - z.units;
					z.cpuUnits = cpuUnits;
					z.tileDefense = tileDefense;
					score += ai.scoreTargetDeploy(z);
				});
				var sum = tileScore + ~~(score/adjTiles);
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
			if (d.player === player && d.units < 65535 && d.flag){
				// cpu's tile
				// less than 65535
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
	getDeployData: function(d, o, multiplier){
		if (multiplier) {
			o.food *= multiplier;
		}
		var newUnits = Math.ceil((o.food / 12) + (g.resourceTick / 5) + 2);
		//console.info('AI.DEPLOY', multiplier, newUnits);
		var deployObj = {
			deployTile: ai.getDeployTarget(d.player),
			newUnits: newUnits
		};
		return deployObj;
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
		return Math.random() * 11000 + 1000;
	},
	attackDelay: function(loop, d) {
		// ensures a clean stagger of CPU turns
		var divTurn = (g.speed*1000) / ai.attackMax[d.difficultyShort],
			t = loop * divTurn + ( loop * ((divTurn - 500) / 8) ) + ((d.player/8) * divTurn);
		return t;
	},
	fireCannons: function(d){
		var tiles = ai.getWeaponTarget(d.player);
		if (tiles[0] > -1){
			if (game.tiles[tiles[0]].adj.indexOf(tiles[1]) === -1){
				action.targetNotAdjacent('You can only attack adjacent territories.', attacker);
				return;
			}
			$.ajax({
				url: app.url + 'php/ai-fireCannons.php',
				data: {
					attacker: tiles[0],
					defender: tiles[1],
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
					defender: tiles[1],
				}
			}).done(function(){
				setTimeout(function(){
					$.ajax({
						url: app.url + 'php/ai-launchMissileHit.php',
						data: {
							attackPlayer: d.player,
							// account: d.account,
							defender: tiles[1],
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
					defender: tiles[1],
				}
			}).done(function(){
				setTimeout(function(){
					$.ajax({
						url: app.url + 'php/ai-launchNukeHit.php',
						data: {
							attackPlayer: d.player,
							account: d.account,
							defender: tiles[1],
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
					player: d.player,
					account: d.account
				}
			});
		}
	},
	// 1 mod this
	deployRate: {
		VeryEasy: 6, 
		Easy: 5,
		Normal: 4,
		Hard: 4,
		VeryHard: 3,
		Mania: 2,
		Juggernaut: 1
	},
	// bonus deploy for this amount of food
	deployFood: {
		VeryEasy: 50, 
		Easy: 40,
		Normal: 30,
		Hard: 25,
		VeryHard: 20,
		Mania: 15,
		Juggernaut: 10
	},
	// number of bonus attacks
	attackFood: {
		VeryEasy: 40,
		Easy: 30,
		Normal: 50,
		Hard: 40,
		VeryHard: 30,
		Mania: 20,
		Juggernaut: 10
	},
	// max attack/CPU
	attackMax: {
		VeryEasy: 2,
		Easy: 2,
		Normal: 2,
		Hard: 3,
		VeryHard: 4,
		Mania: 5,
		Juggernaut: 6
	},
	// guaranteed attacks
	attackBaseTurns: {
		VeryEasy: 1,
		Easy: 1,
		Normal: 2,
		Hard: 2,
		VeryHard: 2,
		Mania: 3,
		Juggernaut: 4
	},
	unlockNuke: {
		VeryEasy: 250, 
		Easy: 150,
		Normal: 100,
		Hard: 90,
		VeryHard: 80,
		Mania: 50,
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
		VeryEasy: 1,
		Easy: .95,
		Normal: .9,
		Hard: .85,
		VeryHard: .8,
		Mania: .75,
		Juggernaut: .7
	},
	cannonRate: {
		VeryEasy: .8,
		Easy: .75,
		Normal: .7,
		Hard: .65,
		VeryHard: .6,
		Mania: .55,
		Juggernaut: .5
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
	takeTurn: function(d){
		var o = ai.getResourceTotal(d.player),
			turns = Math.ceil(o.food / ai.attackFood[d.difficultyShort]) + ai.attackBaseTurns[d.difficultyShort];

		if (turns > ai.attackMax[d.difficultyShort]){
			turns = ai.attackMax[d.difficultyShort];
		}
		// console.info('TAKING TURN', d.player, d.account, turns);
		for (var i=0; i<turns; i++){
			(function(i, d){
				setTimeout(function(){
					if (i + 1 === turns &&
						g.resourceTick % ai.deployRate[d.difficultyShort] === 0) {
						// bonus deploy
						var multiplier = ~~(o.food / ai.deployFood[d.difficultyShort]),
							deployObj = ai.getDeployData(d, o, multiplier);
						o = Object.assign(deployObj, o);
					}
					ai.attack(i, d, o);
					// console.info('executing turn: ', d.player, Date.now());
				}, ai.attackDelay(i, d));
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
					// var len = Math.ceil(o.food / 60);
					setTimeout(function(){
						ai.launchMissile(d);
					}, ai.weaponDelay());
				}
			}
			else if (g.resourceTick > ai.unlockCannons[d.difficultyShort]){
				if (Math.random() > ai.cannonRate[d.difficultyShort]){
					/*var len = Math.ceil(o.food / 30);
					for (var i=0; i<len; i++){
					}*/
					setTimeout(function(){
						ai.fireCannons(d);
					}, ai.weaponDelay());
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