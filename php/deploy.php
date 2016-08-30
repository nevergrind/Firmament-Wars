<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	$deployedUnits = $_POST['deployedUnits'];
	if ($deployedUnits < 1){
		$deployedUnits = 1;
	}
	if ($deployedUnits > $_SESSION['maxDeployment']){
		$deployedUnits = $_SESSION['maxDeployment'];
	}
	
	if ($_SESSION['production'] < $_SESSION['deployCost']){
		header('HTTP/1.1 500 Not enough energy!');
		exit();
	}
	$x = new stdClass();
	
	$query = "select player, units from fwtiles where tile=? and game=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('ii', $_POST['target'], $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($dPlayer, $dUnits);
	while($stmt->fetch()){
		$player = $dPlayer;
		$units = $dUnits;
	}
	
	if ($_SESSION['player'] === $player){
		if ($units >= 254){
			header('HTTP/1.1 500 This territory cannot hold any more armies!');
			exit();
		}
		if ($_SESSION['manpower'] <= 0){
			header('HTTP/1.1 500 Not enough armies to deploy! ' . $_SESSION['manpower']);
			exit();
		}
		
		$deployedUnits = $_SESSION['manpower'] < $_SESSION['maxDeployment'] ? 
			$_SESSION['manpower'] : 
			$_SESSION['maxDeployment'];
		if ($units + $deployedUnits > 255){
			$deployedUnits = ($units - 255) * -1;
		}
		$units += $deployedUnits;
		$_SESSION['manpower'] = $_SESSION['manpower'] - $deployedUnits;
		
		// update attacker
		$query = 'update fwtiles set units=? where tile=? and game=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('iii', $units, $_POST['target'], $_SESSION['gameId']);
		$stmt->execute();
		
		$_SESSION['production'] -= $_SESSION['deployCost'];
		$x->production = $_SESSION['production'];
		$x->manpower = $_SESSION['manpower'];
	} else {
		header('HTTP/1.1 500 You cannot deploy to enemy territory!');
		exit();
	}
	echo json_encode($x);
?>