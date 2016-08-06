<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	// get game tiles
	$query = "select defense from `fwTiles` where game=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($dDefense);
	
	$tiles = [];
	$count = 0;
	while($stmt->fetch()){
		$x = new stdClass();
		$x->defense = $dDefense;
		$tiles[$count++] = $x;
	}
	echo json_encode($tiles);
?>