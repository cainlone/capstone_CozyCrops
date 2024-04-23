<?php

include 'dbConnect.php';

// Retrieve the JSON data sent from JavaScript and decode it
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData);

// Check if JSON data was successfully decoded
if ($data === null) {
    http_response_code(400); // Bad request
    echo "Error: Invalid JSON data.";
    exit;
}

// Retrieve individual variables from the JSON object
$userId = $data->userId;
$layerThree = $data->layerThree;
$spriteX = $data->spriteX;
$spriteY = $data->spriteY;
$inventory = $data->inventory;
$inventoryLength = $data->inventoryLength;

try {
    // Update the layerthreetiles table
    $pdo->beginTransaction();

    // Update layerthreetiles table
    $stmt = $pdo->prepare("DELETE FROM layerthreetiles WHERE userid = :userid");
    $stmt->execute(['userid' => $userId]);

    // Insert new data into layerthreetiles table
    for ($x = 0; $x < 2500; $x++) {
        $sql = "INSERT INTO layerthreetiles (tileindex, userid, tileid) VALUES (:tileindex, :userid, :tileid)";
        $layerthreetilesInfo = $pdo->prepare($sql);
        $layerthreetilesInfo->execute(['tileindex' => $x, 'userid' => $userId, 'tileid' => $layerThree[$x]->tileid]);
    }

    // Optionally, update other tables based on spriteX, spriteY, inventory, etc.
    $stmt = $pdo->prepare("DELETE FROM playerpos WHERE userid = :userid");
    $stmt->execute(['userid' => $userId]);

    $sql = "INSERT INTO playerpos (userid, xpos, ypos) VALUES (:userid, :xpos, :ypos)";
    $playerposInfo = $pdo->prepare($sql);
    $playerposInfo->execute(['userid' => $userId, 'xpos' => $spriteX, 'ypos' => $spriteY]);

    $stmt = $pdo->prepare("DELETE FROM inventory WHERE userid = :userid");
    $stmt->execute(['userid' => $userId]);

    for ($x = 0; $x < $inventoryLength; $x++) {
        $sql = "INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, :quantity, :inventoryid)";
        $inventoryInfo = $pdo->prepare($sql);
        $inventoryInfo->execute(['userid' => $userId, 'name' => $inventory[$x]->name, 'quantity' => $inventory[$x]->quantity, 'inventoryid' => $x]);
    }

    // Commit the transaction
    $pdo->commit();

    echo "Data updated successfully!";
} catch (PDOException $e) {
    // Rollback the transaction on error
    $pdo->rollBack();
    http_response_code(500); // Internal Server Error
    echo "Error: " . $e->getMessage();
}
?>