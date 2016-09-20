// map.js
// map zooming and scrolling
function mouseZoomIn(e){
	if (g.mouse.zoom >= 200){
		g.mouse.zoom = 200;
	} else {
		g.mouse.zoom += 5;
		TweenMax.to("#worldWrap", .5, {
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
}

function mouseZoomOut(e){
	if (g.mouse.zoom <= 100){
		g.mouse.zoom = 100;
	} else {
		g.mouse.zoom -= 5;
		TweenMax.to("#worldWrap", .5, {
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
	}
	worldMap[0].applyBounds();
}

if (!isFirefox){
	$("#worldWrap").on("mousewheel", function(e){
		e.originalEvent.wheelDelta > 0 ? mouseZoomIn(e) : mouseZoomOut(e);
		worldMap[0].applyBounds();
	});
} else {
	$("#worldWrap").on("DOMMouseScroll", function(e){
		e.originalEvent.detail > 0 ? mouseZoomOut(e) : mouseZoomIn(e);
		worldMap[0].applyBounds();
	});
}
function setMousePosition(X, Y){
	var x = ~~((X / g.map.sizeX) * 100);
	var y = ~~((Y / g.map.sizeY) * 100);
	g.mouse.transX = x;
	g.mouse.transY = y;
}
if (!isFirefox){
	$("body").on("mousewheel", function(e){
		if (g.view !== 'title'){
			setMousePosition(e.offsetX, e.offsetY);
			worldMap[0].applyBounds();
		}
	});
} else {
	$("body").on("DOMMouseScroll", function(e){
		if (g.view !== 'title'){
			setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
			worldMap[0].applyBounds();
		}
	});
}

$("#worldWrap").on("mousemove", function(e){
	if (isFirefox){
		setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
	} else {
		setMousePosition(e.offsetX, e.offsetY);
	}
});
$("#gameWrap").on('click', '#surrender', function(){
	exitGame();
});
$("#createGameWrap").on('click', '.mapSelect', function(){
	var x = $(this).text();
	var key = x.replace(/ /g,'');
	g.map.name = x;
	g.map.key = key;
	document.getElementById('createGameMap').innerHTML = x;
	document.getElementById('createGameTiles').innerHTML = title.mapData[key].tiles;
	document.getElementById('createGamePlayers').innerHTML = title.mapData[key].players;
	
});