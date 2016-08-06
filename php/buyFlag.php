<?php
	require_once('connect1.php');
	$flag = $_POST['flag'];
	
	$query = "select row from fwFlags where flag=? and account=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('ss', $flag, $_SESSION['account']);
	$stmt->execute();
	$stmt->store_result();
	$count = $stmt->num_rows;
	// try to buy it
	$crystals = 0;
	$query = "select crystals from accounts where email='".$_SESSION['email']."' limit 1";
	$result = $link->query($query);
	while($row = $result->fetch_assoc()){
		$crystals = $row['crystals'];
	}
	if($count == 0){
		if ($crystals < 100){
			header("HTTP/1.1 500 You don't have enough Never Crystals. <a target='_blank' href='/store/'>Visit the Store to purchase more!</a>");
		} else {
			$crystals = $crystals - 100;
			// give flag
			$query = "insert into fwFlags (`account`, `flag`) VALUES (?, ?)";
			$stmt = $link->prepare($query);
			$stmt->bind_param('ss', $_SESSION['account'], $flag);
			$stmt->execute();
			// take crystals
			$query = "update accounts set crystals=$crystals where email=?";
			$stmt = $link->prepare($query);
			$stmt->bind_param('s', $_SESSION['email']);
			$stmt->execute();
			// set flag
			$query = "update fwNations set flag=? where account=?";
			$stmt = $link->prepare($query);
			$stmt->bind_param('ss', $flag, $_SESSION['account']);
			$stmt->execute();
		}
	}
	echo $crystals;
?>