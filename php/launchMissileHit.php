<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	$o = new stdClass();
	$defender = new stdClass();
	$defender->tile = $_POST['defender']*1;
	
	$query = 'select tile, flag, units from fwTiles where tile=? and game=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('ii', $defender->tile, $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($tile, $flag, $units);
	
	while($stmt->fetch()){
		$defender->tile = $tile;
		$defender->flag = $flag;
		$defender->units = $units;
	}
	
	// missile attack
	$killedUnits = 5 + ($_SESSION['oBonus'] * 2) + round($defender->units * .15);
	$defender->units = $defender->units - $killedUnits;
	if (!$defender->flag || $defender->units < 1){
		$defender->units = 1;
	}
	// update defender
	$query = 'update fwTiles set units=? where tile=? and game=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('iii', $defender->units, $defender->tile, $_SESSION['gameId']);
	$stmt->execute();
	
	echo json_encode($o);
?>