<?php
	require('isAdjacent.php');
	function battle($x, $y, $defender){
		$oBonus = $_SESSION['oBonus'] * 500;
		$dBonus = $_SESSION['dBonus'] * 500;
		$dTileUpgrades = [0, 3000, 4500, 5400, 6200];
		if ($_SESSION['government'] === 'Fundamentalism'){
			if ($y > 0){
				if ($x/$y >= 4){
					// overrun
					return array($x, 0);
				}
			}
			// infiltration
			if (--$defender->defense < 0){
				$defender->defense = 0;
			}
		}
		// structure upgrades + capital
		$defVal = $dTileUpgrades[$defender->defense];
		
		$originalAttackingUnits = $x;
		
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
		
		if ($_SESSION['government'] === 'Republic'){
			// victorious healing
			if ($x > $y){
				$diff = $originalAttackingUnits - $x;
				$x += ceil($diff / 2);
			}
		}
		
		return array($x, $y);
	}
?>