<?php
	// Site-wide values
	$_SESSION['protocol'] = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https:" : "http:";
	date_default_timezone_set('UTC');
	// Firmament Wars values
	$_SESSION['lag'] = 20;
	$_SESSION['refreshGameLag'] = 2;
?>