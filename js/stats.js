// stats.js 
// scoreboard data values
function Stats(){
	var o = {
		overview: {
			score: 0,
			unitScore: 0,
			structureScore: 0,
			weaponScore: 0,
			resourceScore: 0
		},
		units: {
			produced: 0,
			killed: 0,
			lost: 0
		},
		structures: {
			bunkers: 0,
			walls: 0,
			fortresses: 0
		},
		weapons: {
			cannons: 0,
			missiles: 0,
			nukes: 0
		},
		resources: {
			food: 0,
			culture: 0,
			energy: 0
		}
	}
	return o;
}