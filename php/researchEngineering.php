<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	if ($_SESSION['production'] < 150){
		header('HTTP/1.1 500 Not enough energy!');
		exit();
	}
	$x = new stdClass();
	if ($_SESSION['tech']->engineering === 0){
		$_SESSION['production'] -= 150;
		$x->production = $_SESSION['production'];
		$_SESSION['tech']->engineering = 1;
	} else {
		header('HTTP/1.1 500 This skill has already been upgraded!');
		exit();
	}
	echo json_encode($x);
?>