<?php
	header('Content-Type: application/json');
	require_once('connect1.php');
	$x = new stdClass();
	$x->gameDone = 0;
	
	$stmt = $link->prepare('select row from fwtiles where game=? and player=?');
	$stmt->bind_param('ii', $_SESSION['gameId'], $_SESSION['player']);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($row);
	$count = $stmt->num_rows;
	if (!$count){
		$x->gameDone = 1;
	}
	// if I have no tiles remaining... I died
	if (isset($_SESSION['gameId']) && $x->gameDone){
			$x->lose = 1;
			require('loseGame.php');
		
			$x->gameName = $_SESSION['gameName'];
			$x->map = $_SESSION['map'];
			$x->duration = $_SESSION['resourceTick']*5;
			unset($_SESSION['gameId']);
	}
	
	echo json_encode($x);
?>