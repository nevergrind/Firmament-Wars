<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	$target = $_POST['target']*1;
	
	if ($_SESSION['production'] < $_SESSION['RecruitCost']){
		header('HTTP/1.1 500 Not enough energy!' . $_SESSION['production'] . ' v ' . $_SESSION['RecruitCost']);
		exit();
	}
	$x = new stdClass();
	
	$query = "select player, units from fwtiles where tile=? and game=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('ii', $target, $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($dPlayer, $dUnits);
	while($stmt->fetch()){
		$player = $dPlayer;
		$units = $dUnits;
	}
	
	if ($_SESSION['player'] === $player &&
		$units <= 254){
		
		$deployedUnits = 3 + floor($_SESSION['cultureBonus'] / 30);
		$units += $deployedUnits;
		if ($units > 255){
			$units = 255;
		}
		
		// update attacker
		$query = 'update fwtiles set units=? where tile=? and game=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('iii', $units, $target, $_SESSION['gameId']);
		$stmt->execute();
		
		$_SESSION['production'] -= $_SESSION['RecruitCost'];
		$x->production = $_SESSION['production'];
	} else {
		header('HTTP/1.1 500 You cannot recruit here!');
	}
	echo json_encode($x);
?>