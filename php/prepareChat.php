<?php
	require('chatFlag.php');
	$msg = strip_tags($_POST['message']);
	// meme arrows?
	if (!$msg){
		exit();
	}
	if (strpos($msg, '>') === 0){
		$message = '<span class="chat-arrow">'. $flag . $_SESSION['account'] . ': '. $msg . '</span>';
	} else if (strpos($msg, '`') === 0){
		$msg = substr($msg, 1);
		$message = '<span class="chat-hidden">'. $flag . $_SESSION['account'] . ': '. $msg . '</span>';
	} else if (strpos($msg, '!') === 0){
		$msg = substr($msg, 1);
		$message = '<span class="chat-alert">'. $flag . $_SESSION['account'] . ': '. $msg . '</span>';
	} else {
		$message = $flag . $_SESSION['account'] . ': '. $msg;
	}
?>