<?php
	header('Content-Type: application/json');
	$start = microtime(true);
	// connect1.php
	require('connect1.php');
	
	// ping lobby
	$query = 'insert into fwPlayers (`game`, `account`, `nation`, `flag`, `player`) 
		values (?, ?, ?, ?, ?) 
		on duplicate key update timestamp=now()';
	$stmt = $link->prepare($query);
	$stmt->bind_param('isssi', $_SESSION['gameId'], $_SESSION['account'], $_SESSION['nation'], $_SESSION['flag'], $_SESSION['player']);
	$stmt->execute();
	
	// who is still in the lobby?
	$query = 'select account, nation, flag, player, government, startGame from fwPlayers where game=? and timestamp > date_sub(now(), interval '.$_SESSION['lag'].' second) order by player';
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($account, $nation, $flag, $player, $government, $startGame);
	
	$x = new stdClass();
	$x->hostFound = false;
	$totalPlayers = 0;
	$x->playerData = [];
	$x->startGame = 0;
	while($stmt->fetch()){
		$x->playerData[$totalPlayers] = new stdClass();
		$x->playerData[$totalPlayers]->account = $account;
		$x->playerData[$totalPlayers]->nation = $nation;
		$x->playerData[$totalPlayers]->flag = $flag;
		$x->playerData[$totalPlayers]->player = $player;
		$x->playerData[$totalPlayers]->government = $government;
		$totalPlayers++;
		if ($player === 1){
			$x->hostFound = true;
			$x->startGame = $startGame;
		}
	}
	// lobby chat messages
	$x->chat = [];
	$stmt = $link->prepare('select row, message from fwchat where row > ? and gameId=?');
	$stmt->bind_param('ii', $_SESSION['chatId'], $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($row, $message);
	$i = 0;
	while($stmt->fetch()){
		$x->chat[$i++] = $message;
		$_SESSION['chatId'] = $row;
	}
	// some final values to send
	$x->player = $_SESSION['player'];
	$x->gameStarted = $x->startGame; // boolean to trigger game start
	$x->totalPlayers = $totalPlayers;
	$x->delay = microtime(true) - $start;
	echo json_encode($x);
?>