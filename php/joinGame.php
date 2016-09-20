<?php
	header('Content-Type: application/json');
	require('connect1.php');
	if (!isset($_SESSION['email'])){
		exit;
	}
	// remove players that left
	mysqli_query($link, 'delete from fwplayers where timestamp < date_sub(now(), interval 20 second)');
	
	require('checkAlreadyPlaying.php');
	
	$o = new stdClass();
	
	$o->gameId = $_POST['gameId']*1; 
	$name = $_POST['name'];
	$pw = $_POST['pw'];
	
	if (strlen($name) > 0){
		// PRIVATE game, get row id via name
		$stmt = $link->prepare('select row from fwgames where name=? limit 1');
		$stmt->bind_param('s', $name);
		$stmt->execute();
		$stmt->bind_result($gameId);
		$stmt->store_result();
		// check if the game exists at all
		if (!$stmt->num_rows){
			header('HTTP/1.1 500 Game name does not exist.');
			exit;
		}
		// get gameId
		while($stmt->fetch()){
			$o->gameId = $gameId;
		}
		// check password
		$o->pw = '';
		$stmt = $link->prepare('select password from fwgames where row=? limit 1');
		$stmt->bind_param('i', $o->gameId);
		$stmt->execute();
		$stmt->bind_result($password);
		while($stmt->fetch()){
			$o->pw = $password;
		}
		if (strlen($pw) > 0 || strlen($o->pw) > 0){
			if ($pw != $o->pw){
				header('HTTP/1.1 500 The password did not match.');
				exit;
			}
		}
	}
	// is it possible to join this game?
	$query = "select g.name, count(p.game) activePlayers, g.max max, g.map map 
				from fwgames g 
				join fwplayers p 
				on g.row=p.game and p.timestamp > date_sub(now(), interval {$_SESSION['lag']} second)
				where g.row=? and p.startGame=0
				group by p.game";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $o->gameId);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($dgameName, $dactivePlayers, $dmax, $dmap);
	while($stmt->fetch()){
		$gameName = $dgameName;
		$activePlayers = $dactivePlayers;
		$max = $dmax;
		$map = $dmap;
	}
	
	if (!$stmt->num_rows){
		header('HTTP/1.1 500 All players have left the game.');
		exit;
	}
	if ($activePlayers == 0){
		header('HTTP/1.1 500 All players have left the game.');
		exit;
	}
	if ($activePlayers >= $max){
		header('HTTP/1.1 500 The game is full');
		exit;
	}
	// check for disconnected players upon joining
	require('checkDisconnectsByAccount.php');
	
	// set session values
	$_SESSION['gameId'] = $o->gameId;
	$_SESSION['max'] = $max;
	$_SESSION['gameName'] = $gameName;
	$_SESSION['startGame'] = 0;
	$_SESSION['gameType'] = 'FFA';
	$_SESSION['map'] = $map;
	$_SESSION['food'] = 0;
	$_SESSION['foodIncrement'] = 25;
	$_SESSION['foodMax'] = 25;
	$_SESSION['foodMilestone'] = 0;
	$_SESSION['production'] = 30;
	$_SESSION['turnProduction'] = 30;
	$_SESSION['culture'] = 0;
	$_SESSION['cultureMax'] = 400;
	$_SESSION['cultureIncrement'] = 250;
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
	// government perks
	$_SESSION['attackCost'] = 7;
	$_SESSION['splitAttackCost'] = 0;
	$_SESSION['buildCost'] = 1;
	$_SESSION['RecruitCost'] = 40;
	$_SESSION['maxDeployment'] = 12;
	$_SESSION['deployCost'] = 20;
	$_SESSION['researchCost'] = 1;
	$_SESSION['weaponCost'] = 1;
	
	require('initChatId.php');
	// determine map data
	require('setMapIndex.php');
	
	// determine player number
	$query = 'select player, startTile from fwplayers where game=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $o->gameId);
	$stmt->execute();
	$stmt->bind_result($player, $startTile);
	$a = [];
	while($stmt->fetch()){
		$capital = $startTile;
		array_push($a, $player);
	}
	// set player session value
	unset($_SESSION['player']);
	unset($_SESSION['capital']);
	for ($i=1; $i <= $_SESSION['max']; $i++){
		if (!in_array($i, $a)){
			if (!isset($_SESSION['player'])){
				$_SESSION['player'] = $i;
				$_SESSION['playerMod'] = $_SESSION['player'] % 4;
				// claim player slot
				require('pingLobby.php');
			}
		}
	}
	
	// sanity check
	if ($_SESSION['player'] < 1 || $_SESSION['player'] > $_SESSION['max']){
		header('HTTP/1.1 500 Failed to join game: (player: ' . $_SESSION['player'] . ')');
		exit;
	}
	
	require('pingLobby.php');
	
	require('initLobby.php');
	
	$x->player = $_SESSION['player'];
	$x->mapData = $mapData[$_SESSION['mapIndex']];
	
	// update chat
	$msg = '<span class="chat-warning">'. $_SESSION['account'] . ' has joined the game.</span>';
	$stmt = $link->prepare('insert into fwchat (`message`, `gameId`) values (?, ?);');
	$stmt->bind_param('si', $msg, $o->gameId);
	$stmt->execute();
	echo json_encode($x);
?>