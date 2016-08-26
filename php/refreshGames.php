<?php
	require('connect1.php');

	$noGameFound = "<tr><td colspan='3' class='text-warning text-center col-xs-12 warCells'>No active games found. Create a game to play!</td></tr>";
	/* why is this here? lol
	$query = 'select row from fwGames';
	$result = $link->query($query);
	$count = $result->num_rows;
	*/
	$str = 
	'<table id="gameTable" class="table table-condensed table-borderless">
		<tr>
			<th class="gameTableCol1 warCells">Game</th>
			<th class="gameTableCol2 warCells">Map</th>
			<th class="gameTableCol3 warCells">Players</th>
		</tr>';
			
	// game data
	$query = 'select g.row row, min(p.player) host, g.name name, g.map map, count(p.game) players, g.max max from fwGames g join fwplayers p on g.row=p.game and p.timestamp > date_sub(now(), interval ' . $_SESSION["refreshGameLag"] . ' second) and p.startGame = 0 group by p.game having players > 0 and host=1 order by p.account';
	
	$stmt = mysqli_query($link, $query);
	$count = mysqli_num_rows($stmt);
	if ($count > 0){
		while($row = mysqli_fetch_assoc($stmt)){
			$str .= 
			'<tr class="wars" data-id=\'' . $row["row"] . '\'>
				<td class="warCells">' . $row["name"] . '</td>
				<td class="warCells">' . $row["map"] . '</td>
				<td class="warCells">' . $row["players"] . '/' .$row["max"] . '</td>
			</tr>';
			$str .= 
			'<tr class="wars" data-id=\'' . $row["row"] . '\'>
				<td class="warCells">' . $row["name"] . '</td>
				<td class="warCells">' . $row["map"] . '</td>
				<td class="warCells">' . $row["players"] . '/' .$row["max"] . '</td>
			</tr>';
			$str .= 
			'<tr class="wars" data-id=\'' . $row["row"] . '\'>
				<td class="warCells">' . $row["name"] . '</td>
				<td class="warCells">' . $row["map"] . '</td>
				<td class="warCells">' . $row["players"] . '/' .$row["max"] . '</td>
			</tr>';
			$str .= 
			'<tr class="wars" data-id=\'' . $row["row"] . '\'>
				<td class="warCells">' . $row["name"] . '</td>
				<td class="warCells">' . $row["map"] . '</td>
				<td class="warCells">' . $row["players"] . '/' .$row["max"] . '</td>
			</tr>';
		}
	} else {
		$str .= $noGameFound;
	}
	$str .= "</table>";
	echo $str;
?>