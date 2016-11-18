// stats.js 
// scoreboard data values
var stats = {
	get: function(){
		$.ajax({
			url: 'php/stats.php',
		}).done(function(data){
			console.info('stats: ', data);
		});
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