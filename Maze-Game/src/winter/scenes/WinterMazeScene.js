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

    this.player = this.physics.add.sprite(startX, startY, "player");
    this.player.setScale(0.05);   
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, wallLayer);

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
