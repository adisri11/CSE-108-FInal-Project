import Phaser from "phaser";

export default class FallMazeScene extends Phaser.Scene {
  constructor() {
    super("MazeScene");
  }

  preload() {
    // maze 
    this.load.tilemapTiledJSON("maze", "assets/tilemaps/fall_maze.tmj");

    // darker tilest
    this.load.image("Designer (3)", "assets/tilesets/Designer (3).png");

    // lighter tileset
    this.load.image("Designer (4)", "assets/tilesets/Designer (4).png");

    // coins 
    this.load.image("fall_coin","assets/elements/fall_coin.png" )

    // charachter 
    this.load.image("jack_o_lantern","assets/elements/jack_o_lantern.png")
  }


  create() {
    const map = this.make.tilemap({ key: "maze" });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const tileset1 = map.addTilesetImage("Designer (3)", "Designer (3)");
    const tileset2 = map.addTilesetImage("Designer (4)", "Designer (4)");

    const layer1 = map.createLayer("Tile Layer 1", [tileset1, tileset2], 0, 0);
    const layer2 = map.createLayer("Tile Layer 2", [tileset1, tileset2], 0, 0);
    

    // Enable collision on layer 2
    layer2.setCollisionByExclusion([-1]);

    // Initialize score
    this.score = 0;
    this.scoreText = this.add.text(-620, -365, 'Score: 0', { 
      fontSize: '32px', 
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 4
    });
    this.scoreText.setScrollFactor(0); // Keep UI fixed to camera

    // Create coins group
    this.coins = this.physics.add.group();

    this.coins = this.physics.add.group();

    const NUM_COINS = 20;              
    const MIN_DISTANCE = 100;         
    const PLAYER_START = { x: 200, y: 100 };
    const AVOID_PLAYER_RADIUS = 80;    
    const tileSize = map.tileWidth;

    const isWallAt = (x, y) => {
      return layer2.getTileAtWorldXY(x, y) !== null;
    };

    const tooCloseToExisting = (x, y) => {
      const coins = this.coins.getChildren();
      for (let c of coins) {
        if (Phaser.Math.Distance.Between(x, y, c.x, c.y) < MIN_DISTANCE) {
          return true;
        }
      }
      return false;
    };

    for (let i = 0; i < NUM_COINS; i++) {
      let x, y;
      let attempts = 0;

      do {
        attempts++;

        const tileX = Phaser.Math.Between(0, map.width - 1);
        const tileY = Phaser.Math.Between(0, map.height - 1);

        x = tileX * tileSize + tileSize / 2;
        y = tileY * tileSize + tileSize / 2;

        if (attempts > 2000) break; // avoid infinite loops
      } while (
        isWallAt(x, y) ||
        tooCloseToExisting(x, y) ||
        Phaser.Math.Distance.Between(x, y, PLAYER_START.x, PLAYER_START.y) < AVOID_PLAYER_RADIUS
      );

      const coin = this.coins.create(x, y, 'fall_coin');
      this.setupCoin(coin);
    }


    // CREATE PLAYER FIRST
    this.player = this.physics.add.sprite(200,100,'jack_o_lantern')
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // THEN ADD COLLIDER
    if (layer2) {
      this.physics.add.collider(this.player, layer2);
    }

    // Coin collection
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    const camera = this.cameras.main;

    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;

    // Calculate zoom so the whole maze fits on screen
    const zoomX = camera.width / mapWidth;
    const zoomY = camera.height / mapHeight;

    const finalZoom = Math.min(zoomX, zoomY);

    // Apply the zoom
    camera.setZoom(finalZoom);

    // Set proper world bounds
    camera.setBounds(0, 0, mapWidth, mapHeight);

    // Center the camera on the map
    camera.centerOn(mapWidth / 2, mapHeight / 2);

    // Do NOT follow the player if you want the maze to stay still.
    // (Player moves inside a fixed full-maze view)

    

    this.cursors = this.input.keyboard.createCursorKeys();

  }

  setupCoin(coin) {
    // Add smooth rotation tween
    this.tweens.add({
      targets: coin,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });

    // Optional: Add floating effect
    this.tweens.add({
      targets: coin,
      y: coin.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    
    // Optional: Add collection sound
    // this.sound.play('coinSound');
  }

  update() {
    const speed = 200;
    const body = this.player.body;
    body.setVelocity(0);

    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    if (this.cursors.right.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown) body.setVelocityY(-speed);
    if (this.cursors.down.isDown) body.setVelocityY(speed);

  }
}