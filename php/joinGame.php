<?php
	require_once('connect1.php');
	
	$gameId = $_POST['gameId']*1;
	
	$query = "select g.name, count(p.game) activePlayers, g.max max, g.map map 
				from fwGames g 
				join fwplayers p 
				on g.row=p.game and p.timestamp > date_sub(now(), interval {$_SESSION['lag']} second)
				where g.row=? 
				group by p.game";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $gameId);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($dgameName, $dactivePlayers, $dmax, $dmap);
	while($stmt->fetch()){
		$gameName = $dgameName;
		$activePlayers = $dactivePlayers;
		$max = $dmax;
		$map = $dmap;
	}
	
	$count = $stmt->num_rows;
	if (!$count){
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
	$_SESSION['gameId'] = $gameId;
	$_SESSION['max'] = $max;
	$_SESSION['gameName'] = $gameName;
	$_SESSION['gameStarted'] = 0;
	$_SESSION['gameType'] = 'FFA';
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
	
	// init chat
	$query = "select row from fwchat order by row desc limit 1";
	$stmt = $link->prepare($query);
	$stmt->execute();
	$stmt->bind_result($row);
	while($stmt->fetch()){
		$_SESSION['chatId'] = $row;
	}
	
	// determine player number
	$query = 'select player, startTile from fwPlayers where game=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $gameId);
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
				$query = 'insert into fwPlayers (`game`, `account`, `nation`, `flag`, `player`) 
					values (?, ?, ?, ?, ?) 
					on duplicate key update timestamp=now()';
				$stmt = $link->prepare($query);
				$stmt->bind_param('isssi', $_SESSION['gameId'], $_SESSION['account'], $_SESSION['nation'], $_SESSION['flag'], $_SESSION['player']);
				$stmt->execute();
			}
		}
	}
	
	// sanity check
	if ($_SESSION['player'] < 1 || $_SESSION['player'] > $_SESSION['max']){
		header('HTTP/1.1 500 Failed to join game: (player: ' . $_SESSION['player'] . ')');
		exit;
	}
	
	// get account flag
	$_SESSION['nation'] = "";
	$_SESSION['flag'] = "";

	$query = "select nation, flag from fwNations where account=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('s', $_SESSION['account']);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($dNation, $dFlag);
	$count = $stmt->num_rows;
	if ($count < 1){
		header('HTTP/1.1 500 Cannot access nation data.');
		exit;
	}
	while($stmt->fetch()){
		$_SESSION['nation'] = $dNation;
		$_SESSION['flag'] = $dFlag;
	}
	require('pingLobby.php');
	
	require('updateLobby.php');
?>