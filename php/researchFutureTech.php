<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	if ($_SESSION['production'] < 1250){
		header('HTTP/1.1 500 Not enough energy!');
		exit();
	}
	if (!$_SESSION['tech']->gunpowder || 
		!$_SESSION['tech']->engineering ||
		!$_SESSION['tech']->rocketry ||
		!$_SESSION['tech']->atomicTheory){
		header('HTTP/1.1 500 You must research this technology first!');
		exit();
	}
	$x = new stdClass();
	$_SESSION['production'] -= 1250;
	$x->production = $_SESSION['production'];
	
	require('rewardCulture.php');
	$x->cultureMsg = rewardCulture();
	
	echo json_encode($x);
?>