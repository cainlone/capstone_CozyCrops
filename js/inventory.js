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
      this.activeItem = this.hoveredItem;
      this.drawEmptyInventory();
    }
  }

  onKeyDown(event) {
    const key = parseInt(event.key);
    if (key >= 1 && key <= 9) {
      this.activeItem = key - 1;
      this.drawEmptyInventory();
    } else if (key === 0) {
      this.activeItem = this.size - 1;
      this.drawEmptyInventory();
    }
  }

  add(item) {
    this.items.push(item);
  }

  remove(item) {
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
    this.drawEmptyInventory();
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      this.ctx.drawImage(item.img, i * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
    }
  }
}
