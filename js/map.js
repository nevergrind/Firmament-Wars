// map.js
// map zooming and scrolling
function mouseZoomDone() {
	applyBounds();
	if (g.mouse.zoom === 100) {
		TweenMax.set(DOM.worldWrap, {
			transformOrigin: '50% 50%',
			force3D: false
		})
	}
}
function applyBounds() {
	worldMap[0].applyBounds();
}
function mouseZoomIn(e){
	setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
	g.mouse.zoom += 5;
	if (g.mouse.zoom >= 100){
		g.mouse.zoom = 100;
	}
	TweenMax.to(DOM.worldWrap, .3, {
		transformOrigin: g.mouse.transX + "% " + g.mouse.transY + "%",
		force3D: true,
		smoothOrigin: true,
		scale: g.mouse.zoom / 100,
		onUpdate: applyBounds,
		onComplete: mouseZoomDone
	});
}
function mouseZoomOut(e){
	setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
	g.mouse.zoom -= 5;
	if (g.mouse.zoom <= 70){
		g.mouse.zoom = 70;
	}
	TweenMax.to(DOM.worldWrap, .3, {
		force3D: true,
		smoothOrigin: true,
		transformOrigin: g.mouse.transX + "% " + g.mouse.transY + "%",
		scale: g.mouse.zoom / 100,
		onUpdate: applyBounds,
		onComplete: mouseZoomDone
	});
}
function setMousePosition(X, Y){
	g.mouse.x = X;
	g.mouse.y = Y;
	g.mouse.transX = ~~((X / g.map.sizeX) * 100);
	g.mouse.transY = ~~((Y / g.map.sizeY) * 100);
}