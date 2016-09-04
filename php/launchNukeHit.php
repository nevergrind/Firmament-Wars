<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	$o = new stdClass();
	
	$defender = new stdClass();
	$defender->tile = $_POST['defender']*1;
	
	if ($_SESSION['nukesLaunched'] > 0){
		$_SESSION['nukesLaunched']--;
		
		$query = 'select tile, tileName, nation, flag, units, player, account from fwtiles where tile=? and game=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('ii', $defender->tile, $_SESSION['gameId']);
		$stmt->execute();
		$stmt->bind_result($tile, $tileName, $nation, $flag, $units, $player, $account);
		
		while($stmt->fetch()){
			$defender->tile = $tile;
			$defender->tileName = $tileName;
			$defender->nation = $nation;
			$defender->flag = $flag;
			$defender->units = $units;
			$defender->player = $player;
			$defender->account = $account;
		}
		// nuclear attack
		$range = mt_rand(80, 99) / 100;
		$killedUnits = round($defender->units * $range);
		$defender->units = $defender->units - $killedUnits;
		if (!$defender->flag || $defender->units < 1){
			$defender->units = 1;
		}
		$newDef = in_array($defender->tile, $_SESSION['capitalTiles']) ? 1 : 0;
		// update defender
		$query = 'update fwtiles set units=?, defense=? where tile=? and game=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('iiii', $defender->units, $newDef, $defender->tile, $_SESSION['gameId']);
		$stmt->execute();
		
		echo json_encode($o);
	} else {
		header('HTTP/1.1 500 No nukes available');
	}
?>