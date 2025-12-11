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

    const coinLayer = map.getObjectLayer('Coins'); // Create this in Tiled
    if (coinLayer) {
      coinLayer.objects.forEach(coinObj => {
        const coin = this.coins.create(coinObj.x, coinObj.y, 'fall_coin');
        this.setupCoin(coin);
      }); 
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