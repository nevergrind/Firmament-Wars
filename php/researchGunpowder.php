<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	if ($_SESSION['production'] < 125){
		header('HTTP/1.1 500 Not enough energy!');
		exit();
	}
	$x = new stdClass();
	if ($_SESSION['tech']->gunpowder === 0){
		$_SESSION['production'] -= 125;
		$x->production = $_SESSION['production'];
		$_SESSION['tech']->gunpowder = 1;
	} else {
		header('HTTP/1.1 500 This skill has already been upgraded!');
		exit();
	}
	echo json_encode($x);
?>