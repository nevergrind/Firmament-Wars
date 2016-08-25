<?php
require_once('connect1.php');
$governments = [
	'Despotism',
	'Monarchy',
	'Democracy',
	'Fundamentalism',
	'Fascism',
	'Republic',
	'Communism'
];
if (!in_array($_POST['government'], $governments)){
	header('HTTP/1.1 500 Invalid government selection.');
} else {
	$query = "update fwplayers set government=? where account=?";
	$stmt = $link->prepare($query);
	$stmt->bind_param('ss', $_POST['government'], $_SESSION['account']);
	$stmt->execute();
}
?>