<?php
	function getBarbarianReward($attacker, $defender){
		global $link;
		function plunderBonus($amount){
			return $_SESSION['government'] === 'Republic' ? ceil($amount + ($amount / 2)) : $amount;
		}
		function discoveryBonus(){
			return $_SESSION['government'] === 'Communism' ? 20 : 10;
		}
		$msg = 'No reward was found.';
		
		$reward = mt_rand(0,7);
		$tier = mt_rand(0,2);
		
		if ($reward === 3){
			// do I even own my capital?
			$query = 'select account from fwTiles where tile=? and game=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('ii', $_SESSION['capital'], $_SESSION['gameId']);
			$stmt->execute();
			$stmt->bind_result($account);
			
			while($stmt->fetch()){
				$capitalAccount = $account;
			}
			
			if ($capitalAccount !== $_SESSION['account']){
				$reward = 4;
			}
		}
		
		if ($reward === 0){
			// food
			$amount = plunderBonus(30 + ($tier * 10));
			$msg = 'Plunder! We discovered <span class="chat-food">' . $amount . ' food</span> in ' . $defender->tileName. '!';
			$_SESSION['foodReward'] += $amount;
		} else if ($reward === 1){
			// production
			$amount = plunderBonus(20 + ($tier * 5));
			$msg = 'Plunder! We discovered <span class="chat-production">'. $amount .' energy</span> in ' . $defender->tileName. '!';
			$_SESSION['productionReward'] += $amount;
			
		} else if ($reward === 2){
			// culture
			$amount = plunderBonus(60 + ($tier * 20));
			$msg = 'Plunder! We discovered <span class="chat-culture">' . $amount . ' culture</span> in ' . $defender->tileName. '!';
			$_SESSION['cultureReward'] += $amount;
			
		} else if ($reward === 3){
			// +6, 8, 10 fervor units at capital
			$amount = 6 + ($tier * 2);
			if ($_SESSION['government'] === 'Fascism'){
				$amount *= 2;
			}
			$msg = 'Nationalist fervor yields <span class="chat-manpower">' . $amount . ' armies</span> in our capital!';
			// get capital unit value
			$query = 'select units from fwTiles where tile=? and game=?';
			$stmt = $link->prepare($query);
			$stmt->bind_param('ii', $_SESSION['capital'], $_SESSION['gameId']);
			$stmt->execute();
			$stmt->bind_result($units);
			while($stmt->fetch()){
				$capitalUnits = $units;
			}
			// update capital value
			$newTotal = $capitalUnits + $amount;
			$stmt = $link->prepare('update fwTiles set units=? where tile=? and game=?');
			$stmt->bind_param('iii', $newTotal, $_SESSION['capital'], $_SESSION['gameId']);
			$stmt->execute();
		} else if ($reward === 4){
			// +4-6 fervor units at tile
			$amount = 4 + $tier;
			if ($_SESSION['government'] === 'Fascism'){
				$amount *= 2;
			}
			$msg = 'Nationalist fervor yields <span class="chat-manpower">' . $amount . ' armies!</span> in ' . $defender->tileName . '.';
			
			$newTotal = $defender->units + $amount;
			$stmt = $link->prepare('update fwTiles set units=? where tile=? and game=?');
			$stmt->bind_param('iii', $newTotal, $defender->tile, $_SESSION['gameId']);
			$stmt->execute();
			
		} else if ($reward === 5){
			// discover food bonus
			$amount = discoveryBonus();
			$msg = 'Discovery! A granary in ' . $defender->tileName. ' boosts <span class="chat-food">food +'. $amount .'%!</span>';
			$_SESSION['foodBonus'] += $amount;
			
		} else if ($reward === 6){
			// discover energy bonus
			$amount = discoveryBonus();
			$msg = 'Discovery! A factory in ' . $defender->tileName. ' boosts <span class="chat-production">energy +'. $amount .'%!</span>';
			$_SESSION['turnBonus'] += $amount;
			
		} else if ($reward === 7){
			// discover culture bonus
			$amount = discoveryBonus();
			$msg = 'Discovery! An artist in ' . $defender->tileName. ' boosts <span class="chat-culture">culture +'. $amount .'%!</span>';
			$_SESSION['cultureBonus'] += $amount;
			
		}
		return $msg;
	}
?>