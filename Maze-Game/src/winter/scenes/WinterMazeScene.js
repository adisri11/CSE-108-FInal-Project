import Phaser from 'phaser';

export default class WinterMazeScene extends Phaser.Scene {
  constructor() {
    super('WinterMazeScene');
  }

  create() {
    
    const map = this.make.tilemap({ key: 'winter_maze_map' });
    const tileset = map.addTilesetImage('winter_tiles');

    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    const wallLayer = map.createLayer('Walls', tileset, 0, 0);

    wallLayer.setCollisionByExclusion([-1]);

    this.physics.world.setBounds(
      0,
      0,
      groundLayer.width,   
      groundLayer.height  
    );

    const startX = 32;
    const startY = 272;

    this.coins = this.physics.add.group();

    this.coins = this.physics.add.group();

    const NUM_COINS = 20;               
    const MIN_DISTANCE = 100;            
    const PLAYER_START = { x: startX, y: startY };
    const AVOID_PLAYER_RADIUS = 80;     
    const tileSize = map.tileWidth;

    
    function isWallAt(x, y) {
      return wallLayer.getTileAtWorldXY(x, y) !== null;
    }

    function tooCloseToExisting(x, y) {
      const children = this.coins.getChildren();
      for (let i = 0; i < children.length; i++) {
        const other = children[i];
        if (Phaser.Math.Distance.Between(x, y, other.x, other.y) < MIN_DISTANCE) {
          return true;
        }
      }
      return false;
    }

    for (let i = 0; i < NUM_COINS; i++) {
      let x, y;
      let attempts = 0;

      do {
        attempts++;

        const tileX = Phaser.Math.Between(0, map.width - 1);
        const tileY = Phaser.Math.Between(0, map.height - 1);

        x = tileX * tileSize + tileSize / 2;
        y = tileY * tileSize + tileSize / 2;

        // if attempts explode, stop infinite loops
        if (attempts > 2000) break;

      } while (
          isWallAt(x, y) ||
          tooCloseToExisting.call(this, x, y) ||
          Phaser.Math.Distance.Between(x, y, PLAYER_START.x, PLAYER_START.y) < AVOID_PLAYER_RADIUS
      );

      const coin = this.coins.create(x, y, 'coin');
      this.setupCoin(coin);
    }


    this.player = this.physics.add.sprite(startX, startY, "player");
    this.player.setScale(0.05);   
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, wallLayer);

    // Coin collection overlap
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();

    const camera = this.cameras.main;

    const zoomX = camera.width / groundLayer.width;
    const zoomY = camera.height / groundLayer.height;
    const finalZoom = Math.min(zoomX, zoomY);

    camera.setZoom(finalZoom);

    camera.setBounds(0, 0, groundLayer.width, groundLayer.height);

    camera.centerOn(groundLayer.width / 2, groundLayer.height / 2);

    this.score = 0;
    this.scoreText = this.add.text(-620, -365, 'Score: 0', {
      fontSize: '36px',
      fill: '#f84',
      stroke: '#000',
      strokeThickness: 3
    });
    this.scoreText.setScrollFactor(0); 

    // --- FINISH ZONE ---
    const finishLayer = map.getObjectLayer("Finish");
    if (finishLayer && finishLayer.objects.length > 0) {
      const f = finishLayer.objects[0];

      this.finishZone = this.physics.add.staticImage(f.x, f.y, null)
        .setSize(f.width, f.height)
        .setOrigin(0)
        .setVisible(false);

      this.physics.add.overlap(this.player, this.finishZone, () => {
        this.handleFinish();
      });
    }

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

  handleFinish() {
    // Stop player movement
    this.player.body.setVelocity(0);
    this.player.active = false;
  
    const { width, height } = this.cameras.main;
  
    // Dark transparent background
    const overlay = this.add.rectangle(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2,
      width,
      height,
      0x000000,
      0.6
    );
    overlay.setScrollFactor(0);
  
    // Popup box
    const box = this.add.rectangle(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2,
      500,
      300,
      0xffffff,
    );
    box.setScrollFactor(0);
  
    // Score text
    const scoreText = this.add.text(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2 - 60,
      `Your Score: ${this.score}`,
      { fontSize: '40px', fill: '#000' }
    );
    scoreText.setOrigin(0.5);
    scoreText.setScrollFactor(0);
  
    // Replay button
    const replay = this.add.text(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2 + 10,
      "Replay",
      { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
    );
    replay.setOrigin(0.5);
    replay.setInteractive();
    replay.setScrollFactor(0);
  
    replay.on('pointerdown', () => {
      this.scene.start("FallMazeScene"); // restart this same maze
    });
  
    // Exit button
    const exit = this.add.text(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2 + 80,
      "Exit",
      { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
    );
    exit.setOrigin(0.5);
    exit.setInteractive();
    exit.setScrollFactor(0);
  
    exit.on('pointerdown', () => {
      this.scene.start("MainMenu"); // or whatever your menu scene is called
    });
  }  

  update() {
    const speed = 200;
    const body = this.player.body;

    body.setVelocity(0);

    if (this.cursors.left.isDown)  body.setVelocityX(-speed);
    if (this.cursors.right.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown)    body.setVelocityY(-speed);
    if (this.cursors.down.isDown)  body.setVelocityY(speed);
  }
}
