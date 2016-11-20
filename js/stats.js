// stats.js 
// scoreboard data values
var stats = {
	init: function(data){
		var flag = my.flag === 'Default.jpg' ? 'Player'+ my.player +'.jpg' : my.flag;
		var str = '<img id="statWorld" src="images/FlatWorld60.jpg">\
		<div id="statResult">\
			Victory!\
			<img class="statResultFlag pull-left" src="images/flags/'+ flag +'">\
			<img class="statResultFlag pull-right" src="images/flags/'+ flag +'">\
		</div>\
		<div id="statTabWrap">\
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
		<table id="gameStatsTable" class="table">\
		</table>\
		<div id="statFooter">\
			<div id="statDuration" class="fw-primary">Game Duration: <span id="gameDuration">'+ stats.gameDuration(data.gameDuration) +'</span></div>\
			<div id="statsOkWrap" class="fw-primary pull-right">\
				<span id="statsOk">Ok</span>\
			</div>\
		</div>';
		document.getElementById('statWrap').style.display = 'block';
		document.getElementById('statWrap').innerHTML = str;
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
		stats.setView('statOverview');
		TweenMax.to('#gameWrap', .5, {
			startAt: {
				alpha: 0
			},
			alpha: 1
		});
	},
	events: (function(){
		$("#statWrap").on('click', '.statTabs', function(){
			$(".statTabs").removeClass('active');
			$(this).addClass('active');
			audio.play('click');
			// load data
			var id = $(this).attr('id');
			stats.setView(id);
		}).on('click', '#statsOk', function(){
			location.reload();
		});
	})(),
	maxValue: {},
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
				if (i === 1){
					stats.maxValue.unitsTotal = stats.unitsTotal(i);
					stats.maxValue.structuresTotal = stats.structuresTotal(i);
					stats.maxValue.weaponsTotal = stats.weaponsTotal(i);
					stats.maxValue.resourcesTotal = stats.resourcesTotal(i);
					stats.maxValue.overviewTotal = stats.overviewTotal(i);
				} else {
					if (stats.unitsTotal(i) > stats.maxValue.unitsTotal){
						stats.maxValue.unitsTotal = stats.unitsTotal(i);
					}
					if (stats.structuresTotal(i) > stats.maxValue.structuresTotal){
						stats.maxValue.structuresTotal = stats.structuresTotal(i);
					}
					if (stats.weaponsTotal(i) > stats.maxValue.weaponsTotal){
						stats.maxValue.weaponsTotal = stats.weaponsTotal(i);
					}
					if (stats.resourcesTotal(i) > stats.maxValue.resourcesTotal){
						stats.maxValue.resourcesTotal = stats.resourcesTotal(i);
					}
					if (stats.overviewTotal(i) > stats.maxValue.overviewTotal){
						stats.maxValue.overviewTotal = stats.overviewTotal(i);
					}
				}
			}
		}
	},
	setView: function(id){
		var str = stats[id]();
		document.getElementById('gameStatsTable').innerHTML = str;
		if (id === 'statOverview'){
			
		}
	},
	animate: function(a, delay){
		setTimeout(function(){
			for (var i=1, len=a.length; i<len; i++){
				var d = a[i];
				(function(d, e){
					TweenMax.to(d, delay, {
						startAt: {
							max: 0
						},
						max: d.max,
						onUpdate: function(){
							e.textContent = ~~d.max;
						}
					});
					var bar = document.getElementById(d.id + '-bar');
					TweenMax.to(bar, delay, {
						startAt: {
							width: 0
						},
						width : ((d.max / stats.maxValue[d.key]) * 100) + '%'
					});
				})(d, document.getElementById(d.id));
			}
		});
	},
	statOverview: function(){
		// head
		var str = stats.playerHead(['Units', 'Structures', 'Weapons', 'Resources', 'Total Score']);
		// player rows
		var animate = [];
		for (var i=1; i<=8; i++){
			var p = game.player[i];
			if (stats.data[i] !== undefined){
				// player data exists
				var a = [{},
					{
						id: 'p'+ i +'-units',
						max: stats.unitsTotal(i),
						key: 'unitsTotal'
					},
					{
						id: 'p'+ i +'-structures',
						max: stats.structuresTotal(i),
						key: 'structuresTotal'
					},
					{
						id: 'p'+ i +'-weapons',
						max: stats.weaponsTotal(i),
						key: 'weaponsTotal'
					},
					{
						id: 'p'+ i +'-resources',
						max: stats.resourcesTotal(i),
						key: 'resourcesTotal'
					},
					{
						id: 'p'+ i +'-total',
						max: stats.overviewTotal(i),
						key: 'overviewTotal'
					},
				]
				stats.animate(a, 3);
				str += '<tr class="stagBlue statRow">' +
					stats.playerCell(p, i) +
					'<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-units-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-units" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-structures-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-structures" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-weapons-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-weapons" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-resources-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-resources" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-total-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-total" class="statVal chat-warning">0</div>\
						</div>\
					</td>\
				</tr>\
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
			var p = game.player[i];
			if (d !== undefined){
				// player data exists
				var a = [{},
					{
						id: 'p'+ i +'-earned',
						max: d.earned,
						key: 'earned'
					},
					{
						id: 'p'+ i +'-deployed',
						max: d.deployed,
						key: 'deployed'
					},
					{
						id: 'p'+ i +'-killed',
						max: d.killed,
						key: 'killed'
					},
					{
						id: 'p'+ i +'-lost',
						max: d.lost,
						key: 'lost'
					},
				]
				stats.animate(a, 3);
				str += '<tr class="stagBlue statRow">' +
					stats.playerCell(p, i) +
					'<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-earned-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-earned" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-deployed-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-deployed" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-killed-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-killed" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-lost-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-lost" class="statVal">0</div>\
						</div>\
					</td>\
				</tr>\
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
			var p = game.player[i];
			if (d !== undefined){
				// player data exists
				var a = [{},
					{
						id: 'p'+ i +'-bunkers',
						max: d.bunkers,
						key: 'bunkers'
					},
					{
						id: 'p'+ i +'-walls',
						max: d.walls,
						key: 'walls'
					},
					{
						id: 'p'+ i +'-fortresses',
						max: d.fortresses,
						key: 'fortresses'
					}
				]
				stats.animate(a, 1.5);
				str += '<tr class="stagBlue statRow">' +
					stats.playerCell(p, i) +
					'<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-bunkers-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-bunkers" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-walls-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-walls" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-fortresses-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-fortresses" class="statVal">0</div>\
						</div>\
					</td>\
				</tr>\
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
			var p = game.player[i];
			if (d !== undefined){
				// player data exists
				var a = [{},
					{
						id: 'p'+ i +'-cannons',
						max: d.cannons,
						key: 'cannons'
					},
					{
						id: 'p'+ i +'-missiles',
						max: d.missiles,
						key: 'missiles'
					},
					{
						id: 'p'+ i +'-nukes',
						max: d.nukes,
						key: 'nukes'
					}
				]
				stats.animate(a, 1.5);
				str += '<tr class="stagBlue statRow">'+
					stats.playerCell(p, i) +
					'<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-cannons-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-cannons" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-missiles-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-missiles" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-nukes-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-nukes" class="statVal">0</div>\
						</div>\
					</td>\
				</tr>\
				<tr class="statSpacer"></tr>';
			}
		}
		return str;
	},
	statResources: function(){
		// head
		var str = stats.playerHead(['Energy', 'Food', 'Culture']);
		// player rows
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			var p = game.player[i];
			if (d !== undefined){
				// player data exists
				var a = [{},
					{
						id: 'p'+ i +'-energy',
						max: d.energy,
						key: 'energy'
					},
					{
						id: 'p'+ i +'-food',
						max: d.food,
						key: 'food'
					},
					{
						id: 'p'+ i +'-culture',
						max: d.culture,
						key: 'culture'
					}
				]
				stats.animate(a, 3);
				str += '<tr class="stagBlue statRow">' +
					stats.playerCell(p, i) +
					'<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-energy-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-energy" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-food-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
							<div id="p'+ i +'-food" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="statTD">\
						<div class="statBar pb'+ i +'">\
							<div class="statBarBgWrap">\
								<div id="p'+ i +'-culture-bar" class="statBarBg pbar'+ i +'">&nbsp</div>\
							</div>\
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
		var str = '<tr><th style="width: 30%"></th>';
		for (var i=0, len=column.length; i<len; i++){
			if (i === 4){
				str += '<th class="text-center chat-warning">'+ column[i] +'</th>';
			} else {
				str += '<th class="text-center">'+ column[i] +'</th>';
			}
		}
		str += '</tr>';
		return str;
	},
	playerCell: function(p, i){
		var flag = p.flag === 'Default.jpg' ? 'Player'+ i +'.jpg' : p.flag;
		var str = '<td>\
			<img class="statsFlags" src="images/flags/'+ flag +'">\
			<div class="statsPlayerWrap">\
				<div class="statsAccount chat-warning nowrap">'+ p.account +'</div>\
				<div class="statsNation nowrap">\
					<i class="fa fa-gavel diploSquare statsGov player'+ i +'"></i>'+ p.nation +'</div>\
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
				min = '0' + min;
			}
		}
		return min;
	},
	seconds: function(data){
		var sec = ~~(data % 60);
		if (sec < 10){
			return '0' + sec;
		}
		return sec;
	},
	get: function(){
		$.ajax({
			url: 'php/stats.php',
		}).done(function(data){
			console.info(data);
			stats.data = data;
			stats.init(data);
		});
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
		return ~~( (x.food / 100) + (x.culture / 250) + (x.energy / 100) );
	}
}