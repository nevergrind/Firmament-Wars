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
	$query = 'select account, nation, flag, player, government from fwPlayers where game=? and timestamp > date_sub(now(), interval '.$_SESSION['lag'].' second) order by player';
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($account, $nation, $flag, $player, $government);
	
	$x = new stdClass();
	$x->hostFound = false;
	$totalPlayers = 0;
	$x->playerData = [];
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
		}
		/*
		$x->lobbyData .= 
		'<div class="row lobbyRow">
			<div class="col-xs-3">';
		if ($flag != "Default.jpg"){
			$x->lobbyData .= '<img src="images/flags/'.$flag.'" class="player'.$player.' p'.$player.'b w100 block center">';
		} else {
			$x->lobbyData .= '<img src="images/flags/Player'.$player.'.jpg" class="player'.$player.' p'.$player.'b w100 block center">';
		}
		$x->lobbyData .= 
			'</div>
			<div class="col-xs-9 text-center lobbyNationInfo">
				<div class="text-warning">'.$account.'</div>
				<div class="lobbyNationName">'.$nation.'</div>
			</div>
		</div>';
		*/
	}
	// is my gameId started?
	$query = 'SELECT count(row) rows FROM `fwgames` where row=? and start > 0';
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->bind_result($rows);
	$stmt->execute();
	while($stmt->fetch()){
		$count = $rows;
	}
	
	$x->player = $_SESSION['player'];
	$x->gameStarted = $count; // boolean to trigger game start
	$x->totalPlayers = $totalPlayers;
	$x->delay = microtime(true) - $start;
	echo json_encode($x);
?>