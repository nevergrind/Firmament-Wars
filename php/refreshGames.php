<?php
	require('connect1.php');

	$noGameFound = "<tr><td colspan='3' class='text-warning text-center col-md-12 warCells'>No active games found. Create a game to play!</td></tr>";
	/* why is this here? lol
	$query = 'select row from fwGames';
	$result = $link->query($query);
	$count = $result->num_rows;
	*/
	$str = 
	'<table id="refreshGames" class="table table-condensed table-borderless">
		<tr>
			<th class="col-md-9 warCells">Game</th>
			<th class="col-md-3 warCells">Players/Max</th>
		</tr>';
			
	// game data
	$query = 'select g.row row, min(p.player) host, g.name name, count(p.game) players, g.max max from fwGames g join fwplayers p on g.row=p.game and p.timestamp > date_sub(now(), interval ' . $_SESSION["refreshGameLag"] . ' second) and g.start = 0 group by p.game having players > 0 and host=1 order by p.account';
	
	$stmt = mysqli_query($link, $query);
	$count = mysqli_num_rows($stmt);
	if ($count > 0){
		while($row = mysqli_fetch_assoc($stmt)){
			$str .= 
			'<tr class="wars" data-id=\'' . $row["row"] . '\'>
				<td class="warCells">' . $row["name"] . '</td>
				<td class="warCells">' . $row["players"] . '/' .$row["max"] . '</td>
			</tr>';
		}
		$str .=
		'<tr>
			<td colspan="2" class="text-center">
				<hr class="fancyhr">
				<button id="joinGame" type="button" class="btn btn-md btn-info btn-responsive shadow4">Join Game</button>
			</td>
		</tr>';
	} else {
		$str .= $noGameFound;
	}
	$str .= "</table>";
	echo $str;
?>