<?php
	require('chatFlag.php');
	$msg = strip_tags($_POST['message']);
	// meme arrows?
	if (strpos($msg, '>') === 0){
		$message = '<span class="chat-arrow">'. $flag . $_SESSION['account'] . ': '. $msg . '</span>';
	} else {
		$message = $flag . $_SESSION['account'] . ': '. $msg;
	}
?>