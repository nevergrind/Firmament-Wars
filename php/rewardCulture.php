<?php
	function rewardCulture(){
		$msg = '';
		$reward = mt_rand(0,5);
		
		if ($reward === 0){
			// offensive bonus
			$msg = 'A Great General appears!<br> All armies receive a <span class="chat-manpower">+1 offense</span> bonus!';
			$_SESSION['oBonus']++;
		} else if ($reward === 1){
			// defensive bonus
			$msg = 'A Great Tactician appears!<br> All armies receive a <span class="chat-manpower">+1 defense</span> bonus!';
			$_SESSION['dBonus']++;
		} else if ($reward === 2){
			// food bonus
			$msg = 'A <span class="chat-food">Great Humanitarian</span> appears!<br> We receive a <span class="chat-food">+50% food</span> bonus!';
			$_SESSION['foodBonus'] += 50;
		} else if ($reward === 3){
			// energy bonus
			$msg = 'A Great Industrialist appears!<br> We receive a <span class="chat-production">+50% energy</span> bonus!';
			$_SESSION['turnBonus'] += 50;
		} else if ($reward === 4){
			// culture bonus
			$msg = 'A Great Artist appears!<br> We receive a <span class="chat-culture">+50% culture</span> bonus!';
			$_SESSION['cultureBonus'] += 50;
		} else if ($reward === 5){
			require('connect1.php');
			// flip enemy tile
			$query = 'SELECT row, player, nation, tileName, units units FROM `fwtiles` where game=? and player!=? and flag!="" order by units desc limit 1';
			$stmt = $link->prepare($query);
			$stmt->bind_param('ii', $_SESSION['gameId'], $_SESSION['player']);
			$stmt->execute();
			$stmt->bind_result($drow, $dplayer, $dnation, $dtileName, $dunits);
			$x = new stdClass();
			while($stmt->fetch()){
				$x->row = $drow;
				$x->player = $dplayer;
				$x->nation = $dnation;
				$x->tileName = $dtileName;
				$x->units = $dunits;
			}
			
			// flip tile
			$query = "update fwtiles set account=?, player=?, nation=?, flag=? where row=?";
			$stmt = $link->prepare($query);
			$stmt->bind_param('sissi', $_SESSION['account'], $_SESSION['player'], $_SESSION['nation'], $_SESSION['flag'], $x->row);
			$stmt->execute();
			
			// notify players of flip
			$msg = '<img src="images/flags/'. $_SESSION["flag"] .'" class="player'. $_SESSION["player"] .' p' . $_SESSION["player"] . 'b inlineFlag">A <span class="chat-culture">Great Revolutionary</span> conquers ' .
			$x->tileName. '!';
			$stmt = $link->prepare('insert into fwchat (`message`, `gameId`) values (?, ?);');
			$stmt->bind_param('si', $msg, $_SESSION['gameId']);
			$stmt->execute();
			$msg = ''; // don't report msg twice
			
			require('checkDeadPlayer.php');
			checkDeadPlayer($x);
		}
		return $msg;
	}
?>