// map.js
// map zooming and scrolling
function mouseZoomDone() {
	if (g.mouse.zoom === 100) {
		TweenMax.set(DOM.worldWrap, {
			transformOrigin: '50% 50%',
			force3D: false
		})
	}
	applyBounds();
}
function applyBounds() {
	typeof worldMap[0] === 'object' && worldMap[0].applyBounds();
}
function mouseZoomIn(e){
	setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
	if (g.mouse.zoom >= 100) return;
	g.mouse.zoom += 5;
	if (g.mouse.zoom >= 100){
		g.mouse.zoom = 100;
	}
	TweenMax.to(DOM.worldWrap, .3, {
		transformOrigin: g.mouse.x + "px " + g.mouse.y + "px",
		force3D: true,
		scale: g.mouse.zoom / 100,
		onUpdate: function() {
			applyBounds()
		},
		onComplete: function() {
			mouseZoomDone()
		}
	});
}
function mouseZoomOut(e){
	setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
	if (g.mouse.zoom <= 50) return;
	g.mouse.zoom -= 5;
	if (g.mouse.zoom <= 50){
		g.mouse.zoom = 50;
	}
	TweenMax.to(DOM.worldWrap, .3, {
		transformOrigin: g.mouse.x + "px " + g.mouse.y + "px",
		force3D: true,
		scale: g.mouse.zoom / 100,
		onUpdate: function() {
			applyBounds()
		},
		onComplete: function() {
			mouseZoomDone()
		}
	});
}
function setMousePosition(X, Y){
	g.mouse.x = X;
	g.mouse.y = Y;
}