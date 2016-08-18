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
	}
}
var game = {
	tiles: [],
	initialized: false,
	player: [0,0,0,0,0,0,0,0,0], // cached values on client to reduce DB load
	
}
var my = {
	player: 1,
	tgt: 1,
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
	}
}
var timer = {
	hud: g.TDC()
}

var DOM = {
	food: document.getElementById('food'),
	production: document.getElementById('production'),
	culture: document.getElementById('culture'),
	hud: document.getElementById("hud"),
	sumFood: document.getElementById("sumFood"),
	foodMax: document.getElementById("foodMax"),
	cultureMax: document.getElementById("cultureMax"),
	manpower: document.getElementById("manpower"),
	sumProduction: document.getElementById("sumProduction"),
	sumCulture: document.getElementById("sumCulture"),
	chatContent: document.getElementById("chat-content"),
	chatInput: document.getElementById("chat-input"),
	motionPath: document.getElementById('motionPath'),
	targetLine: document.getElementById('targetLine'),
	targetLineShadow: document.getElementById('targetLineShadow'),
	targetCrosshair: document.getElementById('targetCrosshair'),
	target: document.getElementById('target'),
	actions: document.getElementById('actions'),
	oBonus: document.getElementById('oBonus'),
	dBonus: document.getElementById('dBonus'),
	turnBonus: document.getElementById('turnBonus'),
	foodBonus: document.getElementById('foodBonus'),
	cultureBonus: document.getElementById('cultureBonus'),
	foodBar: document.getElementById('foodBar'),
	cultureBar: document.getElementById('cultureBar'),
	world: document.getElementById('world'),
	bgmusic: document.getElementById('bgmusic'),
	tileName: document.getElementById('tile-name'),
	tileActions: document.getElementById('tileActions'),
	tileBuild: document.getElementById('tileBuild'),
	tileCommand: document.getElementById('tileCommand'),
	buildWord: document.getElementById('buildWord'),
	buildCost: document.getElementById('buildCost'),
	upgradeTileDefense: document.getElementById('upgradeTileDefense'),
	upgradeTileComplete: document.getElementById('upgradeTileComplete'),
	screenFlash: document.getElementById('screenFlash')
}
var $DOM = {
	head: $("#head"),
	chatInput: $("#chat-input")
}
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
var isXbox = /Xbox/i.test(navigator.userAgent),
    isPlaystation = navigator.userAgent.toLowerCase().indexOf("playstation") >= 0,
    isNintendo = /Nintendo/i.test(navigator.userAgent),
    isMobile = checkMobile(),
    isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
    isFirefox = typeof InstallTrigger !== 'undefined',
    isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
    isChrome = !!window.chrome && !isOpera,
    isMSIE = /*@cc_on!@*/ false,
    isMSIE11 = !!navigator.userAgent.match(/Trident\/7\./),
	dev = location.host === "localhost" ? true : false,
	chatDragStatus = false,
	dom = {};
// browser dependent
if (isMSIE || isMSIE11){
	$("head").append('<style> text { fill: #ffffff; stroke-width: 0px; } </style>');
} else if (isSafari){
	$("head").append('<style> text { fill: #ffffff; stroke: #ffffff; stroke-width: 0px; } </style>');
}
if (isMobile){
	$("head").append('<style> *{ box-shadow: none !important; } </style>');
}

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
	if (isFirefox){
		TweenMax.set("body", {
			x: ~~(w/2 + ((window.innerWidth - w) / 2)),
			y: ~~(h/2 + ((window.innerHeight - h) / 2)),
			opacity: 1,
			yPercent: -50,
			xPercent: -50,
			force3D: true
		});
		/*
		TweenMax.set("body", {
			left: '50%',
			top: '50%',
			marginLeft: ~~(-w / 2),
			marginTop: ~~(-h / 2),
			opacity: 1,
			force3D: true
		});
		*/
	} else {
		TweenMax.set("body", {
			x: ~~(w/2 + ((window.innerWidth - w) / 2)),
			y: ~~(h/2 + ((window.innerHeight - h) / 2)),
			opacity: 1,
			yPercent: -50,
			xPercent: -50,
			force3D: true
		});
	}
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
			z.parentNode.removeChild(z);
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
				'smoke.png'
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
	pause: function(){
		DOM.bgmusic.pause();
	},
	ambientTrack: 0,
	ambientTotalTracks: 8,
	ambientInit: function(){
		if (audio.ext === 'mp3'){
			audio.pause();
			audio.ambientTrack = ~~(Math.random() * audio.ambientTotalTracks);
			audio.ambientPlay();
		}
	},
	ambientPlay: function(){
		if (audio.ext === 'mp3'){
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
					'warning'
				];
				for (var i=0, len=x.length; i<len; i++){
					var z = x[i];
					audio.cache[z] = new Audio("sound/" + z + ".mp3");
				}
			}
		}
	}
}

function Msg(msg, d) {
    var e = document.createElement('div');
	e.className = "msg";
    e.innerHTML = msg;
    document.getElementById("Msg").appendChild(e);
	if (d === undefined){
		d = 5;
	}
    TweenMax.to(e, d, {
		onComplete: function(){
			this.target.parentNode.removeChild(e);
		}
    });
	var tl = new TimelineMax();
	var split = new SplitText(e, {
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