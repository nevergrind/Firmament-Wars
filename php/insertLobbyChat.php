<?php
	require('connect1.php');
	require('prepareChat.php');
	
	$stmt = $link->prepare('insert into fwchat (`message`, `gameId`) values (?, ?);');
	$stmt->bind_param('si', $message, $_SESSION['gameId']);
	$stmt->execute();
?>