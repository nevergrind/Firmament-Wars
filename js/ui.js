// ui.js

var ui = {
	setMobile: function(){
		 $("head").append('<style>'+
			'*{ box-shadow: none !important; border-radius: 0 !important; } '+
			'.fw-primary{ background: #04061a; border: 1px solid #357; } '+
			'#titleChatPlayers,#statWrap, #joinGameLobby{ background: rgba(0,12,32,1); } '+
			'#refreshGameWrap{ background: none; } '+
			'#hud{ top: 40px; }'+
			'#diplomacy-ui, #ui2{ top: .25vh; }'+
			'#resources-ui{ bottom: .5vh; }'+
			'#lobbyLeftCol, #lobbyRightCol{ top: 1vh; }'+
			'#chat-ui{ bottom: 4vh; }'+
			'#refreshGameWrap{ height: 64vh; }'+
			/*'.titlePanelLeft{ height: 80vh; } '+
			'#chat-input{ bottom: 3vh; }'+
			'#titleMenu, #titleChat{ bottom: 7vh; } '+*/
			'.lobbyButtons, .fwDropdown, .govDropdown{ font-size: 1.25em; }'+
			'#target-ui, #targetLineShadow, .chat-img{ display: none; }'+
			'.chat-hidden{ color: #fff; }'+
		'</style>');
	},
	setWorkSafe: function(){
		 $("head").append('<style>'+
			'.chat-img{ display: none; } '+
			'#statQuote{ visibility: hidden; } '+
		'</style>');
	},
	click: isMobile ? 'mousedown' : 'click',
	delay: function(d){
		return isMobile ? 0 : d;
	},
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
				my.targetLine[2] = (my.targetLine[0] + my.targetLine[4]) / 2;
				my.targetLine[3] = ((my.targetLine[1] + my.targetLine[5]) / 2) - 100;
				TweenMax.set(DOM.targetLineShadow, {
					visibility: 'visible',
					attr: {
						d: "M " + my.targetLine[0] +","+ my.targetLine[1] + " "
								+ my.targetLine[4] +","+ my.targetLine[5]
					}
				});
				if (!isMobile){
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
				}
				// crosshair game.tiles[tileId].player === my.player ? '#aa0000' : '#00cc00',
				if (!isMobile){
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
    isMobile = checkMobile(),
    isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
    isFirefox = typeof InstallTrigger !== 'undefined',
    isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
    isChrome = !!window.chrome && !isOpera,
    isMSIE = /*@cc_on!@*/ false,
    isMSIE11 = !!navigator.userAgent.match(/Trident\/7\./);
// browser dependent
(function(){
	var x = localStorage.getItem('isMobile');
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
	if (isMobile || location.hash === '#mobiletest'){
		ui.setMobile();
	}
	if (location.hash === '#synergist' || location.hash === '#sfw'){
		ui.setWorkSafe();
	}
	localStorage.setItem('isMobile', isMobile);
	setTimeout(function(){
		$("script").remove();
	}, 1000);
})();

function resizeWindow() {
	function forceMod4(x){
		while (x % 4 !== 0) x--;
		return x;
	}
    var winWidth = window.innerWidth,
		winHeight = window.innerHeight
		b = document.getElementById('body');
	if (isMobile){
		winHeight = ~~(winHeight * 1.1);
	}
    // game ratio
    var widthToHeight = window.innerWidth / window.innerHeight;
    // current window size
    var w = winWidth > window.innerWidth ? window.innerWidth : winWidth;
    var h = winHeight > window.innerHeight ? window.innerHeight : winHeight;
    if(w / h > widthToHeight){
    	// too tall
    	w = ~~(h * widthToHeight);
    } else {
    	// too wide
    	h = ~~(w / widthToHeight);
    }
	w = forceMod4(w);
	h = forceMod4(h);
	b.style.width = w + 'px';
	b.style.height = h + 'px';
	TweenMax.set(b, {
		x: ~~(w/2 + ((winWidth - w) / 2)),
		y: ~~(h/2 + ((winHeight - h) / 2)),
		opacity: 1,
		visibility: 'visible',
		yPercent: -50,
		xPercent: -50,
		force3D: true
	});
	g.resizeX = w / window.innerWidth;
	g.resizeY = h / window.innerHeight;
	TweenMax.set("#worldTitle", {
		xPercent: -50,
		yPercent: -50
	});
	if (g.view === 'game'){
		g.screen.resizeMap();
		if (typeof worldMap[0] !== 'undefined'){
			worldMap[0].applyBounds();
		}
	}
};

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
	if (!isMobile){
		// avatar
		if (game.player[t.player].avatar){
			DOM.avatarWrap.style.display = 'table-cell';
			DOM.avatar.src = game.player[t.player].avatar;
		} else {
			DOM.avatarWrap.style.display = 'none';
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
		t.food + '<i class="fa fa-apple food"></i> '+
		t.production + '<i class="fa fa-gavel production "></i> '+
		(t.culture ? t.culture + '<i class="fa fa-flag culture"></i> ' : '')+
		(t.defense ? t.defense + '<i class="fa fa-fort-awesome manpower"></i>' : '');
		DOM.targetCapStar.style.display = t.capital ? 'inline' : 'none';
		DOM.targetNameWrap.innerHTML = name;
		DOM.targetResources.innerHTML = resources;
		DOM.targetFlag.src = 'images/flags/' + flag;
	}
	
	var defWord = ['Bunker', 'Wall', 'Fortress'],
		defBonus = [5, 15, 30],
		ind = t.defense - (t.capital ? 1 : 0);
		var defTooltip = [
			'reduce weapon damage by 1',
			'reduce weapon damage by 3',
			'reduce weapon damage by 6'
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
		if (!isMobile && isLoggedIn){
			var tooltip = defWord[ind] + 's boost tile defense +'+ defBonus[ind] +' and ' + defTooltip[ind];
			$('#upgradeTileDefense')
				.attr('title', tooltip)
				.tooltip('fixTitle')
				.tooltip('hide')
				.tooltip({
					animation: false
				});
		}
	}
	// actions panel
	my.player === t.player ? 
		DOM.tileActionsOverlay.style.display = 'none' : 
		DOM.tileActionsOverlay.style.display = 'none';
	action.setMenu();
};
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
		TweenMax.to(DOM['unit' + i], ui.delay(.5), {
			startAt: {
				fill: '#ff0000'
			},
			ease: Power4.easeIn,
			fill: '#ffffff'
		});
	}
};

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
};


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
};
function triggerEndGame(msg, victory){
	$("*").off('click mousedown keydown keyup keypress');
	g.gameDuration = ~~((Date.now()- ((sessionStorage.getItem('gameDuration') * 1))) / 1000);
	$("#chat-input-open, #chat-input-wrap").remove();
	window.onbeforeunload = null;
	setTimeout(function(){
		// allow for last update to occur for spectators
		g.over = 1;
	}, 1500);
	stats.get();
	if (!isMSIE && !isMSIE11 && !isMobile){
		new Image('images/FlatWorld50-2.jpg');
	}
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
						$("#diplomacy-ui, #ui2, #resources-ui, #chat-input-open, #chat-ui, #chat-input-wrap, #hud, #worldWrap, #victoryScreen").remove();
						stats.show();
					}
				});
			}
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