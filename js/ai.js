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
			if (o.unitDiff > 20){
				score += 20;
			} else if (o.unitDiff > 5){
				score += 10;
			} else if (o.unitDiff > -5){
				score -= 10;
			} else {
				score -= 20;
			}
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
			if (o.unitDiff > 20){
				score -= 20;
			} else if (o.unitDiff > 5){
				score -= 10;
			} else if (o.unitDiff > -5){
				score += 10;
			} else {
				score += 20;
			}
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
	attack: function(d){
		var tiles = ai.getAttackTarget(d.player);
		if (tiles[0] > -1){
			$.ajax({
				url: 'php/attack-ai.php',
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
	deploy: function(d, o){
		var tile = ai.getDeployTarget(d.player);
		if (tile !== undefined){
			$.ajax({
				url: 'php/deploy-ai.php',
				data: {
					tile: tile,
					food: o.food,
					production: o.production,
					culture: o.culture
				}
			});
		}
	},
	getFoodTotal: function(player){
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
	fireCannons: function(d){
		var tiles = ai.getWeaponTarget(d.player);
		if (tiles[0] > -1){
			$.ajax({
				url: 'php/ai-fireCannons.php',
				data: {
					attacker: tiles[0],
					defender: tiles[1]
				}
			});
		}
	},
	launchMissile: function(d){
		var tiles = ai.getWeaponTarget(d.player);
		if (tiles[0] > -1){
			$.ajax({
				url: 'php/ai-launchMissile.php',
				data: {
					attacker: tiles[0],
					defender: tiles[1]
				}
			}).done(function(){
				setTimeout(function(){
					$.ajax({
						url: 'php/ai-launchMissileHit.php',
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
	fireNuke: function(d){
	},
	weaponDelay: function(){
		return Math.random()*3000 + 2000;
	},
	takeTurn: function(d){
		var o = ai.getFoodTotal(d.player);
		// deploy
		//console.info(g.resourceTick, mod, g.resourceTick % mod === 0);
		if (g.resourceTick % 4 === 0){
			ai.deploy(d, o); 
			// bonus deploy
			var len = ~~(o.food / 25);
			if (len > 3){
				len = 3;
			}
			for (var i=0; i<len; i++){
				ai.deploy(d, o);
			}
		}
		// attack
		var turns = Math.ceil(o.food / 30) + 1;
		if (turns > 4){
			turns = 4;
		}
		for (var i=0; i<turns; i++){
			(function(delay, d){
				setTimeout(function(){
					ai.attack(d); 
				}, ((delay * 500) + 500) );
			})(i, d);
		}
		if (g.resourceTick > 80){
			
		}
		if (g.resourceTick > 40){
			for (var i=0, len = Math.ceil(o.food / 60); i<len; i++){
				setTimeout(function(){
					ai.launchMissile(d);
				}, ai.weaponDelay());
			}
		} else if (g.resourceTick > 20){
			for (var i=0, len = Math.ceil(o.food / 30); i<len; i++){
				setTimeout(function(){
					ai.fireCannons(d);
				}, ai.weaponDelay());
			}
		}
	}
};