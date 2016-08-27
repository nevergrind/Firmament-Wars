<?php
require_once('connect1.php');
$query = "select startGame from fwPlayers where game=? limit 1";
$stmt = $link->prepare($query);
$stmt->bind_param('i', $_SESSION['gameId']);
$stmt->bind_result($dCount);
$stmt->execute();
while($stmt->fetch()){
	$gameStartStatus = $dCount;
}
if ($gameStartStatus < 2){
	$governments = [
		'Despotism',
		'Monarchy',
		'Democracy',
		'Fundamentalism',
		'Fascism',
		'Republic',
		'Communism'
	];
	if (!in_array($_POST['government'], $governments)){
		header('HTTP/1.1 500 Invalid government selection.');
	} else {
		$query = "update fwplayers set government=? where account=?";
		$stmt = $link->prepare($query);
		$stmt->bind_param('ss', $_POST['government'], $_SESSION['account']);
		$stmt->execute();
		$_SESSION['government'] = $_POST['government'];
		// set government bonuses
		if ($_SESSION['government'] === 'Despotism'){
			$_SESSION['production'] = 30;
		} else {
			$_SESSION['production'] = 10;
		}
	}
}
?>