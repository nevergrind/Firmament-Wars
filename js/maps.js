// all game maps
maps.getMap = function(key) {
	var str =
		'<div id="worldWater"></div>' +
		this.head +
		this.filters +
		'<g id="landWrap">'+ this[key].land + '</g>' +
		this.mapLayers +
		'<g class="paths">' + this[key].paths + '</g>' +
		'<g id="textWrap">' + this[key].text + '</g>' +
		this.mapTargeting + '</svg>';
	return str;
};
maps.head = '<?xml version="1.1" encoding="UTF-8" standalone="no"><svg id="world">';

maps.filters = '<defs>\
		<marker id="arrowhead"\
			orient="auto"\
			markerWidth="2"\
			markerHeight="4"\
			refX=".1"\
			refY="2">\
		<path id="arrowhead-tip"\
			d="M0,0 V4 L2,2 Z" />\
		  </marker>\
			<marker id="arrowhead-border"\
				orient="auto"\
				markerWidth="2.1"\
				markerHeight="4.2"\
				refX=".25"\
				refY="2.1">\
			<path id="arrowhead-tip-head"\
				d="M0,0 V4.2 L2.1,2.1 Z" />\
		  </marker>\
			<!--<filter id="darken">\
				<feColorMatrix type="matrix"\
				values=".2   0   0   0   0\
						 0  .2   0   0   0\
						 0   0  .2   0   0\
						 0   0   0   1   0 "/>\
			</filter>-->\
			<filter id="emboss" color-interpolation-filters="sRGB">\
				<feGaussianBlur\
					in="SourceAlpha"\
					result="result0"\
					stdDeviation="2"/>\
				<feSpecularLighting\
					in="result0"\
					result="result1"\
					lighting-color="#fff"\
					surfaceScale="5"\
					specularConstant=".3"\
					specularExponent="33">\
					  <feDistantLight azimuth="235" elevation="70"/>\
				 </feSpecularLighting>\
				 <feComposite\
					k2="1"\
					k3="1"\
					in="SourceGraphic"\
					result="result4"\
					operator="arithmetic"/>\
				 <feComposite\
					in2="SourceAlpha"\
					in="result4"\
					result="result2"\
					operator="in"/>\
			</filter>\
			<pattern id="smallGrid" width="22" height="22" patternUnits="userSpaceOnUse">\
				<path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(32, 64, 96, 1)"\ stroke-width="3" />\
			</pattern>\
		</defs>\
		<rect id="grid" fill="url(#smallGrid)" width="100%" height="100%" x="-400px" y="-200px"/>';

maps.mapLayers = '\
		<g id="mapFlagWrap" class="no-pointer"></g>\
		<g id="mapBars" class="no-pointer"></g>\
		<g id="mapAnimations" class="no-pointer"></g>';

maps.mapTargeting = '\
		<g id="targetCrosshair">\
		<path stroke="black" stroke-width="8"\
		   d="m 384.645,256 c 0,70.942 -57.702,128.655 -128.655,128.655 -70.942,0 -128.655,-57.712 -128.655,-128.655 0,-70.912 57.723,-128.635 128.655,-128.635 70.963,0 128.655,57.713 128.655,128.635 z M 255.99,98.969 c -86.558,0 -157.02,70.42 -157.02,157.031 0,86.611 70.462,157.041 157.02,157.041 86.579,0 157.061,-70.441 157.061,-157.041 0,-86.61 -70.482,-157.03 -157.061,-157.03 z"></path>\
		<path stroke="black" stroke-width="8"\
		   d="m 270.192,216.75 0,-206.428 -28.395,0 0,206.418 c 4.485,-1.607 9.196,-2.631 14.203,-2.631 5.007,0 9.707,1.024 14.192,2.642 z"></path>\
		<path stroke="black" stroke-width="8"\
		   d="m 241.787,295.26 0,206.418 28.395,0 0,-206.418 c -4.485,1.608 -9.195,2.642 -14.203,2.642 -5.008,0 -9.708,-1.034 -14.192,-2.642 z"></path>\
		<path stroke="black" stroke-width="8"\
		   d="m 216.73,241.808 -212.121,0 0,28.375 212.121,0 c -1.618,-4.454 -2.642,-9.185 -2.642,-14.213 0,-4.976 1.024,-9.718 2.642,-14.162 z"></path>\
		<path stroke="black" stroke-width="8"\
		   d="m 507.392,241.808 -212.142,0 c 1.618,4.444 2.642,9.175 2.642,14.172 0,5.018 -1.024,9.758 -2.642,14.213 l 212.142,0 0,-28.386 z"></path>\
		  </g>\
			<path id="targetLineShadow"\
			   d="M 0,0 Q 0 0 0 0"\
			   class="paths"></path>\
			<path id="targetLineBorder"\
				marker-end="url(#arrowhead-border)"\
			   d="M 0,0 Q 0 0 0 0"\
			   class="paths"></path>\
			<path id="targetLine"\
				marker-mid="url(#mid-marker)"\
				marker-end="url(#arrowhead)"\
			   d="M 0,0 Q 0 0 0 0"\
			   class="paths"></path>\
		  <g>\
			<path id="motionPath"\
			   d="M 0,0 Q 0 0 0 0"\
			   class="paths"></path>\
		  </g>';

maps.Placeholder = {
	land: '',
	paths: '',
	text: '',
};