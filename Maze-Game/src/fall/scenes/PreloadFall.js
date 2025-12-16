import Phaser from 'phaser';

export default class PreloadFall extends Phaser.Scene {
  constructor() {
    super('PreloadFall');
  }

  init() {
    console.log("=== PreloadFall: INIT CALLED ===");
  }

  preload() {
    console.log("=== PreloadFall: PRELOAD STARTED ===");
    
    // Add listeners BEFORE any loading
    this.load.on('start', () => {
      console.log('PreloadFall: Load STARTED');
    });
    
    this.load.on('progress', (progress) => {
      console.log('PreloadFall: Loading progress:', Math.round(progress * 100) + '%');
    });
    
    this.load.on('loaderror', (file) => {
      console.error('PreloadFall: ❌ ERROR loading file:', file.key, file.url);
    });
    
    this.load.on('filecomplete', (key) => {
      console.log('PreloadFall: ✓ Loaded:', key);
    });
    
    this.load.on('complete', () => {
      console.log('PreloadFall: ✓✓✓ ALL ASSETS LOADED SUCCESSFULLY ✓✓✓');
    });

    // Show loading text
    const { width, height } = this.cameras.main;
    const loadingText = this.add.text(width / 2, height / 2, 'Loading Fall Maze...', {
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
    progressBox.fillRect(width / 2 - 160, height / 2 + 50, 320, 30);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 60, 300 * value, 10);
    });

    // Load fall maze tilemap
    console.log("PreloadFall: Queueing maze tilemap");
    this.load.tilemapTiledJSON('maze', '/assets/tilemaps/maze.tmj');

    // Load tilesets
    console.log("PreloadFall: Queueing tilesets");
    this.load.image('Designer (3)', '/assets/tilesets/Designer (3).png');
    this.load.image('Designer (4)', '/assets/tilesets/Designer (4).png');

    console.log("PreloadFall: Queueing character sprites");
    this.load.image('jack_o_lantern', '/assets/elements/jack_o_lantern.png');
    this.load.image('orange_ghost', '/assets/elements/orange_ghost.png');
    this.load.image('santa_claus', '/assets/elements/santa_claus.png');
    this.load.image('reindeer', '/assets/elements/reindeer.png');
    this.load.image('scarecrow', '/assets/elements/scarecrow.png');
    this.load.image('snowman', '/assets/elements/snowman.png');

    // Load fall-specific elements
    console.log("PreloadFall: Queueing fall elements");
    this.load.image('fall_coin', '/assets/elements/fall_coin.png');
    this.load.image('Riddles', '/assets/elements/Riddles.png');
    this.load.image('vendor', '/assets/elements/vendor.png');
    
    console.log("PreloadFall: Total files in queue:", this.load.queue.entries.length);
  }

  create() {
    console.log('=== PreloadFall: CREATE CALLED ===');
    
    // Properly check if assets loaded
    console.log('Checking loaded assets:');
    console.log('- maze (tilemap):', this.cache.tilemap.exists('maze') ? '✓' : '✗');
    console.log('- Designer (3):', this.textures.exists('Designer (3)') ? '✓' : '✗');
    console.log('- Designer (4):', this.textures.exists('Designer (4)') ? '✓' : '✗');
    console.log('- jack_o_lantern:', this.textures.exists('jack_o_lantern') ? '✓' : '✗');
    console.log('- fall_coin:', this.textures.exists('fall_coin') ? '✓' : '✗');
    console.log('- Riddles:', this.textures.exists('Riddles') ? '✓' : '✗');
    console.log('- vendor:', this.textures.exists('vendor') ? '✓' : '✗');

    // Check if critical assets are missing
    if (!this.cache.tilemap.exists('maze')) {
      console.error('❌ CRITICAL: Maze tilemap not loaded!');
      const errorText = this.add.text(640, 400, 'Error: Maze data not found!\nCheck console for details.', {
        fontSize: '24px',
        fill: '#ff0000',
        align: 'center'
      });
      errorText.setOrigin(0.5);
      return; // Don't start the game scene
    }

    if (!this.textures.exists('Designer (3)') || !this.textures.exists('Designer (4)')) {
      console.error('❌ CRITICAL: Tileset images not loaded!');
      const errorText = this.add.text(640, 400, 'Error: Tileset images not found!\nCheck console for details.', {
        fontSize: '24px',
        fill: '#ff0000',
        align: 'center'
      });
      errorText.setOrigin(0.5);
      return;
    }

    console.log('=== Starting FallMazeScene ===');
    this.scene.start('FallMazeScene');
  }
}