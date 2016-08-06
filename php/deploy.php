<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	$target = $_POST['target'];
	$deployedUnits = $_POST['deployedUnits'];
	if ($deployedUnits < 1){
		$deployedUnits = 1;
	}
	if ($deployedUnits > 12){
		$deployedUnits = 12;
	}
	
	if ($_SESSION['production'] < 20){
		header('HTTP/1.1 500 Not enough energy!');
		exit();
	}
	$x = new stdClass();
	
	$query = "select player, units from fwTiles where tile=? and game=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('ii', $target, $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($dPlayer, $dUnits);
	while($stmt->fetch()){
		$player = $dPlayer;
		$units = $dUnits;
	}
	
	if ($_SESSION['player'] === $player &&
		$units <= 254 &&
		$_SESSION['manpower'] > 0){
		
		$deployedUnits = $_SESSION['manpower'] < 12 ? $_SESSION['manpower'] : 12;
		$rem = 0;
		if ($units + $deployedUnits > 255){
			$rem = ($units + $deployedUnits) - 255;
			$deployedUnits = 255 - $units;
		} else {
			$rem = $_SESSION['manpower'] - $deployedUnits;
		}
		$units += $deployedUnits;
		$_SESSION['manpower'] = $rem;
		
		// update attacker
		$query = 'update fwTiles set units=? where tile=? and game=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('iii', $units, $target, $_SESSION['gameId']);
		$stmt->execute();
		
		$_SESSION['production'] -= 20;
		$x->production = $_SESSION['production'];
	} else {
		header('HTTP/1.1 500 You cannot deploy to enemy territory!');
	}
	echo json_encode($x);
?>