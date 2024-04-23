<?php
session_start();

include 'dbConnect.php';
include 'sanitize.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
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
	if ($fName == "" || $lName == "" || $newUsername == "" || $newPassword == "") {
		$error_message = "Please fill out all information and resubmit.";
	} else {
		if (strlen($newUsername) < 4) {
			$error_message = "Username must be at least 4 characters.";
		} else {
			if ($age < 13) {
				$error_message = "You must be 13 years or older to create an account.";
			} else {
				$loginInfo = $pdo->prepare("SELECT * FROM logininfo WHERE username = :username");
				$loginInfo->execute(['username' => $newUsername]);
				$existingUser = $loginInfo->fetch(PDO::FETCH_ASSOC);

				if ($existingUser) {
					$error_message = "Username already exists. Please choose a different username.";
				} else {
					$pdo->beginTransaction();

					$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
					$loginInfo = $pdo->prepare("INSERT INTO logininfo (username, password) VALUES (:username, :password)");
					$loginInfo->execute(['username' => $newUsername, 'password' => $hashedPassword]);

					$loginInfo = $pdo->prepare("SELECT * FROM logininfo WHERE username = :username");
					$loginInfo->execute(['username' => $newUsername]);
					$userId = $loginInfo->fetch(PDO::FETCH_ASSOC);

					$inventoryInfo = $pdo->prepare("INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)");
					$inventoryInfo = $pdo->prepare("INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)");
					$inventoryInfo = $pdo->prepare("INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)");
					$inventoryInfo = $pdo->prepare("INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)");
					$inventoryInfo = $pdo->prepare("INSERT INTO inventory (userid, name, quantity, inventoryid) VALUES (:userid, :name, 1, :inventoryid)");
					$playerposInfo = $pdo->prepare("INSERT INTO playerpos (userid, xpos, ypos) VALUES (:userid, :xpos, :ypos)");

					$inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Watering Can", 'inventoryid' => 0]);
					$inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Carrot", 'inventoryid' => 1]);
					$inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Cabbage", 'inventoryid' => 2]);
					$inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Grape", 'inventoryid' => 3]);
					$inventoryInfo->execute(['userid' => $userId['userid'], 'name' => "Wheat", 'inventoryid' => 4]);
					$playerposInfo->execute(['userid' => $userId['userid'], 'xpos' => 1152, 'ypos' => 2352]);

					$jsonData = file_get_contents("js/map.json");
					$data = json_decode($jsonData, true);

					for ($x = 0; $x < 2500; $x++) {
						$sql = "INSERT INTO layerthreetiles (tileindex, userid, tileid) VALUES (:tileindex, :userid, :tileid)";
						$layerthreetilesInfo = $pdo->prepare($sql);
						$layerthreetilesInfo->execute(['tileindex' => $x, 'userid' => $userId['userid'], 'tileid' => $data['layers'][2]['data'][$x]]);
					}

					$pdo->commit();

					header("Location: login.php");
					exit();
				}
			}
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
	<script>
		function disableForm() {
			var form = document.getElementById("createAccountForm");
			var elements = form.elements;
			for (var i = 0; i < elements.length; i++) {
				elements[i].disabled = false;
			}
			var buttons = document.querySelectorAll("button");
			buttons.forEach(function(button) {
				button.disabled = true;
			});
		}
	</script>
</head>

<body>
	<div>
		<h2>Create Account</h2>
		<form id="createAccountForm" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" onsubmit="disableForm()">
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
		if (isset($error_message)) {
			echo '<p class="error">' . $error_message . '</p>';
		}
		?>
	</div>
</body>

</html>