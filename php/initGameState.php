<?php
	header('Content-Type: application/json');
	require('connect1.php');
	
	require('pingLobby.php');
	$_SESSION['gameStarted'] = 1; // determines if exitGame is a loss or not
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
	// set capital
	$query = "select startTile from fwPlayers where game=? and account=?;";
	$stmt = $link->prepare($query);
	$stmt->bind_param('is', $_SESSION['gameId'], $_SESSION['account']);
	$stmt->execute();
	$stmt->bind_result($startTile);
	while($stmt->fetch()){
		$_SESSION['capital'] = $startTile;
	}
	
	$x = new stdClass();
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
	$x->ajax = 'initGameState';
	
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
	// map capital tiles give defense bonus
	$_SESSION['capitalTiles'] = [];
	$query = 'select startTile from fwPlayers where game=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($startTile);
	while($stmt->fetch()){
		array_push($_SESSION['capitalTiles'], $startTile);
	}
		
		
		/*$_SESSION['capitalTiles'] = [
			$x->tiles[79]->flag ? 79 : null, 
			$x->tiles[24]->flag ? 24 : null, 
			$x->tiles[29]->flag ? 29 : null, 
			$x->tiles[47]->flag ? 47 : null, 
			$x->tiles[69]->flag ? 69 : null, 
			$x->tiles[52]->flag ? 52 : null, 
			$x->tiles[9]->flag ? 9 : null, 
			$x->tiles[46]->flag ? 46 : null
		];*/
	$x->capitalTiles = $_SESSION['capitalTiles'];
	
	$_SESSION['gameStartTime'] = microtime(true);
	if ($_SESSION['gameDuration'] === -1){
		// actual game start time
		$_SESSION['gameDuration'] = microtime(true);
	}
	echo json_encode($x);
?>