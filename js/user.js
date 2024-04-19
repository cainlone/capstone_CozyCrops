let loginForm = document.getElementById("loginForm");
let createAccountForm = document.getElementById("createAccountForm");

if (loginForm) {
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); // prevent default submission

    // get username and password from form
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // placeholder
    // eventually change this part so info will be sent to server-side
    if (username === "username" && password === "password") {
      // successful login
      // not sure where to send just yet
      window.location.href = "index.html";
    } else {
      // failed login
      alert("Invalid username or password. Please try again.");
    }
  });
}

if (createAccountForm) {
  createAccountForm.addEventListener("submit", function(event) {
    event.preventDefault(); // prevent default submission

    // placeholder
    // eventually change this part so info will be sent to server-side
    // for now, just alert the user that the account has been created
    alert("Account created! Please login to start saving progress.");

    // brings user back to login.html to login again to start saving progress
    window.location.href = 'login.html';
  });
}
