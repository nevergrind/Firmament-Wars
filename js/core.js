// core.js
$.ajaxSetup({
	type: 'POST',
	timeout: 5000
});
TweenMax.defaultEase = Quad.easeOut;
var g = {
	ribbons: [],
	reloadGame: false,
	attackTimer: 0,
	splitAttackTimer: 0,
	cannonTimer: 0,
	missileTimer: 0,
	nukeTimer: 0,
	Msg: document.getElementById('Msg'),
	msgTimer: new TweenMax.delayedCall(0, ''),
	camel: function(str){
		str = str.split("-");
		for (var i=1, len=str.length; i<len; i++){
			str[i] = str[i].charAt(0).toUpperCase() + str[i].substr(1);
		}
		return str.join("");
	},
	msg: function(msg, d) {
		if (!msg.trim()) return;
		if (d === 0){
			TweenMax.set(g.Msg, {
				overwrite: 1,
				startAt: {
					opacity: 1
				}
			});
		}
		else {
			if (d === undefined || d < 2){
				d = 2;
			}
			g.msgTimer.kill();
			g.msgTimer = TweenMax.to(g.Msg, d, {
				startAt: {
					scaleY: 1,
					opacity: 1
				},
				onComplete: function(){
					g.msgClose();
				}
			});
		}
		if (msg) {
			g.Msg.innerHTML = msg;
		}
		// split text animation
		var tl = new TimelineMax(),
			split = new SplitText(g.Msg, {
				type: "words,chars"
			}),
			chars = split.chars;

		tl.staggerFromTo(chars, .01, {
			immediateRender: true,
			alpha: 0
		}, {
			delay: .1,
			alpha: 1
		}, .01);
	},
	msgClose: function() {
		TweenMax.to(g.Msg, .3, {
			scaleY: 0
		});
	},
	gameDuration: 0,
	spectateStatus: 0,
	modalSpeed: .5,
	friends: [],
	ignore: [],
	color: [
		"#02063a",
		"#bb0000",
		"#0077ff",
		"#a5a500",
		"#006000",
		"#b06000",
		"#33ddff",
		"#b050b0",
		"#5500aa",
		"#660000",
		"#0000bb",
		"#663300",
		"#33dd33",
		"#222222",
		"#00ff99",
		"#ff6666",
		"#ff00ff",
		'#e4e4e4',
		'#220088',
		'#404000',
		'#888888'
	],
	rankedMode: 0,
	teamMode: 0,
	joinedGame: false,
	searchingGame: false,
	defaultTitle: 'Firmament Wars',
	titleFlashing: false,
	name: "",
	password: "",
	speed: 12,
	focusUpdateNationName: false,
	focusGameName: false,
	view: "title",
	sfxFood: false,
	sfxCulture: false,
	chatOn: false,
	overlay: document.getElementById("overlay"),
	over: 0,
	showSpectateButton: 1,
	victory: false,
	startTime: Date.now(),
	keyLock: false,
	loadAttempts: 0,
	upgradeCost: [40, 50, 60],
	isModalOpen: false,
	lock: function(clear){
		g.overlay.style.display = "block";
		g.overlay.style.opacity = clear === void 0 ? 0 : 1;
		g.keyLock = true;
	},
	unlock: function(clear){
		g.overlay.style.display = "none";
		clear ? g.overlay.style.opacity = 0 : g.overlay.style.opacity = 1;
		g.keyLock = false;
	},
	unlockFade: function(d){
		if (!d){
			d = 1;
		}
		TweenMax.to(g.overlay, d, {
			startAt: {
				opacity: 1,
			},
			ease: Power3.easeIn,
			opacity: 0,
			onComplete: function(){
				g.overlay.style.display = 'none';
			}
		});
	},
	TDC: function(){
		return new TweenMax.delayedCall(0, '');
	},
	screen: {
		resizeMap: function(){
			// set worldWrap CSS
			$("#mapStyle").remove();
			var css =
				'<style id="mapStyle">#worldWrap{ '+
					'position: absolute; '+
					'top: 0%; '+
					'left: 0%; '+
					'width: ' + ((g.map.sizeX / window.innerWidth) * 100) + '%; '+
					'height: ' + ((g.map.sizeY / window.innerHeight) * 100) + '%; '+
				'}</style>';
			$DOM.head.append(css);
			setTimeout(applyBounds);
		}
	},
	mouse: {
		x: 0,
		y: 0,
		zoom: 100,
		mouseTransX: 50,
		mouseTransY: 50
	},
	map: {
		sizeX: 5099,
		sizeY: 2627,
		name: 'Alpha Earth',
		key: 'AlphaEarth',
		tiles: 143
	},
	updateUserInfo: function(){
		if (location.host !== 'localhost'){
			$.ajax({
				async: true,
				type: 'GET',
				dataType: 'jsonp',
				url: 'https://geoip-db.com/json/geoip.php?jsonp=?'
			}).done(function(data){
				data.latitude += '';
				data.longitude += '';
				g.geo = data;
				$.ajax({
					url: app.url + 'php/updateUserInfo.php',
					data: {
						location: g.geo
					}
				}).done(function(){
					localStorage.setItem('geo', JSON.stringify(g.geo));
					localStorage.setItem('geoSeason', 1);
					localStorage.setItem('geoTime', Date.now());
				});
				//console.info('loc: ', g.geo);
			});
		}
	},
	checkPlayerData: function(){
		var geo = localStorage.getItem(my.account+ '_geo'),
			geoTime = localStorage.getItem(my.account+ '_geoTime'),
			geoSeason = localStorage.getItem(my.account+ '_geoSeason');

		if (geoTime !== null || geoSeason === null){
			// longer than 90 days?
			if ((Date.now() - geoTime) > 7776000 || geoSeason === null){
				g.updateUserInfo();
			}
		}
		else if (geo === null){
			g.updateUserInfo();
		}
		// ignore list
		var ignore = localStorage.getItem('ignore');
		if (ignore !== null){
			g.ignore = JSON.parse(ignore);
		} else {
			// first time user... open configure nation
			app.isApp && title.configureNation();
			var foo = [];
			localStorage.setItem('ignore', JSON.stringify(foo));
		}
		var bible = localStorage.getItem('bible') * 1;
		$("#bible-status").prop('checked', !!bible);
		stats.setBibleMode(bible);
	},
	config: {
		audio: {
			musicVolume: 10,
			soundVolume: 20
		}
	},
	geo: {},
	keepAlive: function(){
		if (g.view !== 'game') {
			$.ajax({
				type: 'GET',
				url: app.url + "php/keepAlive.php"
			});
		}
		setTimeout(g.keepAlive, 120000);
	},
	removeContainers: function(){
		$("#firmament-wars-logo-wrap, #mainWrap").remove();
	},
	notification: {},
	sendNotification: function(data){
		if (!document.hasFocus() && g.view !== 'game' && typeof Notification === 'function'){
			
			Notification.requestPermission().then(function(permission){
				if (permission === 'granted'){
					// it's a player message
					var type = ' says: ';
					if (data.flag && (data.msg || data.message)){
						// sent by a player
						if (data.type === 'chat-whisper'){
							type = ' whispers: ';
						}
						var prefix = data.account + type;
						g.notification = new Notification(prefix, {
							icon: 'images/flags/' + flagFile,
							tag: "Firmament Wars",
							body: data.msg ? data.msg : data.message
						});
						g.notification.onclick = function(){
							window.focus();
						}
						// title flash
						if (!g.titleFlashing){
							g.titleFlashing = true;
							(function repeat(toggle){
								if (!document.hasFocus()){
									if (toggle % 2 === 0){
										document.title = prefix;
									} else {
										document.title = g.defaultTitle;
									}
									setTimeout(repeat, 3000, ++toggle);
								}
							})(0);
						}
						audio.play('chat');
					}
				}
			});
		}
	},
	chat: function(msg, type){
		var o = {
			message: msg,
			type: type
		};
		if (g.view === 'title'){
			title.chat(o);
		} else if (g.view === 'lobby'){
			lobby.chat(o);
		} else {
			game.chat(o);
		}
	},
	getRandomFlag: function(){
		var a = [],
			i = 0;
		for (var key in g.flagData){
			g.flagData[key].name.forEach(function(flag){
				a[i++] = flag;
			});
		}
		var len = a.length,
			ind = ~~(Math.random() * len);
		return a[ind];
	},
	flagData: {
		Africa: {
			group: "Africa",
			name: ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'The Comoros', 'The Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Equatorial Guinea', 'Eritrea', 'Gabon', 'The Gambia', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Egypt', 'Ethiopia', 'Ghana', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe']
		},
		Asia: {
			group: "Asia",
			name: ['Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'East Timor', 'Hong Kong', 'India', 'Indonesia', 'Japan', 'Laos', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Pakistan', 'Philippines', 'Republic of Korea', 'Singapore', 'Sri Lanka', 'Suriname', 'Taiwan', 'Thailand', 'Vietnam']
		},
		CentralAsia: {
			group: "Central Asia",
			name: ['Armenia', 'Azerbaijan', 'Georgia', 'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan']
		},
		Europe: {
			group: "Europe",
			name: ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'England', 'Estonia', 'Faroe Islands', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Luxembourg', 'Macedonia', 'Malta', 'Monaco', 'Montenegro', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Republic of Lithuania', 'Republic of Moldova', 'Romania', 'Russia', 'San Marino', 'Scotland', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City']
		},
		Historic: {
			group: "Historic",
			name: ['Benin Empire', 'Byzantine Empire', 'Confederate Flag', 'Flanders', 'Gadsden Flag', 'Holy Roman Empire', 'Isle of Man', 'Rising Sun Flag', 'NSDAP Flag', 'NSDAP War Ensign', 'Ottoman Empire', 'Rhodesia', 'Roman Empire', 'Shahanshahi', 'USSR', 'Veneto', 'Welsh']
		},
		MiddleEast: {
			group: "Middle East",
			name: ['Afghanistan', 'Bahrain', 'Iran', 'Iraq', 'Israel', 'Jerusalem', 'Jordan', 'Kurdistan', 'Kuwait', 'Lebanon', 'Oman', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Turkey', 'United Arab Emirates', 'Yemen']
		},
		Miscellaneous: {
			group: "Miscellaneous",
			name: ['Anarcho-Capitalist', 'Anarcho-Syndicalist', 'Antifa', 'Cascadia', 'Christian', 'European Union', 'High Energy', 'ISIS', 'Jefferson State', 'Jolly Roger', 'Kekistan', 'Northwest Front', 'Pan-African Flag', 'pol', 'Rainbow Flag', 'Sicily', 'United Nations']
		},
		NorthAmerica: {
			group: "North America",
			name: ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Jamaica', 'Haiti', 'Honduras', 'Mexico', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States']
		},
		Oceania: {
			group: "Oceania",
			name: ['Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Federated States of Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu']
		},
		SouthAmerica: {
			group: "South America",
			name: ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Nicaragua', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela']
		},
		US_States: {
			group: "State Flags",
			name: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia State', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
		},
		US_Territories: {
			group: "US Territories",
			name: ['American Samoa', 'District of Columbia', 'Guam', 'Johnston Atoll', 'Midway Islands', 'Navassa Island', 'Northern Mariana Islands', 'Palmyra Atoll', 'Puerto Rico', 'Virgin Islands', 'Wake Island']
		},
	},
	initGameCallback: function(data) {
		// handle hiding/showing menu based on environment
		if (localStorage.getItem('disconnects') === null) {
			localStorage.setItem('disconnects', 0);
		}
		if (localStorage.getItem('disconnects') * 1) {
			$.ajax({
				type: 'GET',
				url: app.url + 'php/disconnect.php'
			});
			localStorage.setItem('disconnects', 0);
		}

		if (app.isApp) {
			$("#logout").remove();
		}
		else {
			$("#logout").css('display', 'inline-block');
		}
		lang.updateIndexHtml();
		TweenMax.staggerTo(document.getElementsByClassName('action-btn'), .5, {
			startAt: { x: -30 },
			x: 0,
			opacity: 1
		}, .1);

		console.info('init-game', data.account, data);

		$('.actionButtons').tooltip({
			animation: false,
			placement: 'left',
			container: 'body'
		});
		$('[title]').tooltip({
			animation: false,
			placement: 'bottom',
			container: 'body'
		});
		if (data.account) {
			app.account = data.account; // for global reference
			isLoggedIn = 1;
			$('#logout').text('Logout ' + data.account);
			app.isApp && $("#login-modal").remove();
			// people playing firmament wars:
			/*title.chat({
				message: 'There are '+ data.currentPlayers +' people playing Firmament Wars.'
			});*/
			// set flag
			document.getElementById('updateNationFlag').src = 'images/flags/'+ data.flag;
			document.getElementById('selectedFlag').textContent = data.flagShort;
			// initChatId
			my.account = data.account;
			my.flag = data.flag;
			my.rating = data.rating;
			my.nation = data.nation;
			g.checkPlayerData();
			title.friendGet();
			g.msgClose();
		}
		else {
			notLoggedIn();
		}
		// animate logo
		/* blur(5px) hue-rotate(360deg) brightness(100%) contrast(100%) shadow(100%) (chrome not supported?) grayscale(100%) invert(100%) opacity(100%) saturate(100%) sepia(100%) */
		var e = document.getElementById('firmamentWarsLogo');
		function applyFilter(o) {
			e.style.filter =
				'drop-shadow(0px 0px '+ o.shadow +'px #048) ' +
				'brightness('+ o.brightness +'%)';
		}
		var o = {
			shadow: 2,
			brightness: 100
		};
		TweenMax.to(o, 3, {
			overwrite: 1,
			shadow: 12,
			brightness: 150,
			repeat: -1,
			yoyo: true,
			ease: Power4.easeIn,
			onUpdate: function() {
				applyFilter(o);
			}
		});
		// handle setting accounts and config nation for new players
		console.info('setAccountName', data.setAccountName);
		(function repeat() {
			if (typeof socket === 'object') {
				socket.init();
			}
			else {
				setTimeout(repeat, 100);
			}
		})();
		data.isNewAccount && title.configureNation();
		g.ribbons = data.ribbons;
	}
};
g.init = (function(){
	g.lock();
	if (app.isApp) {
		$("#exit-game").on('click', function() {
			title.exitGame();
		});
	}
	$("#reset-game").on('click', function() {
		location.reload();
	});
	TweenMax.to('#title-stars-1', 50, {
		startAt: { backgroundPosition: '0'},
		force3D: true,
		backgroundPosition: '-1920px',
		repeat: -1,
		ease: Linear.easeNone
	});
	TweenMax.to('#title-stars-2', 75, {
		startAt: { backgroundPosition: '200px -200px'},
		backgroundPosition: '-1720px -200px',
		repeat: -1,
		ease: Linear.easeNone
	});
	TweenMax.to('#title-stars-3', 100, {
		startAt: { backgroundPosition: '400px -400px'},
		backgroundPosition: '-1520px -400px',
		repeat: -1,
		ease: Linear.easeNone
	});
	TweenMax.to('#title-backdrop', 12, {
		startAt: { scale: 1, transformOrigin: '0% 100%' },
		scale: 3,
		repeat: -1,
		yoyo: true,
		ease: Power1.easeInOut
	});
	TweenMax.to('#firmamentWarsBG', 1, {
		startAt: { y: '-47%' },
		y: '-50%',
		onComplete: function() {
			TweenMax.to('#firmamentWarsBG', 10, {
				startAt: { scale: 1 },
				scale: 1.08,
				repeat: -1,
				yoyo: true,
				ease: Power1.easeInOut
			});
		}
	});
	// default
	my.lang = 'english';
	my.channel = localStorage.getItem('channel') === null ?
		'usa-1' : localStorage.getItem('channel');
	if (app.isApp) {
		g.lock(1);
		// app login, check for steam ticket
		var greenworks = require('./greenworks'),
			steam = {
				screenName: '',
				steamid: '',
				handle: 0
			};

		if (greenworks.initAPI()) {
			greenworks.init();
			var langPref = greenworks.getCurrentUILanguage(),
				z = greenworks.getSteamId();

			var index = lang.alternateSupportedLanguages.indexOf(langPref);
			/*title.chat({
				message: 'Detected language: ' + langPref
			});*/
			if (index > -1) {
				my.lang = lang.alternateSupportedLanguages[index];
			}

			g.msg(lang[my.lang].verifyingSteam);

			steam.screenName = z.screenName;
			steam.steamid = z.steamId;
			greenworks.getAuthSessionTicket(function (data) {
				steam.handle = data.handle;
				$.ajax({
					type: 'POST',
					url: app.url + 'php/init-game.php',
					data: {
						version: app.version,
						screenName: steam.screenName,
						steamid: steam.steamid,
						channel: my.channel,
						ticket: data.ticket.toString('hex')
					}
				}).done(function(data) {
					greenworks.cancelAuthTicket(steam.handle);
					g.initGameCallback(data);
				}).fail(function(data) {
					g.lock(1);
					data.responseText && g.msg(data.responseText, 0);
				});
			});
		}
		else {
			g.lock(1);
			g.msg(lang[my.lang].steamNotFound, 0);
		}
	}
	else {
		// non-app login
		$.ajax({
			type: "POST",
			url: app.url + 'php/init-game.php',
			data: {
				version: app.version,
				channel: my.channel,
				screenName: '',
				steamid: '',
				ticket: ''
			}
		}).done(function(data) {
			g.initGameCallback(data);
		}).fail(function(data) {
			g.lock(1);
			data.responseText && g.msg(data.responseText, 0);
		});
	}

	// TODO separate this confusing logic a bit
	if (location.hostname === 'localhost'){
		if (location.hash === '#stop') {
			stats.delete();
		}
		else {
			g.reloadGame = true;
			$.ajax({
				type: "GET",
				url: app.url + 'php/rejoinGame.php' // check if already in a game
			}).done(function(data) {
				console.info('rejoin ', data.gameId, data.team);
				if (data.gameId > 0){
					my.player = data.player;
					my.playerColor = data.player;
					g.teamMode = data.teamMode;
					g.rankedMode = data.rankedMode;
					my.team = data.team;
					game.id = data.gameId;
					g.map = data.mapData;
					// g.speed = data.speed;
					// join lobby in progress
					setTimeout(function(){
						lobby.init(data);
						lobby.join(0); // autojoin
						initResources(data); // setResources(data);
						my.government = data.government;
						lobby.updateGovernmentWindow(my.government);
						socket.joinGame();
					}, 111);
				}
				else {
					stats.delete();
				}
			}).fail(function(data){
				g.msg(data.responseText);
			});
		}
	}
	else {
		stats.delete();
	}
})();
