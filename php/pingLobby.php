<?php

	// insert / replace into fwplayers
	$query = "insert into fwPlayers (`game`, `account`, `nation`, `flag`, `player`) 
		values (?, ?, ?, ?, ?) 
		on duplicate key update timestamp=now()";
	$stmt = $link->prepare($query);
	$stmt->bind_param('isssi', $_SESSION['gameId'], $_SESSION['account'], $_SESSION['nation'], $_SESSION['flag'], $_SESSION['player']);
	$stmt->execute();
?>