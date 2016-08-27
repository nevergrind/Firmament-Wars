<?php
require_once('connect1.php');

// must be host
if ($_SESSION['player'] === 1){
	// must have 2-8 players
	$query = "select player from `fwplayers` where game=? and timestamp > date_sub(now(), interval {$_SESSION['lag']} second)";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($dPlayer);
	
	if ($stmt->num_rows < 2 || $stmt->num_rows > 8){
		header('HTTP/1.1 500 You failed to join the game.');
		exit;
	}
	// must timestamp start of game
	$query = "update fwPlayers set startGame=1 where game=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
}
?>