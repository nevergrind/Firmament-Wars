<?php
	$query = "SELECT account FROM `fwplayers` where timestamp < date_sub(now(), interval {$_SESSION['lag']} second);";
	$result = $link->query($query);
	$arr = array();
	$count = 0;
	while ($row = $result->fetch_assoc()){
		$arr[$count++] = $row['account'];
	}
	foreach($arr as $a){
		$query = 'delete from fwPlayers where account=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('s', $a);
		$stmt->execute();
		
		if ($_SESSION['resourceTick'] > 9){
			$query = "insert into fwNations (`account`, `disconnects`, `games`) VALUES (?, 1, 1) on duplicate key update disconnects=disconnects+1, games=games+1";
			$stmt = $link->prepare($query);
			$stmt->bind_param('s', $a);
			$stmt->execute();
		}
	}
?>