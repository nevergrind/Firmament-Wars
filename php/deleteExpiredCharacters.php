<?php
	require('connect1.php');
	$season = 1;
	$total = 0;
	$now = date('U');
	$query = "select email, name, level, race, job, difficulty, zone, zoneN, zoneH, subzone, subzoneN, subzoneH, hardcoreMode, timestamp from characters";
	$result = $link->query($query);
	while($row = $result->fetch_assoc()){
		if($row['level'] >= 15){
		}else{
			$diff = ($now - strtotime($row['timestamp']));
			if($diff < 1296000){ // 1209600000 1296000000
				// indicate days remaining until deletion
			}else{
				// character
				$name = $row['name'];
				$email = $row['email'];
				echo "<div>Deleting {$name}...</div>";
				$query = 'delete from characters where name=? and season=? and email=?';
				$stmt = $link->prepare($query);
				$stmt->bind_param('sis', $name, $season, $email);
				$stmt->execute();
				// quests
				$query = 'delete from quests where name=? and season=? and email=?';
				$stmt = $link->prepare($query);
				$stmt->bind_param('sis', $name, $season, $email);
				$stmt->execute();
				// items
				$query = 'delete from item where characterName=? and season=? and email=?';
				$stmt = $link->prepare($query);
				$stmt->bind_param('sis', $name, $season, $email);
				$stmt->execute();
				$total++;
			}
		}
	}
	echo "<div>Deleted {$total} character(s)</div>";
?>