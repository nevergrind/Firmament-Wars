// stats.js 
// scoreboard data values
var stats = {
	events: (function(){
		$("#statWrap").on('click', '.statTabs', function(){
			$(".statTabs").removeClass('active');
			$(this).addClass('active');
			audio.play('click');
			// load data
			var id = $(this).attr('id');
			if (id === 'statOverview'){
				stats.loadOverview();
			} else if (id === 'statUnits'){
				stats.loadUnits();
			} else if (id === 'statStructures'){
				stats.loadStructures();
			} else if (id === 'statWeapons'){
				stats.loadWeapons();
			} else if (id === 'statResources'){
				stats.loadResources();
			}
		});
	})(),
	loadOverview: function(){
		console.info('loadOverview');
	},
	loadUnits: function(){
		console.info('loadUnits');
	},
	loadStructures: function(){
		console.info('loadStructures');
	},
	loadWeapons: function(){
		console.info('loadWeapons');
	},
	loadResources: function(){
		console.info('loadResources');
	},
	get: function(){
		$.ajax({
			url: 'php/stats.php',
		}).done(function(data){
			console.info('stats: ', data);
			stats.display(data);
		});
	},
	display: function(data){
	}
}
function Stats(){
	var o = {
		overviewTotal: function(){
			return this.unitsTotal() + this.structuresTotal() + this.weaponsTotal() + this.resourcesTotal();
		},
		// units scores
		unitsTotal: function(){
			return this.produced + this.killed + this.lost;
		},
		earned: 0,
		deployed: 0,
		killed: 0,
		lost: 0,
		// structure scores
		structuresTotal: function(){
			return this.bunkers + this.walls + this.fortresses;
		},
		bunkers: 0,
		walls: 0,
		fortresses: 0,
		// weapon scores
		weaponsTotal: function(){
			return this.cannons + this.missiles + this.nukes;
		},
		cannons: 0,
		missiles: 0,
		nukes: 0,
		// resources scores
		resourcesTotal: function(){
			return this.food + this.culture + this.energy;
		},
		food: 0,
		culture: 0,
		energy: 0
	};
	return o;
}