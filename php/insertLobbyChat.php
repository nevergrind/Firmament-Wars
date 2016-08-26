<?php
	require_once('connect1.php');
	
	$msg = strip_tags($_POST['message']);
	// meme arrows?
	if (strpos($msg, '>') === 0){
		$message = '<span class="chat-arrow">'. $_SESSION['account'] . ': '. $msg . '</span>';
	} else {
		$message = $_SESSION['account'] . ': '. $msg;
	}
	
	$stmt = $link->prepare('insert into fwchat (`message`, `gameId`) values (?, ?);');
	$stmt->bind_param('si', $message, $_SESSION['gameId']);
	$stmt->execute();
?>