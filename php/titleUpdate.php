<?php
	header('Content-Type: application/json');
	// connect1.php
	require('connect1.php');
	// chat messages
	$x = new stdClass();
	$x->chat = [];
	$stmt = $link->prepare('select row, message from fwchat where row > ? and event="title"');
	$stmt->bind_param('i', $_SESSION['chatId']);
	$stmt->execute();
	$stmt->bind_result($row, $message);
	$i = 0;
	while($stmt->fetch()){
		$x->chat[$i++] = $message;
		$_SESSION['chatId'] = $row;
	}
	echo json_encode($x);
?>