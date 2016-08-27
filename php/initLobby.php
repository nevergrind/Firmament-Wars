<?php
	if (!isset($x)){
		$x = new stdClass();
	}
	if (isset($_SESSION['gameName'])){
		$x->name = $_SESSION['gameName'];
		$x->max = $_SESSION['max'];
		$x->map = $_SESSION['map'];
		$x->player = $_SESSION['player'];
		$x->startGame = 0; // boolean to trigger game start
	}
	// localhost only
	if($_SERVER["SERVER_NAME"] === "localhost"){
		// is my gameId started?
		$query = 'SELECT startGame FROM `fwplayers` where game=? and account=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('is', $_SESSION['gameId'], $_SESSION['account']);
		$stmt->bind_result($startGame);
		$stmt->execute();
		while($stmt->fetch()){
			$x->startGame = $startGame;
		}
	}
?>