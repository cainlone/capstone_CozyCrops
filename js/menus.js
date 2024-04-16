let BUTTON_WIDTH = TILE_SIZE * 3;

// Pause menu
let pauseScreen = new Image();
let greenActive = new Image();
let redActive = new Image();
let pauseImgStr = "images/pause_menu/";
pauseScreen.src = pauseImgStr + "pause_menu.png";
greenActive.src = pauseImgStr + "green_active.png";
redActive.src = pauseImgStr + "red_active.png";

// Start menu
let background = new Image();
let background2 = new Image();
let blueActive = new Image();
let startImgStr = "images/start_menu/";
background.src = startImgStr + "bg.png";
background2.src = startImgStr + "bg2.png";
blueActive.src = startImgStr + "blue_active.png";

// html ui elements
let pauseBtn = document.getElementById("pauseBtn");
let invCanvas = document.getElementById("inventoryCanvas");

let buttons = [
  {
    name: "Play Game!",
    y: TILE_SIZE * 7,
    x: TILE_SIZE * 5,
    hover: false,
    hoverImg: blueActive,
    width: TILE_SIZE * 7,
    height: TILE_SIZE * 2,
  },
  {
    name: "Save",
    y: TILE_SIZE * 4,
    x: TILE_SIZE * 5,
    hover: false,
    hoverImg: greenActive,
  },
  {
    name: "Resume",
    y: TILE_SIZE * 4,
    x: TILE_SIZE * 9,
    hover: false,
    hoverImg: greenActive,
  },
  {
    name: "Exit",
    y: TILE_SIZE * 6,
    x: TILE_SIZE * 7,
    hover: false,
    hoverImg: redActive,
  },
];

let currentHover = null;

function pauseGame() {
  isPaused = true;
  ctx.save();
  drawPauseScreen();

  window.removeEventListener("keydown", update);

  document.getElementById("pauseBtn").onclick = resumeGame;
  canvas.addEventListener("mousemove", onHoverPauseMenu);
  canvas.addEventListener("click", onClickPauseMenu);
}

function resumeGame() {
  canvas.removeEventListener("mousemove", onHoverPauseMenu);
  canvas.removeEventListener("click", onClickPauseMenu);
  document.getElementById("pauseBtn").onclick = pauseGame;

  ctx.restore();
  startGame();
}

function startGame() {
  canvas.removeEventListener("click", onClickStartMenu);
  canvas.removeEventListener("mousemove", onHoverStartMenu);

  // show ui elements
  pauseBtn.style.display = "block";
  invCanvas.style.display = "block";

  if (isPaused) {
    isPaused = false;
    gameLoop();
  }
}

function saveGame() {
  // save game state
  // alert("Game saved!");
}

function startMenu() {
  // hide ui elements
  pauseBtn.style.display = "none";
  invCanvas.style.display = "none";

  // go to start menu
  drawStartMenu();

  // Add event listeners for start button
  canvas.addEventListener("click", onClickStartMenu);
  canvas.addEventListener("mousemove", onHoverStartMenu);
}

function drawStartMenu() {
  ctx.drawImage(background, 0, 0);
  ctx.drawImage(background2, 0, 0);

  if (currentHover) {
    ctx.drawImage(currentHover.hoverImg, currentHover.x, currentHover.y);
  }

  // Text for buttons
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '36px "Press Start 2P"';
  ctx.fillText("Cozy Crops", TILE_SIZE * 8.5, TILE_SIZE * 1.5);
  if (currentHover) ctx.fillStyle = "gray";
  ctx.font = '16px "Press Start 2P"';
  ctx.fillText("Play Game!", TILE_SIZE * 8.5, TILE_SIZE * 8);
}

function onHoverStartMenu(event) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;
  
  if (mouseX > TILE_SIZE * 5 && mouseX < TILE_SIZE * 12 &&
      mouseY > TILE_SIZE * 7 && mouseY < TILE_SIZE * 9) {
    currentHover = buttons[0];
  } else {
    currentHover = null;
  }
  drawStartMenu();
}

function onClickStartMenu(event) {
  if (currentHover) startGame();
}

function drawPauseScreen() {
  ctx.drawImage(pauseScreen, TILE_SIZE * 4, TILE_SIZE * 3);

  // Text for buttons
  buttons.forEach((button) => {
    if (button.name === 'Play Game!') return; // Skip the play game button (only for start menu)
    if (button.hover) {
      ctx.drawImage(button.hoverImg, button.x, button.y);
    }
    ctx.fillStyle = button.hover ? "gray" : "black"; // Change text color on hover
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(button.name, button.x + BUTTON_WIDTH / 2, button.y + TILE_SIZE / 2);
  });
}

function onHoverPauseMenu(event) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;
  updateHoverState(mouseX, mouseY);
}

function updateHoverState(mouseX, mouseY) {
  let wasUpdated = false;
  currentHover = null;

  buttons.forEach((button) => {
    const isHover = mouseX > button.x && mouseX < button.x + BUTTON_WIDTH &&
                    mouseY > button.y && mouseY < button.y + TILE_SIZE;

    if (isHover && !button.hover) {
      button.hover = true;
      currentHover = button; // Update the currentHover
      wasUpdated = true;
    } else if (!isHover && button.hover) {
      button.hover = false;
      wasUpdated = true;
    }
  });

  // Only redraw if an update occurred
  if (wasUpdated) {
    drawPauseScreen();
  }
}

function onClickPauseMenu(event) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;

  buttons.forEach((button) => {
    if (mouseX > button.x && mouseX < button.x + BUTTON_WIDTH &&
        mouseY > button.y && mouseY < button.y + TILE_SIZE) {
      // Call the respective function for each button
      if (button.name === 'Save') {
        saveGame();
      } else if (button.name === 'Resume') {
        resumeGame();
      } else if (button.name === 'Exit') {
        pauseBtn.onclick = pauseGame;
        exitGame();
      }
    }
  });
}

function exitGame() {
  // save game state
  saveGame();
  // alert("Exiting game...");
  // go back to start menu
  startMenu();
}