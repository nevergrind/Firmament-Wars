<?php
	require_once('connect1.php');
	require('prepareChat.php');
	
	$stmt = $link->prepare('insert into fwchat (`message`, `event`) values (?, "#title");');
	$stmt->bind_param('s', $message);
	$stmt->execute();
?>