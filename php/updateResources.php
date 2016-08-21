<?php
	header('Content-Type: application/json');

	require('connect1.php');
	
	require('pingLobby.php');
	
	$gameDuration = microtime(true) - $_SESSION['gameDuration'] + 6;
	
	$x = new stdClass();
	$x->gameDuration = $gameDuration;
	$x->gameTickTime = $_SESSION['resourceTick'] * 5;
	
	if ($gameDuration > $_SESSION['resourceTick'] * 5){
		$_SESSION['resourceTick']++;
		
		$val1 = $_SESSION['resourceTick'] % 4;
		if ($val1 === $_SESSION['playerMod']){
			require('checkDisconnectsByGame.php');
		}
		// get game tiles
		$query = 'select sum(food), sum(culture) from `fwTiles` where account=? and game=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('si', $_SESSION['account'], $_SESSION['gameId']);
		$stmt->execute();
		$stmt->bind_result($food, $culture);
		
		while($stmt->fetch()){
			$x->sumFood = $food + round($food * ($_SESSION['foodBonus'] / 100)) + $_SESSION['foodReward'];
			$newFood = $_SESSION['food'] + $x->sumFood;
			$x->food = $newFood;
			
			$x->sumCulture = $culture + round($culture * ($_SESSION['cultureBonus'] / 100)) + $_SESSION['cultureReward'];
			$newCulture = $_SESSION['culture'] + $x->sumCulture;
			$x->culture = $newCulture;
		}
		$x->foodMax = $_SESSION['foodMax'];
		$x->cultureMax = $_SESSION['cultureMax'];
		$x->bonus = 0;
		
		// milestones?
		if ($x->food >= $_SESSION['foodMax']){
			function getManpowerReward(){
				$reward = 4 + ($_SESSION['foodMilestone'] * 2);
				$foo = $_SESSION['foodMilestone'];
				if ($foo > 35){
					$reward+=44;
				} else if ($foo > 27){
					$reward+=32;
				} else if ($foo > 20){
					$reward+=22;
				} else if ($foo > 14){
					$reward+=14;
				} else if ($foo > 9){
					$reward+=8;
				} else if ($foo > 5){
					$reward+=4;
				} else if ($foo > 2){
					$reward+=2;
				}
				return $reward;
			}
			require('rewardGet.php');
			$x->food -= $_SESSION['foodMax'];
			$manpowerBonus = getManpowerReward();
			$_SESSION['manpower'] += $manpowerBonus;
			$_SESSION['foodMilestone']++;
			$_SESSION['foodMax'] = $_SESSION['foodMax'] + 25;
			if ($_SESSION['foodMax'] > 9999){
				$_SESSION['foodMax'] = 9999;
			}
			// GET?!
			$stmt = mysqli_query($link, "insert into fwGets (`row`) VALUES (null)");
			// last insert id is GET value
			
			$x->get = mysqli_insert_id($link);
			$bonus = getReward($x->get);
			$x->getBonus = $bonus->units;
			$_SESSION['manpower'] += $bonus->units;
			if ($_SESSION['manpower'] > 999){
				$_SESSION['manpower'] = 999;
			}
			
			$msg = '';
			if ($bonus->units){
				// write GET to chat
				$flag = $_SESSION['flag'] === 'Default.jpg' ? 
					'<img src="images/flags/Player'.$_SESSION['player'].'.jpg" class="player'.$_SESSION['player'].' p'.$_SESSION['player'].'b inlineFlag">' :
					'<img src="images/flags/'.$_SESSION['flag'].'" class="player'.$_SESSION['player'].' p'.$_SESSION['player'].'b inlineFlag">';
				if ($bonus->img){
					$msg .= '<img src="'. $bonus->img .'" class="chat-img"><div class="chat-manpower">'. $bonus->msg .'!</div>';
				}
				if ($bonus->units){
					$msg .= $flag.$x->get . ': ' . $_SESSION["nation"] . ' receives <span class="chat-manpower">' . $manpowerBonus . '+' . $bonus->units . 
					'</span> armies!';
				} else {
					$msg .= $flag.$x->get . ': ' . $_SESSION['nation'] . ' receives <span class="chat-manpower">' . $manpowerBonus . '</span> armies!';
				}
				$foodAccount = 'food|' . $_SESSION['account'];
				$stmt = $link->prepare('insert into fwchat (`message`, `gameId`, `event`) values (?, ?, ?);');
				$stmt->bind_param('sis', $msg, $_SESSION['gameId'], $foodAccount);
				$stmt->execute();
			
				mysqli_query($link, 'delete from fwchat where timestamp < date_sub(now(), interval 20 second)');
				// write to GETS only
				$query = "insert into fwGetsOnly (`get`, `getMessage`, `account`) VALUES (?, ?, ?)";
				$stmt = $link->prepare($query);
				$stmt->bind_param('iss', $x->get, $bonus->msg, $_SESSION['account']);
				$stmt->execute();
			}
			$x->foodMsg = $msg;
		}
		// culture milestone
		if ($x->culture >= $_SESSION['cultureMax']){
			$x->culture -= $_SESSION['cultureMax'];
			$_SESSION['cultureMax'] += 250;
			if ($_SESSION['cultureMax'] > 9999){
				$_SESSION['cultureMax'] = 9999;
			}
			$_SESSION['cultureMilestone']++;
			// provide culture milestone here
			require('rewardCulture.php');
			$x->cultureMsg = rewardCulture();
		}
		$x->sumProduction = $_SESSION['turnProduction'] + round($_SESSION['turnProduction'] * ($_SESSION['turnBonus'] / 100)) + $_SESSION['productionReward'];
		$_SESSION['production'] = $_SESSION['production'] + $x->sumProduction;
		$x->production = $_SESSION['production'];
		$_SESSION['food'] = $x->food;
		$_SESSION['culture'] = $x->culture;
		
		$x->foodBonus = $_SESSION['foodBonus'];
		$x->turnBonus = $_SESSION['turnBonus'];
		$x->cultureBonus = $_SESSION['cultureBonus'];
		$x->oBonus = $_SESSION['oBonus'];
		$x->dBonus = $_SESSION['dBonus'];
		
		$x->manpower = $_SESSION['manpower'];
		$x->foodMax = $_SESSION['foodMax'];
		$x->cultureMax = $_SESSION['cultureMax'];
		
		$_SESSION['productionReward'] = 0;
		$_SESSION['foodReward'] = 0;
		$_SESSION['cultureReward'] = 0;
	}
	echo json_encode($x);
?>