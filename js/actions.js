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
			my.targetLine[0] = e.getAttribute('x')*1;
			my.targetLine[1] = e.getAttribute('y')*1;
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
			(my.production < 3 && my.splitAttack)
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
			var e1 = document.getElementById('land' + defender),
				box = e1.getBBox();
			animate.missile(box, true);
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
	toggleMenu: function(init){
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
	randomColor: function(){
		var x = ~~(Math.random()*6),
			c = '#ffffff';
		if (x === 0){
			c = '#ffffaa';
		} else if (x === 1){
			c = '#ffddaa';
		} else if (x === 2){
			c = '#ffeedd';
		} else if (x === 3){
			c = '#eeeecc';
		} else if (x === 4){
			c = '#ffbb77';
		}
		return c;
	},
	explosion: function(tile, playSound){
		var e1 = document.getElementById('land' + tile),
			box = e1.getBBox();
		var sfx = ~~(Math.random()*9);
		var delay = [.5, .5, .33, .33, .33, .33, .8, .33, .66, .4];
		if (playSound){
			audio.play('machine' + sfx);
		}
		
		for (var i=0; i<50; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				var x = box.x + (Math.random() * (box.width * .8)) + box.width * .1;
				var y = box.y + (Math.random() * (box.height * .8)) + box.height * .1;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",.01);
				circ.setAttributeNS(null,"fill",'none');
				circ.setAttributeNS(null,"stroke",animate.randomColor());
				circ.setAttributeNS(null,"strokeWidth",'1');
				DOM.world.appendChild(circ);
				
				TweenMax.to(circ, .075, {
					delay: Math.random() * delay[sfx],
					startAt:{
						opacity: 1
					},
					strokeWidth: 5,
					onComplete: function(){
						TweenMax.to(this.target, .125, {
							strokeWidth: 0,
							attr: {
								r: 9
							},
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							}
						});
					}
				});
			})(Math);
		}
	},
	upgrade: function(){
		audio.play('build');
	},
	artillery: function(tile, playSound){
		var e1 = document.getElementById('land' + tile),
			box = e1.getBBox();
		if (playSound){
			var a = [5, 6, 8];
			var sfx = ~~(Math.random() * 3);
			audio.play('grenade' + a[sfx]);
		}
		for (var i=0; i<15; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				var x = box.x + (Math.random() * (box.width * .8)) + box.width * .1;
				var y = box.y + (Math.random() * (box.height * .8)) + box.height * .1;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",.01);
				circ.setAttributeNS(null,"fill",'none');
				circ.setAttributeNS(null,"stroke",animate.randomColor());
				circ.setAttributeNS(null,"strokeWidth",'1');
				circ.setAttributeNS(null,"class","no-point");
				DOM.world.appendChild(circ);
				
				if (Math.random() > .3){
					TweenMax.to(circ, .1, {
						delay: Math.random() * .125,
						startAt:{
							opacity: 1
						},
						strokeWidth: 15,
						onComplete: function(){
							TweenMax.to(this.target, .25, {
								strokeWidth: 0,
								attr: {
									r: 21
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
							fill: animate.randomColor(),
							strokeWidth:0,
							attr: {
								r: 8
							}
						},
						opacity: 0,
						ease: Power1.easeIn,
						onComplete: function(){
							this.target.parentNode.removeChild(this.target);
						}
					});
				}
			})(Math);
		}
	},
	missile: function(tile, playSound){
		if (playSound){
			audio.play('missile7');
		}
		
		(function(Math){
			var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
			var x = box.x + (Math.random() * (box.width * .8)) + box.width * .1;
			var y = box.y + (Math.random() * (box.height * .8)) + box.height * .1;
			circ.setAttributeNS(null,"cx",x);
			circ.setAttributeNS(null,"cy",y);
			circ.setAttributeNS(null,"r",3);
			circ.setAttributeNS(null,"fill",animate.randomColor());
			circ.setAttributeNS(null,"stroke",animate.randomColor());
			circ.setAttributeNS(null,"strokeWidth",'1');
			circ.setAttributeNS(null,"class","no-point");
			DOM.world.appendChild(circ);
			
			TweenMax.to(circ, .1, {
				delay: Math.random() * .125,
				startAt:{
					opacity: 1
				},
				strokeWidth: 15,
				onComplete: function(){
					TweenMax.to(this.target, .25, {
						strokeWidth: 0,
						attr: {
							r: 21
						},
						onComplete: function(){
							this.target.parentNode.removeChild(this.target);
						}
					});
				}
			});
		})(Math);
		
		
	},
	nuke: function(tile){
		var e2 = document.getElementById('land' + tile),
			box = e2.getBBox();
		TweenMax.to('#test', 1, {
			onComplete: function(){
				updateTileDefense();
				audio.play('bomb9');
				TweenMax.fromTo(DOM.screenFlash, 1.5, {
					opacity: 1,
					background: '#ffffff'
				}, {
					opacity: 0,
					background: '#ff8800',
					ease: Expo.easeOut
				});
				
				animate.screenShake(32, 20, .016, true);
				
				var a = [];

				for (var i=1; i<30; i++){
					var x = box.x + box.width/2;
					var y = box.y + box.height/2;
					a[i] = document.createElementNS("http://www.w3.org/2000/svg","circle");
					a[i].setAttributeNS(null,"cx",x);
					a[i].setAttributeNS(null,"cy",y);
					a[i].setAttributeNS(null,"class","no-point");
					if (i === 1){
						DOM.world.appendChild(a[i]);
					} else {
						DOM.world.insertBefore(a[i], a[i-1]);
					}
					if (i % 5 === 0){
						  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
						  svg.setAttributeNS(null, 'height', 256);
						  svg.setAttributeNS(null, 'width', 256);
						  svg.setAttributeNS(null,"x",x-128);
						  svg.setAttributeNS(null,"y",y-128);
						  svg.setAttributeNS(null,"class","no-point");
						  svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/smoke.png');
						  DOM.world.appendChild(svg);
						  (function(svg){
								TweenMax.to(svg, 8, {
									startAt: {
										transformOrigin: '50% 50%',
										opacity: .5,
										scale: 0
									},
									opacity: 0,
									rotation: Math.random()*360-180,
									scale: 2,
									ease: Expo.easeOut,
									onComplete: function(){
										this.target.parentNode.removeChild(this.target);
									}
								});
						  })(svg);
					}
					(function(i){
						TweenMax.to(a[i], 1.5, {
							startAt: {
								opacity: .8,
								strokeWidth: i/2,
								fill: '#ffffff',
								stroke: '#ffffff',
								attr: {
									r: i*1 + 20
								}
							},
							attr: {
							  r: i*2 + 20
							},
							fill: '#ffdd88',
							fillOpacity: .5,
							stroke: '#ff8800',
							opacity: .125, 
							strokeWidth: i,
							onComplete: function(){
								TweenMax.to(a[i], 8, {
									transformOrigin: '50% 50%',
									scale: 1.2,
									fill: '#aaaaaa',
									stroke: '#dddddd',
									opacity: 0,
									ease: Expo.easeOut,
									onComplete: function(){
										this.target.parentNode.removeChild(this.target);
									}
									
								});
							}
						});
					})(i);
				}
			}
		});
		
	},
	screenShake: function(count, d, interval, fade){
		// number of shakes, distance of shaking, interval of shakes
		var foo=0;
		var M = Math;
		(function doit(count,d,interval){
			var d2 = d/2;
			if (fade){
				if (foo % 2 === 0){
					d--;
					if (d < 2){
						d = 2;
					}
				}
			}
			TweenMax.to(DOM.world, interval, {
				x: ~~(M.random()*(d)-d2),
				y: ~~(M.random()*(d)-d2),
				onComplete:function(){
					TweenMax.to(DOM.world, interval, {
						x: ~~(M.random()*(d)-d2),
						y: ~~(M.random()*(d)-d2),
						onComplete:function(){
							TweenMax.to(DOM.world, interval, {
								x: ~~(M.random()*(d)-d2),
								y: ~~(M.random()*(d)-d2),
								onComplete:function(){
									TweenMax.to(DOM.world, interval,{
										x: 0,
										y: 0,
										onComplete: function(){
											foo++;
											if(foo < count){ 
												doit(count,d,interval); 
											}
										}
									});
								}
							});
						}
					});
				}
			});
		})(count,d,interval);
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
}).on('mousedown', '#gotoBuild, #gotoCommand', function(e){
	if (e.which === 1){
		action.toggleMenu();
	}
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
						var o = new Target({
							cost: 60,
							minimum: 0,
							attackName: 'artillery',
							hudMsg: 'Fire Artillery'
						});
						action.target(o);
					} else if (x === 67){
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