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
		'<img src="images/flags/' + flag + '" class="w100 block center">';
	
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

function gameDefeat(){
	new Audio('sound/shotgun2.mp3');
	$.ajax({
		type: "GET",
		url: "php/gameDefeat.php" 
	}).done(function(data){
		console.info('defeat: ', data);
		if (data.ceaseFire){
			var msg = 
			'<p>Armistice!</p>\
			<div>The campaign has been suspended!</div>\
			<div id="ceaseFire" class="endBtn">\
				<div class="modalBtnChild">Cease Fire</div>\
			</div>';
		} else if (data.gameDone){
			var msg = 
			'<p>Defeat!</p>\
			<div>Your campaign for world domination has failed!</div>\
			<div id="endWar" class="endBtn">\
				<div class="modalBtnChild">Concede Defeat</div>\
			</div>';
			if (!g.done){
				msg += '<div id="spectate" class="endBtn">\
					<div class="modalBtnChild">Spectate</div>\
				</div>';
			}
		}
		audio.play('shotgun2');
		triggerEndGame(msg);
	}).fail(function(data){
		serverError(data);
	});
}


function gameVictory(){
	new Audio('sound/shotgun2.mp3');
	new Audio('sound/mine4.mp3');
	$.ajax({
		type: "GET",
		url: "php/gameVictory.php"
	}).done(function(data){
		console.info('defeat: ', data);
		if (data.ceaseFire){
			var msg = 
			'<p>Armistice!</p>\
			<div>The campaign has been suspended!</div>\
			<div id="ceaseFire" class="endBtn">\
				<div class="modalBtnChild">Cease Fire</div>\
			</div>';
			audio.play('shotgun2');
		} else if (data.gameDone){
			var msg = 
			'<p>Congratulations!</p>\
			<div>Your campaign for global domination has succeeded!</div>\
			<div id="endWar" class="endBtn">\
				<div class="modalBtnChild">Victory</div>\
			</div>';
			audio.play('mine4');
			g.victory = true;
		}
		triggerEndGame(msg);
	}).fail(function(data){
		serverError(data);
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
	stats.get();
	new Image('images/FlatWorld60.jpg');
	setTimeout(function(){
		var e = document.getElementById('victoryScreen');
		e.innerHTML = msg;
		e.style.display = 'block';
		$("#endWar").on('mousedown', function(e){
			if (e.which === 1){
				$("#endWar").off();
				g.view = 'stats';
				TweenMax.to('#gameWrap', .2, {
					alpha: 0,
					onComplete: function(){ 
						$("#diplomacy-ui, #ui2, #resources-ui, #chat-ui, #chat-input, #hud, #worldWrap, #victoryScreen").remove();
						stats.show();
					}
				});
			}
		});
		$("#ceaseFire").on('click', function(){
			location.reload();
		});
		$("#spectate").on('mousedown', function(e){
			if (e.which === 1){
				$("#victoryScreen, #ui2, #resources-ui").remove();
			}
		});
	}, 2500);
}