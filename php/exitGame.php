<?php
	require_once('connect1.php');
	
	if (isset($_SESSION['gameId'])){
		if ($_SESSION['gameStarted']){
			// surrender
			$msg = $_SESSION['account'] . ' has surrendered.';
			$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, "chatsfx");');
			$stmt->bind_param('si', $msg, $_SESSION['gameId']);
			$stmt->execute();
			// set all tiles and player to 0
			$query = 'update fwTiles set account="", player=0, nation="", flag="", units=0 where game=? and account=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('is', $_SESSION['gameId'], $_SESSION['account']);
			$stmt->execute();
			// add loss
			require('loseGame.php');
		} else {
			// set all tiles and player to 0
			$query = 'update fwTiles set account="", player=0, nation="", flag="", units=0 where game=? and account=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('is', $_SESSION['gameId'], $_SESSION['account']);
			$stmt->execute();
			// exit lobby
			$query = 'delete from fwPlayers where account=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('s', $_SESSION['account']);
			$stmt->execute();
		}
		require('unsetSession.php');
	} else {
		header('HTTP/1.1 500 Game session data not found.');
	}
?>