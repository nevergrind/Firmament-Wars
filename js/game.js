// game.js
function updateTileInfo(tileId){
	var t = game.tiles[tileId],
		flag = "Default.jpg",
		name = t.name,
		account = "",
		name = t.name;
	if (t.player === 0){
		flag = "Player0.jpg";
		if (t.units > 0){
			name = "Barbarian Tribe";
		} else {
			name = "Uninhabited";
			flag = "Default.jpg";
		}
	} else {
		if (t.flag === "Default.jpg"){
			flag = "Player" + t.player + ".jpg";
		} else {
			flag = t.flag;
		}
		name = t.name;
		account = t.account;
	}
	
	var str = ''
	DOM.targetFlag.innerHTML = 
		'<img src="images/flags/' + flag + '" class="p' + t.player + 'b w100 block center">';
	
	var str = '';
	if (t.capital){
		str += 
		'<span id="tileName" class="no-select fa-stack" data-toggle="tooltip" title="Capital Palace<br> Boosts tile defense">\
			<i class="glyphicon glyphicon-star capitalStar"></i>\
		</span> ';
	}
	if (!t.player){
		var foodWidth = 0;
		var cultureWidth = 0;
		var defWidth = 0;
	} else {
		var foodWidth = ((t.food > 8 ? 8 : t.food) / 8) * 100;
		var cultureWidth = ((t.culture > 8 ? 8 : t.culture) / 8) * 100;
		var defWidth = (t.defense / 4) * 100;
	}
	console.info(foodWidth, cultureWidth);
	str += name + '</div>\
		<div class="targetBarsWrap">\
			<hr class="targetBarsFood" style="width: ' + foodWidth + '%"/>\
			<hr class="targetBarsFood" style="width: ' + foodWidth + '%"/>\
		</div>\
		<div class="targetBarsWrap"">\
			<hr class="targetBarsCulture" style="width: ' + cultureWidth + '%"/>\
			<hr class="targetBarsCulture" style="width: ' + cultureWidth + '%"/>\
		</div>\
		<div class="targetBarsWrap"">\
			<hr class="targetBarsDefense" style="width: ' + defWidth + '%"/>\
			<hr class="targetBarsDefense" style="width: ' + defWidth + '%"/>\
		</div>';
		
	DOM.targetName.innerHTML = str;
	
	var defWord = ['Bunker', 'Wall', 'Fortress'],
		ind = t.defense - (t.capital ? 1 : 0);
		var defTooltip = [
			'',
			' Walls reduce cannon damage by 50% and cannot be flipped by Revolutionaries.',
			' Fortresses reduce cannon damage by 75%, missile damage by 50%, and cannot be flipped by Revolutionaries.'
		];
	if (ind > 2){
		DOM.upgradeTileDefense.style.display = 'none';
	} else {
		DOM.upgradeTileDefense.style.display = 'block';
		DOM.buildWord.textContent = defWord[ind];
		DOM.buildCost.textContent = g.upgradeCost[ind] * my.buildCost;
		if (ind === 2){
			defWord[2] = 'Fortresse';
		}
		var tooltip = defWord[ind] + 's upgrade the defense of a territory.' + defTooltip[ind];
		$('#upgradeTileDefense')
			.attr('title', tooltip)
			.tooltip('fixTitle')
			.tooltip('hide');
	}
	// actions panel
	my.player === t.player ? 
		DOM.tileActions.style.display = 'block' : 
		DOM.tileActions.style.display = 'none';
	action.setMenu();
}
function showTarget(e, hover, skipOldTgtUpdate){
	if (e.id === undefined){
		e.id = 'land0';
	}
	if (typeof e === 'object'){
		var tileId = e.id.slice(4)*1;
		// console.info('tileId: ', tileId);
		var d = game.tiles[tileId];
		var cacheOldTgt = my.tgt;
		if (!hover){
			if (cacheOldTgt !== tileId){
				my.tgt = tileId;
				animate.glowTile(cacheOldTgt, tileId);
			}
		}
		// animate targetLine on hover
		if (hover && tileId !== my.tgt){
			var e = document.getElementById('unit' + tileId);
			my.targetLine[4] = e.getAttribute('x')*1 - 10;
			my.targetLine[5] = e.getAttribute('y')*1 - 10;
			my.targetLine[2] = (my.targetLine[0] + my.targetLine[4]) / 2;
			my.targetLine[3] = ((my.targetLine[1] + my.targetLine[5]) / 2) - 100;
			TweenMax.set(DOM.targetLineShadow, {
				visibility: 'visible',
				attr: {
					d: "M " + my.targetLine[0] +","+ my.targetLine[1] + " "
							+ my.targetLine[4] +","+ my.targetLine[5]
				}
			});
			TweenMax.set(DOM.targetLine, {
				visibility: 'visible',
				attr: {
					d: "M " + my.targetLine[0] +","+ my.targetLine[1] + 
						" Q " + my.targetLine[2] +" "+ my.targetLine[3] + " " 
						+ my.targetLine[4] +" "+ my.targetLine[5]
				}
			});
			
			TweenMax.fromTo([DOM.targetLine, DOM.targetLineShadow], .2, {
				strokeDashoffset: 0
			}, {
				strokeDashoffset: -12,
				repeat: -1,
				ease: Linear.easeNone
			});
			// crosshair game.tiles[tileId].player === my.player ? '#aa0000' : '#00cc00',
			TweenMax.set(DOM.targetCrosshair, {
				fill: '#00dd00',
				visibility: 'visible',
				x: my.targetLine[4] - 255,
				y: my.targetLine[5] - 257,
				transformOrigin: '50% 50%'
			})
			TweenMax.fromTo(DOM.targetCrosshair, .2, {
				scale: .1
			}, {
				repeat: -1,
				yoyo: true,
				scale: .08
			});
		}
		// tile data
		if (!skipOldTgtUpdate){
			my.lastTgt = cacheOldTgt;
		}
		updateTileInfo(tileId);
		my.flashTile(tileId);
	} else {
		my.attackOn = false;
		my.attackName = '';
	}
}
function setTileUnits(i, unitColor){
	var e = document.getElementById('unit' + i);
	e.textContent = game.tiles[i].units === 0 ? "" : ~~game.tiles[i].units;
	if (unitColor === '#00ff00'){
		TweenMax.to(e, .05, {
			startAt: {
				transformOrigin: (game.tiles[i].units.length * 3) + ' 12',
				fill: unitColor
			},
			fill: '#ffffff',
			ease: SteppedEase.config(1),
			repeat: 12,
			yoyo: true
		});
	} else {
		TweenMax.to(e, .5, {
			startAt: {
				fill: '#ff0000'
			},
			ease: Power2.easeIn,
			fill: '#ffffff'
		});
	}
}

function getGameState(){
	// add function to get player data list?
	(function repeat(){
		var lag = Date.now();
		var repeatDelay = 2500;
		if (!g.done){
			$.ajax({
				type: "GET",
				url: "php/getGameState.php"
			}).done(function(data){
				// console.info('server lag: ' + (Date.now() - lag), data.delay, data);
				var start = Date.now();
				repeatDelay = data.timeout;
				var tiles = data.tiles;
				// get tile data
				for (var i=0, len=tiles.length; i<len; i++){
					var d = data.tiles[i],
						updateTargetStatus = false;
					// check player value
					if (d.player !== game.tiles[i].player){
						// set text visible if uninhabited
						if (!game.tiles[i].units){
							TweenMax.set(document.getElementById('unit' + i), {
								visibility: 'visible'
							});
						}
						// only update client data if there's a difference
						game.tiles[i].player = d.player;
						game.tiles[i].account = game.player[d.player].account;
						game.tiles[i].nation = game.player[d.player].nation;
						game.tiles[i].flag = game.player[d.player].flag;
						var e1 = document.getElementById('land' + i);
						if (my.tgt === i){
							// attacker won 
							updateTargetStatus = true;
						}
						var newFlag = !game.player[d.player].flag ? 'blank.png' : game.player[d.player].flag;
						var e5 = document.getElementById('flag' + i);
						if (e5 !== null){
							e5.href.baseVal = "images/flags/" + newFlag;
						}
						TweenMax.set(e1, {
							fill: color[d.player]
						});
						// animate other players' attacks
						if (d.player !== my.player && game.tiles[i].units){
							if (d.units){
								animate.gunfire(i, false);
							}
						}
					}
					// check unit value
					if (d.units !== game.tiles[i].units){
						var unitColor = d.units > game.tiles[i].units ? '#00ff00' : '#ff0000';
						game.tiles[i].units = d.units;
						if (my.tgt === i){
							// defender won
							updateTargetStatus = true;
						}
						setTileUnits(i, unitColor);
						if (d.player){
							TweenMax.to(".mapBars" + i, 1, {
								opacity: 1,
								ease: Linear.easeNone
							});
						}
					}
					if (updateTargetStatus){
						showTarget(document.getElementById('land' + i));
						game.updateTopTile(i);
					}
				}
				// report chat messages
				var len = data.chat.length;
				if (len > 0){
					for (var i=0; i<len; i++){
						var z = data.chat[i],
							evt = z.event;
							
						if (z.message){
							console.warn(evt, evt.length, my.player + '');
							if (evt.length === 1){
								if (evt === my.player + ''){
									game.chat(z.message);
								}
							} else {
								game.chat(z.message);
							}
						}
						if (!evt){
							// nothing
						} else if (evt === 'chatsfx'){
							// chat events that get a sfx
							audio.play('chat');
						} else if (evt.indexOf('food') === 0){
							if (evt.indexOf(my.account) > -1){
								audio.play('food');
							}
						} else if (evt.indexOf('upgrade') === 0){
							var a = evt.split('|'),
								tile = a[1];
							// fetch updated tile defense data
							updateTileDefense(tile);
							animate.upgrade(tile);
						} else if (evt.indexOf('cannons') === 0){
							var a = evt.split('|'),
								tile = a[1],
								account = a[2];
							if (my.account !== account){
								animate.cannons(tile, false);
							}
						} else if (evt.indexOf('missile') === 0){
							var a = evt.split('|'),
								attacker = a[1],
								defender = a[2],
								account = a[3];
							animate.missile(attacker, defender, true);
						} else if (evt.indexOf('nuke') === 0){
							audio.play('warning');
							var a = z.event.split('|'),
								tile = a[1];
							(function(tile){
								setTimeout(function(){
									animate.nuke(tile);
								}, 5000);
							})(tile);
						} else if (evt.indexOf('revolution') === 0){
							audio.play('sniper0');
						}
					}
				}
				// check eliminated players; remove from panel
				(function(p, len){
					for (var i=0; i<len; i++){
						if (p[i].account){
							if (!data.player[i]){
								game.player[i].account = '';
								if ($(".alive").length > 1){
									$("#diplomacyPlayer" + i).removeClass('alive');
									var playerLen = $(".alive").length;
									if (playerLen < 2){
										g.done = 1;
									}
									(function(i){
										TweenMax.to('#diplomacyPlayer' + i, 1, {
											autoAlpha: 0,
											onComplete: function(){
												$("#diplomacyPlayer" + i).css('display', 'none');
											}
										});
									})(i);
								}
							}
						}
					}
				})(game.player, game.player.length);
				// remove dead players
				(function(count){
					// game over?
					for (var i=0, len=data.player.length; i<len; i++){
						if (i){
							if (data.player[i]){
								count++;
							}
						}
					}
					if (!g.over){
						if (!data.player[my.player]){
							gameDefeat();
						} else if (count === 1){
							gameVictory();
						}
					}
				})(0);
				// console.info('client lag: ', Date.now() - start);
			}).fail(function(data){
				console.info(data.responseText);
			}).always(function(data){
				setTimeout(repeat, repeatDelay);
			});
		}
	})();
	setTimeout(function(){
		(function repeat(){
			if (!g.over){
				$.ajax({
					type: "GET",
					url: "php/updateResources.php"
				}).done(function(data){
					console.info('resource: ', data);
					setResources(data);
					if (data.cultureMsg !== undefined){
						if (data.cultureMsg){
							game.chat(data.cultureMsg);
							audio.play('culture');
							// recruit bonus changes
							initOffensiveTooltips();
						}
					}
					// filled food bar
					if (data.get !== undefined){
						// was it special?
						if (!data.getBonus){
							// no bonus troops; only broadcast to self
							game.chat(data.get + ': ' + my.nation + ' receives <span class="chat-manpower">' + data.manpowerBonus + '</span> armies!');
						}
					}
				}).fail(function(data){
					console.info(data.responseText);
					serverError(data);
				});
				setTimeout(repeat, 5000); // setInterval preferred with websockets
			}
		})();
	}, 5000);
}
function gameDefeat(){
	new Audio('sound/shotgun2.mp3');
	$.ajax({
		type: "GET",
		url: "php/gameDefeat.php"
	}).done(function(data){
		if (data.gameDone){
			var msg = 
			'<p>Defeat!</p>'+
			'<div>Your campaign for world domination has failed!</div>'+
			'<div id="endWar" class="endBtn">'+
				'<div class="modalBtnChild">Concede Defeat</div>'+
			'</div>';
			if (!g.done){
				msg += '<div id="spectate" class="endBtn">'+
					'<div class="modalBtnChild">Spectate</div>'+
				'</div>';
			}
			triggerEndGame(msg);
			audio.play('shotgun2');
		}
	}).fail(function(data){
		serverError(data);
	});
	g.keepAlive();
}


function gameVictory(){
	new Audio('sound/shotgun2.mp3');
	new Audio('sound/mine4.mp3');
	$.ajax({
		type: "GET",
		url: "php/gameVictory.php"
	}).done(function(data){
		if (data.gameAbandoned){
			var msg = 
			'<p>Armistice!</p>'+
			'<div>The campaign has been suspended!</div>'+
			'<div id="endWar" class="endBtn">'+
				'<div class="modalBtnChild">Cease Fire</div>'+
			'</div>';
			audio.play('shotgun2');
		} else if (data.gameDone){
			var msg = 
			'<p>Congratulations!</p>'+
			'<div>Your campaign for global domination has succeeded!</div>'+
			'<div id="endWar" class="endBtn">'+
				'<div class="modalBtnChild">Victory</div>'+
			'</div>';
			audio.play('mine4');
		}
		triggerEndGame(msg);
	}).fail(function(data){
		serverError(data);
	});
	g.keepAlive();
}
function updateTileDefense(tile){
	$.ajax({
		type: "GET",
		url: "php/updateTileDefense.php"
	}).done(function(data){
		for (var i=0, len=data.length; i<len; i++){
			var d = data[i];
			game.tiles[i].defense = d.defense;
			showTarget(document.getElementById('land' + my.tgt));
		}
		if (tile !== undefined){
			animate.updateMapBars(tile);
		}
	});
}
function triggerEndGame(msg){
	$("*").off('click mousedown keydown keyup keypress');
	$("#chat-input").remove();
	window.onbeforeunload = null;
	setTimeout(function(){
		// allow for last update to occur for spectators
		g.over = 1;
	}, 1500);
	setTimeout(function(){
		var e = document.getElementById('victoryScreen');
		e.innerHTML = msg;
		e.style.display = 'block';
		$("#endWar").on('mousedown', function(e){
			if (e.which === 1){
				location.reload();
			}
		});
		$("#spectate").on('mousedown', function(e){
			if (e.which === 1){
				$("#victoryScreen, #ui2, #resources-ui").remove();
			}
		});
	}, 2500);
}