<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	$cost = 1250 * $_SESSION['researchCost'];
	if ($_SESSION['production'] < $cost){
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
	$_SESSION['production'] -= $cost;
	$x->production = $_SESSION['production'];
	
	require('rewardCulture.php');
	$x->cultureMsg = rewardCulture();
	
	echo json_encode($x);
?>