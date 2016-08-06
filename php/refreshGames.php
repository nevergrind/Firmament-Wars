<?php
	require('connect1.php');

	$noGameFound = "<tr><td colspan='3' class='text-warning text-center col-md-12 warCells'>No active games found. Create a game to play!</td></tr>";

	$query = 'select row from fwGames';
	$result = $link->query($query);
	$count = $result->num_rows;
	
	$str = 
	'<table id="refreshGames" class="table table-condensed table-borderless">
		<tr>
			<th class="col-md-9 warCells">Game</th>
			<th class="col-md-3 warCells">Players/Max</th>
		</tr>';
	if($count > 0){
			
		// game data
		$query = "select g.row row, min(p.player) host, g.name name, count(p.game) players, g.max max from fwGames g join fwplayers p on g.row=p.game and p.timestamp > date_sub(now(), interval {$_SESSION['refreshGameLag']} second) and g.start = 0 group by p.game having players > 0 and host=1 order by p.account";
		
		$result = $link->query($query);
		$count = $result->num_rows;
		if ($count > 0){
			while($row = $result->fetch_assoc()){
				$str .= "<tr class='wars' data-id='{$row['row']}'>
					<td class='warCells'>{$row['name']}</td>
					<td class='warCells'>{$row['players']}/{$row['max']}</td>
				</tr>";
			}
			$str .=
			"<tr>
				<td></td>
				<td>
					<button id='joinGame' type='button' class='btn btn-md btn-info btn-responsive shadow4 pull-right'>Join Game</button>
				</td>
			</tr>";
		} else {
			$str .= $noGameFound;
		}
	} else {
		$str .= $noGameFound;
	}
	$str .= "</table>";
	echo $str;
?>