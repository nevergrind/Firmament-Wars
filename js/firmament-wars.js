(function($,Math,document,location,TweenMax){//payment.js
// payment-confirm
var payment = {
	error: function(msg){
		$("#payment-errors").text(msg);
	},
	init: (function(){
		$("#payment-confirm").on('click', function(e) {
			
			g.lock();
			var response = {};
			var ccNum = $('#card-number').val(),
				cvcNum = $('#card-cvc').val(),
				expMonth = $('#card-month').val(),
				expYear = 20 + $('#card-year').val(),
				error = false;
			// Validate the number:
			if (!Stripe.validateCardNumber(ccNum)) {
				error = true;
				Msg('The credit card number is invalid.');
			}
			// Validate the CVC:
			if (!Stripe.validateCVC(cvcNum)) {
				error = true;
				Msg('The CVC number is invalid.');
			}
			// Validate the expiration:
			if (!Stripe.validateExpiry(expMonth, expYear)) {
				error = true;
				Msg('The expiration date is invalid.');
			}
			if (!error) {
				$('#payment-errors').text('');
				Stripe.createToken({
					number: ccNum,
					cvc: cvcNum,
					exp_month: expMonth,
					exp_year: expYear
				}, stripeResponseHandler);
			} else {
				g.unlock();
			}
			
			function stripeResponseHandler(status, response){
				if (response.error) {
					console.info("ERROR!");
					Msg(response.error.message);
					g.unlock();
				} else {
					// No errors, submit the form.
					Msg("Communicating with the server...");
					$.ajax({
						url: "php/purchaseFw.php",
						data: {
							stripeToken: response.id
						}
					}).done(function(data) {
						Msg("Thank you for your purchase!<br>Firmament Wars - Complete Game Unlocked!", 8);
						setTimeout(function(){
							location.reload();
						}, 3000);
					}).fail(function(data) {
						document.getElementById('payment-errors').textContent = data.error;
					}).always(function(){
						g.unlock();
					});
				}
			}
		});
	})()
};// stats.js 
// scoreboard data values

(function(){
	// attempt auto login
	var isLoggedIn = $("#titleMenu").length;
	if (!isLoggedIn){
		var email = localStorage.getItem('email');
		var token = localStorage.getItem('token');
		if (email){
			// attempt persistent login
			if (token){
				$.ajax({
					type: 'POST',
					url: '/php/master1.php',
					data: {
						run: "authenticate",
						email: email,
						token: token
					}
				}).done(function(data){
					if (data !== 'Persistent login failed'){
						location.reload();
					} else {
						$.ajax({
							type: 'POST',
							url: '/php/master1.php',
							data: {
								run: "getToken",
								email: email
							}
						}).done(function(data){
							token = data;
							$.ajax({
								type: 'POST',
								url: '/php/master1.php',
								data: {
									run: "authenticate",
									email: email,
									token: token
								}
							}).done(function(data){
								console.info(data);
								localStorage.setItem('token', token);
								location.reload();
							}).fail(function(data){
								console.warn(data);
							});
						});
					}
				});
			} else {
				$.ajax({
					type: 'POST',
					url: '/php/master1.php',
					data: {
						run: "getToken",
						email: email
					}
				}).done(function(data){
					token = data;
				});
			}
		}
	}
})();

var stats = {
	init: function(data){
		var flag = my.flag === 'Default.jpg' ? 'Player'+ game.player[my.player].playerColor +'.jpg' : my.flag;
		var str = '<img id="statWorld" src="images/FlatWorld75-2.jpg">\
		<div id="statResult" class="no-select">\
			<span id="statGameResult">Defeat</span>!\
			<img class="statResultFlag pull-left" src="images/flags/'+ flag +'">\
			<img class="statResultFlag pull-right" src="images/flags/'+ flag +'">\
		</div>\
		<div id="statTabWrap" class="no-select">\
			<div id="statOverview" class="statTabs active">\
				Overview\
			</div><div id="statUnits" class="statTabs">\
				Units\
			</div><div id="statStructures" class="statTabs">\
				Structures\
			</div><div id="statWeapons" class="statTabs">\
				Weapons\
			</div><div id="statResources" class="statTabs">\
				Resources\
			</div>\
		</div>\
		<table id="gameStatsTable" class="table"></table>\
		<div id="statFooter" class="container-fluid">\
			<div class="row">\
				<div id="statQuote" class="col-xs-7 stagBlue">\
					<div>'+ stats.data.quote +'</div>\
					<div id="statVerse" class="text-right">'+ stats.data.verse +'</div>\
				</div>\
				<div id="statDuration" class="col-xs-4 stagBlue text-center">\
					<div id="gameDuration">Game Duration '+ stats.gameDuration(data.gameDuration) +'</div>\
					<button id="statsEndGame" class="btn btn-responsive fwBlue shadow4">End Game</button>\
				</div>\
			</div>\
		</div>\
		<div id="ribbonBackdrop"></div>\
		<div id="ribbonReward" class="fw-primary titleModal">\
			<div class="header text-center">\
				<h2 class="header">Achievement Unlocked!</h2>\
			</div>\
			<hr class="fancyhr">\
			<div id="ribbonBody"></div>\
		</div>';
		document.getElementById('statWrap').innerHTML = str;
		stats.events();
		TweenMax.to("#statWorld", 300, {
			startAt: {
				xPercent: -50,
				yPercent: -50,
				rotation: -360
			},
			rotation: 0,
			repeat: -1,
			ease: Linear.easeNone
		});
		stats.setLeaderValues();
	},
	show: function(){
		stats.setView('statOverview');
		if (g.victory){
			audio.play('victory');
			document.getElementById('statGameResult').textContent = "Victory";
		} else {
			audio.play('defeat');
		}
		document.getElementById('statWrap').style.visibility = 'visible';
		TweenMax.to('#gameWrap', .5, {
			startAt: {
				alpha: 0
			},
			alpha: 1
		});
		if (stats.achievements.length){
			audio.play('ding3');
			TweenMax.to('#ribbonBackdrop', .5, {
				startAt: {
					visibility: 'visible',
					alpha: 0
				},
				alpha: 1
			});
			TweenMax.to('#ribbonReward', 1, {
				startAt: {
					visibility: 'visible',
					alpha: 0,
					top: 0,
					y: 0
				},
				alpha: 1,
				y: 30
			});
		}
		$("#worldWrap, #targetWrap, #ui2, #resources-ui, #diplomacy-ui, #chat-ui, #chat-input, #surrenderScreen").remove();
	},
	events: function(){
		$("#statWrap").on('click', '.statTabs', function(){
			$(".statTabs").removeClass('active');
			$(this).addClass('active');
			audio.play('switch13');
			// load data
			var id = $(this).attr('id');
			stats.setView(id);
		}).on('click', '#statsEndGame', function(){
			location.reload();
		}).on('click', '#ribbonBackdrop', function(){
			TweenMax.to('#ribbonBackdrop, #ribbonReward', .25, {
				alpha: 0,
				onComplete: function(){
					TweenMax.set('#ribbonBackdrop, #ribbonReward', {
						visibility: 'hidden'
					});
				}
			});
		});
		
	},
	maxValue: {
		unitsTotal: 0,
		structuresTotal: 0,
		weaponsTotal: 0,
		resourcesTotal: 0,
		overviewTotal: 0
	},
	setLeaderValues: function(){
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (d !== undefined){
				for (var key in d){
					if (i === 1){
						stats.maxValue[key] = d[key];
					} else {
						if (d[key] > stats.maxValue[key]){
							stats.maxValue[key] = d[key];
						}
					}
				}
				var units = stats.unitsTotal(i),
					structures = stats.structuresTotal(i),
					weapons = stats.weaponsTotal(i),
					resources = stats.resourcesTotal(i),
					overview = stats.overviewTotal(i);
				
				if (units > stats.maxValue.unitsTotal){
					stats.maxValue.unitsTotal = stats.unitsTotal(i);
				}
				if (structures > stats.maxValue.structuresTotal){
					stats.maxValue.structuresTotal = structures;
				}
				if (weapons > stats.maxValue.weaponsTotal){
					stats.maxValue.weaponsTotal = weapons;
				}
				if (resources > stats.maxValue.resourcesTotal){
					stats.maxValue.resourcesTotal = resources;
				}
				if (overview > stats.maxValue.overviewTotal){
					stats.maxValue.overviewTotal = overview;
				}
			}
		}
	},
	currentTabId: '',
	setView: function(id){
		if (id !== stats.currentTabId){
			stats.currentTabId = id;
			var str = stats[id]();
			document.getElementById('gameStatsTable').innerHTML = str;
		}
	},
	barAnimate: new TweenMax.delayedCall(0, ''),
	animate: function(a, delay){
		setTimeout(function(){
			var x = {
				max: 100,
				lastVal: 0
			};
			stats.barAnimate.kill();
			stats.barAnimate = TweenMax.to(x, delay, {
				startAt: {
					max: 0
				},
				max: 100,
				onUpdate: function(){
					if (~~x.lastVal !== ~~x.max){
						x.lastVal = x.max;
						audio.play('rollover5');
					}
				},
				onComplete: function(){
					audio.play('switch11');
				},
				ease: Sine.easeOut
			});
			for (var i=1, len=a.length; i<len; i++){
				var d = a[i];
				(function(d, e, bar, Sine){
					TweenMax.to(d, delay, {
						startAt: {
							max: 0
						},
						max: d.max,
						onUpdate: function(){
							e.textContent = ~~d.max;
						},
						ease: Sine.easeOut
					});
					TweenMax.to(bar, delay, {
						startAt: {
							width: 0
						},
						width : ((d.max / stats.maxValue[d.key]) * 100) + '%',
						ease: Sine.easeOut
					});
				})(d, document.getElementById(d.id), document.getElementById(d.id + '-bar'), Sine);
			}
		});
	},
	statOverview: function(){
		// head
		var str = stats.playerHead(['Units', 'Structures', 'Weapons', 'Resources', 'Total Score']);
		// player rows
		var animate = [];
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (stats.data[i] !== undefined){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-units',
						max: stats.unitsTotal(i),
						key: 'unitsTotal'
					}, {
						id: 'p'+ i +'-structures',
						max: stats.structuresTotal(i),
						key: 'structuresTotal'
					}, {
						id: 'p'+ i +'-weapons',
						max: stats.weaponsTotal(i),
						key: 'weaponsTotal'
					}, {
						id: 'p'+ i +'-resources',
						max: stats.resourcesTotal(i),
						key: 'resourcesTotal'
					}, {
						id: 'p'+ i +'-total',
						max: stats.overviewTotal(i),
						key: 'overviewTotal'
					},
				]
				stats.animate(a, 1.5);
				str += '<tr class="stagBlue statRow">' +
					stats.playerCell(d, i);
					var color = game.player[i].playerColor,
						a = ['units', 'structures', 'weapons', 'resources', 'total'],
						len = a.length;
					for (var j=0; j<len; j++){
						var sumRow = (j+1 === len) ? ' statSum' : '';
						str += 
						'<td class="statTD">\
							<div class="statBar pb'+ color +'">\
								<div id="p'+ i +'-'+ a[j] +'-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
								<div id="p'+ i +'-'+ a[j] +'" class="statVal'+ sumRow +'">0</div>\
							</div>\
						</td>';
					}
				str += '</tr>\
				<tr class="statSpacer"></tr>';
			}
		}
		return str;
	},
	statUnits: function(){
		// head
		var str = stats.playerHead(['Earned', 'Deployed', 'Killed', 'Lost']);
		// player rows
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (d !== undefined){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-earned',
						max: d.earned,
						key: 'earned'
					}, {
						id: 'p'+ i +'-deployed',
						max: d.deployed,
						key: 'deployed'
					}, {
						id: 'p'+ i +'-killed',
						max: d.killed,
						key: 'killed'
					}, {
						id: 'p'+ i +'-lost',
						max: d.lost,
						key: 'lost'
					},
				]
				stats.animate(a, 1.5);
				str += '<tr class="stagBlue statRow">' +
					stats.playerCell(d, i);
					var color = game.player[i].playerColor,
						a = ['earned', 'deployed', 'killed', 'lost'],
						len = a.length;
					for (var j=0; j<len; j++){
						str += 
						'<td class="statTD">\
							<div class="statBar pb'+ color +'">\
								<div id="p'+ i +'-'+ a[j] +'-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
								<div id="p'+ i +'-'+ a[j] +'" class="statVal">0</div>\
							</div>\
						</td>';
					}
				str += '</tr>\
				<tr class="statSpacer"></tr>';
			}
		}
		return str;
	},
	statStructures: function(){
		// head
		var str = stats.playerHead(['Bunkers', 'Walls', 'Fortresses']);
		// player rows
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (d !== undefined){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-bunkers',
						max: d.bunkers,
						key: 'bunkers'
					}, {
						id: 'p'+ i +'-walls',
						max: d.walls,
						key: 'walls'
					}, {
						id: 'p'+ i +'-fortresses',
						max: d.fortresses,
						key: 'fortresses'
					}
				]
				stats.animate(a, 1);
				str += '<tr class="stagBlue statRow">' +
					stats.playerCell(d, i);
					var color = game.player[i].playerColor,
						a = ['bunkers', 'walls', 'fortresses'],
						len = a.length;
					for (var j=0; j<len; j++){
						str += 
						'<td class="statTD">\
							<div class="statBar pb'+ color +'">\
								<div id="p'+ i +'-'+ a[j] +'-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
								<div id="p'+ i +'-'+ a[j] +'" class="statVal">0</div>\
							</div>\
						</td>';
					}
					str += '</tr>\
				<tr class="statSpacer"></tr>';
			}
		}
		return str;
	},
	statWeapons: function(){
		// head
		var str = stats.playerHead(['Cannons', 'Missiles', 'Nukes']);
		// player rows
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (d !== undefined){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-cannons',
						max: d.cannons,
						key: 'cannons'
					}, {
						id: 'p'+ i +'-missiles',
						max: d.missiles,
						key: 'missiles'
					}, {
						id: 'p'+ i +'-nukes',
						max: d.nukes,
						key: 'nukes'
					}
				]
				stats.animate(a, 1);
				str += '<tr class="stagBlue statRow">'+
					stats.playerCell(d, i);
					var color = game.player[i].playerColor,
						a = ['cannons', 'missiles', 'nukes'],
						len = a.length;
					for (var j=0; j<len; j++){
						str += 
						'<td class="statTD">\
							<div class="statBar pb'+ color +'">\
								<div id="p'+ i +'-'+ a[j] +'-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
								<div id="p'+ i +'-'+ a[j] +'" class="statVal">0</div>\
							</div>\
						</td>';
					}
					str += '</tr>\
				<tr class="statSpacer"></tr>';
			}
		}
		return str;
	},
	statResources: function(){
		// head
		var str = stats.playerHead(['Oil', 'Crystals', 'Food', 'Culture']);
		// player rows
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (d !== undefined){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-moves',
						max: d.moves,
						key: 'moves'
					}, {
						id: 'p'+ i +'-crystals',
						max: d.crystals,
						key: 'crystals'
					}, {
						id: 'p'+ i +'-food',
						max: d.food,
						key: 'food'
					}, {
						id: 'p'+ i +'-culture',
						max: d.culture,
						key: 'culture'
					}
				]
				stats.animate(a, 1.5);
				str += '<tr class="stagBlue statRow">' +
					stats.playerCell(d, i);
					var color = game.player[i].playerColor;
					str += '<td class="statTD">\
						<div class="statBar pb'+ color +'">\
							<div id="p'+ i +'-moves-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
							<div id="p'+ i +'-moves" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ color +'">\
							<div id="p'+ i +'-crystals-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
							<div id="p'+ i +'-crystals" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ color +'">\
							<div id="p'+ i +'-food-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
							<div id="p'+ i +'-food" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ color +'">\
							<div id="p'+ i +'-culture-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
							<div id="p'+ i +'-culture" class="statVal">0</div>\
						</div>\
					</td>\
				</tr>\
				<tr class="statSpacer"></tr>';
			}
		}
		return str;
	},
	playerHead: function(column){
		var str = '<tr><th style="width: 35%"></th>';
		for (var i=0, len=column.length; i<len; i++){
			if (i === 4){
				str += '<th class="text-center statHead chat-warning">'+ column[i] +'</th>';
			} else {
				str += '<th class="text-center statHead">'+ column[i] +'</th>';
			}
		}
		str += '</tr><tr class="statSpacer2"></tr>';
		return str;
	},
	playerCell: function(p, i){
		i = game.player[i].playerColor;
		var flag = p.flag === 'Default.jpg' ? 'Player'+ i +'.jpg' : p.flag;
		var str = '<td>\
			<img class="statsFlags" src="images/flags/'+ flag +'">\
			<div class="statsPlayerWrap">\
				<div class="statsAccount chat-warning nowrap">\
					<i class="fa fa-gavel diploSquare statsGov player'+ i +'"></i>';
					if (g.teamMode){
						str += '<span class="diploTeam">'+ game.player[i].team +'</span>';
					}
					str += p.account +
				'</div>\
				<div class="statsNation nowrap">'+ p.nation +'</div>\
			</div>\
		</td>'
		return str;
	},
	data: {},
	gameDuration: function(data){
		return stats.hours(data) + stats.minutes(data) +':'+ stats.seconds(data)
	},
	hours: function(data){
		var hours = '';
		if (data >= 3600){
			hours = ~~(data / 3600) + ':';
		}
		return hours;
	},
	minutes: function(data){
		var min = '';
		if (data < 60){
			if (data >= 3600){
				min = '00:';
			}
		} else {
			min = ~~(data / 60 % 60);
			if (min < 10){
				min = '0' + min + '';
			}
		}
		return min;
	},
	seconds: function(data){
		var sec = ~~(data % 60);
		if (sec < 10){
			return '0' + sec + '';
		}
		return sec;
	},
	get: function(){
		$.ajax({
			url: 'php/stats.php',
		}).done(function(data){
			stats.data = data;
			stats.init(data);
			stats.notifyRibbons(data.ribbons);
		});
	},
	achievements: [],
	notifyRibbons: function(data){
		var str = '';
		data.forEach(function(e){
			str += 
			'<div class="ribbonName ranked">'+ game.ribbonTitle[e] +'</div>\
			<div class="ribbonDescription ranked">'+ game.ribbonDescription[e] +'</div>\
			<img class="giantRibbon block" src="images/ribbons/ribbon'+ e +'.jpg">';  
		});
		document.getElementById('ribbonBody').innerHTML = str;
		stats.achievements = data;
		if (stats.achievements.length){
			new Audio('sound/ding3.mp3');
		}
	},
	overviewTotal: function(i){
		var x = stats.data[i];
		return this.unitsTotal(i) + this.structuresTotal(i) + this.weaponsTotal(i) + this.resourcesTotal(i);
	},
	unitsTotal: function(i){
		var x = stats.data[i];
		return (x.deployed * 100) + (x.killed * 3);
	},
	structuresTotal: function(i){
		var x = stats.data[i];
		return (x.bunkers * 80) + (x.walls * 140) + (x.fortresses * 200);
	},
	weaponsTotal: function(i){
		var x = stats.data[i];
		return (x.cannons * 40) + (x.missiles * 60) + (x.nukes * 400);
	},
	resourcesTotal: function(i){
		var x = stats.data[i];
		return ~~( (x.food / 20) + (x.culture / 60) + (x.crystals / 20) );
	}
}// animate.js
var animate = {
	nationName: function(){
		var tl = new TimelineMax();
		var split = new SplitText(".configureNationName", {
			type: "words,chars"
		});
		var chars = split.chars;
		tl.staggerFromTo(chars, .05, {
			immediateRender: true,
			alpha: 0
		}, {
			delay: .25,
			alpha: 1
		}, .016);
	},
	colors: [
		'#ffffff',
		'#ffdddd',
		'#ffddaa',
		'#ffeecc',
		'#ffffaa',
		'#ffffcc'
	],
	randomColor: function(){
		return animate.colors[~~(Math.random()*6)];
	},
	getXY: function(tile){
		var box = DOM['unit' + tile].getBBox(),
			o = {
				x: box.x,
				y: box.y
			}
		return o;
	},
	upgrade: function(tile){
		audio.play('build');
		var box = DOM['unit' + tile].getBBox();
		var x = box.x + box.width/2 - 10;
		var y = box.y + box.height/2 + 10;
		// smoke
		var size = game.tiles[tile].defense - game.tiles[tile].capital ? 1 : 0;
		for (var i=1; i<=(3 + (size*3)); i++){
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
			svg.setAttributeNS(null, 'height', 256);
			svg.setAttributeNS(null, 'width', 256);
			svg.setAttributeNS(null,"x",x);
			svg.setAttributeNS(null,"y",y);
			svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/goldSmoke.png');
			DOM.mapAnimations.appendChild(svg);
			TweenMax.to(svg, .5, {
				startAt: {
					xPercent: -50,
					yPercent: -50,
					transformOrigin: '50% 50%',
					alpha: 1,
					scale: 0
				},
				scale: i*.1,
				alpha: 0,
				onComplete: function(){
					this.target.parentNode.removeChild(this.target);
				}
			});
		}
		// show shield
		var shield = document.createElementNS("http://www.w3.org/2000/svg","image");
		shield.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/bulwark.png");
		shield.setAttributeNS(null,"width",28);
		shield.setAttributeNS(null,"height",32);
		shield.setAttributeNS(null,"x",x);
		shield.setAttributeNS(null,"y",y);
		DOM.mapAnimations.appendChild(shield);
		TweenMax.to(shield, .5, {
			startAt: {
				xPercent: -50,
				yPercent: -50,
				transformOrigin: '50% 50%',
				alpha: 1,
				scale: .1
			},
			scale: 1,
			ease: Back.easeOut.config(3)
		});
		TweenMax.to(shield, 1.5, {
			y: '-=30'
		});
		TweenMax.to(shield, .5, {
			delay: 1.5,
			alpha: 0,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		// update bars
		this.updateMapBars(tile);
	},
	updateMapBars: function(tile){
		var box = DOM['unit' + tile].getBBox(),
			x = box.x + box.width/2 - 10,
			y = box.y + box.height/2 + 10;
		$(".mapBars" + tile).remove();
		this.initMapBars(tile, x, y);
		// console.info("UPDATING MAP BARS");
	},
	initMapBars: function(i, x, y){
		var e = DOM['unit' + i];
		var x = e.getAttribute('x') - 24;
		var y = e.getAttribute('y') - 24;
		
		var boxHeight = 6;
		if (game.tiles[i].culture){
			boxHeight += 4;
		}
		if (game.tiles[i].defense){
			boxHeight += 4;
		}
		var foodWidth = game.tiles[i].food * 3;
		if (foodWidth > 24){
			foodWidth = 24;
		}
		// wrapper
		x += 4
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		svg.setAttributeNS(null, 'width', 26);
		svg.setAttributeNS(null, 'height', boxHeight);
		svg.setAttributeNS(null,"x",x);
		svg.setAttributeNS(null,"y",y + 26);
		svg.setAttributeNS(null,"fill","#2a2a2a");
		svg.setAttributeNS(null,"stroke","#000000");
		svg.setAttributeNS(null,"opacity",1);
		svg.setAttributeNS(null,"class","mapBars" + i);
		DOM.mapBars.appendChild(svg);
		// food
		y += 29;
		x += 1
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		svg.setAttributeNS(null,"x1",x);
		svg.setAttributeNS(null,"y1",y);
		svg.setAttributeNS(null,"x2",x + foodWidth);
		svg.setAttributeNS(null,"y2",y);
		svg.setAttributeNS(null,"stroke","#88dd00");
		svg.setAttributeNS(null,"stroke-width","3");
		svg.setAttributeNS(null,"opacity",1);
		svg.setAttributeNS(null,"class","mapBars mapBars" + i);
		DOM.mapBars.appendChild(svg);
		// culture
		if (game.tiles[i].culture){
			y += 4;
			var cultureWidth = game.tiles[i].culture * 3;
			if (cultureWidth > 24){
				cultureWidth = 24;
			}
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			svg.setAttributeNS(null,"x1",x);
			svg.setAttributeNS(null,"y1",y);
			svg.setAttributeNS(null,"x2",x + cultureWidth);
			svg.setAttributeNS(null,"y2",y);
			svg.setAttributeNS(null,"stroke","#dd22dd");
			svg.setAttributeNS(null,"stroke-width","3");
			svg.setAttributeNS(null,"opacity",1);
			svg.setAttributeNS(null,"class","mapBars mapBars" + i);
			DOM.mapBars.appendChild(svg);
		}
		// defense
		if (game.tiles[i].defense){
			y += 4;
			var defWidth = game.tiles[i].defense * 6;
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			svg.setAttributeNS(null,"x1",x);
			svg.setAttributeNS(null,"y1",y);
			svg.setAttributeNS(null,"x2",x + defWidth);
			svg.setAttributeNS(null,"y2",y);
			svg.setAttributeNS(null,"stroke","#ffff00");
			svg.setAttributeNS(null,"stroke-width","3");
			svg.setAttributeNS(null,"opacity",1);
			svg.setAttributeNS(null,"class","mapBars mapBars" + i);
			DOM.mapBars.appendChild(svg);
		}
	},
	gunfire: function(atkTile, defTile, playSound){
		var box1 = DOM['unit' + atkTile].getBBox(),
			box2 = DOM['unit' + defTile].getBBox();
		var sfx = ~~(Math.random()*9);
		var delay = [.6, .6, .43, .43, .43, .43, .9, .43, .76, .43];
		if (playSound){
			console.info(delay, sfx)
			audio.play('machine' + sfx);
		}
		var shots = 30,
			w1 = 50,
			h1 = 50,
			w2 = w1/2,
			h2 = h1/2 - 10;
		
		for (var i=0; i<shots; i++){
			(function(Math, Linear){
				var path = document.createElementNS("http://www.w3.org/2000/svg","path"),
					x2 = box2.x + (Math.random() * w1) - w2;
					y2 = box2.y + (Math.random() * h1) - h2;
				var drawPath = Math.random() > .5 ? 
					"M "+ (box1.x + ~~(Math.random()*16)-8) +","+ (box1.y + ~~(Math.random()*16)-8) + ' '+ x2 +","+ y2 :
					"M "+ x2 +","+ y2 +' ' + (box1.x + ~~(Math.random()*16)-8) +","+ (box1.y + ~~(Math.random()*16)-8)
				path.setAttributeNS(null,"stroke",animate.randomColor());
				path.setAttributeNS(null,"stroke-width",1);
				DOM.world.appendChild(path);
				TweenMax.to(path, .075, {
					delay: (i / shots) * delay[sfx],
					startAt: {
						attr: {
							d: drawPath
						},
						drawSVG: '0%'
					},
					drawSVG: '0% 100%',
					ease: Power2.easeIn,
					onComplete: function(){
						TweenMax.to(path, .125, {
							drawSVG: '100% 100%',
							ease: Power2.easeOut,
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							}
						});
					}
				});
			})(Math, Quad);
		}
	},
	cannons: function(atkTile, defTile, playSound){
		var box1 = DOM['land' + atkTile].getBBox(),
			box2 = DOM['land' + defTile].getBBox(),
			box3 = DOM['unit' + defTile].getBBox();
		if (game.tiles[atkTile].player === my.player){
			var a = [5, 6, 8];
			var sfx = ~~(Math.random() * 3);
			audio.play('grenade' + a[sfx]);
		}
		var x1 = box1.x + box1.width * .5;
			y1 = box1.y + box1.height * .5,
			w1 = box2.width * .5,
			w2 = w1/2,
			h1 = box2.height * .5,
			h2 = h1/2 - 10;
		for (var i=0; i<20; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle"),
					x2 = box3.x + (Math.random() * w1) - w2,
					y2 = box3.y + (Math.random() * h1) - h2;
				circ.setAttributeNS(null,"cx",x1);
				circ.setAttributeNS(null,"cy",y1);
				circ.setAttributeNS(null,"r",4);
				circ.setAttributeNS(null,"fill",g.color[game.player[game.tiles[atkTile].player].playerColor]);
				circ.setAttributeNS(null,"stroke",animate.randomColor());
				circ.setAttributeNS(null,"strokeWidth",1);
				DOM.mapAnimations.appendChild(circ);
				
				TweenMax.to(circ, .08, {
					delay: i * .0125,
					startAt: {
						alpha: 1
					},
					attr: {
						cx: x2,
						cy: y2
					},
					ease: Linear.easeNone,
					onComplete: function(){
						// explode outward
						var d1 = Math.random()*.5 + .3,
							d2 = d1/2,
							s1 = (d1 * 10) + 3;
						TweenMax.to(circ, d2, {
							startAt: {
								fill: 'none',
								strokeWidth: 0,
								attr: {
									r: 0
								}
							},
							strokeWidth: s1,
							attr: {
								r: s1/2
							},
							ease: Linear.easeNone,
							onComplete: function(){
							// explode fades from inner
								TweenMax.to(circ, d2, {
									attr: {
										r: s1
									},
									strokeWidth: 0,
									ease: Sine.easeOut
								});
								TweenMax.to(circ, d2, {
									alpha: 0,
									onComplete: function(){
										this.target.parentNode.removeChild(this.target);
									},
									ease: Sine.easeOut
								});
							}
						});
					}
				});
			})(Math);
		}
		animate.smoke(defTile, box3.x, box3.y, .8);
	},
	missile: function(attacker, defender, playSound){
		if (playSound){
			audio.play('missile7');
		}
		var e2 = DOM['unit' + attacker],
			boxA = e2.getBBox(),
			x1 = boxA.x + boxA.width/2,
			y1 = boxA.y + boxA.height/2,
			e3 = DOM['unit' + defender],
			boxB = e3.getBBox(),
			x2 = boxB.x + boxB.width/2,
			y2 = boxB.y + boxB.height/2;
			
		// get missile line coordinates
		my.motionPath[0] = e2.getAttribute('x')*1 - 10;
		my.motionPath[1] = e2.getAttribute('y')*1 - 10;
		my.motionPath[4] = e3.getAttribute('x')*1 - 10;
		my.motionPath[5] = e3.getAttribute('y')*1 - 10;
		my.motionPath[2] = (my.motionPath[0] + my.motionPath[4]) / 2;
		my.motionPath[3] = ((my.motionPath[1] + my.motionPath[5]) / 2) - (Math.abs(x1-x2)/3);
		TweenMax.set(DOM.motionPath, {
			attr: {
				d: "M " + my.motionPath[0] +","+ my.motionPath[1] + ' ' +
					+ my.motionPath[4] +" "+ my.motionPath[5]
			}
		});
		var mis = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		mis.setAttributeNS(null, "cx", x1);
		mis.setAttributeNS(null, "cy", y1);
		mis.setAttributeNS(null, "r", 12);
		mis.setAttributeNS(null,"fill",g.color[game.player[game.tiles[attacker].player].playerColor]);
		mis.setAttributeNS(null,"stroke","#ffddaa");
		mis.setAttributeNS(null,"stroke-width",2);
		DOM.mapAnimations.appendChild(mis);
		var count = 0;
		TweenMax.to(mis, .1, {
			attr: {
				r: 3
			},
			repeat: -1
		});
		TweenMax.to(mis, 1, {
			startAt: {
				alpha: 1,
				xPercent: -50,
				yPercent: -50
			},
			attr: {
				cx: x2,
				cy: y2
			},
			ease: Power2.easeIn,
			onUpdate: function(){
				count++;
				if (count % 2 === 0){
					// smoke trail
					var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
					svg.setAttributeNS(null, 'height', 40);
					svg.setAttributeNS(null, 'width', 40);
					svg.setAttributeNS(null, 'opacity', 1);
					svg.setAttributeNS(null, "x", mis.getAttribute('cx')-10);
					svg.setAttributeNS(null, "y", mis.getAttribute('cy')-10);
					svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/smoke.png');
					DOM.mapAnimations.appendChild(svg);
					TweenMax.to(svg, .3, {
						startAt: {
							xPercent: -50,
							yPercent: -50,
							transformOrigin: '50% 50%'
						},
						scale: 3,
						onComplete: function(){
							this.target.parentNode.removeChild(this.target);
						}
					});
					TweenMax.to(svg, .5, {
						alpha: 0
					});
				}
			},
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
				animate.missileExplosion(defender, g.color[game.player[game.tiles[attacker].player].playerColor]);
			}
		});
		/*
		var path = MorphSVGPlugin.pathDataToBezier('#motionPath', {
			align: 'relative'
		});
			bezier: {
				values: path,
				type: 'cubic',
				curviness: 1.5,
				autoRotate: true
			},
		*/
	},
	missileExplosion: function(tile, misColor){
		var box = DOM['unit' + tile].getBBox(),
			a = [5, 6, 8],
			sfx = ~~(Math.random() * 3);
		audio.play('grenade' + a[sfx]);
		var x = 0,
			y = 0;
		for (var i=0; i<5; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				x = box.x + Math.random() * 60 - 30;
				y = box.y + Math.random() * 60 - 30;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",0);
				circ.setAttributeNS(null,"fill",misColor);
				circ.setAttributeNS(null,"stroke",'#ffffaa');
				DOM.mapAnimations.appendChild(circ);
				
				var delay = i * .05;
				TweenMax.to(circ, .75, {
					delay: delay,
					attr: {
						r: 32
					},
					onComplete: function(){
						TweenMax.to(circ, 1, {
							attr: {
								r: 1
							},
							ease: Power1.easeIn,
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							},
						});
					},
					ease: Power4.easeOut
				});
				TweenMax.to(circ, .1, {
					fill: "hsl(+=0%, +=0%, +="+ ~~(Math.random()*100) +"%)",
					repeat: -1
				});
				TweenMax.to(circ, 1.75, {
					startAt:{
						alpha: 1
					},
					alpha: 0,
					ease: Power2.easeIn
				});
			})(Math);
		}
		animate.smoke(tile, x, y, 1);
	},
	nuke: function(tile, attacker){
		var box = DOM['unit' + tile].getBBox();
		var x = box.x;
		var y = box.y;
		// bomb shadow
		shadow = document.createElementNS("http://www.w3.org/2000/svg","ellipse");
		shadow.setAttributeNS(null,"cx",x);
		shadow.setAttributeNS(null,"cy",y);
		shadow.setAttributeNS(null,"rx",2);
		shadow.setAttributeNS(null,"ry",1);
		shadow.setAttributeNS(null,"fill",'#000000');
		shadow.setAttributeNS(null,"stroke",'none');
		DOM.mapAnimations.appendChild(shadow);
		TweenMax.to(shadow, 1, {
			startAt: {
				opacity: .5
			},
			attr: {
				rx: 10,
				ry: 5
			},
			ease: Power1.easeIn,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		// drop bomb svg
		var bomb = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		bomb.setAttributeNS(null, "cx", x);
		bomb.setAttributeNS(null, "cy", y - g.screen.height);
		bomb.setAttributeNS(null, "r", 15);
		bomb.setAttributeNS(null,"fill",g.color[game.player[attacker].playerColor]);
		bomb.setAttributeNS(null,"stroke","#ffddaa");
		bomb.setAttributeNS(null,"stroke-width",2);
		DOM.mapAnimations.appendChild(bomb);
		var count = 0;
		TweenMax.to(bomb, .1, {
			attr: {
				r: 3
			},
			ease: Linear.easeIn,
			repeat: -1
		});
		TweenMax.to(bomb, 1, {
			startAt: {
				alpha: 1,
			},
			attr: {
				cy: y
			},
			ease: Power1.easeIn,
			onComplete: function(){
				this.target.parentNode.removeChild(bomb);
			}
		});
		new Image('images/smoke.png');
		// start bomb explosion sequence
		TweenMax.to(g, 1, {
			onComplete: function(){
				audio.play('bomb9');
				/*
				TweenMax.to(DOM.screenFlash, .1, {
					startAt: {
						opacity: 1,
						background: '#ffffff'
					},
					opacity: 0,
					background: '#ff8800',
					ease: Expo.easeOut
				});
				*/
				// shake
				// animate.screenShake(16, 10, .016, true);
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",1);
				circ.setAttributeNS(null,"fill",g.color[game.player[attacker].playerColor]);
				circ.setAttributeNS(null,"stroke",'#ffdd88');
				DOM.mapAnimations.appendChild(circ);
				
				TweenMax.to(circ, 1.5, {
					startAt: {
						alpha: 1
					},
					attr: {
						r: 80
					},
					onComplete: function(){
						TweenMax.to(circ, 1, {
							attr: {
								r: 50
							},
							ease: Power1.easeIn
						});
					},
					ease: Power3.easeOut
				});
				TweenMax.to(circ, .05, {
					fill: "hsl(+=0%, +=0%, +=30%)",
					repeat: -1,
					yoyo: true,
					ease: SteppedEase.config(6)
				});
				TweenMax.to(circ, 2.5, {
					alpha: 0,
					ease: Power4.easeIn,
					onComplete: function(){
						this.target.parentNode.removeChild(this.target);
					}
				});
				
				animate.smoke(tile, x, y);
				animate.smoke(tile, x, y);
				animate.smoke(tile, x, y);
				animate.smoke(tile, x, y);
			}
		});
	},
	logo: function(linear){
		var globeDelay = 1;
		// animate stars
		var stars = [
			document.getElementById('firmamentWarsStars1'),
			document.getElementById('firmamentWarsStars2'),
			document.getElementById('firmamentWarsStars3')
		];
		
		TweenMax.to(stars[0], 150, {
			backgroundPosition: '-800px 0px', 
			repeat: -1,
			ease: linear
		});
		TweenMax.to(stars[1], 100, {
			startAt: {
				backgroundPosition: '250px 250px', 
			},
			backgroundPosition: '-1050px 250px', 
			repeat: -1,
			ease: linear
		});
		TweenMax.to(stars[2], 60, {
			startAt: {
				backgroundPosition: '600px 500px', 
			},
			backgroundPosition: '-200px 500px', 
			repeat: -1,
			ease: linear
		});
		// logo
		var fwLogo = document.getElementById('firmamentWarsLogo');
		TweenMax.to(fwLogo, globeDelay, {
			startAt: {
				transformPerspective: 1600,
				transformOrigin: '50% 50% -1600',
				rotationY: 180,
				scale: .2,
				visibility: 'visible',
				alpha: 0,
				yPercent: -50,
				y: '-50%'
			},
			rotationY: 0,
			scale: 1,
			alpha: 1,
			ease: Quad.easeInOut
		});
		
		TweenMax.to('#titleMain', .5, {
			delay: globeDelay,
			startAt: {
				visibility: 'visible'
			},
			alpha: 1,
			onComplete: function(){
				$("#title-chat-input").focus();
				resizeWindow();
			},
			ease: Quad.easeIn
		});
		// globe
		var globe = document.getElementById('titleGlobe');
		TweenMax.to(globe, globeDelay, {
			y: '10%'
		});
	},
	smoke: function(tile, x, y, scale){
		if (x === undefined){
			var o = animate.getXY(tile);
			x = o.x;
			y = o.y;
		}
		if (scale === undefined){
			scale = 1.25;
		}
		var smoke = document.createElementNS("http://www.w3.org/2000/svg","image");
		smoke.setAttributeNS(null,"width",256);
		smoke.setAttributeNS(null,"height",256);
		smoke.setAttributeNS(null,"x",x);
		smoke.setAttributeNS(null,"y",y);
		smoke.setAttributeNS(null,"opacity",0);
		smoke.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/smoke.png");
		DOM.mapUpgrades.appendChild(smoke);
		TweenMax.to(smoke, 3, {
			startAt: {
				alpha: 1,
				transformOrigin: '50% 50%',
				xPercent: -50,
				yPercent: -50,
				scale: 0
			},
			ease: Power4.easeOut,
			scale: scale
		});
		TweenMax.to(smoke, 3, {
			alpha: 0,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		
	},
	screenShake: function(count, d, interval, fade){
		// number of shakes, distance of shaking, interval of shakes
		var foo = 0;
		(function doit(count, d, interval, e, M){
			var d2 = d/2;
			if (fade){
				if (foo % 2 === 0){
					d--;
					if (d < 2){
						d = 2;
					}
				}
			}
			TweenMax.to(e, interval, {
				x: ~~(M.random()*(d)-d2),
				y: ~~(M.random()*(d)-d2),
				onComplete:function(){
					TweenMax.to(e, interval, {
						x: ~~(M.random()*(d)-d2),
						y: ~~(M.random()*(d)-d2),
						onComplete:function(){
							TweenMax.to(e, interval, {
								x: ~~(M.random()*(d)-d2),
								y: ~~(M.random()*(d)-d2),
								onComplete:function(){
									TweenMax.to(e, interval,{
										x: 0,
										y: 0,
										onComplete: function(){
											foo++;
											if(foo < count){ 
												doit(count, d, interval, e, M); 
											}
										}
									});
								}
							});
						}
					});
				}
			});
		})(count, d, interval, DOM.gameWrap, Math);
	},
	water: function(){
		/*
		var delay = 100,
			e1 = document.getElementById('worldWater1'),
			e2 = document.getElementById('worldWater2'),
			e3 = document.getElementById('worldWater3'),
			e4 = document.getElementById('worldWater4');
		// animate water
		// up left
		TweenMax.to(e1, delay, {
			backgroundPosition: '-800px -800px',
			repeat: -1,
			ease: Linear.easeNone
		});
		// down right
		TweenMax.to(e2, delay, {
			startAt: {
				backgroundPosition: '400px 300px'
			},
			backgroundPosition: '1200px 1100px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		// down left
		TweenMax.to(e3, delay, {
			startAt: {
				backgroundPosition: '200px 150px', 
			},
			backgroundPosition: '200px -650px', 
			repeat: -1,
			yoyo: true,
			ease: Linear.easeNone
		});
		// up right
		TweenMax.to(e4, delay, {
			startAt: {
				backgroundPosition: '600px 250px', 
			},
			backgroundPosition: '-200px 1050px', 
			repeat: -1,
			yoyo: true,
			ease: Linear.easeNone
		});
		*/
	},
	glowTile: function(oldTgt, newTgt){
		var e1 = document.getElementById('land' + oldTgt),
			e2 = document.getElementById('land' + newTgt);
		TweenMax.set(e1, {
			stroke: '#85daf2',
			filter: '',
			strokeWidth: 1
		});
		TweenMax.set(e2, {
			stroke: '#aaeeff',
			filter: 'url(#glow)',
			strokeWidth: 2
		});
		game.updateTopTile(newTgt);
	}
}// core.js
$.ajaxSetup({
	type: 'POST',
	timeout: 5000
});
if (location.host !== 'localhost'){
	console.log = function(){};
	console.info = function(){};
}
TweenMax.defaultEase = Quad.easeOut;
var g = {
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
		'#707000',
		'#888888'
	],
	rankedMode: 0,
	teamMode: 0,
	joinedGame: false,
	searchingGame: false,
	defaultTitle: 'Firmament Wars | Multiplayer Grand Strategy Warfare',
	titleFlashing: false,
	name: "",
	password: "",
	speed: 10,
	speeds: {
		Slower: 15000,
		Slow: 12000,
		Normal: 10000,
		Fast: 8000,
		Faster: 6000,
		Fastest: 5000
	},
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
	showSpectateButton: 1,
	victory: false,
	startTime: Date.now(),
	keyLock: false,
	loadAttempts: 0,
	upgradeCost: [80, 140, 200],
	isModalOpen: false,
	lock: function(clear){
		g.overlay.style.display = "block";
		clear ? g.overlay.style.opacity = 0 : g.overlay.style.opacity = 1;
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
		fullScreen: true,
		width: window.innerWidth,
		height: window.innerHeight,
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
			if (css){
				$DOM.head.append(css);
			}
		}
	},
	mouse: {
		zoom: 100,
		mouseTransX: 50,
		mouseTransY: 50
	},
	map: {
		sizeX: 2000,
		sizeY: 1000,
		name: 'Earth Alpha',
		key: 'EarthAlpha',
		tiles: 83
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
				localStorage.setItem('geo', JSON.stringify(g.geo));
				localStorage.setItem('geoTime', Date.now());
				$.ajax({
					url: 'php/updateUserInfo.php',
					data: {
						location: g.geo
					}
				});
				
				
			var foo = JSON.parse(geo);
			g.config.location = foo.location;
			console.info('loc: ', g.config.location);
			});
		}
	},
	checkPlayerData: function(){
		var geo = localStorage.getItem('geo');
		var geoTime = localStorage.getItem('geoTime');
		if (geoTime !== null){
			// longer than 90 days?
			if ((Date.now() - geoTime) > 7776000){
				g.updateUserInfo();
			}
		} else if (geo === null){
			g.updateUserInfo();
		}
		// ignore list
		var ignore = localStorage.getItem('ignore');
		if (ignore !== null){
			g.ignore = JSON.parse(ignore);
		} else {
			var foo = [];
			localStorage.setItem('ignore', JSON.stringify(foo));
		}
		var friends = localStorage.getItem('friends');
		if (friends !== null){
			g.friends = JSON.parse(friends);
		} else {
			var friends = [];
			localStorage.setItem('friends', JSON.stringify(friends));
		}
	},
	config: {
		audio: {
			musicVolume: 50,
			soundVolume: 50
		}
	},
	geo: {},
	keepAlive: function(){
		$.ajax({
			type: 'GET',
			url: "php/keepAlive.php"
		}).always(function() {
			setTimeout(g.keepAlive, 300000);
		});
	},
	removeContainers: function(){
		$("#firmamentWarsLogoWrap, #mainWrap").remove();
	},
	notification: {},
	sendNotification: function(data){
		if (!document.hasFocus() && g.view !== 'game'){
			// it's a player message
			var type = ' says: ';
			if (data.flag && (data.msg || data.message)){
				console.info(data);
				console.info(data.message);
				console.info(data.msg);
				// sent by a player
				if (data.type === 'chat-whisper'){
					type = ' whispers: ';
				}
				var prefix = data.account + type;
				var flagFile = data.flag.replace(/-/g, ' ') + (data.flag === 'Nepal' ? '.png' : '.jpg');
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
	}
}
g.init = (function(){
	// console.info("Initializing game...");
	$('[title]').tooltip();
	// build map drop-down 
	var s = "<li><a class='flagSelect'>Default</a></li>";
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
			name: ['Albania', 'Austria', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'England', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Lithuania', 'Macedonia', 'Montenegro', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'Scotland', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom']
		},
		Eurasia: {
			group: "Eurasia",
			name: ['Armenia', 'Azerbaijan', 'Georgia', 'Kazakhstan', 'Uzbekistan']
		},
		Historic: {
			group: "Historic",
			name: ['Confederate Flag', 'Flanders', 'Gadsden Flag', 'Isle of Man', 'Rising Sun Flag', 'NSDAP Flag', 'NSDAP War Ensign', 'Shahanshahi', 'USSR', 'Welsh']
		},
		MiddleEast: {
			group: "Middle East",
			name: ['Israel', 'Jordan', 'Kurdistan', 'Lebanon', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Turkey']
		},
		NorthAmerica: {
			group: "North America",
			name: ['Bahamas', 'Barbados', 'Canada', 'Costa Rica', 'Cuba', 'Haiti', 'Honduras', 'Mexico', 'Saint Lucia', 'Trinidad and Tobago', 'United States']
		},
		Oceania: {
			group: "Oceania",
			name: ['Australia', 'New Zealand']
		},
		Miscellaneous: {
			group: "Miscellaneous",
			name: ['Anarcho-Capitalist', 'Christian', 'Edgemaster', 'European Union', 'High Energy', 'ISIS', 'Northwest Front', 'Pan-African Flag', 'pol', 'Rainbow Flag', 'United Nations']
		},
		SouthAmerica: {
			group: "South America",
			name: ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela']
		},
	}
	for (var key in flagData){
		s += "<li class='dropdown-header'>" + flagData[key].group + "</li>";
		flagData[key].name.forEach(function(e){
			s += "<li><a class='flagSelect' href='#'>" + e + "</a></li>";
		});
	}
	document.getElementById("flagDropdown").innerHTML = s;
	if (location.hostname === 'localhost'){
		$.ajax({
			type: "GET",
			url: 'php/rejoinGame.php' // check if already in a game
		}).done(function(data) {
			//console.info('rejoin ', data.gameId, data.team);
			if (data.gameId > 0){
				console.info("Auto joined game: " + data.team);
				my.player = data.player;
				my.playerColor = data.player;
				g.teamMode = data.teamMode;
				g.rankedMode = data.rankedMode;
				my.team = data.team;
				game.id = data.gameId;
				g.map = data.mapData;
				g.speed = g.speeds[data.speed];
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
		}).fail(function(data){
			Msg(data.responseText);
		}).always(function(){
			g.unlock();
		});
	}
})();
var game = {
	name: '',
	tiles: [],
	initialized: false,
	ribbonTitle: ['',
		'National Combat Medal',
		'Outstanding Communications Ribbon',
		'Presidential Citation Ribbon',
		'Ceremonial Commendation Ribbon',
		'Civic Service Ribbon',
		'Bronze Campaign Medal',
		'Bronze Service Medal',
		'Bronze Expeditionary Medal',
		'Bronze Cross',
		'Silver Cross',//10
		'Golden Cross',
		'Platinum Cross',
		'Outstanding Volunteer Ribbon',
		'Distinguished Resolve Citation',
		'Combat Service Award',
		'Combat Gallantry Award',
		'Vandamor Campaign Medal',
		"Global Commendation Ribbon",
		'Holy Trips Ribbon',
		'Sweet Quads Ribbon',//20
		'Double Dubs Ribbon',
		'Glorious Pents Ribbon',
		'Wicked Sexts Ribbon',
		'Triple Dubs Ribbon',
		'Righteous Septs Ribbon',
		'Almighty Octs Ribbon',
		'Quad Dubs Ribbon',
		"Champion's Medal",
		"Conqueror's Medal",
		"Commander's Medal",//30
		"Meritorious Service Medal",
		'Global War Expeditionary Medal',
		'Silver Expeditionary Medal',
		'Silver Campaign Medal',
		'Silver Service Medal',
		'Good Conduct Medal',
	],
	ribbonDescription: ['',
		'Established a new nation',
		'Confirmed your email address',
		'Backed a Kickstarter campaign',
		'Selected a national flag',
		'Named your nation',
		'Won 10 ranked games',
		'Won 10 team games',
		'Won 10 FFA games',
		'Achieved 1800+ rating',
		'Achieved 2100+ rating',//10
		'Achieved 2400+ rating',
		'Achieved 2700+ rating',
		'Reporting a significant bug, exploit, or suggested an improvement',
		'Acquired a custom flag',
		'Won 10+ games in a row', // 15
		'Won 25+ games in a row',
		'Beat Nevergrind on normal',
		'Provided your real country code',
		'Scored a 777 GET',
		'Scored a quad GET',//20
		'Scored a double dubs GET',
		'Scored a pents GET',
		'Scored a sexts GET',
		'Scored a triple dubs GET',
		'Scored a septs GET',
		'Scored an octs GET',
		'Scored a quad dubs GET',
		"Hit #1 on the leaderboard",
		"Hit top #100 on the leaderboard",
		"Hit top #1000 on the leaderboard",//30
		"Refer a friend that plays 25 games",
		'Win an 8-player FFA game',
		'Won 100 FFA games',
		'Won 100 ranked games',
		'Won 100 team games',
		'Played 200 games and maintained a disconnect rate below 5%',
	],
	toggleGameWindows: function(){
		TweenMax.set(DOM.gameWindows, {
			visibility: $("#targetWrap").css('visibility') === 'visible' ? 'hidden' : 'visible'
		});
	},
	player: [0,0,0,0,0,0,0,0,0], // cached values on client to reduce DB load
	initMap: function(){
		(function(d, len){
			for (var i=0; i<len; i++){
				DOM['land' + i] = d.getElementById('land' + i);
				DOM['flag' + i] = d.getElementById('flag' + i);
				DOM['unit' + i] = d.getElementById('unit' + i);
			}
		})(document, game.tiles.length);
	},
	updateTopTile: function(i){
		document.getElementById('topTile')
			.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#land' + i);
	},
	chat: function(data){
		while (DOM.chatContent.childNodes.length > 10) {
			DOM.chatContent.removeChild(DOM.chatContent.firstChild);
		}
		var z = document.createElement('div');
		if (data.type){
			z.className = data.type;
		}
		z.innerHTML = data.message;
		DOM.chatContent.appendChild(z);
		setTimeout(function(){
			if (z !== undefined){
				if (z.parentNode !== null){
					TweenMax.to(z, .125, {
						alpha: 0,
						onComplete: function(){
							z.parentNode.removeChild(z);
						}
					});
				}
			}
		}, 12000);
	},
	eliminatePlayer: function(data){
		// player eliminated
		var i = data.player,
			count = 0,
			teams = [];
		game.player[i].alive = false;
		// count alive players remaining
		game.player.forEach(function(e){
			if (e.alive && e.account){ 
				count++;
				if (teams.indexOf(e.team) === -1){
					teams.push(e.team);
				}
			}
		});
		// found 2 players on diplomacy panel
		$("#diplomacyPlayer" + i).removeClass('alive');
		if (g.teamMode){
			if (teams.length <= 1){
				// disables spectate button
				g.showSpectateButton = 0;
			}
		} else {
			if (count <= 1){
				// disables spectate button
				g.showSpectateButton = 0;
			}
		}
		// game over - insurance check to avoid multiples somehow happening
		if (!g.over){
			// it's not over... check with server
			console.info('ELIMINATED: ', count, teams.length);
			if (i === my.player){
				gameDefeat();
			} else {
				// check if I won
				if (g.teamMode){
					if (teams.length <= 1){
						setTimeout(function(){
							gameVictory();
						}, 1000);
					}
				} else {
					if (count <= 1){
						setTimeout(function(){
							gameVictory();
						}, 1000);
					}
				}
			}
		}
		// remove
		TweenMax.to('#diplomacyPlayer' + i, 1, {
			autoAlpha: 0,
			onComplete: function(){
				$("#diplomacyPlayer" + i).css('display', 'none');
			}
		});
		TweenMax.to('#diplomacyPlayer' + i, 1, {
			startAt: { 
				transformPerspective: 400,
				transformOrigin: '50% 0',
				rotationX: 0
			},
			height: 0,
			rotationX: -90
		});
		game.removePlayer(i);
	},
	removePlayer: function(p){
		game.tiles[p].account = '';
		game.tiles[p].nation = '';
		game.tiles[p].flag = '';
		for (var i=0, len=game.tiles.length; i<len; i++){
			if (game.tiles[i].player === p){
				if (game.tiles[i].capital){
					var e1 = document.getElementById('mapCapital' + i);
					if (e1 !== null){
						e1.remove();
					}
				}
				game.tiles[i].capital = false;
				game.tiles[i].account = '';
				game.tiles[i].defense = '';
				game.tiles[i].flag = '';
				game.tiles[i].nation = '';
				game.tiles[i].player = 0;
				game.tiles[i].units = 0;
				game.tiles[i].tile = i;
				game.updateTile(game.tiles[i]);
			}
		}
	},
	startGameState: function(){
		// add function to get player data list?
		game.getGameState();
		setInterval(game.updateResources, g.speed);
		delete game.startGameState;
	},
	getGameState: function(){
		// this is now a reality check in case zmq messes up?
		// or check that players are still online?
		$.ajax({
			type: "GET",
			url: "php/getGameState.php"
		}).done(function(data){
			// get tile data
			for (var i=0, len=data.tiles.length; i<len; i++){
				var d = data.tiles[i],
					updateTargetStatus = false;
				// check player value
				if (d.player !== game.tiles[i].player){
					// player value has changed
					if (!game.tiles[i].units){
						// set text visible if uninhabited
						// this confuses me still...
						TweenMax.set(DOM['unit' + i], {
							visibility: 'visible'
						});
					}
					// only update client data
					game.tiles[i].player = d.player;
					game.tiles[i].account = game.player[d.player].account;
					game.tiles[i].nation = game.player[d.player].nation;
					game.tiles[i].flag = game.player[d.player].flag;
					
					if (my.tgt === i){
						// current target was updated
						updateTargetStatus = true;
					}
					var newFlag = !game.player[d.player].flag ? 
						'blank.png' : 
						game.player[d.player].flag;
					if (DOM['flag' + i] !== null){
						DOM['flag' + i].href.baseVal = "images/flags/" + newFlag;
					}
					TweenMax.set(document.getElementById('land' + i), {
						fill: g.color[game.player[d.player].playerColor]
					});
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
					// update this tile within loop cycle?
					showTarget(document.getElementById('land' + i));
					game.updateTopTile(i);
				}
			}
		}).fail(function(data){
			console.info(data.responseText);
		});
	},
	updateDefense: function(data){
		var i = data.tile;
		game.tiles[i].defense = data.defense;
		animate.updateMapBars(i);
		if (my.tgt === i){
			showTarget(document.getElementById('land' + my.tgt));
		}
	},
	updateTile: function(d, override){
		var i = d.tile,
			p = d.player;
		// only update client data
		game.tiles[i].player = p;
		game.tiles[i].account = game.player[p].account;
		game.tiles[i].nation = game.player[p].nation;
		game.tiles[i].flag = game.player[p].flag;
		// set flag
		var newFlag = !game.player[p].flag ? 
			game.tiles[i].units ? 'Player0.jpg' : 'blank.png' 
			: game.player[p].flag;
		// change flag
		if (DOM['flag' + i] !== null){
			DOM['flag' + i].href.baseVal = "images/flags/" + newFlag;
		}
		// land color
		var land = document.getElementById('land' + i);
		TweenMax.set(land, {
			fill: g.color[game.player[p].playerColor]
		});
		
		// check unit value
		if (d.units){
			if (d.units !== game.tiles[i].units){
				var unitColor = d.units > game.tiles[i].units ? '#00ff00' : '#ff0000';
				game.tiles[i].units = d.units;
				setTileUnits(i, unitColor);
			}
			// set text visible
			TweenMax.set(DOM['unit' + i], {
				visibility: 'visible'
			});
		} else {
			// dead/surrender
			game.tiles[i].units = 0;
			// hide mapBars and unit values
			TweenMax.set(DOM['unit' + i], {
				visibility: 'hidden'
			});
		}
		
		if (my.tgt === i){
			// update this tile within loop cycle?
			showTarget(land);
			game.updateTopTile(i);
		}
	},
	updateResources: function(){
		if (!g.over){
			$.ajax({
				type: "GET",
				url: "php/updateResources.php"
			}).done(function(data){
				// console.info('resource: ', data);
				setResources(data);
				game.reportMilestones(data);
			}).fail(function(data){
				console.info(data.responseText);
				serverError(data);
			});
		}
	},
	reportMilestones: function(data){
		if (data.cultureMsg !== undefined){
			if (data.cultureMsg){
				var o = {
					message: data.cultureMsg
				};
				game.chat(o);
				audio.play('culture');
				// recruit bonus changes
				initOffensiveTooltips();
			}
		}
	}
}
// player data values
var my = {
	lastReceivedWhisper: '',
	account: '',
	channel: '',
	player: 0,
	playerColor: 0,
	team: 0,
	gameName: 'Earth Alpha',
	max: 8,
	tgt: 1,
	lastTgt: 1,
	capital: 0,
	lastTarget: {},
	units: 0,
	food: 0,
	production: 25,
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
	splitAttackCost: 1,
	attackCost: 2,
	deployCost: 20,
	recruitCost: 4,
	weaponCost: 1,
	maxDeployment: 24,
	buildCost: 1,
	targetData: {},
	selectedFlag: "Default",
	selectedFlagFull: "Default.jpg",
	government: 'Despotism',
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
		if (!g.spectateStatus){
			my.lastTgt = my.tgt;
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
			my.focusTile(my.tgt, .1);
			animate.glowTile(my.lastTgt, my.tgt);
		}
	},
	// shift camera to tile
	focusTile: function(tile, d){
		var e = DOM['land' + tile];
		if (e !== null){
			var box = e.getBBox();
			if (d === undefined){
				d = .5;
			}
			// init map position & check max/min values
			var x = -box.x + 512;
			if (x > 0){ 
				x = 0;
			}
			var xMin = (g.map.sizeX - g.screen.width) * -1;
			if (x < xMin){ 
				x = xMin;
			}
			
			var y = -box.y + 234; // 384 is dead center
			if (y > 0){ 
				y = 0;
			}
			var yMin = (g.map.sizeY - g.screen.height) * -1;
			if (y < yMin){ 
				y = yMin;
			}
			TweenMax.to(DOM.worldWrap, d, {
				force3D: false,
				x: x * g.resizeX,
				y: y * g.resizeY
			});
			showTarget(document.getElementById('land' + tile), false, 1);
			my.flashTile(tile);
		}
	},
	// flash text in land
	flashTile: function(tile){
		if (!my.attackOn){
			// flag unit text
			if (game.tiles[tile].units){
				TweenMax.to(DOM['unit' + tile], .05, {
					startAt: {
						transformOrigin: '50% 50%',
						fill: '#0ff'
					},
					fill: '#ffffff',
					ease: SteppedEase.config(1),
					repeat: 6,
					yoyo: true
				});
				TweenMax.set(DOM['unit' + tile], {
					visibility: 'visible'
				});
			}
		}
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
		gameWindows: d.getElementsByClassName('gameWindow'),
		sumMoves: d.getElementById('sumMoves'),
		moves: d.getElementById('moves'),
		gameWrap: d.getElementById('gameWrap'),
		gameTableBody: d.getElementById('gameTableBody'),
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
		lobbyChatInput: d.getElementById("lobby-chat-input"),
		titleChatInput: d.getElementById("title-chat-input"),
		worldWrap: d.getElementById('worldWrap'),
		motionPath: d.getElementById('motionPath'),
		targetLine: d.getElementById('targetLine'),
		targetLineShadow: d.getElementById('targetLineShadow'),
		targetCrosshair: d.getElementById('targetCrosshair'),
		target: d.getElementById('target'),
		ribbonWrap: d.getElementById('ribbonWrap'),
		targetFlag: d.getElementById('targetFlag'),
		targetName: d.getElementById('targetName'),
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
		tileActionsOverlay: d.getElementById('tileActionsOverlay'),
		buildWord: d.getElementById('buildWord'),
		buildCost: d.getElementById('buildCost'),
		cannonsCost: d.getElementById('cannonsCost'),
		missileCost: d.getElementById('missileCost'),
		nukeCost: d.getElementById('nukeCost'),
		gunpowderCost: d.getElementById('gunpowderCost'),
		engineeringCost: d.getElementById('engineeringCost'),
		rocketryCost: d.getElementById('rocketryCost'),
		atomicTheoryCost: d.getElementById('atomicTheoryCost'),
		futureTechCost: d.getElementById('futureTechCost'),
		upgradeTileDefense: d.getElementById('upgradeTileDefense'),
		screenFlash: d.getElementById('screenFlash'),
		fireCannons: d.getElementById('fireCannons'),
		launchMissile: d.getElementById('launchMissile'),
		launchNuke: d.getElementById('launchNuke'),
		researchEngineering: d.getElementById('researchEngineering'),
		researchGunpowder: d.getElementById('researchGunpowder'),
		researchRocketry: d.getElementById('researchRocketry'),
		researchAtomicTheory: d.getElementById('researchAtomicTheory'),
		researchFutureTech: d.getElementById('researchFutureTech'),
		lobbyChatLog: d.getElementById('lobbyChatLog'),
		titleChatLog: d.getElementById('titleChatLog'),
		mapAnimations: d.getElementById('mapAnimations'),
		mapCapitals: d.getElementById('mapCapitals'),
		mapUpgrades: d.getElementById('mapUpgrades'),
		mapBars: d.getElementById('mapBars'),
		titleChatBody: d.getElementById('titleChatBody')
	}
};
initDom();

var $DOM = {
	head: $("#head"),
	chatInput: $("#chat-input"),
	lobbyChatInput: $("#lobby-chat-input"),
	titleChatInput: $("#title-chat-input")
};
// team colors
var worldMap = [];
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
(function($){
	if (typeof Notification !== 'function'){
		alert("This browser does not support websockets. We recommend the latest version of Chrome or Firefox");
		window.stop();
	}
	if (isMSIE || isMSIE11 && location.host === 'nevergrind.com'){
		alert("Firmament Wars does not support Internet Explorer. Consider using Chrome or Firefox for an enjoyable experience.");
		window.stop();
		// $("head").append('<style> text { fill: #ffffff; stroke-width: 0px; } </style>');
	} else if (isSafari){
		alert("Firmament Wars does not support Safari. Consider using Chrome or Firefox for an enjoyable experience.");
		window.stop();
		// $("head").append('<style> text { fill: #ffffff; stroke: #ffffff; stroke-width: 0px; } </style>');
	}
	if (isMobile){
		window.stop();
		// $("head").append('<style> *{ box-shadow: none !important; } </style>');
		alert("Firmament Wars is currently not available on mobile devices. Sorry about that! It runs like trash on mobile, so I'm probably doing you a favor.");
	}
})($);

function resizeWindow() {
    var winWidth = window.innerWidth,
		winHeight = window.innerHeight;
	if (g.screen.fullScreen){
		g.screen.width = winWidth;
		g.screen.height = winHeight;
		g.screen.resizeMap();
	}
    // game ratio
    var widthToHeight = g.screen.width / g.screen.height;
    // current window size
    var w = winWidth > g.screen.width ? g.screen.width : winWidth;
    var h = winHeight > g.screen.height ? g.screen.height : winHeight;
    if(w / h > widthToHeight){
    	// too tall
    	w = h * widthToHeight;
    	body.style.height = h + 'px';
    	body.style.width = w + 'px';
    }else{
    	// too wide
    	h = w / widthToHeight;
    	body.style.width = w + 'px';
    	body.style.height = h + 'px';
    }
	TweenMax.set("body", {
		x: ~~(w/2 + ((winWidth - w) / 2)),
		y: ~~(h/2 + ((winHeight - h) / 2)),
		opacity: 1,
		yPercent: -50,
		xPercent: -50,
		force3D: true
	});
	body.style.visibility = "visible";
	if (typeof worldMap[0] !== 'undefined'){
		worldMap[0].applyBounds();
	}
	g.resizeX = w / g.screen.width;
	g.resizeY = h / g.screen.height;
	TweenMax.set("#worldTitle", {
		xPercent: -50,
		yPercent: -50
	});
	TweenMax.set('#firmamentWarsLogo', {
		top: '50%',
		yPercent: -50
	});
}


var video = {
	cache: {},
	load: {
		game: function(){
			var x = [
				'smoke.png',
				'goldSmoke.png',
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

function Msg(msg, d) { 
	DOM.Msg.innerHTML = msg;
	if (d === 0){
		TweenMax.set(DOM.Msg, {
			overwrite: 1,
			startAt: {
				opacity: 1
			}
		});
	} else {
		if (!d || d < .5){
			d = 2;
		}
		TweenMax.to(DOM.Msg, d, {
			overwrite: 1,
			startAt: {
				opacity: 1
			},
			onComplete: function(){
				TweenMax.to(this.target, .2, {
					opacity: 0
				});
			}
		});
	}
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
		url: 'php/deleteFromFwtitle.php'
	});
    $.ajax({
		type: 'GET',
		url: 'php/logout.php'
    }).done(function(data){
		localStorage.removeItem('token');
        location.reload();
    }).fail(function(){
        Msg("Logout failed. Is the server on fire?");
    });
}

function exitGame(bypass){
	if (g.view === 'game'){
		var r = confirm("Are you sure you want to surrender?");
	}
	if (r || bypass || g.view !== 'game'){
		g.lock(1);
		$.ajax({
			url: 'php/exitGame.php',
			data: {
				view: g.view
			}
		}).always(function(){
			location.reload();
		});
	}
}
function surrenderMenu(){
	audio.play('click');
	document.getElementById('surrenderScreen').style.display = 'block';
}
function surrender(){
	audio.play('click');
	document.getElementById('surrenderScreen').style.display = 'none';
	$.ajax({
		url: 'php/surrender.php',
	});
	
}

function serverError(data){
	// Msg('The server reported an error.');
	console.error('The server reported an error.');
}// title.js
var title = {
	players: [],
	games: [],
	init: (function(){
		$(document).ready(function(){
			// console.info("Initializing title screen...");
			// prevents auto scroll while scrolling
			$("#titleChatLog").on('mousedown', function(){
				title.chatDrag = true;
			}).on('mouseup', function(){
				title.chatDrag = false;
			});
			$("#title-chat-input").on('focus', function(){
				title.chatOn = true;
			}).on('blur', function(){
				title.chatOn = false;
			});
			$(".createGameInput").on('focus', function(){
				title.createGameFocus = true;
			}).on('blur', function(){
				title.createGameFocus = false;
			});
			$("#titleChatSend").on('click', function(){
				title.sendMsg(true);
			});
			$.ajax({
				type: 'GET',
				url: 'php/initChatId.php'
			}).done(function(data){
				my.account = data.account;
				my.flag = data.flag;
				title.updatePlayers();
			});
			// init game refresh
			if (typeof Notification === 'function'){
				Notification.requestPermission();
			}
			// initial refresh of games
			$.ajax({
				type: 'GET',
				url: 'php/refreshGames.php'
			}).done(function(data) {
				var e = document.getElementById('gameTableBody');
				if (e === null){
					return;
				}
				// head
				var str = '';
				// body
				for (var i=0, len=data.length; i<len; i++){
					var d = data[i];
					title.games[d.id] = d.players * 1;
					var mode = d.teamMode ? 'Team' : 'FFA';
					str += 
					"<tr id='game_"+ d.id +"' class='wars wars-"+ mode +" no-select' data-name='" + d.name + "'>\
						<td class='warCells'>"+ d.name + "</td>\
						<td class='warCells'>" + d.map + "</td>\
						<td class='warCells'>" + d.speed + "</td>\
						<td class='warCells'>" + mode + "</td>\
					</tr>";
					
				}
				e.innerHTML = str;
				$(".wars").filter(":first").trigger("click");
			}).fail(function(e){
				console.info(e.responseText);
				Msg("Server error.");
			});
			setTimeout(function(){
				g.keepAlive();
			}, 300000);
		});
	})(),
	updatePlayers: function(once){
		title.titleUpdate = $("#titleChatPlayers").length; // player is logged in
		if (title.titleUpdate){
			// title chat loop
			(function repeat(){
				if (g.view === 'title'){
					var start = Date.now();
					$.ajax({
						type: "POST",
						url: "php/titleUpdate.php",
						data: {
							channel: my.channel
						}
					}).done(function(data){
						// report chat messages
						console.log("Ping: ", Date.now() - start);
						// set title players
						if (data.playerData !== undefined){
							var p = data.playerData,
								foundPlayers = [];
							for (var i=0, len=p.length; i<len; i++){
								// add new players
								var account = p[i].account,
									flag = p[i].flag;
								if (title.players[account] === undefined){
									// console.info("ADDING PLAYER: " + account);
									title.addPlayer(account, flag);
								} else if (title.players[account].flag !== flag){
									// replace player flag
									var flagElement = document.getElementById("titlePlayerFlag_" + account);
									if (flagElement !== null){
										console.info(flag);
										var flagClass = flag.split(".");
										flagElement.className = 'flag ' + flagClass[0].replace(/ /g, "-");
									}
								}
								foundPlayers.push(account);
							}
							// remove missing players
							for (var key in title.players){
								if (foundPlayers.indexOf(key) === -1){
									var x = {
										account: key
									}
									// console.info("REMOVING PLAYER: " + x.account);
									title.removePlayer(x);
								}
							}
						}
						if (g.view === 'title'){
							document.getElementById('titleChatHeaderCount').textContent = len;
						}
						// game data sanity check
						var serverGames = [];
						if (data.gameData !== undefined){
							var p = data.gameData;
							for (var i=0, len=p.length; i<len; i++){
								serverGames[p[i].id] = {
									players: p[i].players * 1,
									max: p[i].max * 1
								}
							}
						}
						// remove games if they're not found in server games
						title.games.forEach(function(e, ind){
							// console.info(serverGames[ind]);
							if (serverGames[ind] === undefined){
								// game timed out, not found
								var o = {
									id: ind
								}
								// console.info("REMOVING: ", o);
								title.removeGame(o);
							} else {
								// found game
								if (serverGames[ind].players !== title.games[ind]){
									// player count does not match... fixing
									// console.info("PLAYER COUNT WRONG!");
									var o = {
										id: ind,
										players: serverGames[ind].players,
										max: serverGames[ind].max
									}
									title.setToGame(o);
								}
							}
						});
					}).always(function(){
						if (!once){
							setTimeout(repeat, 5000);
						}
					});
				}
			})();
		} else {
			// not logged in
			$("#titleChat, #titleMenu").remove();
		}
	},
	// adds player to chat room
	addPlayer: function(account, flag){
		title.players[account] = {
			flag: flag
		}
		var e = document.getElementById('titlePlayer' + account);
		if (e !== null){
			e.parentNode.removeChild(e);
		}
		var e = document.createElement('div');
		e.className = "titlePlayer";
		e.id = "titlePlayer" + account;
		var flagClass = flag.split(".");
		flagClass = flagClass[0].replace(/ /g, "-");
		e.innerHTML = '<div id="titlePlayerFlag_'+ account +'" class="flag ' + flagClass +'"></div><span class="titlePlayerAccount">'+ account +'</span>';
		if (title.titleUpdate){
			DOM.titleChatBody.appendChild(e);
		}
	},
	removePlayer: function(data){
		// fix this
		delete title.players[data.account];
		var z = document.getElementById('titlePlayer' + data.account);
		if (z !== null){
			z.parentNode.removeChild(z);
		}
	},
	updateGame: function(data){
		if (data.type === 'addToGame'){
			title.addToGame(data);
		} else if (data.type === 'removeFromGame'){
			title.removeFromGame(data);
		} else if (data.type === 'addGame'){
			title.addGame(data);
		} else if (data.type === 'removeGame'){
			title.removeGame(data);
		}
	},
	updatePlayerText: function(id){
		var e = document.getElementById('game_players_' + id);
		if (e !== null){
			e.textContent = title.games[id];
		}
	},
	setToGame: function(data){
		// refreshGames corrects player values
		// console.info("setToGame", data);
		var id = data.id;
		title.games[id] = data.players;
		// title.updatePlayerText(id);
	},
	addToGame: function(data){
		// player joined or left
		// console.info("addToGame", data);
		var id = data.id;
		if (title.games[id] !== undefined){
			if (title.games[id] + 1 > data.max){
				title.games[id] = data.max;
			} else {
				title.games[id]++;
			}
		} else {
			title.games[id] = 1;
		}
		//title.updatePlayerText(id);
	},
	removeFromGame: function(data){
		// player joined or left
		// console.info("removeFromGame", data);
		var id = data.id;
		if (title.games[id] !== undefined){
			if (title.games[id] - 1 < 1){
				title.games[id] = 1;
			} else {
				title.games[id]--;
			}
		} else {
			title.games[id] = 1;
		}
		//title.updatePlayerText(id);
	},
	addGame: function(data){
		// created game
		// console.info("addGame", data);
		title.games[data.id] = 1;
		var e = document.createElement('tr'),
			mode = data.teamMode ? 'Team' : 'FFA';
		e.id = 'game_' + data.id;
		e.className = 'wars wars-'+ mode +' no-select';
		e.setAttribute('data-name', data.name);
		e.innerHTML = 
			"<td class='warCells'>"+ data.name + "</td>\
			<td class='warCells'>" + data.map + "</td>\
			<td class='warCells'>" + data.speed + "</td>\
			<td class='warCells'>" + mode + "</td>";
		DOM.gameTableBody.insertBefore(e, DOM.gameTableBody.childNodes[0]);
	},
	removeGame: function(data){
		// game countdown started or exited
		// console.info("removeGame", data);
		delete title.games[data.id];
		var e = document.getElementById('game_' + data.id);
		if (e !== null){
			e.parentNode.removeChild(e);
		}
	},
	mapData: {
		EarthAlpha: {
			name: 'Earth Alpha',
			tiles: 83,
			players: 8
		},
		FlatEarth: {
			name: 'Flat Earth',
			tiles: 78,
			players: 8
		}
	},
	chatDrag: false,
	chatOn: false,
	chat: function (data){
		if (g.view === 'title' && data.message){
			while (DOM.titleChatLog.childNodes.length > 500) {
				DOM.titleChatLog.removeChild(DOM.titleChatLog.firstChild);
			}
			var z = document.createElement('div'); 
			if (data.type){
				z.className = data.type;
			}
			z.innerHTML = data.message;
			DOM.titleChatLog.appendChild(z);
			if (!title.chatDrag){
				DOM.titleChatLog.scrollTop = DOM.titleChatLog.scrollHeight;
			}
			if (!data.skip){
				g.sendNotification(data);
			}
		}
	},
	listFriends: function(){
		var len = g.friends.length;
		g.chat('<div>Checking friends list...</div>');
		if (len){
			$.ajax({
				url: 'php/getFriends.php',
				data: {
					friends: g.friends
				}
			}).done(function(data){
				console.info(data);
				var str = '<div>Friend List ('+ len +')</div>';
				for (var i=0; i<len; i++){
					if (g.friends.indexOf(data.players[i]) > -1){
						// online
						str += '<div><span class="chat-online titlePlayerAccount">' + g.friends[i] + '</span>';
						console.info(data.players[i], data.locations[i], typeof data.locations[i]);
						if (typeof data.locations[i] === 'number'){
							str += ' playing in game: ' + data.locations[i];
						} else {
							str += ' in chat channel: ';
							if (g.view === 'title'){
								// enable clicking to change channel
								str += '<span class="chat-online chat-join">' + data.locations[i] + '</span>';
							} else {
								// not in a game
								str += data.locations[i];
							}
						}
						
						str += '</div>';
					} else {
						str += '<div><span class="chat-muted titlePlayerAccount">' + g.friends[i] +'</span></div>';
					}
				}
				g.chat(str);
			});
		} else {
			if (fwpaid){
				g.chat("You don't have any friends!<img src='images/chat/random/feelsbad.png'>", 'chat-muted');
			} else {
				g.chat("This is a paid feature. Unlock the complete game to check your friend's status.", 'chat-muted');
			}
		}
	},
	addFriend: function(account){
		account = account.trim();
		g.chat('<div>Adding friend: '+ account +'</div>');
		if (g.friends.indexOf(account) === -1 && account){
			if (g.friends.length < 20){
				if (account !== my.account){
					g.friends.push(account);
					localStorage.setItem('friends', JSON.stringify(g.friends));
					g.chat('Added friend: ' + account, 'chat-muted');
				} else {
					g.chat("<img src='images/chat/random/hangfrog.jpg'><div>You can't be friends with yourself!</div>", 'chat-muted');
				}
			} else {
				// add image
				g.chat('You cannot have more than 20 friends!', 'chat-muted');
			}
		} else {
			g.chat('You are already friends with ' + account +'!<img src="images/chat/random/forget.jpg">', 'chat-muted');
		}
	},
	removeFriend: function(account){
		account = account.trim();
		g.chat('<div>Removing friend: '+ account +'</div>');
		if (g.friends.indexOf(account) > -1 && account){
			// found account
			var index = g.friends.indexOf(account);
			g.friends.splice(index, 1);
			localStorage.setItem('friends', JSON.stringify(g.friends));
			g.chat('Removed friend: ' + account, 'chat-muted');
		} else {
			g.chat('That account is not on your friend list.', 'chat-muted');
		}
	},
	listIgnore: function(){
		var len = g.ignore.length;
		var str = '<div>Ignore List ('+ len +')</div>';
		for (var i=0; i<len; i++){
			str += '<div><span class="chat-muted titlePlayerAccount">' + g.ignore[i] +'</span></div>';
		}
		g.chat(str);
	},
	addIgnore: function(account){
		account = account.trim();
		g.chat('<div>Ignoring '+ account +'</div>');
		if (g.ignore.indexOf(account) === -1 && account){
			if (g.ignore.length < 20){
				if (account !== my.account){
					g.ignore.push(account);
					localStorage.setItem('ignore', JSON.stringify(g.ignore));
					g.chat('Now ignoring account: ' + account, 'chat-muted');
				} else {
					g.chat("<div>You can't ignore yourself!</div><img src='images/chat/random/autism.jpg'>", 'chat-muted');
				}
			} else {
				g.chat('You cannot ignore more than 20 accounts!', 'chat-muted');
			}
		} else {
			g.chat('Already ignoring ' + account +'!', 'chat-muted');
		}
	},
	removeIgnore: function(account){
		account = account.trim();
		g.chat('<div>Unignoring '+ account +'</div>');
		if (g.ignore.indexOf(account) > -1 && account){
			// found account
			var index = g.ignore.indexOf(account);
			g.ignore.splice(index, 1);
			localStorage.setItem('ignore', JSON.stringify(g.ignore));
			g.chat('Stopped ignoring account: ' + account, 'chat-muted');
		} else {
			g.chat(account + ' is not on your ignore list.', 'chat-muted');
		}
	},
	chatReceive: function(data){
		if (g.view === 'title'){
			// title
			if (data.type === 'remove'){
				title.removePlayer(data);
			} else if (data.type === 'add'){
				// console.info(data);
				title.addPlayer(data.account, data.flag);
			} else {
				if (data.message !== undefined){
					title.chat(data);
				}
			}
		} else if (g.view === 'lobby'){
			// lobby
			// console.info('lobby receive: ', data);
			if (data.type === 'hostLeft'){
				lobby.hostLeft();
			} else if (data.type === 'government'){
				lobby.updateGovernment(data);
			} else if (data.type === 'updatePlayerColor'){
				lobby.updatePlayerColor(data);
			} else if (data.type === 'updateTeamNumber'){
				lobby.updateTeamNumber(data);
			} else if (data.type === 'countdown'){
				lobby.countdown(data);
			} else if (data.type === 'update'){
				lobby.updatePlayer(data);
			} else {
				if (data.message !== undefined){
					lobby.chat(data);
				}
			}
		} else {
			// game
			// console.info('game receive: ', data);
			if (data.type === 'cannons'){
				animate.cannons(data.attackerTile, data.tile, false);
				game.updateTile(data);
			} else if (data.type === 'missile'){
				animate.missile(data.attacker, data.defender, true);
			} else if (data.type === 'nuke'){
				setTimeout(function(){
					animate.nuke(data.tile, data.attacker);
				}, 5000);
			} else if (data.type === 'nukeHit'){
				game.updateTile(data);
				game.updateDefense(data);
			} else if (data.type === 'gunfire'){
				// defender tile update
				animate.gunfire(data.attackerTile, data.tile, data.player === my.player);
				game.updateTile(data);
			} else if (data.type === 'updateTile'){
				// attacker tile update
				game.updateTile(data);
			} else if (data.type === 'food'){
				if (data.account.indexOf(my.account) > -1){
					audio.play('food');
				}
			} else if (data.type === 'upgrade'){
				// fetch updated tile defense data
				game.updateDefense(data);
				animate.upgrade(data.tile);
			} else if (data.type === 'eliminated'){
				game.eliminatePlayer(data);
			} else if (data.type === 'disconnect'){
				game.eliminatePlayer(data);
			}
			
			if (data.message){
				if (data.type === 'gunfire'){
					// ? when I'm attacked?
					if (data.defender === my.account){
						game.chat(data);
					}
					// lost attack
				} else {
					game.chat(data);
				}
			}
			if (data.sfx){
				audio.play(data.sfx);
			}
		}
	},
	sendWhisper: function(msg, splitter){
		// account
		var arr = msg.split(splitter);
		var account = arr[1].split(" ").shift();
		// message
		var splitLen = splitter.length;
		var accountLen = account.length;
		var msg = msg.substr(splitLen + accountLen + 1);
		var flag = my.flag.split(".");
		flag = flag[0].replace(/ /g, "-");
		$.ajax({
			url: 'php/insertWhisper.php',
			data: {
				account: account,
				flag: flag,
				playerColor: my.playerColor,
				message: msg,
				action: 'send'
			}
		});
	},
	receiveWhisper: function(data){
		if (g.view === 'title'){
			title.chat(data);
		} else if (g.view === 'lobby'){
			lobby.chat(data);
		} else {
			game.chat(data);
		}
	},
	changeChannel: function(msg, splitter){
		var arr = msg.split(splitter);
		socket.setChannel(arr[1]);
	},
	who: function(msg){
		var a = msg.split("/who ");
		$.ajax({
			url: 'php/whoUser.php',
			data: {
				account: a[1]
			}
		}).done(function(data){
			g.chat(data);
		});
	},
	help: function(){
		var str = 
			'<div class="chat-warning">Chat Commands:</div>\
			<div>/j: change channel</div>\
			<div>/join: change channel</div>\
			<div>/w account: whisper user</div>\
			<div>/whisper account: whisper user</div>\
			<div>@account_name: whisper user</div>\
			<div>/ignore: show ignore list</div>\
			<div>/ignore account: ignore account</div>\
			<div>/unignore account: stop ignoring account</div>\
			<div>/friend: show friend list</div>\
			<div>/friend account: add friend</div>\
			<div>/unfriend account: remove friend</div>\
			<div>/who account: check account info</div>\
			';
		var o = {
			msg: str,
			type: 'chat-muted'
		};
		title.chat(o);
	},
	broadcast: function(msg){
					$.ajax({
						url: 'php/insertBroadcast.php',
						data: {
							message: msg
						}
					});
	},
	sendMsg: function(bypass){
		var msg = $DOM.titleChatInput.val().trim();
		// bypass via ENTER or chat has focus
		if (bypass || title.chatOn){
			if (msg){
				// is it a command?
				if (msg.indexOf('/unfriend ') === 0){
					var account = msg.slice(10);
					title.removeFriend(account);
				} else if (msg === '/friend'){
					title.listFriends();
				} else if (msg.indexOf('/friend ') === 0){
					var account = msg.slice(8);
					title.addFriend(account);
				} else if (msg.indexOf('/unignore ') === 0){
					var account = msg.slice(10);
					title.removeIgnore(account);
				} else if (msg === '/ignore'){
					title.listIgnore();
				} else if (msg.indexOf('/ignore ') === 0){
					var account = msg.slice(8);
					title.addIgnore(account);
				} else if (msg.indexOf('/help') === 0){
					title.help();
				} else if (msg.indexOf('/join ') === 0){
					title.changeChannel(msg, '/join ');
				} else if (msg.indexOf('/j ') === 0){
					title.changeChannel(msg, '/j ');
				} else if (msg.indexOf('/whisper ') === 0){
					title.sendWhisper(msg , '/whisper ');
				} else if (msg.indexOf('/w ') === 0){
					title.sendWhisper(msg , '/w ');
				} else if (msg.indexOf('@') === 0){
					title.sendWhisper(msg , '@');
				} else if (msg.indexOf('/who ') === 0){
					title.who(msg);
				} else if (msg.indexOf('/broadcast ') === 0){
					title.broadcast(msg);
				} else {
					$.ajax({
						url: 'php/insertTitleChat.php',
						data: {
							message: msg
						}
					});
				}
			}
			$DOM.titleChatInput.val('');
		}
	},
	showBackdrop: function(e){
		TweenMax.to(document.getElementById("titleViewBackdrop"), .3, {
			startAt: {
				visibility: 'visible',
				alpha: 0
			},
			alpha: 1,
			onComplete: function(){
				if (e !== undefined){
					e.focus();
				}
			}
		});
		g.isModalOpen = true;
	},
	closeModal: function(){
		var e1 = document.getElementById("configureNation"),
			e2 = document.getElementById("titleViewBackdrop"),
			e3 = document.getElementById('createGameWrap'),
			e4 = document.getElementById('optionsModal'),
			e5 = document.getElementById('leaderboard'),
			e6 = document.getElementById('unlockGame');
		TweenMax.to([e1,e2,e3,e4,e5,e6], .2, {
			alpha: 0,
			onComplete: function(){
				TweenMax.set(this.target, {
					visibility: 'hidden'
				});
			}
		});
		g.isModalOpen = false;
	},
	createGameFocus: false,
	createGame: function(){
		var name = $("#gameName").val(),
			pw = $("#gamePassword").val(),
			max = $("#gamePlayers").val() * 1,
			speed = $("#createGameSpeed").text();
		if (!g.rankedMode && (name.length < 4 || name.length > 32)){
			Msg("Game name must be at least 4-32 characters.", 1);
			setTimeout(function(){
				$("#gameName").focus().select();
			}, 100);
		} else if (!g.rankedMode && (max < 2 || max > 8 || max % 1 !== 0)){
			Msg("Game must have 2-8 players.", 1);
		} else {
			g.lock(1);
			audio.play('click');
			$.ajax({
				url: 'php/createGame.php',
				data: {
					name: name,
					pw: pw,
					map: title.mapData[g.map.key].name,
					max: max,
					rating: g.rankedMode,
					teamMode: g.teamMode,
					speed: speed
				}
			}).done(function(data) {
				// console.info(data);
				socket.removePlayer(my.account);
				my.player = data.player;
				my.playerColor = data.playerColor;
				my.team = data.team;
				game.id = data.gameId;
				game.name = data.gameName;
				// console.info("Creating: ", data);
				lobby.init(data);
				lobby.join(); // create
				socket.joinGame();
				lobby.styleStartGame();
			}).fail(function(e){
				console.info(e.responseText);
				Msg(e.statusText);
				g.unlock(1);
			});
		}
	},
	joinGame: function(){
		g.name = $("#joinGameName").val();
		if (!g.name){
			Msg("Game name is not valid!", 1.5);
			return;
		}
		g.password = $("#joinGamePassword").val();
		g.lock();
		audio.play('click');
		$.ajax({
			url: 'php/joinGame.php',
			data: {
				name: g.name,
				password: g.password
			}
		}).done(function(data){
			title.joinGameCallback(data);
		}).fail(function(data){
			console.info(data);
			Msg(data.statusText, 1.5);
		}).always(function(){
			g.unlock();
		});
	},
	joinGameCallback: function(data){
		socket.removePlayer(my.account);
		// console.info(data);
		my.player = data.player;
		my.playerColor = data.player;
		g.teamMode = data.teamMode;
		g.rankedMode = data.rankedMode;
		my.team = data.team;
		game.id = data.id;
		game.name = data.gameName;
		g.map = data.mapData;
		g.speed = g.speeds[data.speed];
		lobby.init(data);
		lobby.join(); // normal join
		socket.joinGame();
	},
	submitNationName: function(){
		var x = $("#updateNationName").val();
		g.lock();
		audio.play('click');
		$.ajax({
			url: 'php/updateNationName.php',
			data: {
				name: x
			}
		}).done(function(data) {
			$(".configureNationName").text(data);
			// animate.nationName();
		}).fail(function(e){
			Msg(e.statusText);
		}).always(function(){
			g.unlock();
		});
	}
};
(function(){
	var str = '';
	for (var key in title.mapData){
		str += "<li><a class='mapSelect' href='#'>" + title.mapData[key].name + "</a></li>";
	}
	var e1 = document.getElementById('mapDropdown');
	if (e1 !== null){
		e1.innerHTML = str;
	}
	$('[title]').tooltip();
	setTimeout(function(){
		animate.logo(Linear.easeNone);
	}, 250);
})();// lobby.js
var lobby = {
	data: [
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' }, 
		{ account: '' },
		{ account: '' }
	],
	startClassOn:  "btn btn-info btn-md btn-block btn-responsive shadow4 lobbyButtons",
	startClassOff: "btn btn-default btn-md btn-block btn-responsive shadow4 lobbyButtons",
	totalPlayers: function(){
		var count = 0;
		for (var i=0, len=lobby.data.length; i<len; i++){
			if (lobby.data[i].account){
				count++;
			}
		}
		return count;
	},
	updateGovernmentWindow: function(government){
		// updates government description
		var str = '';
		if (government === "Despotism"){
			str = '<div id="lobbyGovName" class="text-primary">Despotism</div>\
				<div id="lobbyGovPerks">\
					<div>3x starting crystals</div>\
					<div>+50% starting armies</div>\
					<div>Start With a Bunker</div>\
					<div>Free Split Attack</div>\
				</div>';
		} else if (government === "Monarchy"){
			str = '<div id="lobbyGovName" class="text-primary">Monarchy</div>\
				<div id="lobbyGovPerks">\
					<div>3x starting culture</div>\
					<div>+50% culture bonus</div>\
					<div>Start with two Great Tacticians</div>\
					<div>1/2 cost structures</div>\
				</div>';
		} else if (government === "Democracy"){
			str = '<div id="lobbyGovName" class="text-primary">Democracy</div>\
				<div id="lobbyGovPerks">\
					<div>Unlimited Army Deployment</div>\
					<div>+50% crystal bonus</div>\
					<div>More great people</div>\
					<div>Start with a wall</div>\
				</div>';
		} else if (government === "Fundamentalism"){
			str = '<div id="lobbyGovName" class="text-primary">Fundamentalism</div>\
				<div id="lobbyGovPerks">\
					<div>Overrun ability</div>\
					<div>Infiltration</div>\
					<div>Faster growth</div>\
					<div>1/2 cost Recruit</div>\
				</div>';
		} else if (government === "Fascism"){
			str = '<div id="lobbyGovName" class="text-primary">Fascism</div>\
				<div id="lobbyGovPerks">\
					<div>Fervor doubles bonus troops</div>\
					<div>3x Starting Oil</div>\
					<div>Start with Great General</div>\
					<div>1/2 cost Deploy</div>\
				</div>';
		} else if (government === "Republic"){
			str = '<div id="lobbyGovName" class="text-primary">Republic</div>\
				<div id="lobbyGovPerks">\
					<div>+50% plunder bonus</div>\
					<div>2x starting food</div>\
					<div>+50% food bonus</div>\
					<div>Combat medics</div>\
				</div>';
		} else if (government === "Communism"){
			str = '<div id="lobbyGovName" class="text-primary">Communism</div>\
				<div id="lobbyGovPerks">\
					<div>2x discovery bonus</div>\
					<div>1/2 cost research</div>\
					<div>1/2 cost weapons</div>\
					<div>Start with a great person</div>\
				</div>';
		}
		document.getElementById('lobbyGovernment' + my.player).innerHTML = government;
		document.getElementById('lobbyGovernmentDescription').innerHTML = str;
	},
	chat: function (data){
		while (DOM.lobbyChatLog.childNodes.length > 200) {
			DOM.lobbyChatLog.removeChild(DOM.lobbyChatLog.firstChild);
		}
		var z = document.createElement('div');
		if (data.type){
			z.className = data.type;
		}
		z.innerHTML = data.message;
		DOM.lobbyChatLog.appendChild(z);
		if (!lobby.chatDrag){
			DOM.lobbyChatLog.scrollTop = DOM.lobbyChatLog.scrollHeight;
		}
		g.sendNotification(data.message);
	},
	chatDrag: false,
	gameStarted: false,
	chatOn: false,
	sendMsg: function(bypass){
		var msg = $DOM.lobbyChatInput.val().trim();
		if (bypass || lobby.chatOn){
			// bypass via ENTER or chat has focus
			if (msg){
				// is it a command?
				if (msg.indexOf('/unfriend ') === 0){
					var account = msg.slice(10);
					title.removeFriend(account);
				} else if (msg === '/friend'){
					title.listFriends();
				} else if (msg.indexOf('/friend ') === 0){
					var account = msg.slice(8);
					title.addFriend(account);
				} else if (msg.indexOf('/unignore ') === 0){
					var account = msg.slice(10);
					title.removeIgnore(account);
				} else if (msg === '/ignore'){
					title.listIgnore();
				} else if (msg.indexOf('/ignore ') === 0){
					var account = msg.slice(8);
					title.addIgnore(account);
				} else if (msg.indexOf('/whisper ') === 0){
					title.sendWhisper(msg, '/whisper ');
				} else if (msg.indexOf('/w ') === 0){
					title.sendWhisper(msg, '/w ');
				} else if (msg.indexOf('@') === 0){
					title.sendWhisper(msg , '@');
				} else if (msg.indexOf('/who ') === 0){
					title.who(msg);
				} else {
					// send ajax chat msg
					$.ajax({
						url: 'php/insertLobbyChat.php',
						data: {
							message: msg
						}
					});
				}
			}
			$DOM.lobbyChatInput.val('');
		}
	},
	init: function(x){
		// build the lobby DOM
		console.info("Initializing lobby...", x.rating);
		var e1 = document.getElementById("lobbyGameName");
		if (e1 !== null){
			if (x.rating){
				document.getElementById('lobbyRankedMatch').style.display = 'block';
				document.getElementById('lobbyGameNameWrap').style.display = 'none';
			}
			e1.innerHTML = x.name;
			document.getElementById('lobbyGameMode').textContent = x.gameMode;
			g.speed = g.speeds[x.speed];
			document.getElementById("lobbyGameSpeed").innerHTML = x.speed;
			document.getElementById("lobbyGameMap").innerHTML = x.map;
			document.getElementById("lobbyGameMax").innerHTML = x.max;
			document.getElementById("startGame").style.display = x.player === 1 ? "block" : "none";
			if (!x.startGame){
				document.getElementById('mainWrap').style.display = "block";
			}
			var str = '<div id="lobbyWrap" class="container">';
			for (var i=1; i<=8; i++){
				str += 
				'<div id="lobbyRow' +i+ '" class="row lobbyRow">\
					<div class="col-xs-2">\
						<img id="lobbyFlag' +i+ '" data-placement="right" class="lobbyFlags block center" src="images/flags/blank.png">\
					</div>\
					<div class="col-xs-6 lobbyDetails">\
						<div class="lobbyAccounts">';
							if (g.teamMode){
								// yes, the span is necessary to group the dropdown
								str += '<span><div id="lobbyTeam'+ i +'" class="lobbyTeams dropdown-toggle';
								if (i === my.player){
									str += ' pointer2';
								}
								str += '" data-placement="right" data-toggle="dropdown">';
								if (i === my.player){
									str += '<i class="fa fa-flag pointer2 lobbyTeamFlag"></i> <span id="lobbyTeamNumber'+ i +'" class="lobbyTeamNumbers">' + i +'</span>';
								} else {
									str += '<i class="fa fa-flag lobbyTeamFlag"></i> <span id="lobbyTeamNumber'+ i +'" class="lobbyTeamNumbers">' + i +'</span>';
								}
								str += '</div>';
								if (i === my.player){
									str += 
									'<ul id="teamDropdown" class="dropdown-menu">\
										<li class="header text-center selectTeamHeader">Team</li>';
										for (var j=1; j<=8; j++){
											str += '<li class="teamChoice">Team '+ j +'</li>';
										}
									str += '</ul></span>';
								}
							}
							str += '<span><i id="lobbyPlayerColor'+ i +'" class="fa fa-square player'+ i +' lobbyPlayer dropdown-toggle';
							if (i === my.player){
								str += ' pointer2';
							}
							str += '" data-placement="right" data-toggle="dropdown"></i>';
							if (i === my.player && fwpaid){
								str += 
								'<ul id="teamColorDropdown" class="dropdown-menu">\
									<li class="header text-center selectTeamHeader">Player Color</li>';
								for (var j=1; j<=20; j++){
									str += '<i class="fa fa-square player'+ j +' playerColorChoice" data-playercolor="'+ j +'"></i>';
								}
								str += '</ul></span>';
							}
							str += '<span id="lobbyAccountName'+ i +'" class="lobbyAccountName chat-warning"></span>\
						</div>\
						<div id="lobbyName' +i+ '" class="lobbyNames nowrap"></div>\
					</div>\
					<div class="col-xs-4">';
					if (i === x.player){
						// me
						str += 
						'<div class="dropdown govDropdown">\
							<button class="btn btn-primary btn-responsive dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">\
								<span id="lobbyGovernment' +i+ '">Despotism</span>\
								<i class="fa fa-caret-down text-warning lobbyCaret"></i>\
							</button>\
							<ul id="governmentDropdown" class="dropdown-menu">\
								<li class="governmentChoice"><a href="#">Despotism</a></li>\
								<li class="governmentChoice"><a href="#">Monarchy</a></li>\
								<li class="governmentChoice"><a href="#">Democracy</a></li>\
								<li class="governmentChoice"><a href="#">Fundamentalism</a></li>\
								<li class="governmentChoice"><a href="#">Fascism</a></li>\
								<li class="governmentChoice"><a href="#">Republic</a></li>\
								<li class="governmentChoice"><a href="#">Communism</a></li>\
							</ul>\
						</div>';
					} else {
						// not me
						str += 
						'<div class="dropdown govDropdown">\
							<button style="cursor: default" class="btn btn-primary dropdown-toggle shadow4 fwDropdownButton fwDropdownButtonEnemy" type="button">\
								<span id="lobbyGovernment' +i+ '" class="pull-left">Despotism</span>\
								<i class="fa fa-caret-down text-disabled lobbyCaret"></i>\
							</button>\
						</div>';
					}
					str += '</div></div>';
			}
			str += '</div>';
			document.getElementById("lobbyPlayers").innerHTML = str;
		}
		delete lobby.init;
	},
	join: function(d){
		// console.info("Joining lobby...");
		var loadTime = Date.now() - g.startTime;
		if (loadTime < 1000){
			d = 0;
		}
		if (d === undefined){
			d = 1;
		}
		g.view = "lobby";
		var titleMain = document.getElementById('titleMain'),
			titleMenu = document.getElementById ('titleMenu'),
			titleChat = document.getElementById ('titleChat');
		title.closeModal();
		TweenMax.to(titleChat, d, {
			x: '100%',
			ease: Quad.easeIn
		});
		TweenMax.to(titleMenu, d, {
			x: '-100%',
			ease: Quad.easeIn,
			onComplete: function(){
				titleMain.parentNode.removeChild(titleMain);
				g.unlock(1);
				TweenMax.fromTo('#joinGameLobby', d, {
					autoAlpha: 0
				}, {
					autoAlpha: 1
				});
			}
		});
		if (!d){
			// load game
			loadGameState(); // page refresh
		} else {
			// load lobby
			(function repeat(){
				if (g.view === "lobby"){
					$.ajax({
						type: "GET",
						url: "php/updateLobby.php"
					}).done(function(x){
						if (g.view === "lobby"){
							// reality check of presence data every 5 seconds
							var hostFound = false
							for (var i=1; i<=8; i++){
								var data = x.playerData[i];
								if (data !== undefined){
									// server defined
									if (data.account !== lobby.data[i].account){
										lobby.updatePlayer(data);
									}
									// check if host
									if (data.gameHost === 1){
										hostFound = true;
									}
								} else {
									// not defined on server
									if (lobby.data[i].account){
										var o = {
											message: lobby.data[i].account + " has disconnected",
											type: 'chat-warning'
										};
										lobby.chat(o)
										var o = {
											player: i
										}
										lobby.updatePlayer(o);
									}
								}
							}
							// make sure host didn't disconnect
							if (!hostFound){
								lobby.hostLeft();
							}
							setTimeout(repeat, 5000);
						}
					}).fail(function(data){
						serverError(data);
					});
				}
			})();
			delete lobby.join;
		}
	},
	hostLeft: function(){
		setTimeout(function(){
			Msg("The host has left the lobby.");
			setTimeout(function(){
				exitGame(true);
			}, 1000);
		}, 500);
	},
	// add/remove players from lobby
	updatePlayer: function(data){
		var i = data.player;
		if (data.account !== undefined){
			// add
			console.info("ADD PLAYER: ", data);
			document.getElementById("lobbyRow" + i).style.display = 'block';
			// different player account
			document.getElementById("lobbyAccountName" + i).innerHTML = data.account;
			document.getElementById("lobbyName" + i).innerHTML = data.nation;
			var flag = data.flag === 'Default.jpg' ? 
				'Player'+ i +'.jpg' : 
				data.flag;
			document.getElementById("lobbyFlag" + i).src = 'images/flags/'+ flag;
			$('#lobbyFlag' + i)
				.attr('title', data.flag.split(".").shift())
				.tooltip({
					container: 'body'
				});
			if (my.player === i){
				$("#lobbyPlayerColor" + i).attr('title', fwpaid ? 
					'Select Player Color' : 
					'Unlock the complete game to choose player color')
					.tooltip({ container: 'body' });
				$("#lobbyTeam" + i).attr('title', 'Select Team')
					.tooltip({ container: 'body' });
			}
			lobby.updateGovernment(data);
			lobby.data[i] = data;
			lobby.updatePlayerColor(data);
		} else {
			// remove
			console.info("REMOVE PLAYER: ", data);
			document.getElementById("lobbyRow" + i).style.display = 'none';
			lobby.data[i] = { account: '' };
		}
		lobby.styleStartGame();
	},
	// update player's team number
	updateTeamNumber: function(data){
		console.info("UPDATE TEAM NUMBER: ", data);
		var i = data.player;
		var e = document.getElementById('lobbyTeamNumber' + i);
		if (e !== null){
			e.textContent = data.team;
		}
	},
	// update player's color only
	updatePlayerColor: function(data){
		console.info("UPDATE PLAYER COLOR ", data);
		var i = data.player;
		var str = my.player === i ? 
			'fa fa-square lobbyPlayer dropdown-toggle pointer2 player' + data.playerColor :
			'fa fa-square lobbyPlayer dropdown-toggle player' + data.playerColor;
		$("#lobbyPlayerColor" + i).removeClass()
			.addClass(str)
			.data('playerColor', data.playerColor);
		lobby.data[i].playerColor = data.playerColor;
		if (data.flag === 'Default.jpg'){
			document.getElementById('lobbyFlag' + i).src = 'images/flags/Player' + data.playerColor + '.jpg';
		}
	},
	// update player's government only
	updateGovernment: function(data){
		// update button & window
		var i = data.player;
		document.getElementById('lobbyGovernment' + i).innerHTML = data.government;
		lobby.data[i].government = data.government;
	},
	styleStartGame: function(){
		if (my.player === 1){
			// set start game button
			if (lobby.totalPlayers() === 1){
				startGame.className = lobby.startClassOff;
			} else {
				startGame.className = lobby.startClassOn;
			}
		}
	},
	countdown: function(data){
		socket.unsubscribe('title:refreshGames');
		// still in the lobby?
		if (!lobby.gameStarted){
			lobby.gameStarted = true;
			new Audio('sound/beepHi.mp3');
			// normal countdown
			countdown.style.display = 'block';
			(function repeating(secondsToStart){
				countdown.textContent = "Starting game in " + secondsToStart--;
				if (secondsToStart >= 0){
					audio.play('beep');
					setTimeout(repeating, 1000, secondsToStart);
				} else {
					audio.play('beepHi');
					audio.load.game();
					video.load.game();
				}
				if (secondsToStart === 1){
					TweenMax.to('#mainWrap', 1.5, {
						delay: 1,
						alpha: 0,
						ease: Linear.easeNone,
						onComplete: function(){
							loadGameState();
						}
					});
					audio.fade();
				}
			})(5);
			$('[title]').tooltip('disable');
			cancelGame.style.display = 'none';
			$("#teamDropdown").css('display', 'none');
		}
	},
	governmentIcon: function(government){
		var icon = {
			Despotism: 'fa fa-gavel', //  glyphicon glyphicon-screenshot
			Monarchy: 'glyphicon glyphicon-king',
			Democracy: 'fa fa-institution', // fa-institution fa fa-balance-scale
			Fundamentalism: 'fa fa-book',
			Fascism: 'glyphicon glyphicon-fire',
			Republic: 'glyphicon glyphicon-grain', 
			Communism: 'fa fa-flask'
		};
		return icon[government];
	},
	initRibbons: function(data){
		for (var key in data){
			var str = '',
				arr = [];
			for (var i=0, len=data[key].length; i<len; i++){
				var ribbonNum = data[key][i];
				str += '<div class="ribbon ribbon'+ ribbonNum +'" title="'+ game.ribbonTitle[ribbonNum] +'"></div>';
				arr.push(ribbonNum);
			}
			game.player[key].ribbons = str;
			game.player[key].ribbonArray = arr;
		}
	},
	startGame: function(){
		if (lobby.totalPlayers() >= 2 && my.player === 1){
			startGame.style.display = "none";
			cancelGame.style.display = 'none';
			g.lock(1);
			audio.play('click');
			$.ajax({
				type: "GET",
				url: "php/startGame.php"
			}).fail(function(data){
				Msg(data.statusText);
				startGame.style.display = "block";
				cancelGame.style.display = 'block';
			}).always(function(){
				g.unlock();
			});
		}
	}
};

function initOffensiveTooltips(){
	$('#fireCannons')
		.attr('title', 'Fire cannons at an adjacent enemy tile. Kills ' + (2 + my.oBonus) + ' + 4% of armies.')
		.tooltip('fixTitle');
	$('#launchMissile')
		.attr('title', 'Launch a missile at any enemy territory. Kills ' + (5 + (my.oBonus * 2)) + ' + 15% of armies.')
		.tooltip('fixTitle');
	$('#recruit')
		.attr('title', 'Recruit ' + (3 + ~~(my.cultureBonus / 30)) + ' armies. Boosted by culture.')
		.tooltip('fixTitle');
}
function initResources(d){
	my.food = d.food;
	my.production = d.production;
	my.culture = d.culture;
	// current
	DOM.moves.textContent = d.moves;
	DOM.production.textContent = d.production;
	DOM.food.textContent = d.food;
	DOM.culture.textContent = d.culture;
	// turn
	// max
	DOM.manpower.textContent = my.manpower;
	my.manpower = d.manpower;
	DOM.foodMax.textContent = d.foodMax;
	DOM.cultureMax.textContent = d.cultureMax;
	// sum
	DOM.sumFood.textContent = d.sumFood;
	DOM.sumProduction.textContent = d.turnProduction;
	DOM.sumCulture.textContent = d.sumCulture;
	// bonus values
	DOM.oBonus.textContent = d.oBonus;
	DOM.dBonus.textContent = d.dBonus;
	DOM.turnBonus.textContent = d.turnBonus;
	DOM.foodBonus.textContent = d.foodBonus;
	DOM.cultureBonus.textContent = d.cultureBonus;
	setBars(d);
}
function setMoves(d){
	if (d.moves !== undefined){
		my.moves = d.moves;
		DOM.moves.textContent = d.moves;
		if (d.sumMoves){
			DOM.sumMoves.textContent = d.sumMoves;
		}
	}
}
function setProduction(d){
	if (d.production !== undefined){
		TweenMax.to(my, .3, {
			production: d.production,
			ease: Quad.easeIn,
			onUpdate: function(){
				DOM.production.textContent = ~~my.production;
			}
		});
	}
}
function setResources(d){
	//console.info(d);
	setMoves(d);
	setProduction(d);
	TweenMax.to(my, .3, {
		food: d.food === undefined ? my.food : d.food,
		culture: d.culture === undefined ? my.culture : d.culture,
		ease: Quad.easeIn,
		onUpdate: function(){
			DOM.food.textContent = ~~my.food;
			DOM.culture.textContent = ~~my.culture;
		}
	});
	if (d.manpower !== undefined){
		if (d.manpower > my.manpower){
			TweenMax.fromTo('#manpower', .5, {
				color: '#ffaa33'
			}, {
				color: '#ffff00',
				repeat: -1,
				yoyo: true
				
			});
			TweenMax.to(my, .5, {
				manpower: d.manpower,
				onUpdate: function(){
					DOM.manpower.textContent = ~~my.manpower;
				}
			});
		}
	}
	if (d.foodMax !== undefined){
		if (d.foodMax && d.foodMax > my.foodMax){
			DOM.foodMax.textContent = d.foodMax;
			my.foodMax = d.foodMax;
		}
	}
	if (d.cultureMax !== undefined){
		if (d.cultureMax && d.cultureMax > my.cultureMax){
			DOM.cultureMax.textContent = d.cultureMax;
			my.cultureMax = d.cultureMax;
		}
	}
	if (d.sumFood !== undefined){
		if (d.sumFood && d.sumFood !== my.sumFood){
			DOM.sumFood.textContent = d.sumFood;
			my.sumFood = d.sumFood;
		}
	}
	if (d.sumProduction !== undefined){
		if (d.sumProduction && d.sumProduction !== my.sumProduction){
			DOM.sumProduction.textContent = d.sumProduction;
			my.sumProduction = d.sumProduction;
		}
	}
	if (d.sumCulture !== undefined){
		if (d.sumCulture && d.sumCulture !== my.sumCulture){
			DOM.sumCulture.textContent = d.sumCulture;
			my.sumCulture = d.sumCulture;
		}
	}
	// bonus values
	if (d.oBonus !== undefined){
		if (my.oBonus !== d.oBonus){
			DOM.oBonus.textContent = d.oBonus;
			my.oBonus = d.oBonus;
			initOffensiveTooltips();
		}
	}
	if (d.dBonus !== undefined){
		if (my.dBonus !== d.dBonus){
			DOM.dBonus.textContent = d.dBonus;
			my.dBonus = d.dBonus;
		}
	}
	if (d.turnBonus !== undefined){
		if (my.turnBonus !== d.turnBonus){
			DOM.turnBonus.textContent = d.turnBonus;
			my.turnBonus = d.turnBonus;
		}
	}
	if (d.foodBonus !== undefined){
		if (my.foodBonus !== d.foodBonus){
			DOM.foodBonus.textContent = d.foodBonus;
			my.foodBonus = d.foodBonus;
		}
	}
	if (d.cultureBonus !== undefined){
		if (my.cultureBonus !== d.cultureBonus){
			DOM.cultureBonus.textContent = d.cultureBonus;
			my.cultureBonus = d.cultureBonus;
			// recruit bonus changes
			initOffensiveTooltips();
		}
	}
	setBars(d);
}
function setBars(d){
	// animate bars
	TweenMax.to(DOM.foodBar, .3, {
		width: ((d.food / d.foodMax) * 100) + '%'
	});
	TweenMax.to(DOM.cultureBar, .3, {
		width: ((d.culture / d.cultureMax) * 100) + '%'
	});
}

function Nation(){
	this.account = "";
	this.nation = "";
	this.flag = "";
	this.playerColor = 0;
	this.alive = true;
	return this;
}

function loadGameState(){
	g.lock(1);
	var e1 = document.getElementById("mainWrap");
	if (e1 !== null){
		TweenMax.to(e1, .5, {
			alpha: 0
		});
	}
	// load map
	// console.warn("Loading: " + g.map.key + ".php");
	$.ajax({
		type: 'GET',
		url: 'maps/' + g.map.key + '.php'
	}).done(function(data){
		DOM.worldWrap.innerHTML = data;
		
		var loadGameDelay = location.host === 'localhost' ? 0 : 1000;
		setTimeout(function(){
			
		$.ajax({
			type: "GET",
			url: "php/loadGameState.php"
		}).done(function(data){
			g.teamMode = data.teamMode;
			// set map data
			g.map.sizeX = data.mapData.sizeX;
			g.map.sizeY = data.mapData.sizeY;
			g.map.name = data.mapData.name;
			g.map.tiles = data.mapData.tiles;
			
			// console.warn(data.tiles.length, g.map.tiles);
			if (data.tiles.length < g.map.tiles){
				if (g.loadAttempts < 10){
					setTimeout(function(){
						g.loadAttempts++;
						loadGameState();
					}, 1000);
				} else {
					Msg("Failed to load game data");
					setTimeout(function(){
						window.onbeforeunload = null;
						location.reload();
					}, 3000);
				}
				return;
			}
			initDom();
			g.screen.resizeMap();
			
			audio.gameMusicInit();
			// console.info('loadGameState ', data);
			// only when refreshing page while testing
			audio.load.game();
			video.load.game();
			// done
			my.player = data.player;
			my.team = data.team;
			my.account = data.account;
			my.oBonus = data.oBonus;
			my.dBonus = data.dBonus;
			my.cultureBonus = data.cultureBonus;
			my.tech = data.tech;
			my.capital = data.capital;
			my.flag = data.flag;
			my.nation = data.nation;
			my.foodMax = data.foodMax;
			my.production = data.production;
			my.turnProduction = data.turnProduction;
			my.cultureMax = data.cultureMax;
			my.moves = data.moves;
			my.government = data.government;
			my.buildCost = data.buildCost;
			lobby.updateGovernmentWindow(my.government);
			// global government bonuses
			if (my.government === 'Despotism'){
				document.getElementById('splitAttackCost').textContent = 0;
				my.splitAttackCost = 0;
			} else if (my.government === 'Monarchy'){
				my.buildCost = .5;
			} else if (my.government === 'Democracy'){
				my.maxDeployment = 254;
			} else if (my.government === 'Fundamentalism'){
				my.recruitCost = 2;
				document.getElementById('recruitCost').textContent = my.recruitCost;
			} else if (my.government === 'Fascism'){
				document.getElementById('moves').textContent = 12;
				my.deployCost = 10;
				document.getElementById('deployCost').textContent = my.deployCost;
			} else if (my.government === 'Communism'){
				// research
				DOM.gunpowderCost.textContent = 40;
				DOM.engineeringCost.textContent = 60;
				DOM.rocketryCost.textContent = 100;
				DOM.atomicTheoryCost.textContent = 125;
				DOM.futureTechCost.textContent = 500;
				// weapons
				DOM.cannonsCost.textContent = 20;
				DOM.missileCost.textContent = 30;
				DOM.nukeCost.textContent = 200;
				my.weaponCost = .5;
			}
			// initialize player data
			game.initialized = true;
			for (var z=0, len=game.player.length; z<len; z++){
				// initialize diplomacy-ui
				game.player[z] = new Nation();
			}
			
			g.removeContainers();
			g.unlock();
			g.view = "game";
			TweenMax.fromTo(gameWrap, 1, {
				autoAlpha: 0
			}, {
				autoAlpha: 1
			});
			// init game player data
			for (var i=0, len=data.players.length; i<len; i++){
				var d = data.players[i];
				game.player[d.player].account = d.account;
				game.player[d.player].flag = d.flag;
				game.player[d.player].nation = d.nation;
				game.player[d.player].player = d.player;
				game.player[d.player].playerColor = d.playerColor;
				game.player[d.player].team = d.team;
				game.player[d.player].government = d.government;
			}
			
			// initialize client tile data
			var mapCapitals = document.getElementById('mapCapitals'),
				mapUpgrades = document.getElementById('mapUpgrades');
			for (var i=0, len=data.tiles.length; i<len; i++){
				var d = data.tiles[i];
				game.tiles[i] = {
					name: d.tileName,
					account: d.account,
					player: d.player,
					nation: d.nation,
					flag: d.flag,
					capital: data.capitalTiles.indexOf(i) > -1 && d.flag ? true : false,
					units: d.units,
					food: d.food,
					culture: d.culture,
					defense: d.defense
				}
				// init flag unit values
				var zig = document.getElementById('unit' + i);
				if (zig !== null){
					zig.textContent = d.units === 0 ? 0 : d.units;
					if (d.units){
						zig.style.visibility = 'visible';
					}
				}
				if (d.player){
					TweenMax.set('#land' + i, {
						fill: g.color[game.player[d.player].playerColor]
					});
				}
			}
			// init map flags
			var a = document.getElementsByClassName('unit'),
				mapBars = document.getElementById('mapBars'),
				mapFlagWrap = document.getElementById('mapFlagWrap');
			for (var i=0, len=a.length; i<len; i++){
				// set flag position and value
				var t = game.tiles[i];
				var x = a[i].getAttribute('x') - 24;
				var y = a[i].getAttribute('y') - 24;
				var flag = 'blank.png';
				if (t !== undefined){
					if (!t.flag && t.units){ // FIX TODO??
						flag = "Player0.jpg";
					} else if (t.flag){
						flag = t.flag;
					}
				}
				// dynamically add svg flag image to the map
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
				svg.id = 'flag' + i;
				svg.setAttributeNS(null, 'height', 24);
				svg.setAttributeNS(null, 'width', 24);
				svg.setAttributeNS(null,"x",x);
				svg.setAttributeNS(null,"y",y + 5);
				svg.setAttributeNS(null,"class","mapFlag");
				svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/flags/' + flag);
				mapFlagWrap.appendChild(svg);
				// add star for capital to map
				if (game.tiles[i].capital){
					var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
					svg.id = 'mapCapital' + i;
					svg.setAttributeNS(null, 'height', 30);
					svg.setAttributeNS(null, 'width', 30);
					svg.setAttributeNS(null,"x",x - 15);
					svg.setAttributeNS(null,"y",y + 17);
					svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/capital.png');
					mapCapitals.appendChild(svg);
					TweenMax.set(svg, {
						transformOrigin: '50% 50%',
						rotation: 45,
						repeat: -1,
						ease: Linear.easeNone
					});
				}
			}
			// init map DOM elements
			game.initMap();
				// food, culture, def bars
			for (var i=0; i<len; i++){
				animate.initMapBars(i);
			}
			var str = '<div id="diploHead">\
				<span id="options" class="pointer options">Options</span>&nbsp;|&nbsp;\<span id="surrender" class="pointer">Surrender</span><span id="exitSpectate" class="pointer">Exit Game</span>\
			</div><hr class="fancyhr">';
			// init diplomacyPlayers
			function diploRow(p){
				function teamIcon(team){
					return g.teamMode ? 
						'<span data-toggle="tooltip" data-placement="right" class="diploTeam" title="Team '+ team +'">'+ team +'</span>' :
						'';
				}
				var str = '<div id="diplomacyPlayer' + p.player + '" class="diplomacyPlayers alive">\
					<div class="flag '+ p.flagClass +'" data-toggle="tooltip" data-container="#diplomacy-ui" data-placement="right" title="'+ p.flagShort + '"></div>'+ 
					teamIcon(p.team) +
					'<i class="' + lobby.governmentIcon(p.government)+ ' diploSquare player'+ game.player[p.player].playerColor +'" data-placement="right" data-toggle="tooltip" title="' + p.government + '"></i>\
					<span class="diploNames large" data-toggle="tooltip" data-placement="right" title="'+ p.account +'">' + (my.nation === p.nation ? '<b>'+ p.nation +'</b>' : p.nation) + '</span>\
				</div>';
				return str;
			}
			var teamArr = [ str ];
			for (var i=0, len=game.player.length; i<len; i++){
				var p = game.player[i];
				if (p.account){
					p.flagArr = p.flag.split("."),
					p.flagShort = p.flagArr[0],
					p.flagClass = p.flag === 'Default.jpg' ? 
						'player'+ game.player[p.player].playerColor : 
						p.flagArr[0].replace(/ /g, "-");
					if (g.teamMode){
						var foo = diploRow(p);
						// 100 just in case the players/game are increased later
						teamArr[p.team*100 + i] = foo;
					} else {
						str += diploRow(p);
					}
				}
			}
			if (g.teamMode){
				document.getElementById('diplomacy-ui').innerHTML = teamArr.join("");
			} else {
				document.getElementById('diplomacy-ui').innerHTML = str;
			}
			
			$('[data-toggle="tooltip"]').tooltip({
				delay: {
					show: 0,
					hide: 0
				}
			});
			initResources(data);
			lobby.initRibbons(data.ribbons);
			setTimeout(function(){
				// init draggable map
				worldMap = Draggable.create(DOM.worldWrap, {
					type: 'x,y',
					bounds: "#gameWrap"
				});
				
				initOffensiveTooltips();
				TweenMax.set(DOM.targetLine, {
					stroke: g.color[game.player[my.player].playerColor]
				});
				TweenMax.set(DOM.targetLine, {
					stroke: "hsl(+=0%, +=0%, +=15%)"
				});
				
				function triggerAction(that){
					if (my.attackOn){
						var o = my.targetData;
						if (o.attackName === 'attack'){
							action.attack(that);
						} else if (o.attackName === 'cannons'){
							action.fireCannons(that);
						} else if (o.attackName === 'missile'){
							action.launchMissile(that);
						} else if (o.attackName === 'nuke'){
							action.launchNuke(that);
						}
					} else {
						showTarget(that);
					}
				}
				var zug = $('.land');
				// map events
				if (isMSIE || isMSIE11){
					zug.on("click", function(){
						triggerAction(this);
						TweenMax.set(this, {
							fill: "hsl(+=0%, +=0%, +=15%)"
						});
					});
				} else {
					zug.on("click", function(e){
						console.info(this.id);
						triggerAction(this);
					});
				}
				zug.on("mouseenter", function(){
					my.lastTarget = this;
					if (my.attackOn){
						showTarget(this, true);
					}
					TweenMax.set(this, {
						fill: "hsl(+=0%, +=0%, +=15%)"
					});
				}).on("mouseleave", function(){
					var land = this.id.slice(4)*1;
					if (game.tiles.length > 0){
						var player = game.tiles[land] !== undefined ? game.tiles[land].player : 0,
							fillNum = player ? game.player[player].playerColor : 0;
						TweenMax.set(this, {
							fill: g.color[fillNum]
						});
					}
				});
				
				// focus on player home
				my.focusTile(my.capital);
				// add warning for players
				if (location.host !== 'localhost'){
					window.onbeforeunload = function(){
						return "To leave the game use the surrender flag instead!";
					}
				}
				game.startGameState();
			}, 250);
			animate.water();
		}).fail(function(data){
			serverError(data);
		}).always(function(){
			g.unlock();
		});
		
		}, loadGameDelay);
	});
};// ws.js 
// client-side web sockets
var socket = {
	initialConnection: true,
	removePlayer: function(account){
		var o = {
			type: 'remove',
			account: my.account
		}
		// removes id
		socket.zmq.publish('title:' + my.channel, o);
		delete title.players[account];
	},
	addPlayer: function(account, flag){
		var o = {
			type: 'add',
			account: my.account,
			flag: my.flag
		}
		socket.zmq.publish('title:' + my.channel, o);
		title.players[account] = {
			flag: flag
		}
	},
	unsubscribe: function(channel){
		try {
			socket.zmq.unsubscribe(channel);
		} catch(err){
			console.warn(err);
		}
	},
	setChannel: function(channel){
		// change channel on title screen
		if (g.view === 'title'){
			// remove from channel
			channel = channel.trim();
			if (channel === my.channel){
				var o = {
					message: "You're already in that channel.",
					type: 'chat-muted'
				};
				title.chat(o);
			} else {
				$.ajax({
					type: "POST",
					url: "php/titleChangeChannel.php",
					data: {
						channel: channel
					}
				}).done(function(data){
					console.info("NEW CHANNEL: " + data);
					// removes id
					socket.removePlayer(my.account);
					// unsubs
					socket.unsubscribe('title:' + my.channel);
					// set new channel data
					my.channel = data.channel;
					for (var key in title.players){
						delete title.players[key];
					}
					data.skip = true;
					data.msg = "You have joined channel: " + data.channel + ".";
					data.type = "chat-warning";
					title.chat(data);
					socket.zmq.subscribe('title:' + data.channel, function(topic, data) {
						if (g.ignore.indexOf(data.account) === -1){
							title.chatReceive(data);
						}
					});
					// add id
					socket.addPlayer(my.account, my.flag);
					// update display of channel
					if (g.view === 'title'){
						document.getElementById('titleChatHeaderChannel').textContent = data.channel;
						document.getElementById('titleChatBody').innerHTML = '';
					}
					title.updatePlayers(true);
					location.hash = my.channel === 'global' ? '' : my.channel;
				});
			}
		}
	},
	enableWhisper: function(){
		var channel = 'account:' + my.account;
		socket.zmq.subscribe(channel, function(topic, data) {
			if (data.message){
				if (data.action === 'send'){
					// console.info("RECEIVE: ", data.playerColor, data);
					// message sent to user
					var flag = my.flag.split(".");
					flag = flag[0].replace(/ /g, "-");
					my.lastReceivedWhisper = data.account;
					$.ajax({
						url: 'php/insertWhisper.php',
						data: {
							action: "receive",
							flag: data.flag,
							playerColor: data.playerColor,
							account: data.account,
							message: data.message
						}
					});
					data.type = 'chat-whisper';
					data.msg = data.message;
					data.message = data.chatFlag + data.account + ' whispers: ' + data.message;
					title.receiveWhisper(data);
				} else {
					// message receive confirmation to original sender
					// console.info("SEND: ", data.playerColor, data);
					data.msg = data.message;
					data.message = data.chatFlag + 'To ' + data.account + ': ' + data.message;
					data.type = 'chat-whisper';
					title.receiveWhisper(data);
				}
			}
		});
		setInterval(console.clear, 600000); // 10 min
		(function keepAliveWs(){
			socket.zmq.publish(channel, {type: "keepAlive"});
			setTimeout(keepAliveWs, 180000);
		})();
	},
	joinGame: function(){
		(function repeat(){
			if (socket.enabled){
				socket.unsubscribe('title:' + my.channel);
				// game updates
				// console.info("Subscribing to game:" + game.id);
				socket.zmq.subscribe('game:' + game.id, function(topic, data) {
					if (g.ignore.indexOf(data.account) === -1){
						title.chatReceive(data);
					}
				});
			} else {
				setTimeout(repeat, 100);
			}
		})();
	},
	enabled: false,
	connectionTries: 0,
	connectionRetryDuration: 250,
	init: function(){
		// is player logged in?
		var e = document.getElementById('titleMenu');
		if (e !== null){
			socket.zmq = new ab.Session('wss://' + location.hostname + '/wss2/', function(){
				socket.connectionSuccess();
			}, function(){
				socket.connectionFailure();
			}, {
				'skipSubprotocolCheck': true
			});
		}
	},
	connectionSuccess: function(){
		socket.enabled = true;
		console.info("Socket connection established with server");
		// chat updates
		if (g.view === 'title' && socket.initialConnection){
			socket.initialConnection = false;
			var initChannel = location.hash.length > 1 ?
				location.hash.slice(1) :
				'global';
			document.getElementById('titleChatHeaderChannel').innerHTML = my.channel;
			socket.setChannel(initChannel);
			socket.zmq.subscribe('title:refreshGames', function(topic, data) {
				title.updateGame(data);
			});
		}
		if (g.view === 'game'){
			game.getGameState();
		}
		socket.zmq.subscribe('admin:broadcast', function(topic, data) {
			console.info('BROADCAST: ', data);
			g.chat(data.msg, data.type);
		});
		(function repeat(){
			if (my.account){
				socket.enableWhisper();
			} else {
				setTimeout(repeat, 200);
			}
		})();
	},
	connectionFailure: function(){
		console.warn('WebSocket connection failed. Retrying...');
		socket.enabled = false;
		if (++socket.connectionTries * socket.connectionRetryDuration < 60000){
			setTimeout(socket.init, socket.connectionRetryDuration);
		}
	}
}
socket.init();// audio.js
var audio = {
	ext: (function(a){
		return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, '')) ? 'mp3' : 'ogg'
	})(document.createElement('audio')),
	on: (function(a){
		return !!a.canPlayType ? true : false;
	})(document.createElement('audio')),
	play: function(foo, bg){
		if (foo) {
			if (bg){
				// music
				if (g.config.audio.musicVolume){
					DOM.bgmusic.pause();
					if (fwpaid){
						DOM.bgmusic.src = "music/" + foo + "." + audio.ext;
						DOM.bgmusic.volume = g.config.audio.musicVolume / 100;
					}
				}
			} else {
				// sfx
				if (g.config.audio.soundVolume){
					var sfx = new Audio("sound/" + foo + "." + audio.ext);
					sfx.volume = g.config.audio.soundVolume / 100;
					sfx.play();
				}
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
		if (g.config.audio.musicVolume){
			audio.pause();
			audio.trackIndex = ~~(Math.random() * audio.totalTracks);
			audio.gameMusicPlayNext();
		}
	},
	// rotating music tracks in game
	gameMusicPlayNext: function(){
		// FIX IT SO IT USES BGAUDIO
		var tracks = [
			//'WaitingBetweenWorlds'
			'ambient0',
			'ambient1',
			'ambient2',
			'ambient3',
			'ambient4',
			'ambient5',
			'ambient6',
			'ambient7',
			'ambient8'
		]
		audio.totalTracks = tracks.length;
		audio.trackIndex++;
		// future various tracks
		if (my.government){
			// government specific tracks?
		}
		DOM.bgmusic.pause();
		if (fwpaid){
			DOM.bgmusic.src = "music/" + tracks[audio.trackIndex % audio.totalTracks] +"." + audio.ext;
			DOM.bgmusic.volume = g.config.audio.musicVolume / 100;
			DOM.bgmusic.onended = function(){
				audio.gameMusicPlayNext();
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
			var x = [
				'click', 
				'beep'
			];
			for (var i=0, len=x.length; i<len; i++){
				var z = x[i];
				audio.cache[z] = new Audio("sound/" + z + ".mp3");
			}
		},
		game: function(){
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
	},
	musicStart: function(){
		if (g.view !== 'game'){
			// audio.play("ReturnOfTheFallen", 1);
			audio.play("WaitingBetweenWorlds", 1);
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
})();// map.js
// map zooming and scrolling
function mouseZoomIn(e){
	g.mouse.zoom += 20;
	if (g.mouse.zoom > 200){
		g.mouse.zoom = 200;
	}
	TweenMax.set(DOM.worldWrap, {
		transformOrigin: g.mouse.transX + "% " + g.mouse.transY + "%",
		force3D: false,
		smoothOrigin: true,
		scale: g.mouse.zoom / 100,
		onUpdate: function(){
			worldMap[0].applyBounds();
		}, 
		onComplete: function(){
			worldMap[0].applyBounds();
		}
	});
}
function mouseZoomOut(e){
	g.mouse.zoom -= 20;
	if (g.mouse.zoom < 100){
		g.mouse.zoom = 100;
	}
	TweenMax.set(DOM.worldWrap, {
		force3D: false,
		smoothOrigin: true,
		transformOrigin: g.mouse.transX + "% " + g.mouse.transY + "%",
		scale: g.mouse.zoom / 100,
		onUpdate: function(){
			worldMap[0].applyBounds();
		}, 
		onComplete: function(){
			worldMap[0].applyBounds();
		}
	});
	worldMap[0].applyBounds();
}
function setMousePosition(X, Y){
	var x = ~~((X / g.map.sizeX) * 100);
	var y = ~~((Y / g.map.sizeY) * 100);
	g.mouse.transX = x;
	g.mouse.transY = y;
}// game.js
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
		} else {
			flag = t.flag;
		}
		name = t.name;
		account = t.account;
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
		var foodWidth = ~~(((t.food > 8 ? 8 : t.food) / 8) * 100);
		var cultureWidth = ~~(((t.culture > 8 ? 8 : t.culture) / 8) * 100);
		var defWidth = ~~((t.defense / 4) * 100);
	}
	str += name + '</div>\
		<div class="targetBarsWrap">\
			<div class="targetBars targetBarsFood" style="width: ' + foodWidth + '%"></div>\
			<div class="targetBars targetBarsFood" style="width: ' + foodWidth + '%"></div>\
		</div>\
		<div class="targetBarsWrap">\
			<div class="targetBars targetBarsCulture" style="width: ' + cultureWidth + '%"></div>\
			<div class="targetBars targetBarsCulture" style="width: ' + cultureWidth + '%"></div>\
		</div>\
		<div class="targetBarsWrap">\
			<div class="targetBars targetBarsDefense" style="width: ' + defWidth + '%"></div>\
			<div class="targetBars targetBarsDefense" style="width: ' + defWidth + '%"></div>\
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
	DOM['unit' + i].textContent = game.tiles[i].units === 0 ? "" : ~~game.tiles[i].units;
	if (unitColor === '#00ff00'){
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
	} else {
		TweenMax.to(DOM['unit' + i], .5, {
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
			<div>Your campaign for world domination has failed!</div>\
			<div id="endWar" class="endBtn">\
				<div class="modalBtnChild">Concede Defeat</div>\
			</div>';
		}
		if (g.showSpectateButton){
			msg += '<div id="spectate" class="endBtn">\
				<div class="modalBtnChild">Spectate</div>\
			</div>';
		}
		if (msg){
			audio.play('shotgun2');
			triggerEndGame(msg);
		}
	}).fail(function(data){
		console.info("FAIL: ", data);
	});
}


function gameVictory(){
	new Audio('sound/shotgun2.mp3');
	new Audio('sound/bell-8.mp3');
	var count = 0;
	(function repeat(){
		$.ajax({
			type: "GET",
			url: "php/gameVictory.php"
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
				triggerEndGame(msg);
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
function triggerEndGame(msg){
	$("*").off('click mousedown keydown keyup keypress');
	$("#chat-input").remove();
	window.onbeforeunload = null;
	setTimeout(function(){
		// allow for last update to occur for spectators
		g.over = 1;
	}, 1500);
	stats.get();
	new Image('images/FlatWorld75-2.jpg');
	setTimeout(function(){
		var e = document.getElementById('victoryScreen');
		e.innerHTML = msg;
		e.style.display = 'block';
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
			TweenMax.to(diplomacy-ui, 1, {
				alpha: 0,
				onComplete: function(){
					stats.show();
				}
			});
		});
	}, 2500);
}// actions.js
function Target(o){
	if (o === undefined){
		o = {};
	}
	this.cost = 2;
	this.minimum = o.minimum !== undefined ? o.minimum : 2;
	this.attackName = o.attackName ? o.attackName : 'attack';
	this.splitAttack = o.splitAttack ? o.splitAttack : false;
	this.hudMsg = o.hudMsg ? o.hudMsg : 'Select Target';
}

var action = {
	error: function(msg){
		if (msg === undefined){
			msg = "Not enough crystals!";
		}
		Msg(msg, 1.5);
		my.clearHud();
		showTarget(document.getElementById('land' + my.tgt));
	},
	target: function(o){
		my.targetData = o;
		// console.info(my.attackOn, my.tgt, game.tiles[my.tgt].player, my.player);
		if (game.tiles[my.tgt].player !== my.player){
			return;
		}
		if (my.attackOn && o.attackName === my.attackName){
			my.attackOn = false;
			my.attackName = '';
			my.clearHud();
			showTarget(document.getElementById('land' + my.tgt));
			return;
		}
		if (my.moves < o.cost){
			action.error('Not enough oil!');
			return;
		}
		if (game.tiles[my.tgt].units < o.minimum){
			Msg("You need at least " + o.minimum + " armies to attack!", 1.5);
			my.clearHud();
			return;
		}
		if (my.player === game.tiles[my.tgt].player){
			my.attackOn = true;
			my.attackName = o.attackName;
			my.splitAttack = o.splitAttack;
			my.hud(o.hudMsg);
			// set cursor
			$DOM.head.append('<style>.land{ cursor: crosshair; }</style>');
			// set target line
			my.targetLine[0] = DOM['unit' + my.tgt].getAttribute('x')*1 - 10;
			my.targetLine[1] = DOM['unit' + my.tgt].getAttribute('y')*1 - 10;
			showTarget(my.lastTarget, true);
		}
	},
	attack: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		// can't move to maxed friendly tile
		if (game.tiles[defender].player === my.player){
			if (game.tiles[defender].units >= 255){
				Msg("That territory has the maximum number of units!", 1.5);
				my.clearHud();
				return;
			}
		}
		my.attackOn = false;
		my.attackName = '';
		if (game.tiles[my.tgt].units === 1){
			Msg("You need at least 2 armies to move/attack!", 1.5);
			my.clearHud();
			return;
		}
		if ((my.moves < 2 && !my.splitAttack) ||
			(my.moves < 1 && my.splitAttack) ){
			action.error('Not enough oil!');
			return;
		}
		showTarget(that);
		my.clearHud();
		// send attack to server
		var e1 = document.getElementById('land' + attacker);
		$.ajax({
			url: 'php/attackTile.php',
			data: {
				attacker: attacker,
				defender: defender,
				split: my.splitAttack ? 1 : 0
			}
		}).done(function(data){
			// console.info('attackTile', data);
			// animate attack
			if (game.tiles[defender].player !== my.player){
				if (!game.tiles[defender].units){
					audio.move();
				}
			} else {
				audio.move();
			}
			// barbarian message
			if (data.rewardMsg){
				game.chat({ message: '<span class="chat-news">' + data.rewardMsg + '</span>' });
				setResources(data);
				console.info('REWARD: ', data);
			}
			setMoves(data); 
			// reset target if lost
			if (!data.victory){
				showTarget(e1);
			}
			// process barbarian reward messages
			game.reportMilestones(data);
		}).fail(function(data){
			console.info('attackTile', data);
			audio.play('error');
			Msg(data.statusText, 1.5);
			// set target attacker
			showTarget(e1);
		});
	},
	deploy: function(){
		var t = game.tiles[my.tgt];
		if (t.player !== my.player){
			return;
		}
		if (my.production < my.deployCost){
			action.error();
			return;
		}
		if (!my.manpower){
			action.error("No armies available for deployment!");
			return;
		}
		if (t.units <= 254){
			// determine number
			var deployedUnits = my.manpower < my.maxDeployment ? my.manpower : my.maxDeployment,
				tgt = my.tgt;
			var rem = 0;
			if (t.units + deployedUnits > 255){
				rem = ~~((t.units + deployedUnits) - 255);
				deployedUnits = ~~(255 - t.units);
			} else {
				rem = my.manpower - deployedUnits;
			}
			console.log('deploy: ', tgt, t.units, deployedUnits);
			// game.tiles[tgt].units = t.units + deployedUnits;
			// do it
			$.ajax({
				url: 'php/deploy.php',
				data: {
					deployedUnits: deployedUnits,
					target: tgt
				}
			}).done(function(data) {
				console.info("deploy: ", data);
				if (data.production !== undefined){
					audio.move();
					my.manpower = data.manpower;
					DOM.manpower.textContent = my.manpower;
					setProduction(data);
					setTileUnits(tgt, '#00ff00');
				}
			}).fail(function(e){
				audio.play('error');
			});
			TweenMax.set('#manpower', {
			  color: '#fff'
			});
		}
	},
	recruit: function(){
		var t = game.tiles[my.tgt];
		if (t.player !== my.player){
			return;
		}
		if (my.moves < my.recruitCost){
			action.error('Not enough oil!');
			return;
		}
		if (t.units <= 254){
			$.ajax({
				url: 'php/recruit.php',
				data: {
					target: my.tgt
				}
			}).done(function(data) {
				console.info("recruit: ", data.moves, data);
				setMoves(data);
			
				var deployedUnits = 3 + ~~(my.cultureBonus / 30);
				
				if (t.units + deployedUnits > 255){
					game.tiles[my.tgt].units = 255;
				} else {
					game.tiles[my.tgt].units += deployedUnits;
				}
				// do it
				setTileUnits(my.tgt, '#00ff00');
				audio.move();
			}).fail(function(e){
				audio.play('error');
			});
		}
	},
	upgradeTileDefense: function(){
		var oldTgt = my.tgt;
		var t = game.tiles[my.tgt],
			ind = t.defense - t.capital ? 1 : 0;
		if (t.player !== my.player){
			return;
		}
		if (ind > 2){
			return;
		}
		if (my.production < (g.upgradeCost[ind] * my.buildCost)){
			action.error();
			return;
		}
		
		
		$.ajax({
			url: 'php/upgradeTileDefense.php',
			data: {
				target: my.tgt
			}
		}).done(function(data) {
			setProduction(data);
			if (oldTgt === my.tgt){
				game.tiles[my.tgt].defense++;
				showTarget(document.getElementById('land' + my.tgt));
			}
		}).fail(function(e){
			console.info(e.responseText);
			Msg(e.statusText);
			audio.play('error');
		});
	},
	fireCannons: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		if (game.tiles[my.tgt].units === 0){
			return;
		}
		my.attackOn = false;
		my.attackName = '';
		if (my.production < 40 * my.weaponCost){
			action.error();
			return;
		}
		my.clearHud();
		showTarget(document.getElementById('land' + attacker));
		// send attack to server
		$.ajax({
			url: 'php/fireCannons.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			setProduction(data);
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				Msg(e.statusText, 1.5);
			}
		});
	},
	launchMissile: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		if (game.tiles[my.tgt].units === 0){
			return;
		}
		my.attackOn = false;
		my.attackName = '';
		if (my.production < 60 * my.weaponCost){
			action.error();
			return;
		}
		my.clearHud();
		showTarget(document.getElementById('land' + attacker));
		// send attack to server
		$.ajax({
			url: 'php/launchMissile.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			console.info('launchMissile', data);
			// animate attack
			if (data.production !== undefined){
				setProduction(data);
			}
			setTimeout(function(){
				$.ajax({
					url: 'php/launchMissileHit.php',
					data: {
						attacker: attacker,
						defender: defender
					}
				}).fail(function(e){
					console.info('error: ', e);
					if (e.statusText){
						Msg(e.statusText, 1.5);
					}
				});
			}, 1000);
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				Msg(e.statusText, 1.5);
			}
		});
		
	},
	launchNuke: function(that){
		var attacker = my.tgt;
		var defender = that.id.slice(4)*1;
		if (my.tgt === defender){
			return;
		}
		if (game.tiles[my.tgt].units === 0){
			return;
		}
		my.attackOn = false;
		my.attackName = '';
		if (my.production < 400 * my.weaponCost){
			action.error();
			return;
		}
		my.clearHud();
		showTarget(document.getElementById('land' + attacker));
		// send attack to server
		$.ajax({
			url: 'php/launchNuke.php',
			data: {
				attacker: attacker,
				defender: defender
			}
		}).done(function(data) {
			var e1 = document.getElementById('land' + defender),
				box = e1.getBBox();
			setTimeout(function(){
				$.ajax({
					url: 'php/launchNukeHit.php',
					data: {
						defender: defender
					}
				});
			}, 6000);
			console.info('launchNuke', data);
			setProduction(data);
		}).fail(function(e){
			console.info('error: ', e);
			audio.play('error');
			if (e.statusText){
				Msg(e.statusText, 1.5);
			}
		});
		
	},
	// updates currently visible buttons after research/targeting
	setMenu: function(){
		// show/hide research
		DOM.researchEngineering.style.display = my.tech.engineering ? 'none' : 'block';
		DOM.researchGunpowder.style.display = my.tech.gunpowder ? 'none' : 'block';
		DOM.researchRocketry.style.display = my.tech.rocketry || !my.tech.gunpowder ? 'none' : 'block';
		DOM.researchAtomicTheory.style.display = my.tech.atomicTheory || !my.tech.gunpowder || !my.tech.rocketry || !my.tech.engineering ? 'none' : 'block';
		// all techs must be finished for future tech
		var display = 'block';
		if (!my.tech.engineering || 
			!my.tech.gunpowder || 
			!my.tech.rocketry || 
			!my.tech.atomicTheory){
			display = 'none';
		}
		DOM.researchFutureTech.style.display = display;
		if (!game.tiles[my.tgt].defense){
			// zero defense
			DOM.upgradeTileDefense.style.display = 'block';
		} else {
			// wall or fortress
			var capValue = game.tiles[my.tgt].capital ? 1 : 0,
				dMinusPalace = game.tiles[my.tgt].defense - capValue,
				display = 'none';
			if (!my.tech.engineering){
				// bunker max possible
				if (!dMinusPalace){
					display = 'block';
				}
			} else {
				if (dMinusPalace < 3){
					display = 'block';
				}
			}
			DOM.upgradeTileDefense.style.display = display;
		}
		DOM.fireCannons.style.display = my.tech.gunpowder ? 'block' : 'none';
		DOM.launchMissile.style.display = my.tech.rocketry ? 'block' : 'none';
		DOM.launchNuke.style.display = my.tech.atomicTheory ? 'block' : 'none';
	}
}

// key bindings
function toggleChatMode(bypass){
	g.chatOn = g.chatOn ? false : true;
	if (g.chatOn){
		$DOM.chatInput.focus();
		DOM.chatInput.className = 'fw-text noselect nobg chatOn';
	} else {
		var msg = $DOM.chatInput.val().trim();
		if (bypass && msg){
			// send ajax chat msg
			if (msg.indexOf('/unfriend ') === 0){
				var account = msg.slice(10);
				title.removeFriend(account);
			} else if (msg === '/friend'){
				title.listFriends();
			} else if (msg.indexOf('/friend ') === 0){
				var account = msg.slice(8);
				title.addFriend(account);
			} else if (msg.indexOf('/unignore ') === 0){
				var account = msg.slice(10);
				title.removeIgnore(account);
			} else if (msg === '/ignore'){
				title.listIgnore();
			} else if (msg.indexOf('/ignore ') === 0){
				var account = msg.slice(8);
				title.addIgnore(account);
			} else if (msg.indexOf('/whisper ') === 0){
				title.sendWhisper(msg, '/whisper ');
			} else if (msg.indexOf('/w ') === 0){
				title.sendWhisper(msg, '/w ');
			} else if (msg.indexOf('@') === 0){
				title.sendWhisper(msg , '@');
			} else if (msg.indexOf('/who ') === 0){
				title.who(msg);
			} else {
				$.ajax({
					url: 'php/insertChat.php',
					data: {
						message: msg
					}
				});
			}
		}
		$DOM.chatInput.val('').blur();
		DOM.chatInput.className = 'fw-text noselect nobg';
	}
}

$("#gameWrap").on("mousedown", '#attack', function(e){
	if (e.which === 1){
		var o = new Target({});
		action.target(o);
	}
}).on('mousedown', '#deploy', function(e){
	if (e.which === 1){
		action.deploy();
	}
}).on('mousedown', '#splitAttack', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 1,
			splitAttack: true
		});
		action.target(o);
	}
}).on('mousedown', '#recruit', function(e){
	if (e.which === 1){
		action.recruit();
	}
}).on('mousedown', '#upgradeTileDefense', function(e){
	if (e.which === 1){
		action.upgradeTileDefense();
	}
}).on('mousedown', '#researchGunpowder', function(e){
	if (e.which === 1){
		research.gunpowder();
	}
}).on('mousedown', '#researchEngineering', function(e){
	if (e.which === 1){
		research.engineering();
	}
}).on('mousedown', '#researchRocketry', function(e){
	if (e.which === 1){
		research.rocketry();
	}
}).on('mousedown', '#researchAtomicTheory', function(e){
	if (e.which === 1){
		research.atomicTheory();
	}
}).on('mousedown', '#researchFutureTech', function(e){
	if (e.which === 1){
		research.futureTech();
	}
}).on('mousedown', '#fireCannons', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 60,
			minimum: 0,
			attackName: 'cannons',
			hudMsg: 'Fire Cannons'
		});
		action.target(o);
	}
}).on('mousedown', '#launchMissile', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 120,
			minimum: 0,
			attackName: 'missile',
			hudMsg: 'Launch Missile'
		});
		action.target(o);
	}
}).on('mousedown', '#launchNuke', function(e){
	if (e.which === 1){
		var o = new Target({
			cost: 600,
			minimum: 0,
			attackName: 'nuke',
			hudMsg: 'Launch Nuclear Weapon'
		});
		action.target(o);
	}
});

var research = {
	gunpowder: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchGunpowder.php'
		}).done(function(data) {
			my.tech.gunpowder = 1;
			research.report(data, "Gunpowder");
		}).fail(function(data){
			console.info('gunpowder: ', data);
		});
	},
	engineering: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchEngineering.php'
		}).done(function(data) {
			my.tech.engineering = 1;
			research.report(data, "Engineering");
		});
	},
	rocketry: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchRocketry.php'
		}).done(function(data) {
			my.tech.rocketry = 1;
			research.report(data, "Rocketry");
		}).fail(function(data){
			console.info('rocketry: ', data);
		});
	},
	atomicTheory: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchAtomicTheory.php'
		}).done(function(data) {
			my.tech.atomicTheory = 1;
			research.report(data, "Atomic Theory");
		}).fail(function(data){
			console.info('atomic: ', data);
		});
	},
	futureTech: function(){
		$.ajax({
			type: 'GET',
			url: 'php/researchFutureTech.php'
		}).done(function(data) {
			research.report(data, "Future Tech");
		}).fail(function(data){
			console.info('future: ', data);
		});
	},
	report: function(data, tech){
		setProduction(data);
		var o = {
			message: 'You have finished researching ' + tech + '.'
		}
		game.chat(o);
		if (data.cultureMsg){
			var o = {
				message: data.cultureMsg
			};
			game.chat(o);
		}
		audio.play('research');
		action.setMenu();
	}
};var events = {
	core: (function(){
		$(window).focus(function(){
			document.title = g.defaultTitle;
			g.titleFlashing = false;
			if (g.notification.close !== undefined){
				g.notification.close();
			}
		});
		$(window).on('resize orientationchange focus', function() {
			resizeWindow();
		}).on('load', function(){
			resizeWindow();
			// background map
			TweenMax.to("#worldTitle", 600, {
				startAt: {
					xPercent: -50,
					yPercent: -50,
					rotation: -360
				},
				rotation: 0,
				repeat: -1,
				ease: Linear.easeNone
			});
		});
	})(),
	title: (function(){
		$("#mainWrap").on('click', '.titlePlayerAccount, .lobbyAccountName', function(){
			title.who('/who '+ $(this).text());
		});
		$("#gameView").on('dragstart', 'img', function(e) {
			e.preventDefault();
		});
		$("img").on('dragstart', function(event) {
			event.preventDefault();
		});

		$("#logout").on('click', function() {
			playerLogout();
			return false;
		});

		$("#titleMenu").on("click", ".wars", function(){
			var gameName = $(this).data("name");
			$("#joinGameName").val(gameName);
			$("#joinGamePassword").val('');
		}).on("dblclick", ".wars", function(){
			var gameName = $(this).data("name");
			$("#joinGameName").val(gameName);
			$("#joinGamePassword").val('');
			title.joinGame();
		});
		
		function openCreateGameModal(mode){
			var e1 = document.getElementById('createGameHead'),
				e2 = document.getElementById('createRankedGameHead'),
				e3 = $("#gameName"),
				e4 = document.getElementById('createGameNameWrap'),
				e5 = document.getElementById('createGamePasswordWrap'),
				e6 = document.getElementById('createGameMaxPlayerWrap');
				
			if (mode === 'ranked'){
				g.rankedMode = 1;
				e1.style.display = 'none';
				e2.style.display = 'block';
				e4.style.display = 'none';
				e5.style.display = 'none';
				e6.style.display = 'none';
			} else {
				e1.style.display = 'block';
				e2.style.display = 'none';
				e4.style.display = 'block';
				e5.style.display = 'block';
				e6.style.display = 'block';
			}
			if (mode === 'team'){
				g.teamMode = 1;
				e1.textContent = 'Create Team Game';
			}
			e3.val('');
			TweenMax.to(document.getElementById("createGameWrap"), g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			title.showBackdrop(e3);
			
			var speed = localStorage.getItem('gameSpeed');
			newSpeed = g.speeds[speed];
			if (newSpeed >= 5000){
				g.speed = newSpeed;
				$("#createGameSpeed").text(speed);
			}
			
		}
		$("#mainWrap").on('click', '.chat-join', function(){
			socket.setChannel($(this).text());
		});
		$("#create").on("click", function(){
			openCreateGameModal('ffa');
		});
		$("#createRankedBtn").on("click", function(){
			openCreateGameModal('ranked');
		});
		$("#createTeamBtn").on("click", function(){
			openCreateGameModal('team');
		});

		$("#createGame").on("click", function(e){
			title.createGame();
		});
		$("body").on("click", '#options', function(){
			TweenMax.to(document.getElementById("optionsModal"), g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			title.showBackdrop();
		});
		$("#optionsDone, #cancelCreateGame").on("click", function(){
			title.closeModal();
		});


		// cached values on client to reduce DB load

		$("#titleMenu").on("click", "#joinGame", function(){
			title.joinGame();
		});

		$("#mainWrap").on("click", "#cancelGame", function(){
			exitGame();
		}).on("click", "#startGame", function(){
			lobby.startGame();
		});
		$("#toggleNation").on("click", function(){
			TweenMax.to(configureNation, g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			title.showBackdrop();
		});
		$("#unlockGameBtn").on("click", function(){
			var e = document.getElementById("unlockGame");
			TweenMax.to(e, g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			setTimeout(function(){
				$("#card-number").focus();
			}, 100);
			title.showBackdrop();
		});
		$("#leaderboardBtn").on('click', function(){
			TweenMax.to(leaderboard, g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					top: 0,
					alpha: 0
				},
				top: 30,
				alpha: 1
			});
			title.showBackdrop();
			var e3 = document.getElementById('leaderboardBody');
			$.ajax({
				url: 'php/leaderboard.php'
			}).done(function(data) {
				e3.innerHTML = data.str;
			});
		});

		$("#flagDropdown").on('click', '.flagSelect', function(e){
			my.selectedFlag = $(this).text();
			my.selectedFlagFull = my.selectedFlag === "Nepal" ? my.selectedFlag+".png" : my.selectedFlag+".jpg";
			$(".flagPurchaseStatus").css("display", "none");
			$("#updateNationFlag")
				.attr("src", "images/flags/" + my.selectedFlagFull)
				.css("display", "block");
			g.lock(1);
			$.ajax({
				url: 'php/updateFlag.php',
				data: {
					flag: my.selectedFlagFull
				}
			}).done(function(data) {
				$("#offerFlag").css("display", "none");
				my.flag = my.selectedFlagFull;
				$(".nationFlag").attr({
					src: "images/flags/" + my.selectedFlagFull,
					title: my.selectedFlag
				});
				$("#flagPurchased").css("display", "block");
				Msg("Your nation's flag is now: " + my.selectedFlag);
				document.getElementById('selectedFlag').textContent = my.selectedFlag;
				$("[title]").tooltip('fixTitle');
			}).fail(function(e){
				$("#flagPurchased").css("display", "none");
				$("#offerFlag").css("display", "block");
			}).always(function(){
				g.unlock(1);
				TweenMax.to("#updateNationFlag", 1, {
					startAt: {
						alpha: 0
					},
					alpha: 1
				});
			});
			e.preventDefault();
		});

		$("#submitNationName").on("mousedown", function(){
			title.submitNationName();
		});
		$("#updateNationName").on("focus", function(){
			g.focusUpdateNationName = true;
		}).on("blur", function(){
			g.focusUpdateNationName = false;
		});
		$("#refreshGameWrap").on("focus", "#gameName", function(){
			g.focusGameName = true;
		});
		$("#refreshGameWrap").on("blur", "#gameName", function(){
			g.focusGameName = false;
		});
		$("#titleViewBackdrop").on('click', function(){
			title.closeModal();
		});
		$("#mainWrap").on('click', '#unlockGameDone, #configureNationDone, #leaderboardDone', function(){
			audio.play('click');
			title.closeModal();
		});
		$("#autoJoinGame").on('click', function(){
			$("#joinGameName").val('');
			audio.play('click');
			$("#joinGamePassword").val();
			$(".wars-FFA").filter(":first").trigger("click"); 
			console.info($(".wars-FFA"));
			if (!$("#joinGameName").val()){
				Msg("No FFA games found!", 1.5);
			} else {
				title.joinGame();
			}
		});
		$("#joinTeamGame").on('click', function(){
			$("#joinGameName").val('');
			audio.play('click');
			$("#joinGamePassword").val();
			$(".wars-Team").filter(":first").trigger("click"); 
			console.info($(".wars-Team"));
			if (!$("#joinGameName").val()){
				Msg("No team games found!", 1.5);
			} else {
				title.joinGame();
			}
		});
		$("#overlay").on('click', function(){
			g.searchingGame = false;
			TweenMax.set(DOM.Msg, {
				opacity: 0
			});
			g.unlock();
		});
		$("#joinRankedGame").on('click', function(){
			audio.play('click');
			g.lock();
			g.searchingGame = true;
			Msg("Searching for ranked games...", 0);
			(function repeat(count){
				if (count < 4 && !g.joinedGame){
					setTimeout(function(){
						if (g.searchingGame){
							repeat(++count);
						}
					}, 1000);
					// ajax call to join ranked game
					$.ajax({
						url: 'php/joinRankedGame.php'
					}).done(function(data){
						if (g.searchingGame){
							TweenMax.set(DOM.Msg, {
								opacity: 0
							});
							g.joinedGame = 1;
							g.unlock();
							g.searchingGame = false;
							title.joinGameCallback(data);
						}
					}).fail(function(data){
						console.info(data);
					});
				} else {
					if (!g.joinedGame && g.searchingGame){
						Msg("No ranked games found! Try creating a ranked game instead.", 5);
						g.unlock();
						g.searchingGame = false;
					}
				}
			})(0);
		});
	})(),
	lobby: (function(){
		$("#lobby-chat-input").on('focus', function(){
			lobby.chatOn = true;
		}).on('blur', function(){
			lobby.chatOn = false;
		});
		$("#lobbyChatSend").on('click', function(){
			lobby.sendMsg(true);
		});
		// prevents auto scroll while scrolling
		$("#lobbyChatLog").on('mousedown', function(){
			lobby.chatDrag = true;
		}).on('mouseup', function(){
			lobby.chatDrag = false;
		});
		$("#joinGameLobby").on('click', '.governmentChoice', function(e){
			// changes player's own government only
			var government = $(this).text();
			lobby.updateGovernmentWindow(government);
			$.ajax({
				url: "php/changeGovernment.php",
				data: {
					government: government
				}
			});
			e.preventDefault();
		}).on('click', '.playerColorChoice', function(e){
			var playerColor = $(this).data('playercolor');
			$.ajax({
				url: 'php/changePlayerColor.php',
				data: {
					playerColor: playerColor*1
				}
			}).done(function(data) {
				my.playerColor = data.playerColor;
			}).fail(function(data){
				Msg(data.statusText, 1.5);
			});
		}).on('click', '.teamChoice', function(e){
			var team = $(this).text().slice(5);
			console.info("TEAM: ", team);
			$.ajax({
				url: 'php/changeTeam.php',
				data: {
					team: team
				}
			}).done(function(data) {
				my.team = data.team;
			}).fail(function(data){
				Msg(data.statusText, 1.5);
			});
			
		});
	})(),
	map: (function(){
		if (!isFirefox){
			$("body").on("mousewheel", function(e){
				if (g.view === 'game'){
					setMousePosition(e.offsetX, e.offsetY);
					worldMap[0].applyBounds();
				}
			});
			$("#worldWrap").on("mousewheel", function(e){
				e.originalEvent.wheelDelta > 0 ? mouseZoomIn(e) : mouseZoomOut(e);
				worldMap[0].applyBounds();
			});
		} else {
			$("body").on("DOMMouseScroll", function(e){
				if (g.view === 'game'){
					setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
					worldMap[0].applyBounds();
				}
			});
			$("#worldWrap").on("DOMMouseScroll", function(e){
				e.originalEvent.detail > 0 ? mouseZoomOut(e) : mouseZoomIn(e);
				worldMap[0].applyBounds();
			});
		}

		$("#worldWrap").on("mousemove", function(e){
			if (isFirefox){
				setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
			} else {
				// console.info(e.offsetX, e.offsetY);
				setMousePosition(e.offsetX, e.offsetY);
			}
		});
		$("#diplomacy-ui").on('click', '#surrender', function(e){
			surrenderMenu(); 
		});
		$("#createGameWrap").on('click', '.mapSelect', function(e){
			var x = $(this).text();
			var key = x.replace(/ /g,'');
			g.map.name = x;
			g.map.key = key;
			if (fwpaid){
				document.getElementById('createGameMap').innerHTML = x;
				document.getElementById('createGameTiles').innerHTML = title.mapData[key].tiles;
				document.getElementById('createGamePlayers').innerHTML = title.mapData[key].players;
			} else {
				Msg("Unlock the complete game for access to all maps.");
			}
			e.preventDefault();
		});
		$("#mainWrap").on('click', '.gameSelect', function(e){
			e.preventDefault();
		});
		$("#mainWrap").on('click', '.speedSelect', function(e){
			var x = $(this).text();
			g.speed = g.speeds[x];
			$("#createGameSpeed").text(x);
			localStorage.setItem('gameSpeed', x);
			e.preventDefault();
		});
	})(),
	audio: (function(){
		$("#bgmusic").on('ended', function() {
			var x = document.getElementById('bgmusic');
			x.currentTime = 0;
			x.play();
		});
		$("#bgamb1").on('ended', function() {
			var x = document.getElementById('bgamb1');
			x.currentTime = 0;
			x.play();
		});
		$("#bgamb2").on('ended', function() {
			var x = document.getElementById('bgamb2');
			x.currentTime = 0;
			x.play();
		});
	})(),
	game: (function(){
		$("#cancelSurrenderButton").on('click', function(){
			audio.play('click');
			document.getElementById('surrenderScreen').style.display = 'none';
		});
		$("#surrenderButton").on('click', function(){
			surrender();
		});
	})()
};


$(document).on('keydown', function(e){
	var x = e.keyCode;
	if (e.ctrlKey){
		if (x === 82){
			return false;
		}
	} else {
		if (x === 9){
			// tab
			if (g.view === 'game'){
				if (!e.shiftKey){
					my.nextTarget(false);
				} else {
					my.nextTarget(true);
				}
				e.preventDefault();
			}
		} else if (x === 86){
			if (g.view === 'game'){
				game.toggleGameWindows(1);
			}
		}
	}
});
$(document).on('keyup', function(e) {
	var x = e.keyCode;
	//console.info(g.view, x);
	if (g.view === 'title'){
		if (x === 13){
			if (g.focusUpdateNationName){
				title.submitNationName();
			} else if (g.focusGameName){
				title.createGame();
			} else if (title.chatOn){
				if (x === 13){
					// enter - sends chat
					title.sendMsg();
				}
			} else if (title.createGameFocus){
				title.createGame();
			}
		} else if (x === 27){
			// esc
			title.closeModal();
		}
	} else if (g.view === 'lobby'){
		if (lobby.chatOn){
			if (x === 13){
				// enter - sends chat
				lobby.sendMsg();
			}
		}
	} else if (g.view === 'game'){
		if (g.chatOn){
			if (x === 13){
				// enter/esc - sends chat
				toggleChatMode(true);
			} else if (x === 27){
				// esc
				toggleChatMode();
			}
		} else {
			// game hotkeys
			if (x === 13){
				// enter
				toggleChatMode();
			}  else if (x === 27){
				// esc
				my.attackOn = false;
				my.attackName = '';
				my.clearHud();
				showTarget(document.getElementById('land' + my.tgt));
			} else if (x === 65){
				// a
				var o = new Target();
				action.target(o);
			} else if (x === 83){
				// s
				var o = new Target({
					cost: 3, 
					splitAttack: true
				});
				action.target(o);
			} else if (x === 68){
				// d
				if (!g.keyLock){
					action.deploy();
				}
			} else if (x === 82){
				// r
				if (!g.keyLock){
					if (e.ctrlKey){
						var x = my.lastReceivedWhisper;
						if (x){
							if (g.view === 'title'){
								$("#title-chat-input").val('/w ' + x + ' ').focus();
							} else if (g.view === 'lobby'){
								$("#lobby-chat-input").val('/w ' + x + ' ').focus();
							} else {
								if (!g.chatOn){
									toggleChatMode();
								}
								$("#chat-input").val('/w ' + x + ' ').focus();
							}
						}
						return false;
					} else {
						action.recruit();
					}
				}
			} else if (x === 69){
				// e
				research.engineering();
			} else if (x === 71){
				// g
				research.gunpowder();
			} else if (x === 75){
				// k
				research.rocketry();
			} else if (x === 84){
				// t
				research.atomicTheory();
			} else if (x === 70){
				// f
				research.futureTech();
			} else if (x === 66){
				// b
				action.upgradeTileDefense();
			} else if (x === 67){
				// c
				var o = new Target({
					cost: 40 * my.weaponCost,
					minimum: 0,
					attackName: 'cannons',
					hudMsg: 'Fire Cannons'
				});
				action.target(o);
			} else if (x === 77){
				// m
				var o = new Target({
					cost: 60 * my.weaponCost,
					minimum: 0,
					attackName: 'missile',
					hudMsg: 'Launch Missile'
				});
				action.target(o);
			} else if (x === 78){
				// n
				var o = new Target({
					cost: 400 * my.weaponCost,
					minimum: 0,
					attackName: 'nuke',
					hudMsg: 'Launch Nuclear Weapon'
				});
				action.target(o);
			}
		}
	}
});})($,Math,document,location,TweenMax);