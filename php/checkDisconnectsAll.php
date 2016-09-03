<?php
	$query = "SELECT account, startGame FROM `fwplayers` where timestamp < date_sub(now(), interval {$_SESSION['lag']} second);";
	$result = $link->query($query);
	$arr = [];
	$count = 0;
	while ($row = $result->fetch_assoc()){
		$arr[$count++] = $row['account'];
		$startGame = $row['startGame'];
	}
	foreach($arr as $a){
		$query = 'delete from fwplayers where account=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('s', $a);
		$stmt->execute();
		
		if ($startGame >= 2){
			$query = "insert into fwnations (`account`, `disconnects`, `games`) VALUES (?, 1, 1) on duplicate key update disconnects=disconnects+1, games=games+1";
			$stmt = $link->prepare($query);
			$stmt->bind_param('s', $a);
			$stmt->execute();
		}
	}
?>