<?php
session_start();

include 'dbConnect.php';
include 'sanitize.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	$username = trim(sanitizeString(INPUT_POST, 'username'));
	$password = trim(sanitizeString(INPUT_POST, 'password'));

	$loginInfo = $pdo->prepare("SELECT * FROM logininfo WHERE BINARY username = :username");
	$loginInfo->execute(['username' => $username]);
	$user = $loginInfo->fetch(PDO::FETCH_ASSOC);

	if ($user && password_verify($password, $user['password'])) {
		$_SESSION['loggedin'] = true;
		$_SESSION['username'] = $user['username'];
		$_SESSION['userid'] = $user['userid'];

		header("Location: index.php");
		exit();
	} else {
		$error_message = "Could not find account. Double check username and password.";
	}
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Login</title>
	<link rel="stylesheet" href="css/login.css">
	<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</head>

<body>
	<div>
		<h2>Login</h2>
		<form id="loginForm" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
			<label for="username">Username:</label><br>
			<input type="text" id="username" name="username" required><br>

			<label for="password">Password:</label><br>
			<input type="password" id="password" name="password" required><br>

			<input type="submit" class="submitButton" value="Login">
			<button type="button" class="submitButton" onclick="window.location.href = 'createAccount.php';">Create Account</button>

		</form>
		<?php
		if (isset($error_message)) {
			echo '<p class="error">' . $error_message . '</p>';
		}
		?>
	</div>
</body>

</html>