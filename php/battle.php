<?php	
	function battle($x, $y, $defender){
		$oBonus = $_SESSION['oBonus'] * 500;
		$dBonus = $_SESSION['dBonus'] * 500;
		// $oTileUpgrades = [0, 1600, 3200, 4800];
		$dTileUpgrades = [0, 3000, 4500, 5500, 6200];
		// structure upgrades + capital
		$defVal = $dTileUpgrades[$defender->defense];
		// Math.ceil(Math.random() * (6 + bonus)) + (Math.random() * 100 < oTile ? 3 : 0);
		
		while ($y > 0 && $x > 1){
			$diceX = $x > 2 ? 3 : 2;
			$diceY = $y > 1 ? 2 : 1;
			$xRoll = [];
			$yRoll = [];
			
			$x -= $diceX;
			$y -= $diceY;
			for ($i=0; $i<$diceX; $i++){
				$die = ceil(mt_rand(0, 6000 + $oBonus)/1000);
				$xRoll[$i] = $die;
			}
			for ($i=0; $i<$diceY; $i++){
				$die = ceil(mt_rand(0, 6000 + $dBonus)/1000);
				$die += mt_rand(0, 10000) < $defVal ? 3 : 0;
				$yRoll[$i] = $die;
			}
			
			rsort($xRoll);
			rsort($yRoll);
			
			while( ($x && count($xRoll) > 0 || !$x && 
				count($xRoll) > 1) && 
				count($yRoll) > 0){
				$xRoll[0] > $yRoll[0] ? $diceY-=1 : $diceX-=1;
				$xRoll = array_slice($xRoll, 1);
				$yRoll = array_slice($yRoll, 1);
			}
			$x += $diceX;
			$y += $diceY;
		}
		
		return array($x, $y);
	}
	function isAdjacent($x, $y){
		if ($_SESSION['map'] == 'Earth Alpha'){
			require('adjEarthAlpha.php');
		}
		return in_array($y, $adj[$x]);
	}
?>