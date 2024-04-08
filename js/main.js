let TILE_SIZE = 48;

let map = {
  jsonPath: '',
  id: 0
}

map.jsonPath = 'js/sample.json';
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

let tileLayerArray = [];

const sprite = {
  x: 0,
  y: 0,
  width: 48,
  height: 48,
  speed: 2
};

let mapData;
let tilesetImages;

function extractImageSource(tsxContent) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(tsxContent, 'text/xml');
  let imageElement = xmlDoc.querySelector('image');
  return imageElement.getAttribute('source');
}

function drawMap() {
  mapData.layers.forEach(layer => {
    if (layer.type === 'tilelayer' && (layer.id === 1 || layer.id === 2)) {
      drawLayer(layer);
    }
  });

  drawSprite();

  mapData.layers.forEach(layer => {
    if (layer.type === 'tilelayer' && layer.id !== 1 && layer.id !== 2) {
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
      let tileX = ((tileIndex - tileset.firstgid) % (tilesetImage.width / TILE_SIZE)) * TILE_SIZE;

      let tileY = Math.floor(((tileIndex - tileset.firstgid) / (tilesetImage.width / TILE_SIZE))) * TILE_SIZE;

      let destX = (index % layer.width) * TILE_SIZE;
      let destY = Math.floor(index / layer.width) * TILE_SIZE;

      let tileLayerId = layer.id;

      tileLayerArray[index] = tileLayerId;

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
  .then(response => response.json())
  .then(data => {
    mapData = data;    

    let tilesetPromises = mapData.tilesets.map(async tileset => {
      let response = await fetch(tileset.source);
      let tsxContent = await response.text();
      let tilesetImageSrc = extractImageSource(tsxContent);
      let tilesetImage = new Image();
      tilesetImage.src = tilesetImageSrc;
      return await new Promise((resolve, reject) => {
        tilesetImage.onload = () => resolve(tilesetImage);
        tilesetImage.onerror = error => reject(error);
      });
    });
  
    Promise.all(tilesetPromises)
      .then(images => {
        tilesetImages = images;
        gameLoop();
      })
      .catch(error => console.error('Error loading tilesets:', error));
  })
  .catch(error => console.error('Error loading map:', error));
}

let targetPosition = { x: 0, y: 0 };

function updatePosition() {

  let dx = targetPosition.x - sprite.x;
  let dy = targetPosition.y - sprite.y;

  let vx = Math.sign(dx) * Math.min(Math.abs(dx), sprite.speed);
  let vy = Math.sign(dy) * Math.min(Math.abs(dy), sprite.speed);

  sprite.x += vx;
  sprite.y += vy;

  window.removeEventListener('keydown', update);

  if (sprite.x === targetPosition.x && sprite.y === targetPosition.y) {
    return;
  }

  requestAnimationFrame(updatePosition);
}

function update(event) {
  let yOrX;
  let upOrDown;
  switch(event.key) {
    case 'ArrowUp':
      if(!(targetPosition.y <= 0)) {
        targetPosition.y -= (TILE_SIZE);
        yOrX = true;
        upOrDown = false;
      }
      break;
    case 'ArrowDown':
      if(!(targetPosition.y < 0 || (targetPosition.y + 48) >= canvas.height)) {
        targetPosition.y += (TILE_SIZE);
        yOrX = true;
        upOrDown = true;
      }
      break;
    case 'ArrowLeft':
      if(!(targetPosition.x <= 0)) {
        targetPosition.x -= (TILE_SIZE);
        yOrX = false;
        upOrDown = false;
      }
      break;
    case 'ArrowRight':
      if(!(targetPosition.x < 0 || (targetPosition.x + 48) >= canvas.width)) {
        targetPosition.x += (TILE_SIZE);
        yOrX = false;
        upOrDown = true;
      }
      break;
  }

  let tileIndexX = Math.floor(targetPosition.x / TILE_SIZE);
  let tileIndexY = Math.floor(targetPosition.y / TILE_SIZE);

  let tileLayerId = getTileLayerId(tileIndexX, tileIndexY);

  if (tileLayerId === 3) {
    
    if(yOrX && upOrDown) {
      targetPosition.y -= TILE_SIZE;
    } else if(yOrX && !upOrDown) {
      targetPosition.y += TILE_SIZE;
    } else if(!yOrX && upOrDown) {
      targetPosition.x -= TILE_SIZE;
    } else {
      targetPosition.x += TILE_SIZE;
    }
  }

  window.removeEventListener('keydown', update);
  updatePosition();
}

function getTileLayerId(tileIndexX, tileIndexY) {
  let tileIndex = tileIndexY * mapData.width + tileIndexX;
  return tileLayerArray[tileIndex];
}

function drawSprite() {
  ctx.fillStyle = 'red';
  ctx.fillRect(sprite.x, sprite.y, sprite.width, sprite.height);
}

function gameLoop() {
  drawMap();
  window.addEventListener('keydown', update)
  requestAnimationFrame(gameLoop);
}

fetchJson(map.jsonPath);