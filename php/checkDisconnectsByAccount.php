<?php
	$query = "SELECT game, account FROM fwplayers where account=? and game!=? limit 1";
	$stmt = $link->prepare($query);
	$stmt->bind_param('si', $_SESSION['account'], $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($dGame, $dAccount);
	while($stmt->fetch()){
		$game = $dGame;
		$account = $dAccount;
	}
	
	if ($stmt->num_rows > 0){
		// notify game player has disconnected
		$msg = $account . ' has disconnected from the game.';
		$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, "chatsfx");');
		$stmt->bind_param('si', $msg, $game);
		$stmt->execute();
		// set all tiles and player to 0
		$query = 'update fwTiles set account="", player=0, nation="", flag="", units=0 where game=? and account=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('is', $game, $account);
		$stmt->execute();
		
		// delete from players
		$query = 'delete from fwPlayers where account=? and game=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('si', $account, $game);
		$stmt->execute();
		// add disconnect
		if ($_SESSION['resourceTick'] > 9){
			$query = "insert into fwNations (`account`, `disconnects`, `games`) VALUES (?, 1, 1) on duplicate key update disconnects=disconnects+1, games=games+1";
			$stmt = $link->prepare($query);
			$stmt->bind_param('s', $account);
			$stmt->execute();
		}
	}
?>