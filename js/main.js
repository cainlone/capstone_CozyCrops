let inventory;

window.onload = function() {
  inventory = new Inventory('inventoryCanvas');
};

let TILE_SIZE = 48;

let map = {
  jsonPath: "js/sample.json",
  height: 0,
  width: 0,
};

let balloonTsxPath = "../images/balloon.tsx";

let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let canvasMaxWidth = canvas.width;
let canvasMaxHeight = canvas.height;
let canvasMinWidth = 0;
let canvasMinHeight = 0;

let tileLayerArray = [];
let eventTileArray = [];
let frameDurations = [];
let eventTileIds = [];
let cropTiles = [];
let cropTileOptions = [242, 234, 198, 210, 222, 235, 199, 211, 223];
let carrotTiles = [];
let carrotTileOptions = [242, 234, 198, 210, 222];
let cabbageTiles = [];
let cabbageTileOptions = [242, 235, 199, 211, 223];
let layerThree = [];

let sprite = {
  x: 0,
  y: 0,
  width: TILE_SIZE,
  height: TILE_SIZE,
  speed: 2,
};

let balloon = {
  x: -1000000,
  y: -1000000,
};

let mapData;
let tilesetImages;
let balloonImage;
let isEvent;
let eventTileIndex;

let drawBalloonCount = 0;
let drawLayerCount = 1;

let cropStage = 0;
let isCrop;
let cropTileIndex;

// Timer needs to either be paused when the game is closed meaning it needs to be saved, or the time passed between when the game is open from when it was closed needs to be calculated. When they start playing for the first time, the timer could be set to the time on their device and saved in a variable. Then be constantly setting the device time into a second variable and compare the two to see how much time has passed. The first variable will have to always stay the same even after they close and open the game. Whether or not it's their first time playing will have to be stored and retrieved. Run a check on it to decide whether or not to set the variable. If not, it must already exist, so retrieve it.

function extractImageSource(tsxContent) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(tsxContent, "text/xml");
  let imageElement = xmlDoc.querySelector("image");
  return imageElement.getAttribute("source");
}

function drawMap() {

  mapData.layers.forEach((layer) => {
    if (layer.type === "tilelayer" && (layer.id === 1 || layer.id === 2)) {
      drawLayer(layer);
    }
  });

  drawSprite();

  mapData.layers.forEach((layer) => {
    if (layer.type === "tilelayer" && layer.id !== 1 && layer.id !== 2) {
      drawLayer(layer);
    }
  });
}

function drawLayer(layer) {
  layer.data.forEach((tileIndex, index) => {
    let tileLayerId = layer.id;

    if (tileIndex !== 0 && layer.visible == true) {
      let tilesetIndex = findTilesetIndex(tileIndex, mapData.tilesets);
      let tileset = mapData.tilesets[tilesetIndex];
      let tilesetImage = tilesetImages[tilesetIndex];
      let tileX =
        ((tileIndex - tileset.firstgid) % (tilesetImage.width / TILE_SIZE)) *
        TILE_SIZE;
      let tileY =
        Math.floor(
          (tileIndex - tileset.firstgid) / (tilesetImage.width / TILE_SIZE)
        ) * TILE_SIZE;
      let destX = (index % layer.width) * TILE_SIZE;
      let destY = Math.floor(index / layer.width) * TILE_SIZE;

      if (tileLayerId !== 5 && tileLayerId !== 6) {
        tileLayerArray[index] = tileLayerId;
      }

      if(tileLayerId == 3) {
        eventTileIds[index] = layer.data[index];
        if(cropTileOptions.includes(eventTileIds[index])) {
          isCrop = true;

        } else {
          isCrop = false;
        }

        cropTiles[index] = isCrop;
      } else if (tileLayerId != 5 && tileLayerId != 6) {
        eventTileIds[index] = 0;
      }

      if (tileLayerId === 5) {
        eventTileArray[index] = true;
      } else {
        eventTileArray[index] = false;
      }

      ctx.drawImage(
        tilesetImage,
        tileX,
        tileY,
        TILE_SIZE,
        TILE_SIZE,
        destX,
        destY,
        TILE_SIZE,
        TILE_SIZE
      );
    }

    if(drawLayerCount == 1 && tileLayerId == 3) {
      layerThree = layer.data;
    }

    if (tileLayerId == 5 && !eventTileArray[index]) {
      eventTileIds[index] = 0
      cropTiles[index] = false;
    }

  });
}

function findTilesetIndex(tileIndex, tilesets) {
  for (let i = tilesets.length - 1; i >= 0; i--) {
    if (tileIndex >= tilesets[i].firstgid) {
      return i;
    }
  }
  return 0;
}

function fetchJson(jsonPath) {
  fetch(jsonPath)
    .then((response) => response.json())
    .then((data) => {
      mapData = data;
      map.height = mapData.height * TILE_SIZE;
      map.width = mapData.width * TILE_SIZE;
      let tilesetPromises = mapData.tilesets.map(async (tileset) => {
        let response = await fetch(tileset.source);
        let tsxContent = await response.text();
        let tilesetImageSrc = extractImageSource(tsxContent);
        let tilesetImage = new Image();
        tilesetImage.src = tilesetImageSrc;
        return await new Promise((resolve, reject) => {
          tilesetImage.onload = () => resolve(tilesetImage);
          tilesetImage.onerror = (error) => reject(error);
        });
      });

      Promise.all(tilesetPromises)
        .then((images) => {
          tilesetImages = images;
          fetch(balloonTsxPath)
            .then((response) => response.text())
            .then((tsxContent) => {
              let parser = new DOMParser();
              let xmlDoc = parser.parseFromString(tsxContent, "text/xml");
              let frames = xmlDoc.querySelectorAll("animation frame");
              frames.forEach((frame) => {
                frameDurations.push(parseInt(frame.getAttribute("duration")));
              });
              // Load balloon image
              let imageSource = extractImageSource(tsxContent);
              balloonImage = new Image();
              balloonImage.src = imageSource;
              balloonImage.onload = () => {
                gameLoop();
              };
            })
            .catch((error) =>
              console.error("Error loading balloon image:", error)
            );
        })
        .catch((error) => console.error("Error loading tilesets:", error));
    })
    .catch((error) => console.error("Error loading map:", error));
}

let targetPosition = { x: 0, y: 0 };

function updatePosition() {
  let dx = targetPosition.x - sprite.x;
  let dy = targetPosition.y - sprite.y;
  let vx = Math.sign(dx) * Math.min(Math.abs(dx), sprite.speed);
  let vy = Math.sign(dy) * Math.min(Math.abs(dy), sprite.speed);
  sprite.x += vx;
  sprite.y += vy;

  window.removeEventListener("keydown", update);

  if (sprite.x === targetPosition.x && sprite.y === targetPosition.y) {
    return;
  }

  requestAnimationFrame(updatePosition);
}

function update(event) {
  let yOrX;
  let upOrDown;
  let facing;
  let tileIndexX = Math.floor(targetPosition.x / TILE_SIZE);
  let tileIndexY = Math.floor(targetPosition.y / TILE_SIZE);

  switch (event.key) {
    case "ArrowUp":
    case "w":
      if (!(targetPosition.y <= canvasMinHeight)) {
        targetPosition.y -= TILE_SIZE;
        yOrX = true;
        upOrDown = false;
        facing = "up";
      } else if (!(targetPosition.y <= 0)) {
        ctx.translate(0, TILE_SIZE);
        canvasMinHeight -= TILE_SIZE;
        canvasMaxHeight -= TILE_SIZE;
        targetPosition.y -= TILE_SIZE;
        yOrX = true;
        upOrDown = false;
        facing = "up";
      }
      isEvent = false;
      break;
    case "ArrowDown":
    case "s":
      if (!(targetPosition.y + TILE_SIZE >= canvasMaxHeight)) {
        targetPosition.y += TILE_SIZE;
        yOrX = true;
        upOrDown = true;
        facing = "down";
      } else if (!(targetPosition.y + TILE_SIZE >= map.height)) {
        ctx.translate(0, -TILE_SIZE);
        canvasMaxHeight += TILE_SIZE;
        canvasMinHeight += TILE_SIZE;
        targetPosition.y += TILE_SIZE;
        yOrX = true;
        upOrDown = true;
        facing = "down";
      }
      isEvent = false;
      break;
    case "ArrowLeft":
    case "a":
      if (!(targetPosition.x <= canvasMinWidth)) {
        targetPosition.x -= TILE_SIZE;
        yOrX = false;
        upOrDown = false;
        facing = "left";
      } else if (!(targetPosition.x <= 0)) {
        ctx.translate(TILE_SIZE, 0);
        canvasMaxWidth -= TILE_SIZE;
        canvasMinWidth -= TILE_SIZE;
        targetPosition.x -= TILE_SIZE;
        yOrX = false;
        upOrDown = false;
        facing = "left";
      }
      isEvent = false;
      break;
    case "ArrowRight":
    case "d":
      if (!(targetPosition.x + TILE_SIZE >= canvasMaxWidth)) {
        targetPosition.x += TILE_SIZE;
        yOrX = false;
        upOrDown = true;
        facing = "right";
      } else if (!(targetPosition.x + TILE_SIZE >= map.width)) {
        ctx.translate(-TILE_SIZE, 0);
        canvasMaxWidth += TILE_SIZE;
        canvasMinWidth += TILE_SIZE;
        targetPosition.x += TILE_SIZE;
        yOrX = false;
        upOrDown = true;
        facing = "right";
      }
      isEvent = false;
      break;
    case "Enter":
      if (isEvent) {
        eventPicker(eventTileIndex);
      }
  }

  tileIndexX = Math.floor(targetPosition.x / TILE_SIZE);
  tileIndexY = Math.floor(targetPosition.y / TILE_SIZE);

  let tileLayerId = getTileLayerId(tileIndexX, tileIndexY);

  if (tileLayerId === 3) {
    if (yOrX && upOrDown) {
      targetPosition.y -= TILE_SIZE;
    } else if (yOrX && !upOrDown) {
      targetPosition.y += TILE_SIZE;
    } else if (!yOrX && upOrDown) {
      targetPosition.x -= TILE_SIZE;
    } else {
      targetPosition.x += TILE_SIZE;
    }

    tileIndexX = Math.floor(targetPosition.x / TILE_SIZE);
    tileIndexY = Math.floor(targetPosition.y / TILE_SIZE);
  }

  if (
    (getEventTile(tileIndexX - 1, tileIndexY) && facing == "left") ||
    (getEventTile(tileIndexX, tileIndexY - 1) && facing == "up") ||
    (getEventTile(tileIndexX + 1, tileIndexY) && facing == "right") ||
    (getEventTile(tileIndexX, tileIndexY + 1) && facing == "down")
  ) {
    if (drawBalloonCount == 0) {
      drawBalloon();
      drawBalloonCount = 1;
    }

    balloon.x = targetPosition.x;
    balloon.y = targetPosition.y - TILE_SIZE;

    isEvent = true;
    if (facing == "left") {
      eventTileIndex = tileIndexY * mapData.width + (tileIndexX - 1);
    } else if (facing == "up") {
      eventTileIndex = (tileIndexY - 1) * mapData.width + tileIndexX;
    } else if (facing == "right") {
      eventTileIndex = tileIndexY * mapData.width + (tileIndexX + 1);
    } else {
      eventTileIndex = (tileIndexY + 1) * mapData.width + tileIndexX;
    }

  } else {
    balloon.x = -1000000;
    balloon.y = -1000000;
  }

  updatePosition();
}

function getTileLayerId(tileIndexX, tileIndexY) {
  let tileIndex = tileIndexY * mapData.width + tileIndexX;
  return tileLayerArray[tileIndex];
}

function getEventTile(tileIndexX, tileIndexY) {
  let tileIndex = tileIndexY * mapData.width + tileIndexX;
  return eventTileArray[tileIndex];
}

function isCropTile(tileIndex) {
  return cropTiles[tileIndex];
}

function getCropTileId(tileIndex) {
  return eventTileIds[tileIndex];
}

function changeTile(tileIndex, newTileId) {
  mapData.layers.forEach((layer) => {
    if(layer.id == 3) {
      layer.data[tileIndex] = newTileId;
    }
  });
}

function drawSprite() {
  ctx.fillStyle = "red";
  ctx.fillRect(sprite.x, sprite.y, sprite.width, sprite.height);
}

function drawBalloon() {
  let currentFrameIndex = 0;
  let frameDuration = frameDurations[currentFrameIndex];
  let lastFrameChangeTime = Date.now();

  function animate() {
    let now = Date.now();
    if (now - lastFrameChangeTime > frameDuration) {
      currentFrameIndex = (currentFrameIndex + 1) % frameDurations.length;
      frameDuration = frameDurations[currentFrameIndex];
      lastFrameChangeTime = now;
    }

    ctx.drawImage(
      balloonImage,
      currentFrameIndex * TILE_SIZE,
      0,
      TILE_SIZE,
      TILE_SIZE,
      balloon.x,
      balloon.y,
      TILE_SIZE,
      TILE_SIZE
    );

    requestAnimationFrame(animate);
  }

  animate();
}

function gameLoop() {
  currentTime = Date.now();
  drawMap();
  drawLayerCount = 0;
  window.addEventListener("keydown", update);
  requestAnimationFrame(gameLoop);
}

// This will obviously grow as we add events.
function eventPicker(tileIndex) {
  let startTime;

  cropTileIndex = getCropTileId(tileIndex);

  // eventually change "inventory.activeItem == 0" to something like "inventory.activeItemName == 'seeds'"

  if(isCropTile(tileIndex)) {
    if(cropTileIndex == 242 && inventory.activeItem == 0) {
      plantCarrot(tileIndex);
    } else if(cropTileIndex == 242 && inventory.activeItem == 1) {
      plantCabbage(tileIndex);
    } else if(cropTileIndex == 234 && inventory.activeItem == 1) {
      startTime = Date.now();
      checkTime(startTime, "waterCarrot", tileIndex);
      // waterCarrot(tileIndex);
    } else if(cropTileIndex == 235 && inventory.activeItem == 1) {
      startTime = Date.now();
      checkTime(startTime, "waterCabbage", tileIndex);
    }
  } else {
    signEvent();
  }
}

// For simple events like this, we can probably put the code for it in the switch case above instead of in their own functions. This is just to show what we'd do for more complicated functions.
function signEvent() {
  console.log("work please");
  console.log(layerThree)
}

function plantCarrot(tileIndex) {
  console.log(tileIndex)
  changeTile(tileIndex, 234);
}

function plantCabbage(tileIndex) {
  changeTile(tileIndex, 235)
}

function waterCarrot(tileIndex) {
  changeTile(tileIndex, 198);
}

function waterCabbage(tileIndex) {
  changeTile(tileIndex, 199);
}

function checkTime(startTime, name, tileIndex) {
  let currentTime = Date.now();
  console.log("the fuck " + startTime);
  console.log("the hell " + currentTime - startTime)

  if(currentTime - startTime >= 5000) {
    if(name === "waterCarrot") {
      waterCarrot(tileIndex);
    } else if(name === "waterCabbage") {
      waterCabbage(tileIndex);
    }
    cancelAnimationFrame(checkTime);
  } else {
    requestAnimationFrame(function() {
      checkTime(startTime, name, tileIndex)
    })
  }

}

fetchJson(map.jsonPath);
