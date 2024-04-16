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
let eventNumberArray = [];
let totalEvents = 0;
let frameDurations = [];

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
let eventTileNumber;

let drawCount = 0;
let drawLayerCount = 1;
let isPaused = true;

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
      let tileLayerId = layer.id;

      if (tileLayerId !== 5 && tileLayerId !== 6) {
        tileLayerArray[index] = tileLayerId;
      }

      if (tileLayerId === 5) {
        eventTileArray[index] = true;
      } else {
        eventTileArray[index] = false;
      }

      if (drawLayerCount == 1 && eventTileArray[index]) {
        totalEvents += 1;
        eventNumberArray[index] = totalEvents;
      } else {
        if (drawLayerCount == 1) {
          eventNumberArray[index] = 0;
        }
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
                startMenu();
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

  console.log(event.key);

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
        eventPicker(eventTileNumber);
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
    if (drawCount == 0) {
      drawBalloon();
      drawCount = 1;
    }

    balloon.x = targetPosition.x;
    balloon.y = targetPosition.y - TILE_SIZE;

    isEvent = true;
    if (getEventNumber(tileIndexX - 1, tileIndexY) != 0 && facing == "left") {
      eventTileNumber = getEventNumber(tileIndexX - 1, tileIndexY);
    } else if (
      getEventNumber(tileIndexX, tileIndexY - 1) != 0 &&
      facing == "up"
    ) {
      eventTileNumber = getEventNumber(tileIndexX, tileIndexY - 1);
    } else if (
      getEventNumber(tileIndexX + 1, tileIndexY) != 0 &&
      facing == "right"
    ) {
      eventTileNumber = getEventNumber(tileIndexX + 1, tileIndexY);
    } else {
      eventTileNumber = getEventNumber(tileIndexX, tileIndexY + 1);
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

function getEventNumber(tileIndexX, tileIndexY) {
  let tileIndex = tileIndexY * mapData.width + tileIndexX;
  return eventNumberArray[tileIndex];
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
  if (!isPaused) {
    drawMap();
    drawLayerCount = 0;
    window.addEventListener("keydown", update);
    requestAnimationFrame(gameLoop);
  }
}

// This will obviously grow as we add events.
function eventPicker(eventNumber) {
  switch (eventNumber) {
    case 1:
      signEvent();
  }
}

// For simple events like this, we can probably put the code for it in the switch case above instead of in their own functions. This is just to show what we'd do for more complicated functions.
function signEvent() {
  console.log("work please");
}

fetchJson(map.jsonPath);