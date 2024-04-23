<?php
session_start();

include 'dbConnect.php';
include 'sanitize.php';

if (isset($_POST['userId'])) {
	$userId = sanitizeString(INPUT_POST, 'userId');

	$playerPos = $pdo->prepare("SELECT * FROM playerpos WHERE userid = :userid");
	$playerPos->execute(['userid' => $userId]);
	$playerPosData = $playerPos->fetchAll(PDO::FETCH_ASSOC);

	$inventory = $pdo->prepare("SELECT * FROM inventory WHERE userid = :userid");
	$inventory->execute(['userid' => $userId]);
	$inventoryData = $inventory->fetchAll(PDO::FETCH_ASSOC);

	$layerthreetiles = $pdo->prepare("SELECT * FROM layerthreetiles WHERE userid = :userid");
	$layerthreetiles->execute(['userid' => $userId]);
	$layerthreetilesData = $layerthreetiles->fetchAll(PDO::FETCH_ASSOC);

	$responseData = [
		'playerPosData' => $playerPosData,
		'inventoryData' => $inventoryData,
		'layerthreetilesData' => $layerthreetilesData,
		'userId' => $userId
	];

	echo json_encode($responseData);
} else {
	http_response_code(400);
	echo "User ID not provided";
}
