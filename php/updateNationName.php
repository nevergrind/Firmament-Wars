<?php
	require_once('connect1.php');
	
	function validateName($x){
		// min/max length
		$len = strlen($x);
		$x = str_replace(" ", "", $x);
		$x = str_replace("/", "", $x);
		$x = str_replace(".", "", $x);
		if ($len < 4){
			header('HTTP/1.1 500 Nation name must be at least 4 characters.');
			return false;
		} else if ($len > 32){
			header('HTTP/1.1 500 Nation name must contain less than 33 characters.');
			return false;
		} else if (!ctype_alnum($x)){
			header('HTTP/1.1 500 Nation name must contain letters and numbers only.');
			return false;
		}
		return true;
	}
	$name = $_POST['name'];
	
	if (validateName($name)){
		$query = 'update fwnations set nation=? where account=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('ss', $name, $_SESSION['account']);
		$stmt->execute();
		
		$_SESSION['nation'] = $name;
		echo $name;
	}
?>