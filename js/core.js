// core.js
$.ajaxSetup({
	type: 'POST',
	timeout: 4000
});
TweenMax.defaultEase = Quad.easeOut;

var g = {
	focusUpdateNationName: false,
	focusGameName: false,
	view: "title",
	resizeX: 1,
	resizeY: 1,
	sfxFood: false,
	sfxCulture: false,
	chatOn: false,
	overlay: document.getElementById("overlay"),
	over: 0,
	actionMenu: 'command',
	startTime: Date.now(),
	lock: function(clear){
		g.overlay.style.display = "block";
		clear ? g.overlay.style.opacity = 0 : g.overlay.style.opacity = 1;
	},
	unlock: function(clear){
		g.overlay.style.display = "none";
		clear ? g.overlay.style.opacity = 0 : g.overlay.style.opacity = 1;
	},
	TDC: function(){
		return new TweenMax.delayedCall(0, '');
	},
	mouse: {
		mouseZoom: 100,
		mouseTransX: 50,
		mouseTransY: 50,
		mapSizeX: 2000,
		mapSizeY: 1150
	},
	updateUserInfo: function(){
		$.getJSON('https://geoip-db.com/json/geoip.php?jsonp=?') 
		.done (function(location){
			location.latitude += '';
			location.longitude += '';
			g.config.location = location;
			var x = g.config;
			var foo = JSON.stringify(x);
			localStorage.setItem('config', foo);
			$.ajax({
				url: 'php/updateUserInfo.php',
				data: {
					location: g.config.location
				}
			});
		});
	},
	checkPlayerData: function(){
		var config = localStorage.getItem('config');
		if (config !== null){
			var foo = JSON.parse(config);
			g.config.location = foo.location;
			if (g.config.location === undefined){
				g.updateUserInfo();
			}
		}
	},
	config: {
		audio: {
			musicOn: true
		}
	}
}
g.init = (function(){
	console.info("Initializing game...");
	$('[title]').tooltip();
	// build map drop-down 
	var s = "<li><a class='flagSelect' href='#'>Default</a></li>";
	var flagData = {
		Africa: {
			group: "Africa",
			name: ['Algeria', 'Botswana', 'Cameroon', 'Cape Verde', 'Ivory Coast', 'Egypt', 'Ghana', 'Kenya', 'Liberia', 'Morocco', 'Mozambique', 'Namibia', 'Nigeria', 'South Africa', 'Uganda']
		},
		Asia: {
			group: "Asia",
			name: ['Bangladesh', 'Cambodia', 'China', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Japan', 'Malaysia', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Pakistan', 'Philippines', 'Singapore', 'South Korea', 'Sri Lanka', 'Suriname', 'Taiwan', 'Thailand', 'Vietnam']
		},
		Europe: {
			group: "Europe",
			name: ['Albania', 'Austria', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'England', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Lithuania', 'Macedonia', 'Montenegro', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'Scotland', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'United States']
		},
		Eurasia: {
			group: "Eurasia",
			name: ['Armenia', 'Azerbaijan', 'Georgia', 'Kazakhstan', 'Uzbekistan']
		},
		Historic: {
			group: "Historic",
			name: ['Confederate Flag', 'Flanders', 'Gadsden Flag', 'Isle of Man', 'Rising Sun Flag', 'NSDAP Flag', 'Shahanshahi', 'USSR', 'Welsh']
		},
		MiddleEast: {
			group: "Middle East",
			name: ['Israel', 'Jordan', 'Kurdistan', 'Lebanon', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Turkey']
		},
		NorthAmerica: {
			group: "North America",
			name: ['Bahamas', 'Barbados', 'Canada', 'Costa Rica', 'Cuba', 'Haiti', 'Honduras', 'Mexico', 'Saint Lucia', 'Trinidad and Tobago']
		},
		Oceania: {
			group: "Oceania",
			name: ['Australia', 'New Zealand']
		},
		Miscellaneous: {
			group: "Miscellaneous",
			name: ['Anarcho-Capitalist', 'European Union', 'High Energy', 'ISIS', 'Northwest Front', 'Pan-African Flag', 'Rainbow Flag', 'United Nations']
		},
		SouthAmerica: {
			group: "South America",
			name: ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela']
		},
	}
	for (x in flagData){
		s += "<li class='dropdown-header'>" + flagData[x].group + "</li>";
		flagData[x].name.forEach(function(e){
			s += "<li><a class='flagSelect' href='#'>" + e + "</a></li>";
		});
	}
	document.getElementById("flagDropdown").innerHTML = s;
	g.lock();
	function showTitleScreen(){
		document.getElementById("titleMain").style.visibility = "visible";
		document.getElementById('mainWrap').style.display = "block";
	}
	if (location.host === 'localhost'){
		$.ajax({
			type: "GET",
			url: 'php/rejoinGame.php' // check if already in a game
		}).done(function(data) {
			console.info('rejoin ', data);
			if (data.gameId > 0){
				console.info("Auto joined game:" + (data.gameId));
				// join lobby in progress
				joinLobby(0); // autojoin
				initResources(data); // setResources(data);
			} else {
				showTitleScreen();
			}
		}).fail(function(e){
			Msg("Failed to contact server.");
		}).always(function(){
			g.unlock();
		});
	} else {
		showTitleScreen();
	}
})();
// game data values
var game = {
	tiles: [],
	initialized: false,
	player: [0,0,0,0,0,0,0,0,0], // cached values on client to reduce DB load
	
}
// player data values
var my = {
	player: 1,
	tgt: 1,
	capital: 0,
	lastTarget: {},
	units: 0,
	food: 0,
	production: 10,
	culture: 0,
	oBonus: -1,
	dBonus: -1,
	turnBonus: -1,
	foodBonus: -1,
	cultureBonus: -1,
	turnProduction: 10,
	foodMax: 25,
	cultureMax: 400,
	manpower: 0,
	focusTile: 0,
	sumFood: 0,
	sumProduction: 0,
	sumCulture: 0,
	flag: "",
	targetLine: [0,0,0,0,0,0],
	motionPath: [0,0,0,0,0,0],
	attackOn: false,
	splitAttack: false,
	targetData: {},
	selectedFlag: "Default",
	selectedFlagFull: "Default.jpg",
	tech: {
		engineering: 0,
		gunpowder: 0,
		rocketry: 0,
		atomicTheory: 0
	},
	hud: function(msg, d){
		timer.hud.kill();
		DOM.hud.style.visibility = 'visible';
		DOM.hud.textContent = msg;
		if (d){
			timer.hud = TweenMax.to(DOM.hud, 5, {
				onComplete: function(){
					DOM.hud.style.visibility = 'hidden';
				}
			});
		}
	},
	clearHud: function(){
		timer.hud.kill();
		DOM.hud.style.visibility = 'hidden';
		TweenMax.set([DOM.targetLine, DOM.targetLineShadow, DOM.targetCrosshair], {
			visibility: 'hidden',
			strokeDashoffset: 0
		});
		$DOM.head.append('<style>.land{ cursor: pointer; }</style>');
	},
	nextTarget: function(backwards){
		var count = 0,
			len = game.tiles.length;
		backwards ? my.tgt-- : my.tgt++;
		if (my.tgt < 0){
			my.tgt = len-1;
		}
		while (count < 255 && my.player !== game.tiles[my.tgt % len].player){
			backwards ? my.tgt-- : my.tgt++;
			if (my.tgt < 0){
				my.tgt = len-1;
			}
			count++;
		}
		if (!backwards){
			my.tgt = my.tgt % len;
		} else {
			my.tgt = Math.abs(my.tgt);
		}
		showTarget(document.getElementById('land' + my.tgt));
		my.focusTile(my.tgt, .1);
	},
	focusTile: function(tile, d){
		var e = document.getElementById("land" + tile),
			box = e.getBBox();
		if (d === undefined){
			d = .5;
		}
		// init map position & check max/min values
		var x = -box.x + 512;
		if (x > 0){ 
			x = 0;
		}
		var xMin = (g.mouse.mapSizeX - 1024) * -1;
		if (x < xMin){ 
			x = xMin;
		}
		
		var y = -box.y + 234; // 384 is dead center
		if (y > 0){ 
			y = 0;
		}
		var yMin = (g.mouse.mapSizeY - 768) * -1;
		if (y < yMin){ 
			y = yMin;
		}
		TweenMax.to(DOM.worldWrap, d, {
			force3D: false,
			x: x * g.resizeX,
			y: y * g.resizeY
		});
		showTarget(document.getElementById('land' + tile));
		my.flashTile(tile);
	},
	flashTile: function(tile){
		var e2 = document.getElementById('unit' + tile);
		TweenMax.to(e2, .05, {
			startAt: {
				transformOrigin: '50% 50%',
				fill: '#0ff'
			},
			fill: '#ffffff',
			ease: SteppedEase.config(1),
			repeat: 12,
			yoyo: true
		});
		var e3 = document.getElementById('flag' + tile);
		var e4 = document.getElementById('land' + tile);
		TweenMax.to(e3, 1, {
			startAt: {
				transformOrigin: '50% 50%',
				scale: 1.75
			},
			ease: Power3.easeIn,
			scale: 1
		});
		TweenMax.to(e4, 1, {
			fillOpacity: .8,
			drawSVG: '0%'
		}, {
			drawSVG: '100%',
			fillOpacity: 1
		});
	}
}
var timer = {
	hud: g.TDC()
}
// DOM caching
var DOM;
function initDom(){
	var d = document;
	DOM = {
		food: d.getElementById('food'),
		production: d.getElementById('production'),
		culture: d.getElementById('culture'),
		Msg: d.getElementById('Msg'),
		hud: d.getElementById("hud"),
		sumFood: d.getElementById("sumFood"),
		foodMax: d.getElementById("foodMax"),
		cultureMax: d.getElementById("cultureMax"),
		manpower: d.getElementById("manpower"),
		sumProduction: d.getElementById("sumProduction"),
		sumCulture: d.getElementById("sumCulture"),
		chatContent: d.getElementById("chat-content"),
		chatInput: d.getElementById("chat-input"),
		worldWrap: d.getElementById('worldWrap'),
		motionPath: d.getElementById('motionPath'),
		targetLine: d.getElementById('targetLine'),
		targetLineShadow: d.getElementById('targetLineShadow'),
		targetCrosshair: d.getElementById('targetCrosshair'),
		target: d.getElementById('target'),
		actions: d.getElementById('actions'),
		oBonus: d.getElementById('oBonus'),
		dBonus: d.getElementById('dBonus'),
		turnBonus: d.getElementById('turnBonus'),
		foodBonus: d.getElementById('foodBonus'),
		cultureBonus: d.getElementById('cultureBonus'),
		foodBar: d.getElementById('foodBar'),
		cultureBar: d.getElementById('cultureBar'),
		world: d.getElementById('world'),
		bgmusic: d.getElementById('bgmusic'),
		tileName: d.getElementById('tileName'),
		tileActions: d.getElementById('tileActions'),
		tileCommand: d.getElementById('tileCommand'),
		tileResearch: d.getElementById('tileResearch'),
		tileBuild: d.getElementById('tileBuild'),
		buildWord: d.getElementById('buildWord'),
		buildCost: d.getElementById('buildCost'),
		upgradeTileDefense: d.getElementById('upgradeTileDefense'),
		screenFlash: d.getElementById('screenFlash'),
		fireArtillery: d.getElementById('fireArtillery'),
		launchMissile: d.getElementById('launchMissile'),
		launchNuke: d.getElementById('launchNuke'),
		researchEngineering: d.getElementById('researchEngineering'),
		researchGunpowder: d.getElementById('researchGunpowder'),
		researchRocketry: d.getElementById('researchRocketry'),
		researchAtomicTheory: d.getElementById('researchAtomicTheory'),
		researchFutureTech: d.getElementById('researchFutureTech')
	}
}
initDom();

var $DOM = {
	head: $("#head"),
	chatInput: $("#chat-input")
}
// team colors
var color = [
	"#002F73",
	"#700000",
	"#0000d0",
	"#b0b000",
	"#006000",
	"#b06000",
	"#1177aa",
	"#b050b0",
	"#5500aa"
]
var worldMap = [];
function checkMobile(){
	var x = false;
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) x = true;
	return x;
}
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
(function($){
	if (isMSIE || isMSIE11){
		$("head").append('<style> text { fill: #ffffff; stroke-width: 0px; } </style>');
	} else if (isSafari){
		$("head").append('<style> text { fill: #ffffff; stroke: #ffffff; stroke-width: 0px; } </style>');
	}
	if (isMobile){
		$("head").append('<style> *{ box-shadow: none !important; } </style>');
	}
})($);

function resizeWindow() {
    var e = document.getElementById('body');
    // game ratio
    var widthToHeight = 1024/768;
    // current window size
    var w = window.innerWidth > 1024 ? 1024 : window.innerWidth;
    var h = window.innerHeight > 768 ? 768 : window.innerHeight;
    if(w / h > widthToHeight){
    	// too tall
    	w = h * widthToHeight;
    	e.style.height = h + 'px';
    	e.style.width = w + 'px';
    }else{
    	// too wide
    	h = w / widthToHeight;
    	e.style.width = w + 'px';
    	e.style.height = h + 'px';
    }
	/* various responsive options
		// e.style.marginTop = (-h / 2) + 'px';
		// e.style.marginLeft = (-w / 2) + 'px';
		x: 0,
		y: 0,
		xPercent: -50,
		yPercent: -50,
		left: '50%',
		top: '50%'
	*/
	/* old firefox code
	TweenMax.set("body", {
		left: '50%',
		top: '50%',
		marginLeft: ~~(-w / 2),
		marginTop: ~~(-h / 2),
		opacity: 1,
		force3D: true
	});
	*/
	TweenMax.set("body", {
		x: ~~(w/2 + ((window.innerWidth - w) / 2)),
		y: ~~(h/2 + ((window.innerHeight - h) / 2)),
		opacity: 1,
		yPercent: -50,
		xPercent: -50,
		force3D: true
	});
	e.style.visibility = "visible";
	if (typeof worldMap[0] !== 'undefined'){
		worldMap[0].applyBounds();
	}
	g.resizeX = w / 1024;
	g.resizeY = h / 768;
}


function chat(msg) {
    while (DOM.chatContent.childNodes.length > 10) {
        DOM.chatContent.removeChild(DOM.chatContent.firstChild);
    }
    var z = document.createElement('div');
    z.innerHTML = msg;
    DOM.chatContent.appendChild(z);
	setTimeout(function(){
		if (z !== undefined){
			if (z.parentNode !== null){ 
				z.parentNode.removeChild(z);
			}
		}
	}, 9000);
}
var video = {
	cache: {},
	load: {
		game: function(){
			var x = [
				'missile.png', 
				'nuke.png',
				'smoke.png',
				'goldSmoke.png',
				'fireball.png',
				'bulwark.png'
			];
			for (var i=0, len=x.length; i<len; i++){
				var z = x[i];
				video.cache[z] = new Image();
				video.cache[z].src = "images/" + z;
			}
		}
	}
}
var audio = {
	ext: (function(a){
		return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, '')) ? 'mp3' : 'ogg'
	})(document.createElement('audio')),
	on: (function(a){
		return !!a.canPlayType ? true : false;
	})(document.createElement('audio')),
	play: function(foo, bg){
		if (foo && audio.ext === 'mp3') {
			if (bg){
				DOM.bgmusic.src = "music/" + foo + "." + audio.ext;
			} else {
				new Audio("sound/" + foo + "." + audio.ext).play();
			}
		}
	},
	toggle: function(){
		if (g.config.audio.musicOn){
			g.config.audio.musicOn = false;
			audio.pause();
			document.getElementById('musicToggle').className = 'fa fa-volume-off';
		} else {
			g.config.audio.musicOn = true;
			audio.start();
			document.getElementById('musicToggle').className = 'fa fa-volume-up';
		}
	},
	pause: function(){
		DOM.bgmusic.pause();
	},
	start: function(){
		DOM.bgmusic.play();
	},
	ambientTrack: 0,
	ambientTotalTracks: 8,
	ambientInit: function(){
		if (audio.ext === 'mp3' && g.config.audio.musicOn){
			audio.pause();
			audio.ambientTrack = ~~(Math.random() * audio.ambientTotalTracks);
			audio.ambientPlay();
		}
	},
	ambientPlay: function(){
		if (audio.ext === 'mp3' && g.config.audio.musicOn){
			audio.ambientTrack++;
			var x = new Audio("music/ambient" + (audio.ambientTrack % audio.ambientTotalTracks) + "." + audio.ext);
			x.onended = function(){
				audio.ambientPlay();
			}
			x.play();
		}
	},
	fade: function(){
		var x = {
			vol: 1
		}
		TweenMax.to(x, 2.5, {
			vol: 0,
			ease: Linear.easeNone,
			onUpdate: function(){
				DOM.bgmusic.volume = x.vol;
			}
		});
	},
	move: function(){
		audio.play('boots' + ~~(Math.random()*3));
	},
	cache: {},
	load: {
		title: function(){
			if (audio.ext === 'mp3'){
				var x = [
					'click', 
					'beep'
				];
				for (var i=0, len=x.length; i<len; i++){
					var z = x[i];
					audio.cache[z] = new Audio("sound/" + z + ".mp3");
				}
			}
		},
		game: function(){
			if (audio.ext === 'mp3'){
				var x = [
					'machine0',
					'machine1',
					'machine2',
					'machine3',
					'machine4',
					'machine5',
					'machine6',
					'machine7',
					'machine8',
					'machine9',
					'boots0',
					'boots1',
					'boots2',
					'chat', 
					'food', 
					'culture',
					'error',
					'build',
					'grenade5',
					'grenade6',
					'grenade8',
					'missile7',
					'bomb9',
					'warning',
					'research'
				];
				for (var i=0, len=x.length; i<len; i++){
					var z = x[i];
					audio.cache[z] = new Audio("sound/" + z + ".mp3");
				}
			}
		}
	}
}
audio.init = (function(){
	console.info("Checking local data...");
	var config = localStorage.getItem('config');
	if (config === null){
		var x = g.config;
		var foo = JSON.stringify(x);
		localStorage.setItem('config', foo);
	} else {
		var foo = JSON.parse(config);
		g.config.audio = foo.audio;
		console.info(foo);
	}
	console.info("Initializing audio...");
	audio.load.title();
	audio.play("ReturnOfTheFallen", 1);
	g.checkPlayerData();
})();

$("#musicToggle").on('mousedown', function(){
	audio.toggle();
});

function Msg(msg, d) {
	DOM.Msg.innerHTML = msg;
	if (!d || d < .5){
		d = 5;
	}
    TweenMax.to(DOM.Msg, d, {
		overwrite: 1,
		startAt: {
			opacity: 1
		},
		onComplete: function(){
			TweenMax.to(this.target, .5, {
				opacity: 0
			});
		}
    });
	// split text animation
	var tl = new TimelineMax();
	var split = new SplitText(DOM.Msg, {
		type: "words,chars"
	});
	var chars = split.chars;
	tl.staggerFromTo(chars, .01, {
		immediateRender: true,
		alpha: 0
	}, {
		delay: .1,
		alpha: 1
	}, .01);
}

function playerLogout(){
    g.lock();
    $.ajax({
		type: 'GET',
		url: 'php/logout.php'
    }).done(function(data) {
        location.reload();
    }).fail(function() {
        Msg("Logout failed.");
    });
}

(function repeat(){
	if (g.view === 'title'){
		$.ajax({
			type: "GET",
			url: "php/keepAlive.php"
		}).always(function(){
			setTimeout(function(){
				repeat();
			}, 240000);
		});
	}
})();
function refreshGames(){
	g.lock();
	$.ajax({
		type: 'GET',
		url: 'php/refreshGames.php'
	}).done(function(data) {
		$("#menuContent").html(data);
		$(".wars").filter(":first").trigger("click");
	}).fail(function(e){
		Msg("Server error.");
	}).always(function(){
		g.unlock();
	});
}

function exitGame(bypass){
	
	if (g.view === 'game'){
		var r = confirm("Are you sure you want to surrender?");
	}
	if (r || bypass || g.view !== 'game'){
		g.lock(1);
		$.ajax({
			type: "GET",
			url: 'php/exitGame.php'
		}).done(function(data) {
			location.reload();
		}).fail(function(e){
			Msg(e.statusText);
			g.unlock(1);
		});
	}
}

function serverError(){
	Msg('The server reported an error.');
	setTimeout(function(){
		window.onbeforeunload = null;
		location.reload();
	}, 5000);
}

$(window).on('resize orientationchange', function() {
	resizeWindow();
}).on('load', function(){
	resizeWindow();
	// background map
	TweenMax.set("#worldTitle", {
		x: -200,
		y: -800
	});
	TweenMax.fromTo("#worldTitle", 316, {
		rotation: -360
	}, {
		rotation: 0,
		repeat: -1,
		ease: Linear.easeNone
	});
});