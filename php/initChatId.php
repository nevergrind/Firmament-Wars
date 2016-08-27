<?php
	require('connect1.php');
	$query = "select row from fwchat order by row desc limit 1";
	$stmt = $link->prepare($query);
	$stmt->execute();
	$stmt->bind_result($row);
	while($stmt->fetch()){
		$_SESSION['chatId'] = $row;
	}
?>