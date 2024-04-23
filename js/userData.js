// simple table to store user data
let users = [];

//user object structure 
function User(id, username, password) {
  this.id = id;
  this.username = username;
  this.password = password;
  //user progress
  this.progress = {};
}

//add a new user to table
function addUser(username, password) {
  //unique ID for new user
  let id = users.length + 1;

  let newUSer = new User(id, username, password);

  users.push(newUSer);
}

//save user progress
function saveProgress(userId, cropData) {
  // find the user in the table
  let user = users.find(user => user.id === userId);
  if (user) {
    //update the progress data for user
    user.progress = cropData;
    console.log(`Progress saved for user ${userId}`);
  } else {
    console.error(`User ${userId} not found`);
  }
}

function loadProgress(userId) {
  // find the user in table
  let user = users.find(user => user.id === userId);
  if (user) {
    console.log(`Progress loaded for user ${userId}`);
    return user.progress;
  } else {
    console.error(`User ${userId} not found`);
    return null;
  }
}

//example
saveProgress(1, "level: 5. score: 100");
addUser("user1", "password");
addUser("user2", "password2");



let userProgress = loadProgress(1);
console.log(users);