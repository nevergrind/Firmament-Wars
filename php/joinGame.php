<?php
	header('Content-Type: application/json');
	require_once('connect1.php');
	// remove players that left
	mysqli_query($link, 'delete from fwplayers where timestamp < date_sub(now(), interval 20 second)');
	
	$gameId = $_POST['gameId']*1; 
	$pw = $_POST['pw'];
	
	$o = new stdClass();
	$o->pw = '';
	$stmt = $link->prepare('select password from fwgames where row=? limit 1');
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($password);
	while($stmt->fetch()){
		$o->pw = $password;
	}
	if (strlen($pw) > 0 || strlen($o->pw) > 0){
		if ($pw != $o->pw){
			header('HTTP/1.1 500 The password did not match.' . $pw . ' !== ' . $o->pw);
			exit;
		}
	}
	// is it possible to join this game?
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
	$_SESSION['missilesLaunched'] = 0;
	$_SESSION['nukesLaunched'] = 0;
	$_SESSION['tech'] = new stdClass();
	$_SESSION['tech']->engineering = 0;
	$_SESSION['tech']->gunpowder = 0;
	$_SESSION['tech']->rocketry = 0;
	$_SESSION['tech']->atomicTheory = 0;
	$_SESSION['government'] = 'Despotism';
	
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
	
	require('pingLobby.php');
	
	require('initLobby.php');
	
	$x->player = $_SESSION['player'];
	
	// update chat
	$msg = '<span class="chat-warning">'. $_SESSION['account'] . ' has joined the game.</span>';
	$stmt = $link->prepare('insert into fwchat (`message`, `gameId`) values (?, ?);');
	$stmt->bind_param('si', $msg, $_SESSION['gameId']);
	$stmt->execute();
	echo json_encode($x);
?>