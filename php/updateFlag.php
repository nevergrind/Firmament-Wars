<?php
	require_once('connect1.php');
	$flag = $_POST['flag'];
	
	$query = "select count(row) rows from fwFlags where flag=? and account=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('ss', $flag, $_SESSION['account']);
	$stmt->bind_result($rows);
	$stmt->execute();
	while($stmt->fetch()){
		$count = $rows;
	}
	
	function updateFlag($link, $flag){
		$query = "update fwNations set flag=? where account=?";
		$stmt = $link->prepare($query);
		$stmt->bind_param('ss', $flag, $_SESSION['account']);
		$stmt->execute();
		$_SESSION['flag'] = $flag;
	}
	
	if($count > 0){
		updateFlag($link, $flag);
	} else {
		if ($flag == "Default.jpg"){
			updateFlag($link, $flag);
		} else {
			header('HTTP/1.1 500 You must purchase this flag to use it.');
		}
	}
?>