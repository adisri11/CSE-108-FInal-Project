import Phaser from 'phaser';

export default class PreloadWinter extends Phaser.Scene {
  constructor() {
    super('PreloadWinter');
  }

  preload() {
    const loadingText = this.add.text(640, 400, 'Loading...', {
      fontSize: '24px',
      fill: '#000',
    });
    loadingText.setOrigin(0.5);

    this.load.tilemapTiledJSON('winter_maze_map', 'assets/tilemaps/winter_maze.tmj');
    this.load.image('winter_tiles', 'assets/tilesets/winter_tiles.png');

    this.load.image('player', 'assets/elements/snowman.png');

    this.load.image('coin', 'assets/elements/winter_coin.png');
  }

  create() {
    this.scene.start('WinterMazeScene');
  }
}
