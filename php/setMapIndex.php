<?php
	$_SESSION['mapIndex'] = 0;
	require('mapData.php');
	// find map data - default to Earth Alpha if not found
	$count = count($mapData);
	for ($i = 0; $i < $count; $i++){
		if ($map === $mapData[$i]->name){
			$_SESSION['mapIndex'] = $i;
		}
	}
?>