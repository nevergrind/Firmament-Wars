<?php
	if (isset($_SESSION['player'])){
		// in a game
		$flag = $_SESSION['flag'] === 'Default.jpg' ? 
		'<img src="images/flags/Default.jpg" class="player'.$_SESSION['player'].' p'.$_SESSION['player'].'b inlineFlag">' :
		'<img src="images/flags/'. $_SESSION['flag']. '" class="player'. $_SESSION['player'] .' p'. $_SESSION['player'] . 'b inlineFlag">';
	} else {
		// not in a game
		$flag = $_SESSION['flag'] === 'Default.jpg' ? 
		'<img src="images/flags/Default.jpg" class="inlineFlag">' :
		'<img src="images/flags/'.$_SESSION['flag'].'" class="inlineFlag">';
	}
?>