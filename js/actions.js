// actions.js
var action = {
	error: function(){
		Msg("Not enough energy!", 1.5);
		my.clearHud();
		audio.play('error');
	},
	attack: function(skip){
		if (game.tiles[my.tgt].player !== my.player){
			return;
		}
		if (my.attackOn){
			my.attackOn = false;
			my.clearHud();
			return;
		}
		if (my.production < 7){
			action.error();
			return;
		}
		if (game.tiles[my.tgt].units < 2){
			Msg("You need at least two armies to attack!", 1.5);
			my.clearHud();
			return;
		}
		if (my.player === game.tiles[my.tgt].player){
			my.attackOn = true;
			my.splitAttack = false;
			my.hud("Select Target");
			$DOM.head.append('<style>.land{ cursor: crosshair; }</style>');
			
			var e = document.getElementById('unit' + my.tgt);
			my.targetLine[0] = e.getAttribute('x')*1;
			my.targetLine[1] = e.getAttribute('y')*1;
			if(!skip){
				showTarget(my.lastTarget, true);
			}
		}
	},
	splitAttack: function(skip){
		if (game.tiles[my.tgt].player !== my.player){
			return;
		}
		if (my.attackOn){
			my.attackOn = false;
			my.clearHud();
			return;
		}
		if (my.production < 3){
			action.error();
			return;
		}
		if (game.tiles[my.tgt].units < 2){
			Msg("You need at least two armies to split attack!", 1.5);
			my.clearHud();
			return;
		}
		if (my.player === game.tiles[my.tgt].player){
			my.attackOn = true;
			my.splitAttack = true;
			my.hud("Select Target");
			$DOM.head.append('<style>.land{ cursor: crosshair; }</style>');
			
			var e = document.getElementById('unit' + my.tgt);
			my.targetLine[0] = e.getAttribute('x')*1;
			my.targetLine[1] = e.getAttribute('y')*1;
			if(!skip){
				showTarget(my.lastTarget, true);
			}
		}
	},
	attackTile: function(that){
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
			(my.production < 3 && my.splitAttack)
		){
			action.error();
			return;
		}
		g.lock(true);
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
				var e1 = document.getElementById('land' + defender),
					box = e1.getBBox();
				if (!game.tiles[defender].units){
					audio.move();
				} else {
					animate.explosion(box);
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
		// update mouse
		showTarget(that);
		// report attack message
		
		// report battle results
		my.clearHud();
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
			game.tiles[my.tgt].units += deployedUnits;
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
			
			var deployedUnits = 3;
			
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
			cost = [80, 225, 450],
			ind = t.defense - t.capital ? 1 : 0;
		if (t.player !== my.player){
			return;
		}
		if (ind > 2){
			return;
		}
		if (my.production < cost[ind]){
			action.error();
			return;
		}
		
		animate.upgrade();
		
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
	fireArtillery: function(){
		console.info('fire');
	},
	launchMissile: function(){
		console.info('missile');
	},
	launchNuke: function(){
		console.info('nuke');
	},
	toggleMenu: function(init){
		console.info(g.actionMenu);
		if (init || g.actionMenu === 'build'){
			g.actionMenu = 'command';
			DOM.tileCommand.style.display = 'block';
			DOM.tileBuild.style.display = 'none';
		} else {
			g.actionMenu = 'build';
			DOM.tileCommand.style.display = 'none';
			DOM.tileBuild.style.display = 'block';
		}
	}
}

var animate = {
	explosion: function(box){
		/*
		if (box === undefined){
			box = {
				x: 1050,
				y: 200,
				width: 500,
				height: 200
			}
		}
		*/
		function randomColor(){
			var x = ~~(Math.random()*7),
				c = '#ffffff';
			if (x === 0){
				c = '#ffffff';
			} else if (x === 1){
				c = '#ffff88';
			} else if (x === 2){
				c = '#ffff55';
			} else if (x === 3){
				c = '#ffaa55';
			} else if (x === 4){
				c = '#ffdddd';
			} else if (x === 5){
				c = '#dddd88';
			} else {
				c = '#cccccc';
			}
			return c;
		}
		var sfx = ~~(Math.random()*9);
		var delay = [.5, .5, .33, .33, .33, .33, .8, .33, .66, .4];
		
		for (var i=0; i<30; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				var x = box.x + (Math.random() * (box.width * .8)) + box.width * .1;
				var y = box.y + (Math.random() * (box.height * .8)) + box.height * .1;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",.01);
				circ.setAttributeNS(null,"fill","none");
				circ.setAttributeNS(null,"stroke",randomColor());
				circ.setAttributeNS(null,"strokeWidth","0");
				DOM.world.appendChild(circ);
				
				if (Math.random() > .3){
					TweenMax.to(circ, .1, {
						delay: Math.random() * delay[sfx],
						startAt:{
							opacity: 1
						},
						strokeWidth: 15,
						onComplete: function(){
							TweenMax.to(this.target, .25, {
								strokeWidth: 0,
								attr: {
									r: 15
								},
								onComplete: function(){
									this.target.parentNode.removeChild(this.target);
								}
							});
						}
					});
				} else {
					TweenMax.to(circ, Math.random()*.2+.1, {
						startAt: {
							opacity: 1,
							fill: randomColor(),
							strokeWidth:0,
							attr: {
								r: 8
							}
						},
						delay: Math.random() * delay[sfx],
						opacity: 0,
						ease: Power1.easeIn,
						onComplete: function(){
							this.target.parentNode.removeChild(this.target);
						}
					});
				}
			})(Math);
		}
		audio.play('machine' + sfx);
	},
	upgrade: function(){
		audio.play('build');
	},
	artillery: function(){
		audio.play('grenade5');
	},
	missile: function(){
		audio.play('missile7');
	},
	nuke: function(){
		audio.play('bomb7');
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

$("#actions").on("mousedown", '#attack', function(){
	action.attack(true);
}).on('mousedown', '#deploy', function(){
	action.deploy();
}).on('mousedown', '#splitAttack', function(){
	action.splitAttack(true);
}).on('mousedown', '#recruit', function(){
	action.recruit();
}).on('mousedown', '#upgradeTileDefense', function(){
	action.upgradeTileDefense();
}).on('mousedown', '#fireArtillery', function(){
	action.fireArtillery();
}).on('mousedown', '#launchMissile', function(){
	action.launchMissile();
}).on('mousedown', '#launchNuke', function(){
	action.launchNuke();
}).on('mousedown', '#gotoBuild, #gotoCommand', function(){
	action.toggleMenu();
});

$(document).on('keyup', function(e) {
	var x = e.keyCode;
	console.info(x);
	if (g.view === 'title'){
		if (x === 13){
			if (g.focusUpdateNationName){
				$("#submitNationName").trigger("mousedown");
			} else if (g.focusGameName){
				$("#createGame").trigger("mousedown");
			}
		}
	} else if (g.view === 'game'){
		if (g.chatOn){
			if (x === 13){
				// enter - sends chat
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
			} else if (x === 69){
				// e
				action.toggleMenu();
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
						action.attack();
					} else if (x === 83){
						// s
						action.splitAttack();
					} else if (x === 68){
						// d
						action.deploy();
					} else if (x === 82){
						// r
						action.recruit();
					}
				} else {
					if (x === 66){
						// b
						action.upgradeTileDefense();
					} else if (x === 70){
						// f
						action.fireArtillery();
					} else if (x === 67){
						// c
						action.launchMissile();
					} else if (x === 78){
						// n
						action.launchNuke();
					}
				}
			}
		}
	}
});