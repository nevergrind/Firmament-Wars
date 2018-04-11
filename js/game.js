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
			flag = "Player" + game.player[t.player].playerColor + ".jpg";
			flag = t.flag;
		} else {
			flag = t.flag;
		}
		name = t.name;
		account = t.account;
	}
	if (game.player[t.player].avatar){
		DOM.avatarWrap.style.display = 'table-cell';
		DOM.avatar.src = game.player[t.player].avatar;
	} else {
		DOM.avatarWrap.style.display = 'none';
	}
	if (game.player[t.player].ribbons === undefined){
		DOM.ribbonWrap.style.display = 'none';
	} else {
		DOM.ribbonWrap.style.display = 'table-cell';
		if (game.player[t.player].ribbonArray.length >= 24){
			DOM.ribbonWrap.className = 'tight wideRack';
		} else {
			DOM.ribbonWrap.className = 'tight narrowRack';
		}
	}
	DOM.ribbonWrap.innerHTML = game.player[t.player].ribbons === undefined ? 
		'' : game.player[t.player].ribbons;
	var str = ''
	// tileName and bars
	document.getElementById('ui2-flag').src = 'images/flags/'+ flag;
	var str = '<img class="targetFlag" src="images/flags/' + flag + '"><div id="targetNameSpan" class="nowrap">';
	if (t.capital){
		str += 
		'<span id="tileName" class="no-select fa-stack shadow4" title="Capital Palace Boosts tile defense">\
			<i class="glyphicon glyphicon-star capitalStar"></i>\
		</span> ';
	}
	if (!t.player){
		var foodWidth = 0;
		var cultureWidth = 0;
		var productionWidth = 0;
		var defWidth = 0;
	} else {
		var foodWidth = ~~(((t.food > 8 ? 8 : t.food) / 8) * 99);
		var productionWidth = ~~(((t.production > 8 ? 8 : t.production) / 8) * 99);
		var cultureWidth = ~~(((t.culture > 8 ? 8 : t.culture) / 8) * 99);
		var defWidth = ~~((t.defense / 4) * 99);
	}
	str += name + '</div>\
		<svg id="targetBarsWrap">\
			<line id="targetBarFood" class="targetBars targetBarsFood" opacity="'+ (foodWidth ? 1 : 0) +'" x1="1%" x2="'+ foodWidth +'%" y1="7" y2="7" />\
			<line id="targetBarProduction" class="targetBars targetBarsProduction" opacity="'+ (productionWidth ? 1 : 0) +'" x1="1%" x2="'+ productionWidth +'%" y1="16" y2="16" />\
			<line id="targetBarCulture" class="targetBars targetBarsCulture" opacity="'+ (cultureWidth ? 1 : 0) +'"x1="1%" x2="'+ cultureWidth +'%" y1="25" y2="25" />\
			<line id="targetBarDefense" class="targetBars targetBarsDefense" opacity="'+ (defWidth ? 1 : 0) +'"x1="1%" x2="'+ defWidth +'%" y1="34" y2="34" />\
		</svg>';
		
	DOM.targetName.innerHTML = str;
	
	var defWord = ['Bunker', 'Wall', 'Fortress'],
		ind = t.defense - (t.capital ? 1 : 0);
		var defTooltip = [
			'',
			' Walls reduce cannon damage by 50%.',
			' Fortresses reduce cannon damage by 75% and missile damage by 50%.'
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
			.tooltip('hide')
			.tooltip({
				animation: false
			});
	}
	// actions panel
	my.player === t.player ? 
		DOM.tileActionsOverlay.style.display = 'none' : 
		DOM.tileActionsOverlay.style.display = 'block';
	action.setMenu();
}
function showTarget(e, hover, skipOldTgtUpdate){
	if (e.id === undefined){
		e.id = 'land0';
	}
	if (typeof e === 'object'){
		var tileId = e.id.slice(4)*1;
		var d = game.tiles[tileId];
		var cacheOldTgt = my.tgt;
		if (!hover){
			if (cacheOldTgt !== tileId){
				my.tgt = tileId;
				animate.selectTile(cacheOldTgt, tileId);
			}
		}
		// animate targetLine on hover
		if (hover && tileId !== my.tgt){
			my.targetLine[4] = DOM['unit' + tileId].getAttribute('x')*1 - 10;
			my.targetLine[5] = DOM['unit' + tileId].getAttribute('y')*1 - 10;
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
			
			TweenMax.to([DOM.targetLine, DOM.targetLineShadow], .2, {
				startAt: {
					strokeDashoffset: 0
				},
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
	DOM['unit' + i].textContent = game.tiles[i].units === 0 ? "" : ~~game.tiles[i].units;
	if (unitColor === '#00ff00'){
		/*
		TweenMax.to(DOM['unit' + i], .05, {
			startAt: {
				transformOrigin: (game.tiles[i].units.length * 3) + ' 12',
				fill: unitColor
			},
			fill: '#ffffff',
			ease: SteppedEase.config(1),
			repeat: 12,
			yoyo: true
		});
		*/
	} else {
		TweenMax.to(DOM['unit' + i], .5, {
			startAt: {
				fill: '#ff0000'
			},
			ease: Power4.easeIn,
			fill: '#ffffff'
		});
	}
}

function gameDefeat(){
	new Audio('sound/shotgun2.mp3');
	$.ajax({
		type: "GET",
		url: app.url + "php/gameDefeat.php"
	}).done(function(data){
		console.info("DEFEAT: ", data);
		var msg = '';
		if (data.ceaseFire){
			msg = 
			'<p>Armistice!</p>\
			<div>The campaign has been suspended!</div>\
			<div id="ceaseFire" class="endBtn">\
				<div class="modalBtnChild">Cease Fire</div>\
			</div>';
		} else if (data.gameDone){
			msg = 
			'<p>Defeat!</p>\
			<div>Your campaign for world domination has failed!</div>';
			if (g.showSpectateButton){
				msg += 
				'<div id="spectate" class="endBtn">\
					<div class="modalBtnChild">Spectate</div>\
				</div>';
			}
			msg += '<div id="endWar" class="endBtn">\
				<div class="modalBtnChild">Concede Defeat</div>\
			</div>';
		}
		if (msg){
			triggerEndGame(msg);
		}
	}).fail(function(data){
		console.info("FAIL: ", data);
	});
}


function gameVictory(){
	new Audio('sound/sniper0.mp3');
	var count = 0;
	(function repeat(){
		$.ajax({
			type: "GET",
			url: app.url + "php/gameVictory.php"
		}).done(function(data){
			var msg = '';
			console.info('VICTORY: ', data);
			if (data.ceaseFire){
				msg = 
				'<p>Armistice!</p>\
				<div>The campaign has been suspended!</div>\
				<div id="ceaseFire" class="endBtn">\
					<div class="modalBtnChild">Cease Fire</div>\
				</div>';
				audio.play('shotgun2');
			} else if (data.gameDone){
				msg = 
				'<p>Congratulations!</p>\
				<div>Your campaign for global domination has succeeded!</div>\
				<div id="endWar" class="endBtn">\
					<div class="modalBtnChild">Victory</div>\
				</div>';
				g.victory = true;
			}
			if (msg){
				triggerEndGame(msg, 1);
			}
		}).fail(function(data){
			console.info("FAIL: ", data);
			if (++count < 5){
				setTimeout(function(){
					repeat();
				}, 2500);
			}
		});
	})();
}
function triggerEndGame(msg, victory){
	$("*").off('click mousedown keydown keyup keypress');
	$("#chat-input").remove();
	window.onbeforeunload = null;
	setTimeout(function(){
		// allow for last update to occur for spectators
		g.over = 1;
	}, 1500);
	stats.get();
	new Image('images/FlatWorld50-2.jpg');
	setTimeout(function(){
		var e = document.getElementById('victoryScreen');
		e.innerHTML = msg;
		e.style.display = 'block';
		if (victory){
			audio.play('sniper0');
		} else {
			audio.play('shotgun2');
		}
		$("#endWar").on('mousedown', function(e){
			if (e.which === 1){
				$("#endWar").off();
				g.view = 'stats';
				TweenMax.to('#gameWrap', .05, {
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
		$("#spectate").on('click', function(e){
			$("#victoryScreen, #ui2, #resources-ui, #targetWrap").remove();
			document.getElementById('surrender').style.display = "none";
			document.getElementById('exitSpectate').style.display = "inline";
			g.spectateStatus = 1;
		});
		$("#exitSpectate").on('click', function(){
			stats.get();
			TweenMax.to('#diplomacy-ui', 1, {
				alpha: 0,
				onComplete: function(){
					stats.show();
				}
			});
		});
	}, 2500);
}