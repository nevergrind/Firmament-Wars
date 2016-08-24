<?php
	if (!isset($x)){
		$x = new stdClass();
	}
	if (isset($_SESSION['gameName'])){
		$x->name = $_SESSION['gameName'];
		$x->max = $_SESSION['max'];
		$x->map = $_SESSION['map'];
		$x->player = $_SESSION['player'];
		$x->gameStarted = 0; // boolean to trigger game start
	}
	// localhost only
	if($_SERVER["SERVER_NAME"] === "localhost"){
		// is my gameId started?
		$query = 'SELECT count(row) rows FROM `fwgames` where row=? and start > 0';
		$stmt = $link->prepare($query);
		$stmt->bind_param('i', $_SESSION['gameId']);
		$stmt->bind_result($rows);
		$stmt->execute();
		while($stmt->fetch()){
			$count = $rows;
		}
		$x->gameStarted = $count; // boolean to trigger game start
	}
?>