let BUTTON_WIDTH = TILE_SIZE * 3;

let pauseScreen = new Image();
let greenActive = new Image();
let redActive = new Image();
let pauseImgStr = "images/pause_menu/";
pauseScreen.src = pauseImgStr + "pause_menu.png";
greenActive.src = pauseImgStr + "green_active.png";
redActive.src = pauseImgStr + "red_active.png";

let buttons = [
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
  if (isPaused) {
    isPaused = false;
    gameLoop();
  }
}

function saveGame() {
  // save game state
  alert("Game saved!");
}

function startMenu() {
  // go back to start menu
  drawStartMenu();
}

function drawStartMenu() {}

function drawPauseScreen() {
  ctx.drawImage(pauseScreen, TILE_SIZE * 4, TILE_SIZE * 3);

  // Text for buttons
  buttons.forEach((button) => {
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
        exitGame();
      }
    }
  });
}

function exitGame() {
  // save game state
  saveGame();
  alert("Exiting game...");
  // go back to start menu
  startMenu();
}