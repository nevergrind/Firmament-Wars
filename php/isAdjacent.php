<?php
	function isAdjacent($x, $y){
		if ($_SESSION['map'] === 'Earth Alpha'){
			require('adjEarthAlpha.php');
		}
		return in_array($y, $adj[$x]);
	}
?>