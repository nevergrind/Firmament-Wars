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
		// default values
		$_SESSION['production'] = 10;
		$_SESSION['turnProduction'] = 10;
		$_SESSION['attackCost'] = 7;
		$_SESSION['splitAttackCost'] = 3;
		$_SESSION['cultureBonus'] = 0;
		$_SESSION['dBonus'] = 0;
		$_SESSION['buildCost'] = 1;
		$_SESSION['cultureMax'] = 400;
		$_SESSION['cultureIncrement'] = 250;
		$_SESSION['foodIncrement'] = 25;
		$_SESSION['RecruitCost'] = 50;
		$_SESSION['foodMax'] = 25;
		$_SESSION['maxDeployment'] = 12;
		$_SESSION['oBonus'] = 0;
		$_SESSION['deployCost'] = 20;
		$_SESSION['foodBonus'] = 0;
		$_SESSION['culture'] = 0;
		$_SESSION['researchCost'] = 1;
		$_SESSION['weaponCost'] = 1;
		// global government bonuses
		if ($_SESSION['government'] === 'Despotism'){
			$_SESSION['production'] = 30;
			$_SESSION['splitAttackCost'] = 0;
		} else if ($_SESSION['government'] === 'Monarchy'){
			$_SESSION['cultureBonus'] = 50;
			$_SESSION['dBonus'] = 1;
			$_SESSION['buildCost'] = .5;
		} else if ($_SESSION['government'] === 'Democracy'){
			$_SESSION['turnProduction'] = 15;
			$_SESSION['cultureMax'] = 200;
			$_SESSION['cultureIncrement'] = 150;
			$_SESSION['maxDeployment'] = 254;
		} else if ($_SESSION['government'] === 'Fundamentalism'){
			$_SESSION['foodIncrement'] = 20;
			$_SESSION['RecruitCost'] = 25;
			$_SESSION['foodMax'] = 20;
		} else if ($_SESSION['government'] === 'Fascism'){
			$_SESSION['attackCost'] = 5;
			$_SESSION['oBonus'] = 1;
			$_SESSION['deployCost'] = 0;
		} else if ($_SESSION['government'] === 'Republic'){
			$_SESSION['foodBonus'] = 50;
		} else if ($_SESSION['government'] === 'Communism'){
			$_SESSION['culture'] = 150;
			$_SESSION['cultureMax'] = 150;
			$_SESSION['researchCost'] = .5;
			$_SESSION['weaponCost'] = .5;
		}
	}
}
?>