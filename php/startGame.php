<?php
require_once('connect1.php');

// must be host
if ($_SESSION['player'] === 1){
	// must have 2-8 players
	$query = "select player, account, nation, flag from `fwplayers` where game=? and timestamp > date_sub(now(), interval {$_SESSION['lag']} second)";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($dPlayer, $dAccount, $dNation, $dFlag);
	$count = $stmt->num_rows;
	
	$players = array();
	while($stmt->fetch()){
		$x = new stdClass();
		$x->player = $dPlayer;
		$x->account = $dAccount;
		$x->nation = $dNation;
		$x->flag = $dFlag;
		array_push($players, $x);
	}
	
	if ($count < 2 || $count > 8){
		header('HTTP/1.1 500 You failed to join the game.');
		exit;
	}
	// must timestamp start of game
	$query = "update fwGames set start=now() where row=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	// resource functions
	function getFood(){
		$x = 4;
		$roll = mt_rand(1, 20);
		if ($roll >= 17){
			$x = 6;
		} else if ($roll >=11){
			$x = 5;
		}
		return $x;
	}
	function getProduction(){
		$x = 3;
		$roll = mt_rand(1, 20);
		if ($roll >= 17){
			$x = 5;
		} else if ($roll >=11){
			$x = 4;
		}
		return $x;
	}
	function getCulture(){
		$x = 2;
		$roll = mt_rand(1, 20);
		if ($roll >= 17){
			$x = mt_rand(5, 7);
		} else if ($roll >=11){
			$x = mt_rand(3, 4);
		}
		return $x;
	}
	// determine map and 8 possible start points
	$map = $_SESSION['map'];
	$maxTiles = 1;
	if ($map === "Earth Alpha"){
		$maxTiles = 83;
		$tileName = array('Chicago','Pakistan','Namibia','Congo','Greece','Oman','Punta Arenas','Buenos Aires','Turkey','Sydney','Perth','Gibson Desert','Queensland','Germany','Persia','Kenya','France','Italy','Mali','Sri Lanka','India','Ontario','Estonia','Panama','Bolivia','Brazil','Rio de Janeiro','Guyana','Kyrgyzstan','Zimbabwe','South Africa','Sudan','Quebec','Alberta','Nunavut','British Colombia','Shanghai','Tibet','Beijing','Colombia','Cuba','Poland','Ethiopia','Algeria','Peru','Egypt','Scandinavia','United Kingdom','Greenland','Yemen','Babylon','Iceland','Japan','Kazakhstan','Thailand','Libya','Morocco','Ukraine','Madagascar','Mexico','Mongolia','Nigeria','Svalbard','New Zealand','Philippines','Indonesia','Alaska','Papua New Guinea','Spain','Saudi Arabia','Norilsk','Tomsk','St. Petersburg','Moscow','Ural','Yakutsk','Kamchatka','Irkutsk','Syberia','California','New York','Florida','Texas');
		// set barbarians
		for ($i = 0; $i < $maxTiles; $i++){
			$barbarianUnits = mt_rand(0, 9) > 6 ? 2 : 0;
			$food = 2;
			// $production = 2;
			$culture = 0;
			if ($barbarianUnits === 2){
				$foo = mt_rand(0, 1);
				if ($foo === 0){
					$food = getFood();
				} else {
					$culture = getCulture();
				}
			}
			$query = "insert into fwTiles (`game`, `tile`, `tileName`, `units`, `food`, `culture`) 
				VALUES (?, $i, ?, $barbarianUnits, $food, $culture)";
			$stmt = $link->prepare($query);
			$stmt->bind_param('is', $_SESSION['gameId'], $tileName[$i]);
			$stmt->execute();
		}
		
		// configure player data
		$start = [79, 24, 29, 47, 69, 52, 9, 46];
		$len = count($players);
		for ($i=0; $i<$len; $i++){
			$startLen = count($start);
			$startIndex = mt_rand(0, $startLen-1);
			$startTile = $start[$startIndex];
			$players[$i]->start = $startTile;
			array_splice($start, $startIndex, 1);
			// set start tiles
			$query = "update fwplayers set startTile=$startTile where account=?";
			$stmt = $link->prepare($query);
			$stmt->bind_param('s', $players[$i]->account);
			$stmt->execute();
			
			// set starting units
			$query = "update fwTiles set account=?, player=?, nation=?, flag=?, units=12, food=5, culture=8, defense=1 where tile=$startTile and game=?";
			$stmt = $link->prepare($query);
			$stmt->bind_param('sissi', $players[$i]->account, $players[$i]->player, $players[$i]->nation, $players[$i]->flag, $_SESSION['gameId']);
			$stmt->execute();
		}
	} else {
		// another map
	}
}
?>