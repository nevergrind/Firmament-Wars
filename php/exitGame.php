<?php
	require('connect1.php');
	
	if (isset($_SESSION['gameId'])){
		if ($_SESSION['startGame']){
			// surrender
			$msg = $_SESSION['account'] . ' has surrendered.';
			$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, "chatsfx");');
			$stmt->bind_param('si', $msg, $_SESSION['gameId']);
			$stmt->execute();
			// set all tiles and player to 0
			$query = 'update fwtiles set account="", player=0, nation="", flag="", units=0 where game=? and account=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('is', $_SESSION['gameId'], $_SESSION['account']);
			$stmt->execute();
			// add loss
			require('loseGame.php');
		} else {
			// left lobby
			// set all tiles and player to 0
			$query = 'update fwtiles set account="", player=0, nation="", flag="", units=0 where game=? and account=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('is', $_SESSION['gameId'], $_SESSION['account']);
			$stmt->execute();
			// exit lobby
			$query = 'delete from fwplayers where account=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('s', $_SESSION['account']);
			$stmt->execute();
			if ($_POST['view'] === 'lobby'){
				$msg = '<span class="chat-warning">'. $_SESSION['account'] . ' has left the game.</span>';
				$stmt = $link->prepare('insert into fwchat (`message`, `gameId`) values (?, ?);');
				$stmt->bind_param('si', $msg, $_SESSION['gameId']);
				$stmt->execute();
			}
		}
		require('resetGame.php');
	}
?>