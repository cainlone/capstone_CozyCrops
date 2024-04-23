class Item {
  constructor(name, imgSrc, quantity = 1) {
    this.name = name;
    this.img = new Image();
    this.img.src = imgSrc;
    this.quantity = quantity;
    this.resizedImg = null; 
    this.img.onload = () => this.resizeImage();
  }


  resizeImage() {
    const self = this;
    const resizedImg = new Image();

    resizedImg.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
        
      canvas.width = TILE_SIZE;
      canvas.height = TILE_SIZE;
        
      ctx.drawImage(this, 0, 0, TILE_SIZE, TILE_SIZE);
        
      self.resizedImg = resizedImg;
        
      console.log("Resized image dimensions for", self.name + ":", resizedImg.width, resizedImg.height);
    };
    resizedImg.src = this.img.src;
    
  }
}

class Inventory {
  constructor(canvasId, size = 10) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.activePng = new Image();
    this.inactivePng = new Image();
    this.size = size;
    this.activeItem = 0;
    this.items = [];
    this.hoveredItem = -1;
    
    this.activePng.src = 'images/hotbar_active.png';
    this.inactivePng.src = 'images/hotbar_inactive.png';
    this.activePng.onload = () => this.drawEmptyInventory();
    this.inactivePng.onload = () => this.drawEmptyInventory();

    this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    this.canvas.addEventListener('click', e => this.onClick(e));
    window.addEventListener('keydown', e => this.onKeyDown(e));
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const itemIndex = Math.floor(x / TILE_SIZE);
    if (itemIndex >= 0 && itemIndex < this.size) {
      this.hoveredItem = itemIndex;
    } else {
      this.hoveredItem = -1;
    }
    this.drawEmptyInventory();
  }

  onClick(event) {
    if (this.hoveredItem !== -1) {
      const activeItem = this.items[this.activeItem];
      this.activeItem = this.hoveredItem;
      this.useActiveItem();
      this.drawEmptyInventory();
    }
  }

  onKeyDown(event) {
    const key = parseInt(event.key);
    if (key >= 1 && key <= 9) {
      this.activeItem = key - 1;
      this.useActiveItem();
      this.drawEmptyInventory();
    } else if (key === 0) {
      this.activeItem = this.size - 1;
      this.useActiveItem();
      this.drawEmptyInventory();
    }
  }

  add(item) {
    const existingItem = this.items.find(i => i.name === item.name);
    if (existingItem) {
      if (existingItem.quantity >= 999) {
        return;
      } else {
        existingItem.quantity++;
      }
    } else {
      this.items.push(item);
      if(item.quantity == 0) {
        item.quantity++;
      }
    }

    this.drawItemsInventory();
  }

  remove(item) {
    console.log(item);
    this.items = this.items.filter(i => i !== item);
  }

  has(item) {
    return this.items.includes(item);
  }

  drawEmptyInventory() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.size; i++) {
      let img = this.inactivePng;
      if (i === this.activeItem) {
        img = this.activePng;
      } else if (i === this.hoveredItem) {
        this.ctx.globalAlpha = 0.6;
      }
      this.ctx.drawImage(img, i * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
      this.ctx.globalAlpha = 1.0;
    }

    if (this.items.length > 0) this.drawItemsInventory();
  }

  drawItemsInventory() {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const img = item.resizedImg;

      if (img) {
      let xPos = i * TILE_SIZE - 120;
      let yPos = -140;
      let width = TILE_SIZE * 6;
      let height = TILE_SIZE * 6;

      if (/*item.name === "Bamboo" || item.name === "Corn" ||*/ item.name === "Wheat") {
        yPos += 58;
        xPos += 49;
        width = TILE_SIZE * 4;
        height = TILE_SIZE * 4; 
      }

      if(item.name === "Cabbage") {
        yPos -= 4;
      }

      if(item.name === "Watering Can") {
        yPos -= 33;
        xPos -= 4;
      }

      if(item.name === "RedFlower" || item.name === "PurpleFlower" || item.name === "Mushroom") {
        yPos += -120;
        xPos += -96;
        width = TILE_SIZE * 10;
        height = TILE_SIZE * 10; 
      }
   
      this.ctx.drawImage(img, xPos, yPos, width, height);
    
      this.ctx.fillStyle = 'black';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillText(item.quantity.toString(), i * TILE_SIZE + 30, TILE_SIZE - 3);
     }
    }
  }  

  useActiveItem() {
    const activeItem = this.items[this.activeItem];
    if(activeItem && activeItem.quantity > 0) {
      document.getElementById("currentItem").innerHTML = activeItem.name;
      document.getElementById("currentItem").style.left = "calc(50% + " + ((this.activeItem * 48) - 241) + "px"; 
    } else {
      if (activeItem) {
        this.remove(this.items[this.activeItem]);
      }
      document.getElementById("currentItem").innerHTML = "";
    }
    this.drawEmptyInventory();
  }
}

let items = [
  new Item('Watering Can', '/images/wateringCan.png'),
  new Item('Carrot', '/images/crops/crop_carrot_SE.png'),
  new Item('Cabbage', '/images/crops/crop_cabbage.png'),
  new Item('Grape', '/images/crops/crop_grape.png'),
  new Item('Wheat', '/images/crops/crop_wheat.png'),
  // new Item('Corn', '/images/crops/crops_cornStageD_SE.png'),
  // new Item('Melon', '/images/crops/crop_melon_SE.png'),
  // new Item('Pumpkin', '/images/crops/crop_pumpkin_SW.png'),
  // new Item('Turnip', '/images/crops/crop_turnip_NE.png')
]
