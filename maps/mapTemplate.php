<?php 
require('waters.php');
echo '
<?xml version="1.1" encoding="UTF-8" standalone="no"?> 
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   version="1.1" 
   id="world" 
   viewBox="0 0 2000 1100">';
   
   require('filters.php');
   
	echo '<g id="landWrap">
	
	</g>';
	
	require('mapLayers.php');
	
	echo '<g class="paths">
		<path d="m 320,175 q -305 -100 -610 0"/>
	</g>
	
	<g>
		<text x="9999" y="9999" class="unit" id="unit0">0</text>
	</g>';
	   
	require ('mapTargeting.php');
echo '</svg>';