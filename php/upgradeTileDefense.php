<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	$target = $_POST['target']*1;
	
	$query = "select player, tileName, defense from fwTiles where tile=? and game=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('ii', $target, $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($dPlayer, $dTileName, $dDefense);
	while($stmt->fetch()){
		$player = $dPlayer;
		$tileName = $dTileName;
		$defense = $dDefense;
	}
	$cost = [80, 225, 450];
	$capitalDefBonus = in_array($target, $_SESSION['capitalTiles']) ? 1 : 0;
	$ind = $defense - $capitalDefBonus;
	
	
	$x = new stdClass();
	$x->capital = $capitalDefBonus;
	$x->defense = $defense;
	
	if ($player !== $_SESSION['player']){
		header('HTTP/1.1 500 You cannot build at this location!');
		exit();
	}
	if ($ind > 2){
		header('HTTP/1.1 500 This tile is fully upgraded!');
		exit();
	}
	if ($_SESSION['production'] < $cost[$ind]){
		header('HTTP/1.1 500 Not enough energy!');
		exit();
	}
	
	$structures = ['bunker', 'wall', 'fortress'];
	$built = $structures[$ind];
	$_SESSION['production'] -= $cost[$ind];
	$x->production = $_SESSION['production'];
	$ind++;
	$newDef = $ind + $capitalDefBonus;
	// update attacker
	$query = 'update fwTiles set defense=? where tile=? and game=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('iii', $newDef, $target, $_SESSION['gameId']);
	$stmt->execute();
	
	$msg = $_SESSION['nation'] . ' built a '. $built . ' in ' . $tileName . '.';
	$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, "upgrade");');
	$stmt->bind_param('si', $msg, $_SESSION['gameId']);
	$stmt->execute();
	
	echo json_encode($x);
?>