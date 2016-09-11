<?php
	function isAdjacent($x, $y){
		if ($_SESSION['map'] === 'Earth Alpha'){
			require('adjEarthAlpha.php');
		} else if ($_SESSION['map'] === 'Flat Earth'){
			require('adjFlatEarth.php');
		}
		return in_array($y, $adj[$x]);
	}
?>