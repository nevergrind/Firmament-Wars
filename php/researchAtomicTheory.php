<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	if ($_SESSION['production'] < 500){
		header('HTTP/1.1 500 Not enough energy!');
		exit();
	}
	$x = new stdClass();
	if ($_SESSION['tech']->atomicTheory === 0){
		$_SESSION['production'] -= 500;
		$x->production = $_SESSION['production'];
		$_SESSION['tech']->atomicTheory = 1;
	} else {
		header('HTTP/1.1 500 This skill has already been upgraded!');
		exit();
	}
	echo json_encode($x);
?>