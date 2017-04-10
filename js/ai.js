var ai = {
	getRandomTile: function(player){
		var a = [],
			i = 0;
		game.tiles.forEach(function(d, index){
			if (d.player === player){
				a[i++] = index;
			}
		});
		var randVal = ~~(Math.random() * i);
		return a[randVal];
	},
	attack: function(d){
		
	},
	deploy: function(d){
		var tile = ai.getRandomTile(d.player);
		if (tile !== undefined){
			console.info('tile ', tile);
			console.info('DEPLOY: ', d);
			$.ajax({
				url: 'php/deploy-ai.php',
				data: {
					tile: tile
				}
			}).done(function(data){
				//console.info(data);
				game.tiles[tile].units = data.units;
			});
		}
	}
};