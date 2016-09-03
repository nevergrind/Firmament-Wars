<?php
	require('connect1.php');
	if (!isset($_SESSION['email'])){
		exit;
	}
	require('prepareChat.php');
	$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, "chatsfx");');
	$stmt->bind_param('si', $message, $_SESSION['gameId']);
	$stmt->execute();
?>