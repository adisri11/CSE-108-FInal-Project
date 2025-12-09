import Phaser from 'phaser';

export default class WinterMazeScene extends Phaser.Scene {
  constructor() {
    super('WinterMazeScene');
  }

  create() {
    // ---------------------------
    // 1. LOAD TILEMAP
    // ---------------------------
    const map = this.make.tilemap({ key: 'winter_maze_map' });
    const tileset = map.addTilesetImage('winter_tiles');
    
    // Create layers
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    const wallLayer = map.createLayer('Walls', tileset, 0, 0);
    
    // Enable collisions based on Tiled properties
    wallLayer.setCollisionByProperty({ collides: true });

    // ---------------------------
    // 2. SET WORLD BOUNDS TO MATCH MAP SIZE
    // ---------------------------
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // ---------------------------
    // 3. CAMERA SETUP - Center on maze
    // ---------------------------
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(0.5); // Slightly more zoomed in
    
    // Center camera on the middle of the maze
    this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);

    // Optional: Add camera controls for testing (arrow keys or WASD to pan)
    const cursors = this.input.keyboard.createCursorKeys();
    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      speed: 0.5
    };
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

    // ---------------------------
    // 4. PLAYER SETUP (uncomment when ready)
    // ---------------------------
    // this.player = this.physics.add.sprite(1120, 800, 'player'); // Start in center
    // this.player.setCollideWorldBounds(true);
    
    // this.anims.create({
    //   key: 'walk',
    //   frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    //   frameRate: 8,
    //   repeat: -1,
    // });
    
    // this.physics.add.collider(this.player, wallLayer);
    
    // // Camera follows player
    // this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    // this.cameras.main.setZoom(1.5); // Zoom in when following player
  }

  update(time, delta) {
    // Update camera controls
    if (this.controls) {
      this.controls.update(delta);
    }

    // ---------------------------
    // PLAYER MOVEMENT (uncomment when ready)
    // ---------------------------
    // const speed = 150;
    // const player = this.player;
    // player.setVelocity(0);
    
    // if (this.cursors.up.isDown) {
    //   player.setVelocityY(-speed);
    // } else if (this.cursors.down.isDown) {
    //   player.setVelocityY(speed);
    // }
    // if (this.cursors.left.isDown) {
    //   player.setVelocityX(-speed);
    // } else if (this.cursors.right.isDown) {
    //   player.setVelocityX(speed);
    // }
  }
}