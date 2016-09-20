<?php
// the first player to load the game
$query = "select startGame from fwplayers where game=? limit 1";
$stmt = $link->prepare($query);
$stmt->bind_param('i', $_SESSION['gameId']);
$stmt->bind_result($dCount);
$stmt->execute();
while($stmt->fetch()){
	$gameStartStatus = $dCount;
}
// must be host
if ($gameStartStatus === 1){
	// resource functions
	function getFood(){
		$x = 4;
		$roll = mt_rand(1, 20);
		if ($roll >= 17){
			$x = 6;
		} else if ($roll >= 11){
			$x = 5;
		}
		return $x;
	}
	function getCulture(){
		$x = 2;
		$roll = mt_rand(1, 20);
		if ($roll >= 17){
			$x = mt_rand(5, 7);
		} else if ($roll >= 11){
			$x = mt_rand(3, 4);
		}
		return $x;
	}
	
	// update startGame to 2 - only one player should init the game: whichever countdown loads first
	$query = "update fwplayers set startGame=2 where game=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	
	// load player data
	$query = "select player, account, nation, flag, government from `fwplayers` where game=? and timestamp > date_sub(now(), interval {$_SESSION['lag']} second)";
	$stmt = $link->prepare($query);
	$stmt->bind_param('i', $_SESSION['gameId']);
	$stmt->execute();
	$stmt->bind_result($dPlayer, $dAccount, $dNation, $dFlag, $dGovernment);
	
	$players = array();
	while($stmt->fetch()){
		$x = new stdClass();
		$x->player = $dPlayer;
		$x->account = $dAccount;
		$x->nation = $dNation;
		$x->flag = $dFlag;
		$x->government = $dGovernment;
		array_push($players, $x);
	}
	// determine map and 8 possible start points
	
	$mapData = array(
		(object) array(
			'name' => 'Earth Alpha',
			'key' => 'EarthAlpha',
			'tiles' => 83,
			'maxPlayers' => 8,
			'startTiles' => [40, 44, 58, 51, 5, 52, 63, 62],
			'sizeX' => 2000,
			'sizeY' => 1200,
			'tileNames' => array(
				'Chicago', 'Pakistan', 'Namibia', 'Congo', 'Greece', 'Oman', 'Punta Arenas', 'Buenos Aires', 'Turkey', 'Sydney', 'Perth', 'Gibson Desert', 'Queensland', 'Germany', 'Persia','Kenya', 'France', 'Italy', 'Mali', 'Sri Lanka', 'India', 'Ontario', 'Estonia', 'Panama','Bolivia', 'Brazil', 'Rio de Janeiro', 'Guyana', 'Kyrgyzstan', 'Zimbabwe', 'South Africa', 'Sudan', 'Quebec', 'Alberta', 'Nunavut', 'British Colombia', 'Shanghai', 'Tibet','Beijing', 'Colombia', 'Cuba', 'Poland', 'Ethiopia', 'Algeria', 'Peru', 'Egypt','Scandinavia', 'United Kingdom', 'Greenland', 'Yemen', 'Babylon', 'Iceland', 'Japan','Kazakhstan', 'Thailand', 'Libya', 'Morocco', 'Ukraine', 'Madagascar', 'Mexico','Mongolia', 'Nigeria', 'Svalbard', 'New Zealand', 'Philippines', 'Indonesia', 'Alaska','Papua New Guinea', 'Spain', 'Saudi Arabia', 'Norilsk', 'Tomsk', 'St. Petersburg','Moscow', 'Ural', 'Yakutsk', 'Kamchatka', 'Irkutsk', 'Syberia', 'California', 'New York','Florida', 'Texas'
			)
		),
		(object) array(
			'name' => 'Flat Earth',
			'key' => 'FlatEarth',
			'tiles' => 79,
			'maxPlayers' => 8,
			'startTiles' => [9, 10, 14, 48, 53, 19, 32, 41],
			'sizeX' => 1600,
			'sizeY' => 1600,
			'tileNames' => array(
				'', '', '', '', '', '', '', '', '', '', 
				'', '', '', '', '', '', '', '', '', '', 
				'', '', '', '', '', '', '', '', '', '', 
				'', '', '', '', '', '', '', '', '', '', 
				'', '', '', '', '', '', '', '', '', '', 
				'', '', '', '', '', '', '', '', '', ''
			)
		)
	);
	$map = $mapData[$_SESSION['mapIndex']]->name;
	$maxTiles = $mapData[$_SESSION['mapIndex']]->tiles;
	$tileName = $mapData[$_SESSION['mapIndex']]->tileNames;
	$start = $mapData[$_SESSION['mapIndex']]->startTiles;
	// set barbarians
	for ($i = 0; $i < $maxTiles; $i++){
		// 30% chance for barbs - needs 25 barbs (3 per player)
		$barbarianUnits = mt_rand(0, 9) > 6 ? 2 : 0;
		$food = 2;
		$culture = 0;
		if ($barbarianUnits === 2){
			$foo = mt_rand(0, 1);
			if ($foo === 0){
				$food = getFood();
			} else {
				$culture = getCulture();
			}
		}
		// TODO: optimize into one query
		$query = "insert into fwtiles (`game`, `tile`, `tileName`, `units`, `food`, `culture`) 
			VALUES (?, $i, ?, $barbarianUnits, $food, $culture)";
		$stmt = $link->prepare($query);
		$stmt->bind_param('is', $_SESSION['gameId'], $tileName[$i]);
		$stmt->execute();
	}
	
	// configure player data
	$len = count($players);
	for ($i=0; $i < $len; $i++){
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
		// tile government bonuses
		// set capital values
		$units = 12;
		$defense = 1;
		$culture = 8;
		$food = 5;
		if ($players[$i]->government === 'Despotism'){
			$units = 18;
			$defense = 2;
		} else if ($players[$i]->government === 'Monarchy'){
			$culture = 24;
		} else if ($players[$i]->government === 'Democracy'){
			$defense = 3;
		} else if ($players[$i]->government === 'Republic'){
			$food = 10;
		} else if ($players[$i]->government === 'Communism'){
		}
		// TODO: optimize into one query
		// set starting units
		$query = "update fwtiles set account=?, player=?, nation=?, flag=?, units=$units, food=$food, culture=$culture, defense=$defense where tile=$startTile and game=?";
		$stmt = $link->prepare($query);
		$stmt->bind_param('sissi', $players[$i]->account, $players[$i]->player, $players[$i]->nation, $players[$i]->flag, $_SESSION['gameId']);
		$stmt->execute();
	}
}
?>