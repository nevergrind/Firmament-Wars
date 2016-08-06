// map.js
// map zooming and scrolling
function mouseZoomIn(e){
	if (g.mouse.mouseZoom >= 200){
		g.mouse.mouseZoom = 200;
	} else {
		g.mouse.mouseZoom += 5;
		TweenMax.to("#worldWrap", .5, {
			transformOrigin: g.mouse.mouseTransX + "% " + g.mouse.mouseTransY + "%",
			force3D: false,
			smoothOrigin: true,
			scale: g.mouse.mouseZoom / 100,
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
	if (g.mouse.mouseZoom <= 100){
		g.mouse.mouseZoom = 100;
	} else {
		g.mouse.mouseZoom -= 5;
		TweenMax.to("#worldWrap", .5, {
			force3D: false,
			smoothOrigin: true,
			transformOrigin: g.mouse.mouseTransX + "% " + g.mouse.mouseTransY + "%",
			scale: g.mouse.mouseZoom / 100,
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
	var x = ~~((X / g.mouse.mapSizeX) * 100);
	var y = ~~((Y / g.mouse.mapSizeY) * 100);
	g.mouse.mouseTransX = x;
	g.mouse.mouseTransY = y;
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
		// console.info(e.offsetX, e.offsetY);
	}
});
$("#gameWrap").on('click', '#surrender', function(){
	exitGame();
});