<?php
	header('Content-Type: application/json');
	require('connect1.php');
	require('battle.php');
	
	$o = new stdClass();
	$o->reward = 1;
	
	$attacker = new stdClass();
	$attacker->tile = $_POST['attacker'];
	
	$defender = new stdClass();
	$defender->tile = $_POST['defender'];
	
	$split = $_POST['split'] * 1;
	
	if ($split === 0){
		if ($_SESSION['production'] < 7){
			header('HTTP/1.1 500 Not enough energy!');
			exit();
		}
	} else {
		if ($_SESSION['production'] < 3){
			header('HTTP/1.1 500 Not enough energy!');
			exit();
		}
	}
	
	if (isAdjacent($attacker->tile, $defender->tile)){
		$query = 'select tile, tileName, nation, flag, units, player, account, defense from fwTiles where (tile=? or tile=?) and game=? limit 2';
		$stmt = $link->prepare($query);
		$stmt->bind_param('iii', $attacker->tile, $defender->tile, $_SESSION['gameId']);
		$stmt->execute();
		$stmt->bind_result($tile, $tileName, $nation, $flag, $units, $player, $account, $defense);
		
		while($stmt->fetch()){
			if ($_POST['attacker'] == $tile){
				// use classes?
				$attacker->tile = $tile;
				$attacker->tileName = $tileName;
				$attacker->nation = $nation;
				$attacker->flag = $flag;
				$attacker->units = $units;
				$attacker->player = $player;
				$attacker->account = $account;
			} else {
				$defender->tile = $tile;
				$defender->tileName = $tileName;
				$defender->nation = $nation;
				$defender->flag = $flag;
				$defender->units = $units;
				$defender->player = $player;
				$defender->account = $account;
				$defender->defense = $defense;
			}
		}
		if ($attacker->account !== $_SESSION['account']){
			header('HTTP/1.1 500 You do not control that territory!');
			exit();
		}
		
		if ($split === 1){
			/*
			$availableArmies = $attacker->units - 1;
			$splitDef = floor($availableArmies / 2);
			$splitAtk = $availableArmies - $splitDef;
			*/
			$availableArmies = $attacker->units;
			$splitDef = floor($availableArmies / 2);
			$splitAtk = $availableArmies - $splitDef;
		}
		$originalDefendingUnits = $defender->units;
		// add adjacent validation
		if ($defender->account == $_SESSION['account']){
			// move to allied territory
			if ($split === 0){
				if ($defender->units + $attacker->units > 255){
					// attack overflow
					$diff = (255 - ($defender->units + $attacker->units) ) * -1;
					$defender->units = $defender->units + $attacker->units - $diff;
					$attacker->units = $diff;
				} else {
					// attack normal
					$defender->units = $defender->units + $attacker->units - 1;
					$attacker->units = 1;
				}
			} else {
				if ($defender->units + $splitAtk > 255){
					// split attack overflow
					$diff = (255 - ($defender->units + $splitAtk) ) * -1;
					$defender->units = $defender->units + $splitAtk - $diff;
					$attacker->units = $diff + $splitDef;
				} else {
					// what advances
					$defender->units = $splitAtk + $originalDefendingUnits;
					// what's left behind
					$attacker->units = $splitDef;
				}
			}
			// update attacker
			$query = 'update fwTiles set units=? where tile=? and game=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('iii', $attacker->units, $attacker->tile, $_SESSION['gameId']);
			$stmt->execute();
			// update defender
			$query = 'update fwTiles set units=? where tile=? and game=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('iii', $defender->units, $defender->tile, $_SESSION['gameId']);
			$stmt->execute();
			
			$_SESSION['production'] -= $split === 0 ? 7 : 3;
			$o->production = $_SESSION['production'];
			
			
			
		} else {
			// attacking uninhabited/enemy territory
			if ($attacker->units > 1 &&
				$defender->account !== $_SESSION['account'])
			{
				// RESUME: split attacking with $splitAtk
				if ($split === 0){
					$result = battle($attacker->units, $defender->units, $defender);
				} else {
					$result = battle($splitAtk, $defender->units, $defender);
				}
				if ($result[0] > $result[1]){
					// victory
					if ($split === 0){
						$attacker->units = 1;
						$defender->units = $result[0] - $attacker->units;
					} else {
						$attacker->units = $splitDef;
						$defender->units = $result[0];
					}
					// update attacker
					$query = "update fwTiles set units=? where tile=? and game=?";
					$stmt = $link->prepare($query);
					$stmt->bind_param('iii', $attacker->units, $attacker->tile, $_SESSION['gameId']);
					$stmt->execute();
					// update defender
					$query = 'update fwTiles set nation=?, flag=?, units=?, player=?, account=? where tile=? and game=?';
					$stmt = $link->prepare($query);
					$stmt->bind_param('ssiisii', $attacker->nation, $attacker->flag, $defender->units, $attacker->player, $attacker->account, $defender->tile, $_SESSION['gameId']);
					$stmt->execute();
					
					if ($originalDefendingUnits > 0){
						// write victory to chat
						$atkFlag = $attacker->flag === 'Default.jpg' ? 
							'<img src="images/flags/Player'.$attacker->player.'.jpg" class="player'.$attacker->player.' p'.$attacker->player.'b inlineFlag">' :
							'<img src="images/flags/'.$attacker->flag.'" class="player'.$attacker->player.' p'.$attacker->player.'b inlineFlag">';
						$defFlag = '';
						// tile is by player
						if ($defender->flag){
							// tile is not barbarian
							if ($defender->flag === 'Default.jpg'){
								$defFlag = '<img src="images/flags/Player'.$defender->player.'.jpg" class="player'.$defender->player.' p'.$defender->player.'b inlineFlag">';
							} else {
								$defFlag = '<img src="images/flags/'.$defender->flag.'" class="player'.$defender->player.' p'.$defender->player.'b inlineFlag">';
							}
						} else {
							// give barbarian reward
							require('rewardBarbarian.php');
							$o->rewardMsg = getBarbarianReward($attacker, $defender);
						}
							
						$msg = $atkFlag. $attacker->nation . ' conquers ' . $defFlag . $defender->tileName. '.';
						$stmt = $link->prepare('insert into fwchat (`message`, `gameId`) values (?, ?);');
						$stmt->bind_param('si', $msg, $_SESSION['gameId']);
						$stmt->execute();
						// was the player eliminated?
						if ($defender->flag){
							require('checkDeadPlayer.php');
							checkDeadPlayer($defender);
						}
					}
			
					$_SESSION['production'] -= $split === 0 ? 7 : 3;
					$o->production = $_SESSION['production'];
				} else {
					// defeat
					if ($split === 0){
						$attacker->units = $result[0];
						$defender->units = $result[1];
					} else {
						$attacker->units = $splitDef;
						$defender->units = $result[1];
					}
					// update attacker
					$query = 'update fwTiles set units=? where tile=? and game=?';
					$stmt = $link->prepare($query);
					$stmt->bind_param('iii', $attacker->units, $attacker->tile, $_SESSION['gameId']);
					$stmt->execute();
					// update defender
					$query = 'update fwTiles set units=? where tile=? and game=?';
					$stmt = $link->prepare($query);
					$stmt->bind_param('iii', $defender->units, $defender->tile, $_SESSION['gameId']);
					$stmt->execute();
					
					// write victory to chat
					$atkFlag = $attacker->flag === 'Default.jpg' ? 
						'<img src="images/flags/Player'.$attacker->player.'.jpg" class="player'.$attacker->player.' p'.$attacker->player.'b inlineFlag">' :
						'<img src="images/flags/'.$attacker->flag.'" class="player'.$attacker->player.' p'.$attacker->player.'b inlineFlag">';
					$defFlag = '';
					// non-barbarian flag
					if ($defender->flag){
					$defFlag = $defender->flag === 'Default.jpg' ? 
						'<img src="images/flags/Player'.$defender->player.'.jpg" class="player'.$defender->player.' p'.$defender->player.'b inlineFlag">' :
						'<img src="images/flags/'.$defender->flag.'" class="player'.$defender->player.' p'.$defender->player.'b inlineFlag">';
					}
					/*
					$msg = $atkFlag. $attacker->nation . ' fails to conquer ' . $defFlag . $defender->tileName. '.';
					$stmt = $link->prepare('insert into fwchat (`message`, `gameId`) values (?, ?);');
					$stmt->bind_param('si', $msg, $_SESSION['gameId']);
					$stmt->execute();
					*/
					$_SESSION['production'] -= $split === 0 ? 7 : 3;
					$o->production = $_SESSION['production'];
				}
			} else {
				header('HTTP/1.1 500 You cannot attack under these conditions.');
				exit();
			}
		}
	} else {
		header('HTTP/1.1 500 You can only attack adjacent territories.');
		exit();
	}
	echo json_encode($o);
?>