<?php
	// loss
		if ($_SESSION['resourceTick'] > 9){
		$query = "insert into fwNations (`account`, `losses`, `games`) VALUES (?, 1, 1) on duplicate key update losses=losses+1, games=games+1";
		$stmt = $link->prepare($query);
		$stmt->bind_param('s', $_SESSION['account']);
		$stmt->execute();
	}
	
	$query = 'delete from fwPlayers where account=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('s', $_SESSION['account']);
	$stmt->execute();
?>