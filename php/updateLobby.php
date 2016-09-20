<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	// ping lobby
	require('pingLobby.php');
	
	// who is still in the lobby?
	$query = 'select account, nation, flag, player, government, startGame from fwplayers where game=? and timestamp > date_sub(now(), interval '. $_SESSION['lag'] .' second) order by player';
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($account, $nation, $flag, $player, $government, $startGame);
	
	$x = new stdClass();
	$x->hostFound = false;
	$x->totalPlayers = 0;
	$x->playerData = [];
	$x->startGame = 0;
	while($stmt->fetch()){
		$x->playerData[$x->totalPlayers] = new stdClass();
		$x->playerData[$x->totalPlayers]->account = $account;
		$x->playerData[$x->totalPlayers]->nation = $nation;
		$x->playerData[$x->totalPlayers]->flag = $flag;
		$x->playerData[$x->totalPlayers]->player = $player;
		$x->playerData[$x->totalPlayers]->government = $government;
		$x->totalPlayers++;
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
	$x->map = $_SESSION['map'];
	echo json_encode($x);
?>