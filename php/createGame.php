<?php
	header('Content-Type: application/json');
	// create a new lobby 
	require_once('connect1.php');
	$name = $_POST['name'];
	$pw = $_POST['pw'];
	$players = $_POST['players'];
	$map = $_POST['map'];
	
	$len = strlen($name);
	if ($len < 4 || $len > 32){
		header('HTTP/1.1 500 Game name invalid');
		exit;
	}
	
	if ($players < 2 || $players > 8 || $players % 1 != 0){
		$players = 2;
	}
	// does this game name exist and is the game active?
	$query = "select count(p.game) players from fwGames g join fwPlayers p on g.row=p.game and g.name=? group by p.game having players > 0";
	
	$stmt = $link->prepare($query);
	$stmt->bind_param('s', $name);
	$stmt->execute();
	$stmt->store_result();
	$count = $stmt->num_rows;
	if ($count > 0){
		header('HTTP/1.1 500 Game name already exists.');
		exit;
	} else {
		// check disconnected players when creating a game
		require('checkDisconnectsByAccount.php');
		// delete games with the same name since we know they have 0 players
		$query = 'delete from fwgames where name=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('s', $name);
		$stmt->execute();
	}
	// map data
	$possibleMaps = ['Earth Alpha'];
	if (!in_array($map, $possibleMaps)){
		$map = 'Earth Alpha';
	}
	// create game
	$query = "insert into fwGames (`name`, `password`, `max`, `map`) values (?, ?, ?, ?)";
	$stmt = $link->prepare($query);
	$stmt->bind_param('ssis', $name, $pw, $players, $map);
	$stmt->execute();
	
	// set session values
	$_SESSION['gameId'] = $stmt->insert_id;
	$_SESSION['max'] = $players;
	$_SESSION['gameName'] = $name;
	$_SESSION['startGame'] = 0;
	$_SESSION['gameType'] = 'FFA';
	$_SESSION['player'] = 1;
	$_SESSION['playerMod'] = $_SESSION['player'] % 4;
	$_SESSION['map'] = $map;
	$_SESSION['food'] = 0;
	$_SESSION['foodMax'] = 25;
	$_SESSION['foodMilestone'] = 0;
	$_SESSION['production'] = 10;
	$_SESSION['turnProduction'] = 10;
	$_SESSION['culture'] = 0;
	$_SESSION['cultureMax'] = 400;
	$_SESSION['cultureMilestone'] = 0;
	$_SESSION['manpower'] = 0;
	$_SESSION['foodBonus'] = 0;
	$_SESSION['turnBonus'] = 0;
	$_SESSION['cultureBonus'] = 0;
	$_SESSION['oBonus'] = 0;
	$_SESSION['dBonus'] = 0;
	$_SESSION['resourceTick'] = 0;
	$_SESSION['foodReward'] = 0;
	$_SESSION['cultureReward'] = 0;
	$_SESSION['productionReward'] = 0;
	$_SESSION['gameStartTime'] = microtime(true);
	$_SESSION['gameDuration'] = -1;
	$_SESSION['missilesLaunched'] = 0;
	$_SESSION['nukesLaunched'] = 0;
	$_SESSION['tech'] = new stdClass();
	$_SESSION['tech']->engineering = 0;
	$_SESSION['tech']->gunpowder = 0;
	$_SESSION['tech']->rocketry = 0;
	$_SESSION['tech']->atomicTheory = 0;
	$_SESSION['government'] = 'Despotism';
	
	require('initChatId.php');
	
	require('initLobby.php');
	$x->player = $_SESSION['player'];
	echo json_encode($x);
?>