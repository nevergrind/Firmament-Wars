// game.js
audio.play("ReturnOfTheFallen", 1);
audio.load.title();

function updateTileInfo(tileId){
	function defMsg(){
		var d = t.defense;
		if (!d){
			return 'Build structures to boost tile defense';
		} else {
			var x = '+' + d + ' tile defense:<br>';
			if (t.capital){
				x += 'Palace<br>';
				if (t.defense >= 2){
					x += 'Bunker<br>';
				}
				if (t.defense >= 3){
					x += 'Wall';
				}
			} else {
				if (t.defense >= 1){
					x += 'Bunker<br>';
				}
				if (t.defense >= 2){
					x += 'Wall';
				}
			}
			return x;
		}
	}
	var t = game.tiles[tileId],
		flag = "",
		nation = "",
		account = "",
		name = t.name;
	if (t.player === 0){
		flag = "Player0.jpg";
		if (t.units > 0){
			nation = "Barbarian Tribe";
		} else {
			nation = "";
			flag = "blank.png";
			name = '???';
		}
	} else {
		if (t.flag === "Default.jpg"){
			flag = "Player" + t.player + ".jpg";
		} else {
			flag = t.flag;
		}
		nation = t.nation;
		account = t.account;
	}
	
	var str = 
		'<div id="tileInfo" class="shadow4">';
		str += 
			'<span class="fwTooltip" data-toggle="tooltip" title="' + t.food + ' food in ' + name + '"> <i class="food glyphicon glyphicon-apple" ></i> ' + t.food + '</span> \
			<span class="fwTooltip" data-toggle="tooltip" title="' + t.culture + ' culture in ' + name + '"><i class="culture fa fa-flag" data-toggle="tooltip"></i> ' + t.culture + '</span>\
			<span class="fwTooltip" data-toggle="tooltip" title="' + defMsg() + '"><i class="glyphicon glyphicon-tower manpower" data-toggle="tooltip"></i> ' + t.defense + '</span>\
		</div>'+
		'<img src="images/flags/' + flag + '" class="p' + t.player + 'b w100 block center">\
		<div id="nation-ui" class="shadow4">';
			if (t.capital){
				str += 
				'<span id="tile-name" class="no-select text-center shadow4 fwTooltip" data-toggle="tooltip" title="Capital Palace<br> Boosts tile defense">\
					<i class="fa fa-fort-awesome text-warning shadow4"></i>\
				</span> ';
			}
			str += nation + '</div>';
	DOM.target.innerHTML = str;
	var defWord = ['Bunker', 'Wall', 'Fortress'],
		defCost = [80, 225, 450],
		ind = t.defense - (t.capital ? 1 : 0);
	if (ind > 2){
		DOM.upgradeTileDefense.style.display = 'none';
		DOM.upgradeTileComplete.style.display = 'block';
	} else {
		DOM.upgradeTileDefense.style.display = 'block';
		DOM.upgradeTileComplete.style.display = 'none';
		DOM.buildWord.textContent = defWord[ind];
		DOM.buildCost.textContent = defCost[ind];
	}
	
	$('.fwTooltip').tooltip({
		html: true
	});
	// actions panel
	setActionButtons(t);
}
function showTarget(e, hover){
	if (typeof e === 'object' && e.id !== undefined){
		var tileId = e.id.slice(4)*1;
		// console.info('tileId: ', tileId);
		var d = game.tiles[tileId];
		if (!hover){
			my.tgt = tileId;
		}
		// animate targetLine
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
							// " Q " + my.targetLine[2] +" "+ (my.targetLine[3] + 150) + " " 
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
		updateTileInfo(tileId);
	} else {
		my.attackOn = false;
	}
}
function setActionButtons(t){
	DOM.tileName.textContent = !t.flag ? '???' : t.name;
	my.player === t.player ? DOM.tileActions.style.display = 'block' : DOM.tileActions.style.display = 'none';
	action.toggleMenu(true);
}
function setTileUnits(i, unitColor){
	var e = document.getElementById('unit' + i);
	e.textContent = game.tiles[i].units === 0 ? "" : game.tiles[i].units;
	TweenMax.to(e, .5, {
		startAt: {
			transformOrigin: (game.tiles[i].units.length * 3) + ' 12',
			scale: unitColor !== '#00ff00' ? 1 : 2,
			fill: unitColor
		},
		scale: 1,
		fill: "#ffffff"
	});
}

function getGameState(){
	// add function to get player data list?
	(function repeat(){
		var lag = Date.now();
		var repeatDelay = 2500;
		if (!g.over){
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
							var box = e1.getBBox();
							if (d.units){
								animate.explosion(box, false);
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
					}
					if (updateTargetStatus){
						showTarget(document.getElementById('land' + i));
					}
				}
				// report chat messages
				var len = data.chat.length;
				if (len > 0){
					for (var i=0; i<len; i++){
						var z = data.chat[i];
						if (z.message){
							chat(z.message);
						}
						if (!z.event){
							// nothing
						} else if (z.event === 'chatsfx'){
							// chat events that get a sfx
							audio.play('chat');
						} else if (z.event.indexOf('food') === 0){
							if (z.event.indexOf(my.account) > -1){
								audio.play('food');
							}
						} else if (z.event === 'upgrade'){
							// fetch updated tile defense data
							updateTileDefense();
						} else if (z.event.indexOf('artillery') === 0){
							var a = z.event.split('|');
							var tile = a[1];
							var account = a[2];
							if (my.account !== account){
								var e2 = document.getElementById('land' + tile),
									box = e2.getBBox();
								animate.artillery(box, false);
							}
						} else if (z.event.indexOf('missile') === 0){
							var a = z.event.split('|');
							var tile = a[1];
							var account = a[2];
							if (my.account !== account){
								var e2 = document.getElementById('land' + tile),
									box = e2.getBBox();
								animate.missile(box, false);
							}
						} else if (z.event.indexOf('nuke') === 0){
							console.warn("NUKE EVENT");
							var a = z.event.split('|');
							var tile = a[1];
							var account = a[2];
							var e2 = document.getElementById('land' + tile),
								box = e2.getBBox();
							setTimeout(function(){
								animate.nuke(box, true);
							}, 7000);
						}
					}
				}
				// check eliminated players; remove from panel
				(function(p, len){
					for (var i=0; i<len; i++){
						if (p[i].account){
							if (!data.player[i]){
								game.player[i].account = '';
								console.info('players: ', $(".diplomacyPlayers").length);
								if ($(".alive").length > 1){
									$("#diplomacyPlayer" + i).removeClass('alive');
									TweenMax.to('#diplomacyPlayer' + i, 1, {
										autoAlpha: 0
									});
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
				serverError();
			}).always(function(data){
				setTimeout(repeat, repeatDelay);
			});
		}
	})();
	
	(function(){
		setInterval(function(){
			if (!g.over){
				$.ajax({
					type: "GET",
					url: "php/updateResources.php"
				}).done(function(data){
					console.info('resource: ', data);
					setResources(data);
					if (data.cultureMsg !== undefined){
						if (data.cultureMsg){
							chat(data.cultureMsg);
							audio.play('culture');
						}
					}
				}).fail(function(data){
					console.info(data.responseText);
					serverError();
				});
			}
		}, 5000);
	})();
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
			'<div id="endWar">'+
				'<div class="modalBtnChild">Concede Defeat</div>'+
			'</div>';
			triggerEndGame(msg);
			audio.play('shotgun2');
		}
	}).fail(function(data){
		serverError();
	});
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
			'<div id="endWar">'+
				'<div class="modalBtnChild">Cease Fire</div>'+
			'</div>';
			triggerEndGame(msg);
			audio.play('shotgun2');
		} else if (data.gameDone){
			var msg = 
			'<p>Congratulations!</p>'+
			'<div>Your campaign for global domination has succeeded!</div>'+
			'<div id="endWar">'+
				'<div class="modalBtnChild">Victory</div>'+
			'</div>';
			triggerEndGame(msg);
			audio.play('mine4');
		}
	}).fail(function(data){
		serverError();
	});
}
function updateTileDefense(){
	$.ajax({
		type: "GET",
		url: "php/updateTileDefense.php"
	}).done(function(data){
		for (var i=0, len=data.length; i<len; i++){
			var d = data[i];
			game.tiles[i].defense = d.defense;
		}
	});
}
function triggerEndGame(msg){
	$("*").off('click mousedown keydown keup keypress')
	g.over = 1;
	setTimeout(function(){
		var e = document.getElementById('victoryScreen');
		e.innerHTML = msg;
		e.style.display = 'block';
		$("#endWar").on('mousedown', function(e){
			if (e.which === 1){
				location.reload();
			}
		});
	}, 2500);
}