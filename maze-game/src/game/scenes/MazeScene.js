import Phaser from "phaser";
// import playerImg from "../../assets/images/player.png";

export default class MazeScene extends Phaser.Scene {
  constructor() {
    super("MazeScene");
  }

  preload() {
    this.load.tilemapTiledJSON("maze", "/maze.tmj");

    // Image used by Designer (3)
    this.load.image("Designer (3)", "/Designer (3).png");

    // Image used by lighter tile
    this.load.image("Designer (4)", "/Designer (4).png");
  }


  create() {
    const map = this.make.tilemap({ key: "maze" });
    const tileset1 = map.addTilesetImage("Designer (3)", "Designer (3)");
    const tileset2 = map.addTilesetImage("Designer (4)", "Designer (4)");

    const layer1 = map.createLayer("Tile Layer 1", [tileset1, tileset2], 0, 0);
    const layer2 = map.createLayer("Tile Layer 2", [tileset1, tileset2], 0, 0);

    // Enable collision on layer 2
    if (layer2) {
      layer2.setCollisionByExclusion([-1]);
    }

    // CREATE PLAYER FIRST
    this.player = this.add.circle(200, 100, 20, 0xff0000);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // THEN ADD COLLIDER
    if (layer2) {
      this.physics.add.collider(this.player, layer2);
    }

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const scaleX = 800 / map.widthInPixels;
    const scaleY = 600 / map.heightInPixels;
    const zoom = Math.min(scaleX, scaleY);
    this.cameras.main.setZoom(zoom);

    this.cursors = this.input.keyboard.createCursorKeys();
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
