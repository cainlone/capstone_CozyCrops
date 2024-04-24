let BUTTON_WIDTH = TILE_SIZE * 3;

let pauseScreen = new Image();
let greenActive = new Image();
let redActive = new Image();
let pauseImgStr = "images/pause_menu/";
pauseScreen.src = pauseImgStr + "pause_menu.png";
greenActive.src = pauseImgStr + "green_active.png";
redActive.src = pauseImgStr + "red_active.png";

let background = new Image();
let background2 = new Image();
let blueActive = new Image();
let startImgStr = "images/start_menu/";
background.src = startImgStr + "bg.png";
background2.src = startImgStr + "bg2.png";
blueActive.src = startImgStr + "blue_active.png";

let pauseBtn = document.getElementById("pauseBtn");
let invCanvas = document.getElementById("inventoryCanvas");

let buttons = [
  {
    name: "Play Game!",
    y: canvasMinHeight + TILE_SIZE * 7,
    x: canvasMinWidth + TILE_SIZE * 5,
    hover: false,
    hoverImg: blueActive,
    width: TILE_SIZE * 7,
    height: TILE_SIZE * 2,
  },
  {
    name: "Save",
    y: canvasMinHeight + TILE_SIZE * 4,
    x: canvasMinWidth + TILE_SIZE * 5,
    hover: false,
    hoverImg: greenActive,
  },
  {
    name: "Resume",
    y: canvasMinHeight + TILE_SIZE * 4,
    x: canvasMinWidth + TILE_SIZE * 9,
    hover: false,
    hoverImg: greenActive,
  },
  {
    name: "Exit",
    y: canvasMinHeight + TILE_SIZE * 6,
    x: canvasMinWidth + TILE_SIZE * 7,
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
  drawBalloonCount = 0;
  startGame();
}

function startGame() {
  canvas.removeEventListener("click", onClickStartMenu);
  canvas.removeEventListener("mousemove", onHoverStartMenu);
  drawBalloonCount = 0;

  pauseBtn.style.display = "block";
  invCanvas.style.display = "block";

  if (isPaused) {
    isPaused = false;
    gameLoop();
  }
}

function saveGame() {
  mapData.layers.forEach((layer) => {
    if (layer.id === 3) {
      layer.data.forEach((tileIndex, index) => {
        dbData.layerthreetilesData[index].tileid = layer.data[index];
      });
    }
  });

  let userId = dbData.userId;
  let layerThree = dbData.layerthreetilesData;
  let spriteX = sprite.x;
  let spriteY = sprite.y;
  let inventory = this.inventory.items;
  let inventoryLength = inventory.length;

  let data = {
    userId,
    layerThree,
    spriteX,
    spriteY,
    inventory,
    inventoryLength,
  };

  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
    }
  };

  xhttp.open("POST", "storeData.php", true);

  xhttp.setRequestHeader("Content-type", "application/json");

  xhttp.send(JSON.stringify(data));
}

function startMenu() {
  pauseBtn.style.display = "none";
  invCanvas.style.display = "none";

  drawStartMenu();

  canvas.addEventListener("click", onClickStartMenu);
  canvas.addEventListener("mousemove", onHoverStartMenu);
}

function drawStartMenu() {
  ctx.drawImage(background, canvasMinWidth, canvasMinHeight);
  ctx.drawImage(background2, canvasMinWidth, canvasMinHeight);

  if (currentHover) {
    ctx.drawImage(
      currentHover.hoverImg,
      canvasMinWidth + currentHover.x,
      canvasMinHeight + currentHover.y
    );
  }

  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '36px "Press Start 2P"';
  ctx.fillText(
    "Cozy Crops",
    canvasMinWidth + TILE_SIZE * 8.5,
    canvasMinHeight + TILE_SIZE * 1.5
  );
  if (currentHover) ctx.fillStyle = "gray";
  ctx.font = '16px "Press Start 2P"';
  ctx.fillText(
    "Play Game!",
    canvasMinWidth + TILE_SIZE * 8.5,
    canvasMinHeight + TILE_SIZE * 8
  );
}

function onHoverStartMenu(event) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;

  if (
    mouseX > TILE_SIZE * 5 &&
    mouseX < TILE_SIZE * 12 &&
    mouseY > TILE_SIZE * 7 &&
    mouseY < TILE_SIZE * 9
  ) {
    currentHover = buttons[0];
  } else {
    currentHover = null;
  }
  drawStartMenu();
}

function onClickStartMenu(event) {
  if (currentHover) {
    startGame();

    inventory.activeItem = 0;
    inventory.useActiveItem();
  }
}

function drawPauseScreen() {
  ctx.drawImage(
    pauseScreen,
    canvasMinWidth + TILE_SIZE * 4,
    canvasMinHeight + TILE_SIZE * 3
  );

  buttons.forEach((button) => {
    if (button.name === "Play Game!") return;
    if (button.hover) {
      ctx.drawImage(
        button.hoverImg,
        canvasMinWidth + button.x,
        canvasMinHeight + button.y
      );
    }
    ctx.fillStyle = button.hover ? "gray" : "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(
      button.name,
      canvasMinWidth + (button.x + BUTTON_WIDTH / 2),
      canvasMinHeight + (button.y + TILE_SIZE / 2)
    );
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
    const isHover =
      mouseX > button.x &&
      mouseX < button.x + BUTTON_WIDTH &&
      mouseY > button.y &&
      mouseY < button.y + TILE_SIZE;

    if (isHover && !button.hover) {
      button.hover = true;
      currentHover = button;
      wasUpdated = true;
    } else if (!isHover && button.hover) {
      button.hover = false;
      wasUpdated = true;
    }
  });

  if (wasUpdated) {
    drawPauseScreen();
  }
}

function onClickPauseMenu(event) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = event.clientX - rect.left;
  let mouseY = event.clientY - rect.top;

  buttons.forEach((button) => {
    if (
      mouseX > button.x &&
      mouseX < button.x + BUTTON_WIDTH &&
      mouseY > button.y &&
      mouseY < button.y + TILE_SIZE
    ) {
      if (button.name === "Save") {
        saveGame();
      } else if (button.name === "Resume") {
        resumeGame();
      } else if (button.name === "Exit") {
        pauseBtn.onclick = pauseGame;
        exitGame();
      }
    }
  });
}

function exitGame() {
  saveGame();

  document.getElementById("currentItem").innerHTML = "";
  startMenu();
}
