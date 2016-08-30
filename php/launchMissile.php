<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	$o = new stdClass();
	$attacker = new stdClass();
	$attacker->tile = $_POST['attacker']*1;
	
	$defender = new stdClass();
	$defender->tile = $_POST['defender']*1;
	
	$cost = 150*$_SESSION['weaponCost'];
	if ($_SESSION['production'] < $cost){
		header('HTTP/1.1 500 Not enough energy!');
		exit();
	}
	if (!$_SESSION['tech']->rocketry){
		header('HTTP/1.1 500 You must research this technology first!');
		exit();
	}
	$query = 'select tile, units, account from fwtiles where (tile=? or tile=?) and game=? limit 2';
	$stmt = $link->prepare($query);
	$stmt->bind_param('iii', $attacker->tile, $defender->tile, $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($tile, $units, $account);
	
	while($stmt->fetch()){
		if ($attacker->tile === $tile){
			$attacker->tile = $tile;
			$attacker->units = $units;
			$attacker->account = $account;
		} else {
			$defender->tile = $tile;
			$defender->units = $units;
			$defender->account = $account;
		}
	}
	if ($attacker->account !== $_SESSION['account']){
		header('HTTP/1.1 500 You do not control that territory!');
		exit();
	}
	
	if ($defender->units === 0){
		// cannot use artillery on undiscovered territory
		header('HTTP/1.1 500 There\'s nobody to shoot at!');
		exit();
	}
	if ($defender->account === $_SESSION['account']){
		// cannot use artillery on allied territory
		header('HTTP/1.1 500 You cannot fire artillery at allied territory!');
		exit();
	} else {
		$_SESSION['missilesLaunched']++;
		$_SESSION['production'] -= $cost;
		$o->production = $_SESSION['production'];
		// report & animate launch
		$msg = '';
		$data = 'missile|' . $attacker->tile . '|' . $defender->tile . '|' . $_SESSION['account'];
		$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, ?);');
		$stmt->bind_param('sis', $msg, $_SESSION['gameId'], $data);
		$stmt->execute();
	}
	
	echo json_encode($o);
?>