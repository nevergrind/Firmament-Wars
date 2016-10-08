
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
			var foo = JSON.stringify(g.config);
			localStorage.setItem('config', foo);
		} else {
			g.config.audio.musicOn = true;
			audio.start();
			document.getElementById('musicToggle').className = 'fa fa-volume-up';
			var foo = JSON.stringify(g.config);
			localStorage.setItem('config', foo);
			audio.play("ReturnOfTheFallen", 1);
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
			// var x = new Audio("music/ambient" + (audio.ambientTrack % audio.ambientTotalTracks) + "." + audio.ext);
			var x = new Audio("music/WaitingBetweenWorlds." + audio.ext);
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
	$("#musicToggle").on('mousedown', function(){
		audio.toggle();
	});
	var config = localStorage.getItem('config');
	if (config === null){
		// initialize
		var x = g.config;
		var foo = JSON.stringify(x);
		localStorage.setItem('config', foo);
	} else {
		var foo = JSON.parse(config);
		g.config.audio = foo.audio;
	}
	console.info("Initializing audio...");
	audio.load.title();
	audio.play("ReturnOfTheFallen", 1);
	if (g.config.audio.musicOn){
		document.getElementById('musicToggle').className = 'fa fa-volume-up';
	} else {
		audio.pause();
		document.getElementById('musicToggle').className = 'fa fa-volume-off';
	}
	g.checkPlayerData();
})();