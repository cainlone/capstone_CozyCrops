<?php
session_start();

// Check if user is logged in
if(!isset($_SESSION['loggedin'])) {
    // Redirect to login page if not logged in
    header("Location: login.php");
    exit();
}

// Now you can safely access userid from session
$userid = $_SESSION['userid'];

// Include your dbConnect.php file to establish a database connection
include 'dbConnect.php';

// Retrieve user data based on userid
$loginInfo = $pdo->prepare("SELECT * FROM logininfo WHERE userid = :userid");
$loginInfo->execute(['userid' => $userid]);
$user_data = $loginInfo->fetch(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cozy Crops</title>

  <link rel="stylesheet" href="css/main.css">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</head>
<body style="overflow: hidden;">
  <div id="gameContainer">
    <!-- Game Canvas is 17 tiles by 11 tiles -->
    <Canvas id="gameCanvas" width="816" height="528"></Canvas>
    <button id="pauseBtn" onclick="pauseGame();"> || </button>

    <div id="accountContainer">
    <button class="loginBtn" onclick="saveGame(); window.location.href = 'logout.php';">Log Out</button>
    </div>

    <!-- Inventory Canvas is 10 tiles by 1 tile -->
    <canvas id="inventoryCanvas" width="480" height="48"></canvas>

    <div id="currentItem"></div>
    <div id="text" width="816"></div>
  </div>
  
  <!-- Include your JavaScript files -->
  <script> let userId = "<?php echo $userid ?>";</script>
  <script src="js/main.js"></script>
  <script src="js/inventory.js"></script>
  <script src="js/user.js"></script>
  <script src="js/menus.js"></script>
</body>
</html>