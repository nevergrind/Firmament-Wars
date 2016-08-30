<?php
	require('connect1.php');
	$x = $_POST['location'];
	
	$query = "update fwnations set IPv4=?, city=?, country_code=?, country_name=?, latitude=?, longitude=?, postal=?, state=? where account=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param("sssssssss", $x['IPv4'], $x['city'], $x['country_code'], $x['country_name'], $x['latitude'], $x['longitude'], $x['postal'], $x['state'], $_SESSION["account"]);
	$stmt->execute();
?>