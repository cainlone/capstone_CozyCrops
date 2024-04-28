var dbData;
var inventory;
let playerPosData;
let inventoryData;

let TILE_SIZE = 48;

let map = {
  jsonPath: "./js/map.json",
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
let loadingCanvasMaxWidth = 0;
let loadingCanvasMaxHeight = 0;

let rightButton = document.getElementById("rightButton");
let leftButton = document.getElementById("leftButton");
let upButton = document.getElementById("upButton");
let downButton = document.getElementById("downButton");
let enterButton = document.getElementById("enterButton");

let tileLayerArray = [];
let eventTileArray = [];
let frameDurations = [];
let eventTileIds = [];
let cropTiles = [];
let cropTileOptions = [
  242, 234, 235, 236, 237, 198, 199, 200, 201, 210, 211, 212, 213, 222, 223,
  224, 225,
];
let layerThree = [];
let eventInUse = [];

let sprite = {
  x: 1152,
  y: 2352,
  width: TILE_SIZE,
  height: TILE_SIZE,
  speed: 2,
};

let targetPosition = { x: sprite.x, y: sprite.y };

let balloon = {
  x: -1000000,
  y: -1000000,
};

let mapData;
let tilesetImages;
let balloonImage;
let isEvent;
let eventTileIndex;
let facing;
let loadingGame = true;

let drawBalloonCount = 0;
let drawLayerCount = 1;
let isPaused = true;

let cropStage = 0;
let isCrop;

document.addEventListener("DOMContentLoaded", function () {
  if (userId) {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "fetchData.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        dbData = JSON.parse(xhr.responseText);
        playerPosData = dbData.playerPosData;
        inventoryData = dbData.inventoryData;

        loadingCanvasMaxWidth = playerPosData[0].xpos + canvas.width / 2;
        loadingCanvasMaxHeight = playerPosData[0].ypos + canvas.height / 2;

        inventory = new Inventory("inventoryCanvas");

        for (x = 0; x < inventoryData.length; x++) {
            for (y = 0; y < items.length; y++) {
                if (items[y].name == inventoryData[x].name) {
                    inventory.add(items[y]);
                    items[y].quantity = inventoryData[x].quantity;
                }
            }
        }

        inventory.drawEmptyInventory();
      } else {
        console.error("Request failed with status:", xhr.status);
      }
    };

    xhr.onerror = function () {
      console.error("Request failed");
    };

    var formData = "userId=" + encodeURIComponent(userId);
    xhr.send(formData);
  } else {
    console.error("User ID not set");
  }
});

function extractImageSource(tsxContent) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(tsxContent, "text/xml");
  let imageElement = xmlDoc.querySelector("image");
  return imageElement.getAttribute("source");
}

function drawMap() {
  if (loadingGame) {
    while (canvasMaxWidth <= loadingCanvasMaxWidth && !(canvasMaxWidth >= map.width)) {
      canvasMaxWidth += TILE_SIZE;
      canvasMinWidth += TILE_SIZE;
      ctx.translate(-TILE_SIZE, 0);
    }

    while (canvasMaxHeight <= loadingCanvasMaxHeight && !(canvasMaxHeight >= map.height)) {
      canvasMaxHeight += TILE_SIZE;
      canvasMinHeight += TILE_SIZE;
      ctx.translate(0, -TILE_SIZE);
    }
    loadingGame = false;
  }

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

      if (tileLayerId == 3) {
        eventTileIds[index] = layer.data[index];
        if (cropTileOptions.includes(eventTileIds[index])) {
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

    if (drawLayerCount == 1 && tileLayerId == 3) {
      sprite.x = playerPosData[0].xpos;
      sprite.y = playerPosData[0].ypos;
      targetPosition = { x: sprite.x, y: sprite.y };
      layer.data[index] = dbData.layerthreetilesData[index].tileid;
      layerThree = layer.data;
      eventInUse[index] = false;
    }

    if (tileLayerId == 5 && !eventTileArray[index]) {
      eventTileIds[index] = 0;
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
      
      while (loadingCanvasMaxWidth > map.width) {
        loadingCanvasMaxWidth -= TILE_SIZE;
      }
      while (loadingCanvasMaxHeight > map.height) {
        loadingCanvasMaxHeight -= TILE_SIZE;
      }

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

function updatePosition(translate, yOrX, upOrDown) {
  let dx = targetPosition.x - sprite.x;
  let dy = targetPosition.y - sprite.y;
  let vx = Math.sign(dx) * Math.min(Math.abs(dx), sprite.speed);
  let vy = Math.sign(dy) * Math.min(Math.abs(dy), sprite.speed);
  sprite.x += vx;
  sprite.y += vy;

    if (translate) {
        if (!yOrX && upOrDown) {
        ctx.translate(-vx, 0);
        canvasMaxWidth += vx;
        canvasMinWidth += vx;
        } else if (!yOrX && !upOrDown) {
        ctx.translate(-vx, 0);
        canvasMaxWidth += vx;
        canvasMinWidth += vx;
        } else if (yOrX && !upOrDown) {
        ctx.translate(0, -vy);
        canvasMinHeight += vy;
        canvasMaxHeight += vy;
        } else {
        ctx.translate(0, -vy);
        canvasMaxHeight += vy;
        canvasMinHeight += vy;
        }
    }

  window.removeEventListener("keydown", update);
  rightButton.removeEventListener("mousedown", update);
  leftButton.removeEventListener("mousedown", update);
  upButton.removeEventListener("mousedown", update);
  downButton.removeEventListener("mousedown", update);
  enterButton.removeEventListener("mousedown", update);

  if (sprite.x === targetPosition.x && sprite.y === targetPosition.y) {
    return;
  }

  requestAnimationFrame(function() {
    updatePosition(translate, yOrX, upOrDown);
  });
}

function update(event) {
  let yOrX;
  let upOrDown;
  let tileIndexX = Math.floor(targetPosition.x / TILE_SIZE);
  let tileIndexY = Math.floor(targetPosition.y / TILE_SIZE);
  let translate = false;

  document.getElementById("text").innerHTML = "";

  switch (event.key || event.target.id) {
    case "ArrowUp":
    case "w":
    case "upButton":
      if (
        !(canvasMinHeight <= 0) &&
        sprite.y + TILE_SIZE <= canvasMaxHeight - canvas.height / 2
      ) {
        translate = true;
        targetPosition.y -= TILE_SIZE;
        yOrX = true;
        upOrDown = false;
        facing = "up";
      } else if (!(targetPosition.y <= 0)) {
        translate = false;
        targetPosition.y -= TILE_SIZE;
        yOrX = true;
        upOrDown = false;
        facing = "up";
      }
      isEvent = false;
      break;
    case "ArrowDown":
    case "s":
    case "downButton":
      if (
        !(canvasMaxHeight >= map.height) &&
        sprite.y >= canvasMaxHeight - canvas.height / 2
      ) {
        translate = true;
        targetPosition.y += TILE_SIZE;
        yOrX = true;
        upOrDown = true;
        facing = "down";
      } else if (!(targetPosition.y + TILE_SIZE >= map.height)) {
        translate = false;
        targetPosition.y += TILE_SIZE;
        yOrX = true;
        upOrDown = true;
        facing = "down";
      }
      isEvent = false;
      break;
    case "ArrowLeft":
    case "a":
    case "leftButton":
      if (
        !(canvasMinWidth <= 0) &&
        sprite.x + TILE_SIZE <= canvasMaxWidth - canvas.width / 2
      ) {
        translate = true;
        targetPosition.x -= TILE_SIZE;
        yOrX = false;
        upOrDown = false;
        facing = "left";
      } else if (!(targetPosition.x <= 0)) {
        translate = false;
        targetPosition.x -= TILE_SIZE;
        yOrX = false;
        upOrDown = false;
        facing = "left";
      }
      isEvent = false;
      break;
    case "ArrowRight":
    case "d":
    case "rightButton":
      if (
        !(canvasMaxWidth >= map.width) &&
        sprite.x >= canvasMaxWidth - canvas.width / 2
      ) {
        translate = true;
        targetPosition.x += TILE_SIZE;
        yOrX = false;
        upOrDown = true;
        facing = "right";
      } else if (!(targetPosition.x + TILE_SIZE >= map.width)) {
        translate = false;
        targetPosition.x += TILE_SIZE;
        yOrX = false;
        upOrDown = true;
        facing = "right";
      }
      isEvent = false;
      break;
    case "Enter":
    case "enterButton":
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

  updatePosition(translate, yOrX, upOrDown);
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

function getEventTileId(tileIndex) {
  return eventTileIds[tileIndex];
}

function changeTile(tileIndex, newTileId) {
  mapData.layers.forEach((layer) => {
    if (layer.id == 3) {
      layer.data[tileIndex] = newTileId;
      eventInUse[tileIndex] = false;
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

    if (isPaused) {
      cancelAnimationFrame(animate);
    } else {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

function gameLoop() {
  if (!isPaused) {
    drawMap();
    drawLayerCount = 0;
    if (
      inventory.items[inventory.activeItem] != undefined &&
      inventory.items[inventory.activeItem].quantity > 999
    ) {
      inventory.items[inventory.activeItem].quantity = 999;
      inventory.useActiveItem();
    }
    inventory.drawEmptyInventory();
    window.addEventListener("keydown", update);
    rightButton.addEventListener("mousedown", update);
    leftButton.addEventListener("mousedown", update);
    upButton.addEventListener("mousedown", update);
    downButton.addEventListener("mousedown", update);
    enterButton.addEventListener("mousedown", update);
    requestAnimationFrame(gameLoop);
  }
}

function eventPicker(tileIndex) {
  let startTime;
  let item = inventory.items[inventory.activeItem];

  let eventTileId = getEventTileId(tileIndex);

  if (isCropTile(tileIndex)) {
    if (eventInUse[tileIndex] == true) {
      return;
    } else {
      if (eventTileId == 242 && item.name == "Carrot") {
        item.quantity -= 1;
        inventory.useActiveItem();
        plantCarrot(tileIndex);
      } else if (eventTileId == 242 && item.name == "Cabbage") {
        item.quantity -= 1;
        inventory.useActiveItem();
        plantCabbage(tileIndex);
      } else if (eventTileId == 242 && item.name == "Grape") {
        item.quantity -= 1;
        inventory.useActiveItem();
        plantGrape(tileIndex);
      } else if (eventTileId == 242 && item.name == "Wheat") {
        item.quantity -= 1;
        inventory.useActiveItem();
        plantWheat(tileIndex);
      } else if (eventTileId == 234 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterCarrot", tileIndex, 5);
      } else if (eventTileId == 198 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterCarrot2", tileIndex, 5);
      } else if (eventTileId == 210 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterCarrot3", tileIndex, 5);
      } else if (eventTileId == 235 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterCabbage", tileIndex, 5);
      } else if (eventTileId == 199 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterCabbage2", tileIndex, 5);
      } else if (eventTileId == 211 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterCabbage3", tileIndex, 5);
      } else if (eventTileId == 236 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterGrape", tileIndex, 5);
      } else if (eventTileId == 200 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterGrape2", tileIndex, 5);
      } else if (eventTileId == 212 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterGrape3", tileIndex, 5);
      } else if (eventTileId == 237 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterWheat", tileIndex, 5);
      } else if (eventTileId == 201 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterWheat2", tileIndex, 5);
      } else if (eventTileId == 213 && item.name == "Watering Can") {
        startTime = Date.now();
        checkTime(startTime, "waterWheat3", tileIndex, 5);
      } else if (eventTileId == 222) {
        for (let i = 0; i < 4; i++) {
          inventory.add(items[1]);
        }
        harvestCarrot(tileIndex);
      } else if (eventTileId == 223) {
        for (let i = 0; i < 4; i++) {
          inventory.add(items[2]);
        }
        harvestCabbage(tileIndex);
      } else if (eventTileId == 224) {
        for (let i = 0; i < 4; i++) {
          inventory.add(items[3]);
        }
        harvestGrape(tileIndex);
      } else if (eventTileId == 225) {
        for (let i = 0; i < 4; i++) {
          inventory.add(items[4]);
        }
        harvestWheat(tileIndex);
      }
    }
  } else if (eventTileId == 435) {
    signEvent(tileIndex);
  }
}

function signEvent(tileIndex) {
  if (tileIndex == 2376) {
    document.getElementById("text").innerHTML =
      'The sign reads: "This is a test"';
  }
}

function plantCarrot(tileIndex) {
  changeTile(tileIndex, 234);
}

function plantCabbage(tileIndex) {
  changeTile(tileIndex, 235);
}

function plantGrape(tileIndex) {
  changeTile(tileIndex, 236);
}

function plantWheat(tileIndex) {
  changeTile(tileIndex, 237);
}

function waterCarrot(tileIndex) {
  changeTile(tileIndex, 198);
}

function waterCarrotTwo(tileIndex) {
  changeTile(tileIndex, 210);
}

function waterCarrotThree(tileIndex) {
  changeTile(tileIndex, 222);
}

function waterCabbage(tileIndex) {
  changeTile(tileIndex, 199);
}

function waterCabbageTwo(tileIndex) {
  changeTile(tileIndex, 211);
}

function waterCabbageThree(tileIndex) {
  changeTile(tileIndex, 223);
}

function waterGrape(tileIndex) {
  changeTile(tileIndex, 200);
}

function waterGrapeTwo(tileIndex) {
  changeTile(tileIndex, 212);
}

function waterGrapeThree(tileIndex) {
  changeTile(tileIndex, 224);
}

function waterWheat(tileIndex) {
  changeTile(tileIndex, 201);
}

function waterWheatTwo(tileIndex) {
  changeTile(tileIndex, 213);
}

function waterWheatThree(tileIndex) {
  changeTile(tileIndex, 225);
}

function harvestCarrot(tileIndex) {
  changeTile(tileIndex, 242);
}

function harvestCabbage(tileIndex) {
  changeTile(tileIndex, 242);
}

function harvestGrape(tileIndex) {
  changeTile(tileIndex, 242);
}

function harvestWheat(tileIndex) {
  changeTile(tileIndex, 242);
}

function checkTime(startTime, name, tileIndex, waitTime) {
  let currentTime = Date.now();

  eventInUse[tileIndex] = true;

  if (currentTime - startTime >= waitTime * 1000) {
    cancelAnimationFrame(checkTime);
    switch (name) {
      case "waterCarrot":
        waterCarrot(tileIndex);
        break;
      case "waterCarrot2":
        waterCarrotTwo(tileIndex);
        break;
      case "waterCarrot3":
        waterCarrotThree(tileIndex);
        break;
      case "waterCabbage":
        waterCabbage(tileIndex);
        break;
      case "waterCabbage2":
        waterCabbageTwo(tileIndex);
        break;
      case "waterCabbage3":
        waterCabbageThree(tileIndex);
        break;
      case "waterGrape":
        waterGrape(tileIndex);
        break;
      case "waterGrape2":
        waterGrapeTwo(tileIndex);
        break;
      case "waterGrape3":
        waterGrapeThree(tileIndex);
        break;
      case "waterWheat":
        waterWheat(tileIndex);
        break;
      case "waterWheat2":
        waterWheatTwo(tileIndex);
        break;
      case "waterWheat3":
        waterWheatThree(tileIndex);
        break;
    }
  } else {
    requestAnimationFrame(function () {
      checkTime(startTime, name, tileIndex, waitTime);
    });
  }
}

fetchJson(map.jsonPath);