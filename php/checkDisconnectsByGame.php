<?php
	$query = "SELECT account FROM fwplayers where timestamp < date_sub(now(), interval {$_SESSION['lag']} second) and game=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($account);
	
	$arr = array();
	$count = 0;
	while($stmt->fetch()){
		$arr[$count++] = $account;
	}
	foreach($arr as $a){
		// notify game player has disconnected
		$msg = $a . ' has disconnected from the game.';
		$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, "chatsfx");');
		$stmt->bind_param('si', $msg, $_SESSION['gameId']);
		$stmt->execute();
		// set all tiles and player to 0
		$query = 'update fwTiles set account="", player=0, nation="", flag="", units=0 where game=? and account=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('is', $_SESSION['gameId'], $a);
		$stmt->execute();
		// delete from players
		$query = 'delete from fwPlayers where account=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('s', $a);
		$stmt->execute();
		// add disconnect
		
		if ($_SESSION['resourceTick'] > 9){
			$query = "insert into fwNations (`account`, `disconnects`, `games`) VALUES (?, 1, 1) on duplicate key update disconnects=disconnects+1, games=games+1";
			$stmt = $link->prepare($query);
			$stmt->bind_param('s', $a);
			$stmt->execute();
		}
	}
?>