<?php

function checkDeadPlayer($defender){
	// must pass in nation and player values via an object
	global $link;
	// check if defender was eliminated
	$stmt = $link->prepare('select count(row) total from fwtiles where game=? and player=?');
	$stmt->bind_param('ii', $_SESSION['gameId'], $defender->player);
	$stmt->execute();
	$stmt->bind_result($total);
	while($stmt->fetch()){
		$count = $total;
	}
	if ($count === 0){
		$msg = $defender->nation . ' has been eliminated.';
		$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, "chatsfx")');
		$stmt->bind_param('si', $msg, $_SESSION['gameId']);
		$stmt->execute();
	}
}

?>