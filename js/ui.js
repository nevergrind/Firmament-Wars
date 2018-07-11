// ui.js

var ui = {
	defenseBonus: [1, 2, 3],
	defenseReductionAmount: [1, 3, 6],
	cannonDamage: function() {
		var cannonBonus = my.government === 'Monarchy' ? 2 : 0;
		return (2 + my.oBonus + cannonBonus) +'-'+ (4 + my.oBonus + cannonBonus) + lang[my.lang].damage;
	},
	cannonTooltip: function() {
		return lang[my.lang].fireCannons + ui.cannonDamage();
	},
	missileDamage: function() {
		return (7 + (my.oBonus * 2)) +'-'+ (12 + (my.oBonus * 2)) + lang[my.lang].damage;
	},
	missileTooltip: function() {
		return lang[my.lang].launchMissile + ui.missileDamage();
	},
	rushTooltip: function(ind) {
		return lang[my.lang].rush + '('+ ui.cultureBonus() +')';
	},
	defenseTooltip: function(ind) {
		return lang[my.lang].boostsTileDefenses + ui.defenseBonus[ind] + lang[my.lang].reducesWeaponsBy + ui.defenseReductionAmount[ind];
	},
	cultureBonus: function() {
		return (2 + ~~(my.cultureBonus / 50));
	},
	getTeamIcon: function(team) {
		return g.teamMode ? '<span class="diploTeam">'+ team +'</span>' : '';
	},
	updateTileInfo: function(tileId) {
		var t = game.tiles[tileId],
			flag = "blank.png",
			name = t.name;

		if (t.player === 0){
			flag = "Barbarian.jpg";
			if (t.units > 0){
				name = lang[my.lang].barbarianTribe;
			}
			else {
				name = lang[my.lang].uninhabited;
				flag = "blank.png";
			}
		}
		else {
			flag = t.flag;
			name = t.name;
			flag = flag.split('.')[0];
			flag = flag + ui.getFlagExt(flag);
		}
		// tileName and bars
		var o = {
			food: 0,
			culture: 0,
			production: 0,
			defense: 0
		};
		if (t.player){
			o.food = ~~(((t.food > 8 ? 8 : t.food) / 8) * 99);
			o.production = ~~(((t.production > 8 ? 8 : t.production) / 8) * 99);
			o.culture = ~~(((t.culture > 8 ? 8 : t.culture) / 8) * 99);
			o.defense = ~~((t.defense / 4) * 99);
		}
		var resources =
			'<span>' + t.food + '<img src="images/icons/food.png" class="fw-icon-sm"></span>'+
			'<span>' + t.production + '<img src="images/icons/production.png" class="fw-icon-sm"></span>'+
			'<span>' + t.culture + '<img src="images/icons/culture.png" class="fw-icon-sm"></span>'+
			'<span>' + t.defense + '<img src="images/icons/tile-defense.png" class="fw-icon-sm"></span>';
		// DOM.targetCapStar.style.display = t.capital ? 'inline' : 'none';
		DOM.targetNameWrap.innerHTML = name;
		DOM.targetResources.innerHTML = resources;
		DOM.targetFlag.src = 'images/flags/' + flag;


		if (t.player === my.player && my.tech.masonry) {
			var ind = t.defense - (t.capital ? 1 : 0);
			if (ind < 3) {
				// fortress present
				// console.info('buildCost ', ind, g.upgradeCost[ind], my.buildCost, g.upgradeCost[ind]);
				DOM.buildWord.textContent = lang[my.lang].defenseLabel[ind];
				DOM.buildCost.textContent = g.upgradeCost[ind];
				var tooltip = ui.defenseTooltip(ind);
				$('#upgradeTileDefense')
					.attr('title', tooltip)
					.tooltip('fixTitle')
					.tooltip('hide')
					.tooltip({
						animation: false,
						placement: 'bottom',
						container: 'body'
					});
			}
			// actions panel
		}
		action.setBuildButton();
		animate.target();
	},
	getDiploRow: function(p) {
		var account = p.cpu ? lang[my.lang].difficulties[p.difficulty] : p.account,
			icon = lobby.governmentIcon(p),
			color = game.player[p.player].playerColor;

		var str =
		'<div id="diplomacyPlayer' + color + '" class="diplomacyPlayers alive pb'+ color +'">'+
			// bg
			'<div class="diplo-pipe pbar'+ color +'"></div>'+
			'<img src="images/flags/'+ p.flagSrc +'" class="diplo-flag no-select">'+
			// row 1
			'<div class="diplo-data-col"' +
				'<div>'+
					'<div class="nowrap">'+ icon + account +'</div>' +
					'<div class="nowrap">'+ ui.getTeamIcon(p.team) + p.nation + '</div>'+
				'</div>'+
				// row 2
			'</div>' +

		'</div>';
		return str;
	},
	getPlayersByTileRank: function() {
		var arr = [0,0,0,0,0,0,0,0,0];
		game.tiles.forEach(function(t) {
			t.player && arr[t.player]++;
		});
		return arr;
	},
	drawDiplomacyPanel: function() {
		var strArr = [],
			p,
			i = 0,
			len = game.player.length,
			arr = ui.getPlayersByTileRank();

		ui.currentLoser = 99;
		arr.forEach(function(v, loop) {
			if (loop) {
				if (v && v < ui.currentLoser) {
					ui.currentLoser = v;
				}
			}
		});

		for (; i<len; i++){
			p = game.player[i];
			if (p.account && arr[i]){
				p.flagArr = p.flag.split("."),
				p.flagShort = p.flagArr[0],
				p.flagSrc = p.flag;

				while (strArr[arr[i]] !== undefined) {
					arr[i]++;
				}
				strArr[arr[i]] = ui.getDiploRow(p);
			}
		}
		document.getElementById('diplomacy-body').innerHTML = strArr.reverse().join("");
	},
	currentLoser: 0,
	resizeWindow: function() {
		g.view === 'game' && worldMap[0].applyBounds();
		g.screen.resizeMap();
	},
	windowDefault: 'window-full-screen',
	initWindow: function() {
		var size = localStorage.getItem('window-size');
		if (size === null) {
			localStorage.setItem('window-size', ui.windowDefault);
			size = ui.windowDefault;
		}
		ui.setWindow(size);
	},
	setWindow: function(size) {
		if (app.isApp) {
			var gui = require('nw.gui'),
				win = gui.Window.get();
			// ??????? reasons
			setTimeout(function() {
				if (size === 'window-full-screen') {
					!win.isFullscreen && win.enterFullscreen();
				}
				else if (size === 'window-1920-1080') {
					win.isFullscreen && win.leaveFullscreen();
					win.resizeTo(1920, 1080);
					win.maximize();
				}
				else if (size === 'window-1600-900') {
					win.isFullscreen && win.leaveFullscreen();
					win.resizeTo(1600, 900);
				}
				else if (size === 'window-1360-768') {
					win.isFullscreen && win.leaveFullscreen();
					win.resizeTo(1360, 768);
				}
				else if (size === 'window-1280-720') {
					win.isFullscreen && win.leaveFullscreen();
					win.resizeTo(1280, 720);
				}
				else {
					// just in case do this
					size = 'window-full-screen';
					!win.isFullscreen && win.enterFullScreen();
				}
				// always do this
				$("#current-window-size").text(lang[my.lang][g.camel(size)]);
				localStorage.setItem('window-size', size);
			}, 100);
		}
	},
	click: 'click',
	showTarget: function(e, hover, skipOldTgtUpdate){
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
				// draw straight line because it's close?
				var straightLine = "M " + my.targetLine[0] +","+ my.targetLine[1] + " "
								+ my.targetLine[4] +","+ my.targetLine[5],
					totalCoordDiff = 0;
				totalCoordDiff += Math.abs(my.targetLine[0] - my.targetLine[4]);
				totalCoordDiff += Math.abs(my.targetLine[1] - my.targetLine[5]);
				my.targetLine[2] = (my.targetLine[0] + my.targetLine[4]) / 2;
				my.targetLine[3] = ((my.targetLine[1] + my.targetLine[5]) / 2) - 100;
				var arcLine = "M " + my.targetLine[0] +","+ my.targetLine[1] +
							" Q " + my.targetLine[2] +" "+ my.targetLine[3] + " "
							+ my.targetLine[4] +" "+ my.targetLine[5];
				// set path data for shadow
				TweenMax.set(DOM.targetLineShadow, {
					visibility: 'visible',
					attr: {
						d: straightLine
					}
				});
				// set path data for line
				TweenMax.set([DOM.targetLine, DOM.targetLineBorder], {
					visibility: 'visible',
					attr: {
						d: totalCoordDiff > 300 ? arcLine : straightLine
					}
				});
				/*
				TweenMax.to([DOM.targetLine, DOM.targetLineBorder, DOM.targetLineShadow], .5, {
				  	startAt: { drawSVG: '0%' },
				  	drawSVG: '100%'
				});
				 */

				TweenMax.set([DOM.arrowhead, DOM.arrowheadBorder], {
					visibility: 'hidden'
				});
				TweenMax.set(DOM.targetLineBorder, {
					stroke: g.color[game.player[my.player].playerColor]
				});
				TweenMax.to([
					DOM.targetLine,
					DOM.targetLineBorder,
					DOM.targetLineShadow], .2, {
				  	startAt: {
				  		drawSVG: '0%'
					},
				  	drawSVG: '100%',
					onComplete: function() {
						TweenMax.set([DOM.arrowhead, DOM.arrowheadBorder], {
							visibility: 'visible'
						});
						TweenMax.to([DOM.targetLine, DOM.targetLineShadow], .5, {
							startAt: {
								strokeDasharray: '31,1',
								strokeDashoffset: 0,
							},
							strokeDashoffset: -32,
							repeat: -1,
							force3D: true,
							ease: Linear.easeNone
						});
						// fade in the black border
						TweenMax.to(DOM.targetLineBorder, .5, {
							stroke: '#000'
						});
					}
				});
				TweenMax.set(DOM.targetCrosshair, {
					fill: '#00dd00',
					visibility: 'visible',
					x: my.targetLine[4] - 255,
					y: my.targetLine[5] - 257,
					transformOrigin: '50% 50%'
				})
				TweenMax.to(DOM.targetCrosshair, 1, {
					startAt: { scale: .35 },
					force3D: true,
					scale: .175,
					repeat: -1,
					ease: Power4.easeOut
				});
				TweenMax.to(DOM.targetCrosshair, 1, {
					startAt: { opacity: 1 },
					force3D: true,
					opacity: 0,
					repeat: -1,
					ease: Power2.easeIn
				});
			}
			// tile data
			if (!skipOldTgtUpdate){
				my.lastTgt = cacheOldTgt;
			}
			ui.updateTileInfo(tileId);
		} else {
			my.attackOn = false;
			my.attackName = '';
		}
	},
	/*
	targetBars: function(o){
		var spacing = 8;
		var str = 
			'<line class="targetBars targetBarsFood" opacity="'+ (o.food ? 1 : 0) +'" x1="1%" x2="'+ o.food +'%" y1="'+ o.yPos +'" y2="'+ o.yPos +'" />';
			o.yPos += spacing;
			str += '<line class="targetBars targetBarsProduction" opacity="'+ (o.production ? 1 : 0) +'" x1="1%" x2="'+ o.production +'%" y1="'+ o.yPos +'" y2="'+ o.yPos +'" />';
			o.yPos += spacing;
			str += '<line class="targetBars targetBarsCulture" opacity="'+ (o.culture ? 1 : 0) +'"x1="1%" x2="'+ o.culture +'%" y1="'+ o.yPos +'" y2="'+ o.yPos +'" />';
			o.yPos += spacing;
			str += '<line class="targetBars targetBarsDefense" opacity="'+ (o.defense ? 1 : 0) +'"x1="1%" x2="'+ o.defense +'%" y1="'+ o.yPos +'" y2="'+ o.yPos +'" />';
		return str;
	},
	*/
	transformYear: function(tick){
		var foo = tick >= 40 ? ' A.D.' : ' B.C.',
			year = 0;
		if (tick <= 40){
			year = 4000 - (tick * 100);
		} else if (tick <= 60){
			year = 0 + ((tick - 40) * 50);
		} else if (tick <= 80){
			year = 1000 + ((tick - 60) * 25);
		} else if (tick <= 120){
			year = 1500 + ((tick - 80) * 10);
		} else if (tick <= 170){
			year = 1900 + ((tick - 120) * 2);
		} else {
			year = 2000 + ((tick - 170) * 1);
		}
		return year + foo;
	},
	setCurrentYear: function(tick){
		DOM.currentYear.textContent = ui.transformYear(tick);
	},
	setTileUnits: function(i){
		var unitVal = game.tiles[i].capital ?
			'<tspan class="unit-star">\t&#10028;</tspan>' + ~~game.tiles[i].units :
			~~game.tiles[i].units;
		DOM['unit' + i].innerHTML = game.tiles[i].units === 0
			? "" : unitVal;
		TweenMax.to(DOM['unit' + i], .5, {
			startAt: {
				visibility: 'visible',
			},
			opacity: 1,
			ease: Power4.easeIn
		});
		/*ui.setUnitVisibility(i);
		ui.updateAdjacentTileVisibility(i);*/
	},
	updateAdjacentTileVisibility: function(i) {
		/*game.tiles[i].adj.forEach(function(v) {
			var adjacent = game.isMineOrAdjacent(v);
			TweenMax.to(DOM['unit' + v], .5, {
				startAt: {
					visibility: adjacent ? 'visible' : 'hidden'
				},
				opacity: adjacent ? 1 : 0
			});
			game.tiles[v].units & TweenMax.set(DOM['land' + v], {
				filter: adjacent ? '' : 'url(#darken)'
			});
		});*/
	},
	setUnitVisibility: function(i) {
		// player visibility logic
		TweenMax.set(DOM['unit' + i], {
			startAt: {
				fill: '#ffffff',
				visibility: game.tiles[i].units ? 'visible' : 'hidden'
			},
			opacity: 1
		});
		/*
		game.tiles[i].units & TweenMax.set(DOM['land' + i], {
			filter: adjacent ? '' : 'url(#darken)'
		});*/
	},
	pngFlags: ['Ohio', 'Nepal'],
	isFlagPng: function(flag) {
		return this.pngFlags.indexOf(flag) > -1;
	},
	getFlagExt: function(flag) {
		return this.pngFlags.indexOf(flag) > -1 ? '.png' : '.jpg';
	}
};
function checkMobile(){
	var x = false;
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) x = true;
	return x;
};
// browser/environment checks
var isXbox = /Xbox/i.test(navigator.userAgent),
    isPlaystation = navigator.userAgent.toLowerCase().indexOf("playstation") >= 0,
    isNintendo = /Nintendo/i.test(navigator.userAgent),
    isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
    isFirefox = typeof InstallTrigger !== 'undefined',
    isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
    isChrome = !!window.chrome && !isOpera,
    isMSIE = /*@cc_on!@*/ false,
    isMSIE11 = !!navigator.userAgent.match(/Trident\/7\./);
// browser dependent
(function(){
	if (isMSIE || isMSIE11){
		//alert("Firmament Wars does not support Internet Explorer. Consider using Chrome or Firefox for an enjoyable experience.");
		//window.stop();
		if (x === null){
			alert("Oh no! It looks like you're using Internet Explorer! Please consider using Chrome or Firefox for a better experience!");
		}
		$("head").append('<style> text { font-family: Verdana; stroke-width: 0; stroke: #000; fill: #fff; } .unit{ font-size: 26px; } </style>');
	} else if (isSafari){
		//alert("Firmament Wars does not support Safari. Consider using Chrome or Firefox for an enjoyable experience.");
		//window.stop();
		if (x === null){
			alert("Oh no! It looks like you're using Safari! Please consider using Chrome or Firefox for a better experience!");
		}
		$("head").append('<style> text { fill: #ffffff; stroke: none; stroke-width: 0px; } </style>');
	}
	setTimeout(function(){
		$("script").remove();
	}, 1000);
	ui.initWindow();
})();


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
			'<p>'+ lang[my.lang].armistice +'</p>\
			<div>'+ lang[my.lang].gameArmistice +'</div>\
			<div id="ceaseFire" class="endBtn">\
				<div class="modalBtnChild">'+ lang[my.lang].ceaseFire +'</div>\
			</div>';
		}
		else if (data.gameDone){
			msg =
			'<p>'+ lang[my.lang].defeat +'</p>\
			<div>'+ lang[my.lang].gameDefeat +'</div>';
			if (g.showSpectateButton){
				msg +=
				'<div id="spectate" class="endBtn">\
					<div class="modalBtnChild">'+ lang[my.lang].spectate +'</div>\
				</div>';
			}
			msg += '<div id="endWar" class="endBtn">\
				<div class="modalBtnChild">'+ lang[my.lang].concede +'</div>\
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
			type: "POST",
			url: app.url + "php/gameVictory.php",
			data: {
				juggernautValid: action.isJuggernautValid(),
			}
		}).done(function(data){
			var msg = '';
			console.info('VICTORY: ', data);
			if (data.ceaseFire){
				msg =
				'<p>'+ lang[my.lang].armistice +'</p>\
				<div>'+ lang[my.lang].gameArmistice +'</div>\
				<div id="ceaseFire" class="endBtn">\
					<div class="modalBtnChild">'+ lang[my.lang].ceaseFire +'</div>\
				</div>';
				audio.play('shotgun2');
			}
			else if (data.gameDone){
				msg =
				'<p>'+ lang[my.lang].congratulations +'</p>\
				<div>'+ lang[my.lang].gameVictory +'</div>\
				<div id="endWar" class="endBtn">\
					<div class="modalBtnChild">'+ lang[my.lang].victory +'</div>\
				</div>';
				g.victory = true;
			}
			if (msg){
				triggerEndGame(msg, 1);
			}
		}).fail(function(data){
			console.warn(data.responseText);
		});
	})();
}
function triggerEndGame(msg, victory){
	// $("body, #gameWrap").off('click mousedown keydown keyup keypress');
	g.gameDuration = ~~((Date.now()- ((sessionStorage.getItem('gameDuration') * 1))) / 1000);
	$("#chat-input-open, #chat-input-wrap").remove();
	window.onbeforeunload = null;
	setTimeout(function(){
		// allow for last update to occur for spectators
		g.over = 1;
	}, 1500);
	stats.get();
	new Image('images/FlatWorld90.jpg');
	setTimeout(function(){
		var e = document.getElementById('victoryScreen');
		e.innerHTML = msg;
		e.style.display = 'block';
		if (victory){
			audio.play('sniper0');
		} else {
			audio.play('shotgun2');
		}
		$("#endWar").on(ui.click, function(){
			$("#endWar").off();
			g.view = 'stats';
			TweenMax.to('#gameWrap', .05, {
				alpha: 0,
				onComplete: function(){
					$("#ui2-head, #diplomacy-ui, #chat-input-open, #chat-ui, #chat-input-wrap, #hud, #worldWrap, #victoryScreen").remove();
					stats.show();
				}
			});
		});
		$("#ceaseFire").on(ui.click, function(){
			location.reload();
		});
		$("#spectate").on(ui.click, function(e){
			$("#victoryScreen, #ui2, #resourceBody, #targetWrap").remove();
			document.getElementById('surrender').style.display = "none";
			document.getElementById('exitSpectate').style.display = "inline";
			g.spectateStatus = 1;
		});
		$("#exitSpectate").on(ui.click, function(){
			$(this).off(ui.click);
			stats.get();
			TweenMax.to('#diplomacy-ui', 1, {
				alpha: 0,
				onComplete: function(){
					stats.show();
				}
			});
		});
	}, 2500);
};
function testMap() {
	game.tiles.forEach(function(v, i) {
		if (!v.adj.length) {
			TweenMax.set(DOM['land' + i], {
				stroke: "#0f0",
				strokeWidth: 3
			});
		}
	});
	g.map.tileNames.forEach(function(v, i) {
		if (v === 'Nangis') {
			TweenMax.set(DOM['land' + i], {
				stroke: "#0f0",
				strokeWidth: 3
			});
		}
	});
	setTimeout(function() {
		testMap();
	}, 1000);
}
function testNames() {
	g.map.tileNames.forEach(function(v, i) {
		if (v === 'XXXXXXXX') {
			TweenMax.set(DOM['land' + i], {
				stroke: "#0f0",
				strokeWidth: 3
			});
		}
	})
}
