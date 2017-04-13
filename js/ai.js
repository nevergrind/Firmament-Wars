var ai = {
	scoreTargetAttack: function(o){
		if (o.attackerUnits < 4){
			return 0;
		} 
		var score = 50;
		// score units
		if (o.unitDiff > 25){
			score += 20;
		} else if (o.unitDiff > 10){
			score += 10;
		} else if (o.unitDiff > 5){
			score += 5;
		} else if (o.unitDiff < 0){
			score -= 20;
		}
		// score player
		if (!g.teamMode){
			if (o.defender === 0){
				score += 10;
			} else if (o.attacker !== o.defender){
				score += 5;
			} else {
				score -= 10;
			}
		} else {
			// 
			if (o.defender === 0){
				// barb/empty
				score += 30;
			} else if (game.player[o.attacker].team !== game.player[o.defender].team){
				// enemy
				score += 25;
			} else if (o.attacker === o.defender){
				// mine
				score -= 5;
			} else {
				// ally
				score -= 15;
			}
		}
		// defense
		if (!o.defense){
			score += 25;
		} else if (o.defense === 1){
			score += 15;
		} else if (o.defense === 2){
			score += 5;
		}
		// food
		score += ~~((o.food * 2) + (o.production * 2) + o.culture + Math.random()*10 - 5);
		return score;
	},
	getTarget: function(player){
		var atkTile = -1,
			defTile = -1,
			maxScore = 0;
		
		game.tiles.forEach(function(d, index){
			var cpuUnits = game.tiles[index].units
			if (d.player === player){
				// cpu's tile
				d.adj.forEach(function(defender){
					var z = game.tiles[defender];
					var o = {
						attacker: player,
						defender: z.player,
						attackerUnits: cpuUnits,
						unitDiff: (cpuUnits - z.units),
						defense: z.defense,
						food: z.food,
						production: z.production,
						culture: z.culture
					};
					var score = ai.scoreTargetAttack(o);
					if (score > maxScore){
						maxScore = score;
						atkTile = index;
						defTile = defender;
					}
				});
			}
		});
		return [atkTile, defTile, maxScore];
	},
	attack: function(d){
		var tiles = ai.getTarget(d.player);
		if (tiles[0] > -1){
			$.ajax({
				url: 'php/attack-ai.php',
				data: {
					attacker: tiles[0],
					defender: tiles[1]
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
		if (o.sameTeam){
			
			score += 25;
		}
		// score units
		if (o.unitDiff < 25){
			score += 20;
		} else if (o.unitDiff < 10){
			score += 10;
		} else if (o.unitDiff > 5){
			score += 5;
		} else if (o.unitDiff > 0){
			score -= 10;
		}
		// food
		score += ~~(Math.random()*10 - 5);
		return score;
	},
	getDeployTarget: function(player){
		var tile = -1,
			maxScore = 0;
		
		game.tiles.forEach(function(d, index){
			var cpuUnits = game.tiles[index].units,
				score = 0,
				loops = 0;
			if (d.player === player && d.units < 255 && d.flag){
				// cpu's tile
				
				d.adj.forEach(function(defender){
					var z = game.tiles[defender];
					var o = {
						sameTeam: player === z.player,
						attackerUnits: cpuUnits,
						unitDiff: (cpuUnits - z.units)
					};
					score += ai.scoreTargetDeploy(o);
				});
			}
			loops++;
			var tempScore = ~~(score/loops);
			if (tempScore > maxScore){
				maxScore = tempScore;
				tile = index;
			}
		});
		return tile;
	},
	deploy: function(d, food){
		var tile = ai.getDeployTarget(d.player);
		if (tile !== undefined){
			$.ajax({
				url: 'php/deploy-ai.php',
				data: {
					tile: tile,
					food: food
				}
			});
		}
	},
	getFoodTotal: function(player){
		var sum = 0;
		game.tiles.forEach(function(tile){
			if (player === tile.player){
				sum += tile.food;
			}
		});
		return sum;
	}
};