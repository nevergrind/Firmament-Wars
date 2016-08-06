<?php
	session_start();
	session_set_cookie_params(86400);
	ini_set('session.gc_maxlifetime', 86400);
	if (!isset($_SESSION['email'])){
		header('HTTP/1.1 500 Session info not found.');
	}
?>