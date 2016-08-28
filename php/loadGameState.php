<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	require('initializeGame.php');
	
	require('pingLobby.php');
	$_SESSION['startGame'] = 1; // determines if exitGame is a loss or not
	
	// get game tiles
	$query = "select account, flag, nation, tile, tileName, player, units, food, culture, defense from `fwTiles` where game=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($dAccount, $dFlag, $dNation, $dTile, $dTileName, $dPlayer, $dUnits, $dFood, $dCulture, $dDefense);
	
	$tiles = [];
	$count = 0;
	while($stmt->fetch()){
		$x = new stdClass();
		$x->account = $dAccount;
		$x->flag = $dFlag;
		$x->nation = $dNation;
		$x->tile = $dTile;
		$x->tileName = $dTileName;
		$x->player = $dPlayer;
		$x->units = $dUnits;
		$x->food = $dFood;
		$x->culture = $dCulture;
		$x->defense = $dDefense;
		$tiles[$count++] = $x;
	}
	$x = new stdClass();
	$_SESSION['capitalTiles'] = [];
	// map capital tiles give defense bonus
	/*
	$query = 'select startTile from fwPlayers where game=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($startTile);
	while($stmt->fetch()){
		array_push($_SESSION['capitalTiles'], $startTile);
	}*/
	// set my capital, all capital tiles, and all players data IN PROGRESS
	$query = "select player, nation, flag, account, startTile, government from fwPlayers where game=?;";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($player, $nation, $flag, $account, $startTile, $government);
	$x->players = [];
	$count = 0;
	while($stmt->fetch()){
		$x->players[$count] = new stdClass();
		$x->players[$count]->player = $player;
		$x->players[$count]->nation = $nation;
		$x->players[$count]->flag = $flag;
		$x->players[$count]->account = $account;
		$x->players[$count]->government = $government;
		if ($account === $_SESSION['account']){
			$_SESSION['capital'] = $startTile;
		}
		array_push($_SESSION['capitalTiles'], $startTile);
		$count++;
	}
	
	$x->player = $_SESSION['player'];
	$x->flag = $_SESSION['flag'];
	$x->nation = $_SESSION['nation'];
	$x->foodMax = $_SESSION['foodMax'];
	$x->food = $_SESSION['food'];
	$x->production = $_SESSION['production'];
	$x->turnProduction = $_SESSION['turnProduction'];
	$x->culture = $_SESSION['culture'];
	$x->cultureMax = $_SESSION['cultureMax'];
	
	$x->manpower = $_SESSION['manpower'];
	$x->turnBonus = $_SESSION['turnBonus'];
	$x->foodBonus = $_SESSION['foodBonus'];
	$x->cultureBonus = $_SESSION['cultureBonus'];
	$x->oBonus = $_SESSION['oBonus'];
	$x->dBonus = $_SESSION['dBonus'];
	// turn
	$x->turnProduction = $_SESSION['turnProduction'];
	$x->account = $_SESSION['account'];
	$x->oBonus = $_SESSION['oBonus'];
	$x->dBonus = $_SESSION['dBonus'];
	$x->cultureBonus = $_SESSION['cultureBonus'];
	// tech
	$x->tech = $_SESSION['tech'];
	$x->capital = $_SESSION['capital'];
	
	$query = 'select sum(food), sum(culture) from `fwTiles` where account=? and game=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('si', $_SESSION['account'], $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($food, $culture);
	
	while($stmt->fetch()){
		$x->sumFood = $food + round($food * ($_SESSION['foodBonus'] / 100)) + $_SESSION['foodReward'];
		$x->sumCulture = $culture + round($culture * ($_SESSION['cultureBonus'] / 100)) + $_SESSION['cultureReward'];
	}
	$x->tiles = $tiles;
	$x->capitalTiles = $_SESSION['capitalTiles'];
	$x->government = $_SESSION['government'];
	$x->buildCost = $_SESSION['buildCost'];
	
	$_SESSION['gameStartTime'] = microtime(true);
	if ($_SESSION['gameDuration'] === -1){
		// actual game start time
		$_SESSION['gameDuration'] = microtime(true);
	}
	echo json_encode($x);
?>