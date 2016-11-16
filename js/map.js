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
function setMousePosition(X, Y){
	var x = ~~((X / g.map.sizeX) * 100);
	var y = ~~((Y / g.map.sizeY) * 100);
	g.mouse.transX = x;
	g.mouse.transY = y;
}