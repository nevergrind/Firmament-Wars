<?php
	$query = "SELECT game, account, startGame FROM fwplayers where account=? limit 1";
	$stmt = $link->prepare($query);
	$stmt->bind_param('s', $_SESSION['account']);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($dGame, $dAccount, $startGameDb);
	while($stmt->fetch()){
		$game = $dGame;
		$account = $dAccount;
		$startGame = $startGameDb;
	}
	
	if ($stmt->num_rows > 0){
		// notify game player has disconnected
		$msg = $account . ' has disconnected from the game.';
		$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, "chatsfx");');
		$stmt->bind_param('si', $msg, $game);
		$stmt->execute();
		// set all tiles and player to 0
		$query = 'update fwtiles set account="", player=0, nation="", flag="", units=0 where game=? and account=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('is', $game, $account);
		$stmt->execute();
		
		// delete from players
		$query = 'delete from fwplayers where account=? and game=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('si', $account, $game);
		$stmt->execute();
		// add disconnect
		if ($startGame >=2){
			$query = "insert into fwnations (`account`, `disconnects`, `games`) VALUES (?, 1, 1) on duplicate key update disconnects=disconnects+1, games=games+1";
			$stmt = $link->prepare($query);
			$stmt->bind_param('s', $account);
			$stmt->execute();
		}
	}
?>