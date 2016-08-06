<?php
	require_once('connect1.php');
	$flag = $_SESSION['flag'] === 'Default.jpg' ? 
		'<img src="images/flags/Player'.$_SESSION['player'].'.jpg" class="player'.$_SESSION['player'].' p'.$_SESSION['player'].'b inlineFlag">' :
		'<img src="images/flags/'.$_SESSION['flag'].'" class="player'.$_SESSION['player'].' p'.$_SESSION['player'].'b inlineFlag">';
	$msg = strip_tags($_POST['message']);
	// meme arrows?
	if (strpos($msg, '>') === 0){
		$message = '<span class="chat-arrow">'. $flag . $_SESSION['account'] . ': '. $msg . '</span>';
	} else {
		$message = $flag . $_SESSION['account'] . ': '. $msg;
	}
	
	$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, "chatsfx");');
	$stmt->bind_param('si', $message, $_SESSION['gameId']);
	$stmt->execute();
?>