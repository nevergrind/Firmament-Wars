<?php
	header('Content-Type: application/json');
	require('connect1.php');

	$o = [];
	$str = 
	
			
	// game data
	$query = 'select g.row row, min(p.player) host, g.name name, g.map map, count(p.game) players, g.max max from fwgames g join fwplayers p on g.row=p.game and p.timestamp > date_sub(now(), interval ' . $_SESSION["refreshGameLag"] . ' second) and p.startGame = 0 and g.password="" group by p.game having players > 0 and host=1 order by p.row desc';
	
	$stmt = mysqli_query($link, $query);
	$i = 0;
	if (mysqli_num_rows($stmt) > 0){
		while($row = mysqli_fetch_assoc($stmt)){
			$o[$i] = new stdClass();
			$o[$i]->row = $row['row'];
			$o[$i]->name = $row['name'];
			$o[$i]->map = $row['map'];
			$o[$i]->players = $row['players'];
			$o[$i]->max = $row['max'];
			$i++;
		}
	}
	echo json_encode($o);
?>