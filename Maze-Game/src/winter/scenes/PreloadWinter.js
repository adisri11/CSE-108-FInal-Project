import Phaser from 'phaser';

export default class PreloadWinter extends Phaser.Scene {
  constructor() {
    super('PreloadWinter');
  }

  preload() {
    const loadingText = this.add.text(640, 400, 'Loading Winter Maze...', {
      fontSize: '32px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 4
    });
    loadingText.setOrigin(0.5);

    // Progress bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(320, 450, 320, 30);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(330, 460, 300 * value, 10);
    });

    // Load winter maze tilemap with absolute path
    this.load.tilemapTiledJSON('winter_maze_map', '/assets/tilemaps/winter_maze.tmj');
    
    // Load tileset with absolute path
    this.load.image('winter_tiles', '/assets/tilesets/winter_tiles.png');

    // Load character sprites with absolute paths
    this.load.image('jack_o_lantern', '/assets/elements/jack_o_lantern.png');
    this.load.image('orange_ghost', '/assets/elements/orange_ghost.png');
    this.load.image('santa_claus', '/assets/elements/santa_claus.png');
    this.load.image('reindeer', '/assets/elements/reindeer.png');
    this.load.image('scarecrow', '/assets/elements/scarecrow.png');
    this.load.image('snowman', 'assets/elements/snowman.png');
    
    // Load winter-specific elements with absolute paths
    this.load.image('coin', '/assets/elements/winter_coin.png');
    this.load.image('Riddles', '/assets/elements/Riddles.png');
  }

  create() {
    console.log('=== PreloadWinter: CREATE CALLED ===');
    
    // Verify critical assets loaded
    console.log('Checking loaded assets:');
    console.log('- winter_maze_map (tilemap):', this.cache.tilemap.exists('winter_maze_map') ? '✓' : '✗');
    console.log('- winter_tiles:', this.textures.exists('winter_tiles') ? '✓' : '✗');
    console.log('- jack_o_lantern:', this.textures.exists('jack_o_lantern') ? '✓' : '✗');
    console.log('- coin:', this.textures.exists('coin') ? '✓' : '✗');

    if (!this.cache.tilemap.exists('winter_maze_map')) {
      console.error('❌ CRITICAL: Winter maze tilemap not loaded!');
      const errorText = this.add.text(640, 400, 'Error: Winter maze data not found!', {
        fontSize: '24px',
        fill: '#ff0000',
        align: 'center'
      });
      errorText.setOrigin(0.5);
      return;
    }

    if (!this.textures.exists('winter_tiles')) {
      console.error('❌ CRITICAL: Winter tileset image not loaded!');
      const errorText = this.add.text(640, 400, 'Error: Winter tileset not found!', {
        fontSize: '24px',
        fill: '#ff0000',
        align: 'center'
      });
      errorText.setOrigin(0.5);
      return;
    }

    console.log('=== Starting WinterMazeScene ===');
    this.scene.start('WinterMazeScene');
  }
}
