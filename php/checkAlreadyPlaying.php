<?php
	$query = 'select count(row) from fwplayers where account=?';
	$stmt = $link->prepare($query);
	$stmt->bind_param('s', $_SESSION['account']);
	$stmt->execute();
	$stmt->bind_result($account);
	$count = 0;
	while ($stmt->fetch()){
		$count = $account;
	}
	if ($count){
		require('checkDisconnectsByAccount.php');
	}
?>