let TILE_SIZE = 48;

function extractImageSource(tsxContent) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(tsxContent, 'text/xml');
  let imageElement = xmlDoc.querySelector('image');
  return imageElement.getAttribute('source');
}

function drawMap(mapData, tilesetImages) {
  
  let canvas = document.getElementById('mapCanvas');
  let ctx = canvas.getContext('2d');


  mapData.layers.forEach(layer => {
    if (layer.type === 'tilelayer') {
      layer.data.forEach((tileIndex, index) => {
        if (tileIndex !== 0) {
          let tilesetIndex = findTilesetIndex(tileIndex, mapData.tilesets);
          let tileset = mapData.tilesets[tilesetIndex];
          let tilesetImage = tilesetImages[tilesetIndex];
          let tileX = ((tileIndex - tileset.firstgid) % (tilesetImage.width / TILE_SIZE)) * TILE_SIZE;

          let tileY = Math.floor(((tileIndex - tileset.firstgid) / (tilesetImage.width / TILE_SIZE))) * TILE_SIZE;

          let destX = (index % layer.width) * TILE_SIZE;
          let destY = Math.floor(index / layer.width) * TILE_SIZE;

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


fetch('js/map.json')
.then(response => response.json())
.then(mapData => {
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
    .then(tilesetImages => {
      drawMap(mapData, tilesetImages);
    })
    .catch(error => console.error('Error loading tilesets:', error));
})
.catch(error => console.error('Error loading map:', error));