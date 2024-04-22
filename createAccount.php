<?php
session_start();

// Include your dbConnect.php file to establish a database connection
include 'dbConnect.php';
// Include your sanitize.php file
include 'sanitize.php';

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize form inputs
    $fName = trim(sanitizeString(INPUT_POST, 'fName'));
    $lName = trim(sanitizeString(INPUT_POST, 'lName'));
    $newUsername = trim(sanitizeString(INPUT_POST, 'newUsername'));
    $newPassword = trim(sanitizeString(INPUT_POST, 'newPassword'));
    $dob = sanitizeString(INPUT_POST, 'dob');

    $dobTimestamp = strtotime($dob);
    $age = date('Y') - date('Y', $dobTimestamp);
    if (date('md') < date('md', $dobTimestamp)) {
        $age--;
    }

    if ($age < 13) {
        $error_message = "You must be 13 years or older to create an account.";
    } else {
        $loginInfo = $pdo->prepare("SELECT * FROM logininfo WHERE username = :username");
        $loginInfo->execute(['username' => $newUsername]);
        $existingUser = $loginInfo->fetch(PDO::FETCH_ASSOC);

        if ($existingUser) {
            $error_message = "Username already exists. Please choose a different username.";
        } else {
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $sql = "INSERT INTO logininfo (username, password) VALUES (:username, :password)";
            $loginInfo = $pdo->prepare($sql);
            $loginInfo->execute(['username' => $newUsername, 'password' => $hashedPassword]);

            $loginInfo = $pdo->prepare("SELECT * FROM logininfo WHERE username = :username");
            $loginInfo->execute(['username' => $newUsername]);
            $userId = $loginInfo->fetch(PDO::FETCH_ASSOC);

            $sql = "INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)";
            $inventoryInfo = $pdo->prepare($sql);
            $inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Watering Can", 'inventoryid' => 0]);

            $sql = "INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)";
            $inventoryInfo = $pdo->prepare($sql);
            $inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Carrot", 'inventoryid' => 1]);

            $sql = "INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)";
            $inventoryInfo = $pdo->prepare($sql);
            $inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Cabbage", 'inventoryid' => 2]);

            $sql = "INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)";
            $inventoryInfo = $pdo->prepare($sql);
            $inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Grape", 'inventoryid' => 3]);

            $sql = "INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)";
            $inventoryInfo = $pdo->prepare($sql);
            $inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Wheat", 'inventoryid' => 4]);

            $jsonData = file_get_contents("js/sample.json");
            $data = json_decode($jsonData, true);
            

            //instead of setting tileid to 0 every time, set it to sample.json layer three tileId at data[$x]
            for($x = 0; $x < 400; $x++) {
              $sql = "INSERT INTO layerthreetiles (tileindex, userid, tileid) VALUES (:tileindex, :userid, :tileid)";
              $layerthreetilesInfo = $pdo->prepare($sql);
              $layerthreetilesInfo->execute(['tileindex' => $x, 'userid' => $userId['userid'], 'tileid' => $data['layers'][2]['data'][$x]]);
            }

            $sql = "INSERT INTO playerpos (userid, xpos, ypos) VALUES (:userid, :xpos, :ypos)";
            $playerposInfo = $pdo->prepare($sql);
            $playerposInfo->execute(['userid' => $userId['userid'], 'xpos' => 0, 'ypos' => 0]);

            // echo implode(', ', $data['layers'][2]['data']);

            header("Location: login.php");
            exit();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create New Account</title>
  <link rel="stylesheet" href="css/createAccount.css">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</head>
<body>
  <div>
    <h2>Create Account</h2>
    <form id="createAccountForm" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post"> 
      <label for="fName">First Name:</label><br>
      <input type="text" id="fName" name="fName" required><br>

      <label for="lName">Last Name:</label><br>
      <input type="text" id="lName" name="lName" required><br>

      <label for="newUsername">Username:</label><br>
      <input type="text" id="newUsername" name="newUsername" required><br>

      <label for="newPassword">Password:</label><br>
      <input type="password" id="newPassword" name="newPassword" required><br>

      <label for="dob">Date of Birth:</label><br>
      <input type="date" id="dob" name="dob" required><br><br>

      <button type="submit" class="createAccountButton">Create Account</button>
      <button onclick="window.location.href = 'login.php';" class="createAccountButton">Login</button>
    </form>
    <?php
    // Display error message if exists
    if(isset($error_message)) {
        echo '<p class="error">' . $error_message . '</p>';
    }
    ?>
  </div>
</body>
</html>