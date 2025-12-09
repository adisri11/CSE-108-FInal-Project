import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // ---- LOADING TEXT ----
    const loadingText = this.add.text(450, 300, 'Loading...', {
      fontSize: '24px',
      fill: '#000',
    });
    loadingText.setOrigin(0.5);

    this.load.tilemapTiledJSON(
        'winter_maze_map',
        'assets/tilemaps/winter_maze.tmj'
      );
      
      this.load.image('winter_tiles', 'assets/tilesets/winter_tiles.png');
      
    //   this.load.spritesheet('player', 'assets/player/player.png', {
    //     frameWidth: 32,
    //     frameHeight: 32,
    //   });      
  }

  create() {
    // When done loading, go to your main scene
    this.scene.start('WinterMazeScene');
  }
}
