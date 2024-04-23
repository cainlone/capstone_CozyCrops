<?php

try {
	$pdo = new PDO('mysql:host=localhost:3306;dbname=cozycrops', 'itsd', 'mysqlmysql');

	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$pdo->exec('SET NAMES "utf8"');
} catch (PDOException $e) {
	echo ($e);
	$error = 'Unable to connect to the database server.';
	include 'error.html.php';
	exit();
}
