// audio.js
var audio = {
	ext: (function(a){
		return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, '')) ? 'mp3' : 'ogg'
	})(document.createElement('audio')),
	on: (function(a){
		return !!a.canPlayType ? true : false;
	})(document.createElement('audio')),
	play: function(foo, bg){
		if (foo && audio.ext === 'mp3' && g.config.audio.soundVolume) {
			if (bg){
				// music
				DOM.bgmusic.pause();
				DOM.bgmusic.src = "music/" + foo + "." + audio.ext;
				DOM.bgmusic.play();
			} else {
				// sfx
				var sfx = new Audio("sound/" + foo + "." + audio.ext);
				sfx.volume = g.config.audio.soundVolume / 100;
				sfx.play();
			}
		}
	},
	save: function(){
		// save to storage
		var foo = JSON.stringify(g.config);
		localStorage.setItem('config', foo);
	},
	setMusicVolume: function(val){
		if (g.config.audio.musicVolume){
			if (!val){
				audio.pause();
			}
		} else {
			// start playing music
			audio.musicStart();
		}
		DOM.bgmusic.volume = val / 100;
		g.config.audio.musicVolume = val;
		audio.save();
	},
	setSoundVolume: function(val){
		g.config.audio.soundVolume = val;
		audio.save();
	},
	pause: function(){
		DOM.bgmusic.pause();
	},
	trackIndex: 0,
	totalTracks: 1,
	gameMusicInit: function(){
		if (audio.ext === 'mp3' && g.config.audio.musicVolume){
			audio.pause();
			audio.trackIndex = ~~(Math.random() * audio.totalTracks);
			audio.gameMusicPlayNext();
		}
	},
	// rotating music tracks in game
	gameMusicPlayNext: function(){
		// FIX IT SO IT USES BGAUDIO
		if (audio.ext === 'mp3'){
			var tracks = [
				'WaitingBetweenWorlds'
			]
			audio.trackIndex++;
			// future various tracks
			if (my.government){
				// government specific tracks?
			}
			DOM.bgmusic.src = "music/" + tracks[audio.trackIndex % audio.totalTracks] +"." + audio.ext;
			DOM.bgmusic.volume = g.config.audio.musicVolume / 100;
			DOM.bgmusic.onended = function(){
				audio.gameMusicPlayNext();
			}
			if (g.config.audio.musicVolume){
				DOM.bgmusic.play();
			} else {
				DOM.bgmusic.pause();
			}
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
	},
	musicStart: function(){
		if (g.view !== 'game'){
			audio.play("ReturnOfTheFallen", 1);
		} else {
			audio.gameMusicPlayNext();
		}
	}
}
audio.init = (function(){
	// console.info("Checking local data...");
	var config = localStorage.getItem('config');
	if (config === null){
		// initialize
		audio.save();
	} else {
		var foo = JSON.parse(config);
		if (g.config.audio.musicOn === undefined){
			g.config.audio = foo.audio;
		}
	}
	// console.info("Initializing audio...", g.config.audio);
	audio.load.title();
	if (!g.config.audio.musicVolume){
		audio.pause();
	} else {
		audio.musicStart();
	}
	g.checkPlayerData();
	var initComplete = false;
	$("#musicSlider").slider({
		min  : 0, 
		max  : 100, 
		value: g.config.audio.musicVolume, 
		formatter: function(value) {
			if (initComplete){
				audio.setMusicVolume(value);
				return value;
			} else {
				return g.config.audio.musicVolume;
			}
		}
	}).slider('setValue', g.config.audio.musicVolume);
	$("#soundSlider").slider({
		min  : 0, 
		max  : 100, 
		value: g.config.audio.soundVolume, 
		tooltip_position: 'bottom',
		formatter: function(value) {
			if (initComplete){
				audio.setSoundVolume(value);
				return value;
			} else {
				return g.config.audio.soundVolume
			}
		}
	}).on('slideStop', function(val){
		audio.play('machine0');
	}).slider('setValue', g.config.audio.soundVolume);
	initComplete = true;
})();