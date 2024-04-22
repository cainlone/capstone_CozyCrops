<?php
session_start();

// Include your dbConnect.php file to establish a database connection
include 'dbConnect.php';
include 'sanitize.php';

// Check if the user ID is sent via POST
if(isset($_POST['userId'])) {
    // Sanitize the user ID
    $userId = sanitizeString(INPUT_POST, 'userId');
    
    // Prepare SQL statement to fetch data from tables
    $playerPos = $pdo->prepare("SELECT * FROM playerpos WHERE userid = :userid");
    $playerPos->execute(['userid' => $userId]);
    $playerPosData = $playerPos->fetchAll(PDO::FETCH_ASSOC);
    
    $inventory = $pdo->prepare("SELECT * FROM inventory WHERE userid = :userid");
    $inventory->execute(['userid' => $userId]);
    $inventoryData = $inventory->fetchAll(PDO::FETCH_ASSOC);

    $layerthreetiles = $pdo->prepare("SELECT * FROM layerthreetiles WHERE userid = :userid");
    $layerthreetiles->execute(['userid' => $userId]);
    $layerthreetilesData = $layerthreetiles->fetchAll(PDO::FETCH_ASSOC);

    // Prepare your response data
    $responseData = [
        'playerPosData' => $playerPosData,
        'inventoryData' => $inventoryData,
        'layerthreetilesData' => $layerthreetilesData,
        'userId' => $userId
    ];

    // Send the response data as JSON
    echo json_encode($responseData);
} else {
    // If user ID is not provided, return an error
    http_response_code(400);
    echo "User ID not provided";
}
?>