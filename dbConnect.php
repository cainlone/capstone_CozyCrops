<?php

try {
	$pdo = new PDO('mysql:host=sql310.infinityfree.com;dbname=if0_36424514_cozycrops', 'if0_36424514', '4MyINFINITYFREE');

	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$pdo->exec('SET NAMES "utf8"');
} catch (PDOException $e) {
	echo ($e);
	$error = 'Unable to connect to the database server.';
	include 'error.html.php';
	exit();
}
