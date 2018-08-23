// my.js
var my = {
	window: 'Full Screen',
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
	productionBonus: -1,
	foodBonus: -1,
	cultureBonus: -1,
	foodMax: 25,
	cultureMax: 300,
	manpower: 0,
	moves: 4,
	sumMoves: 4,
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
	deployCost: 1,
	rushCost: 2,
	maxDeployment: 12,
	cannonBonus: 0,
	targetData: {},
	selectedFlag: "blank",
	selectedFlagFull: "blank.png",
	government: 'Despotism',
	tech: {
		masonry: 0,
		construction: 0,
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
		TweenMax.set([DOM.targetLine, DOM.targetLineBorder, DOM.targetLineShadow, DOM.targetCrosshair], {
			visibility: 'hidden',
			strokeDashoffset: 0
		});
		$("#style-land-pointer").remove();
		$DOM.head.append('<style id="style-land-pointer">.land{ cursor: pointer; }</style>');
	},
	checkSelectLastTarget: function(){
		if (game.tiles[my.tgt].player !== my.player){
			if (game.tiles[my.lastTgt].player === my.player){
				my.nextTarget(false, my.lastTgt);
			} else {
				my.nextTarget(false);
			}
		}

	},
	nextTarget: function(backwards, setTgt){
		console.info('nextTarget', backwards, setTgt);
		if (!g.spectateStatus){
			my.lastTgt = my.tgt;
			var count = 0,
				len = game.tiles.length;
			if (setTgt === undefined){
				// TAB targeting
				backwards ? my.tgt-- : my.tgt++;
			}
			else {
				my.tgt = setTgt;
			}
			if (my.tgt < 0){
				my.tgt = len-1;
			}
			while (count < len && my.player !== game.tiles[my.tgt % len].player){
				backwards ? my.tgt-- : my.tgt++;
				if (my.tgt < 0){
					my.tgt = len - 1;
				}
				count++;
			}
			if (setTgt === undefined){
				// TAB targeting
				if (!backwards){
					my.tgt = my.tgt % len;
				}
				else {
					my.tgt = Math.abs(my.tgt);
				}
			}
			else {
				my.tgt = setTgt;
			}
			my.focusTile(my.tgt, .1);
			animate.selectTile(my.lastTgt, my.tgt);
		}
	},
	// shift camera to tile
	focusTile: function(tile, d){
		console.info('focusTile', tile, d);
		var e = DOM['land' + tile];
		if (e !== null){
			var box = e.getBBox();
			if (d === undefined){
				d = .5;
			}
			// 300 is left padding; 200 top padding
			var x = -box.x - (box.width/2) - 300 + (window.innerWidth/2);
			if (x > 0){
				// if positive, it's too far left
				x = 0;
			}
			var xMin = (g.map.sizeX - window.innerWidth) * -1;
			if (x < xMin){
				// if negative it's too high
				x = xMin;
			}

			var y = -box.y - (box.height/2) - 200 + (window.innerHeight/2);
			if (y > 0){
				y = 0;
			}
			var yMin = (g.map.sizeY - window.innerHeight) * -1;
			if (y < yMin){
				y = yMin;
			}
			console.info('focusTile: ', ~~x, ~~y);
			TweenMax.to(DOM.worldWrap, d, {
				left: ~~x,
				top: ~~y,
				onUpdate: function() {
					applyBounds()
				}
			});
			ui.showTarget(DOM['land' + tile], false, 1);
		}
	}
};