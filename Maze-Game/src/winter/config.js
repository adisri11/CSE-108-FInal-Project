import Phaser, { Physics } from 'phaser';

import PreloadWinter from './winter/scenes/PreloadWinter'
import WinterMazeScene from './scenes/WinterMazeScene'

const config = {
    type: Phaser.AUTO,
    width: 2240,
    height: 1600,
    parent: 'phaser-container',
    
    backgroundColor: '#D6EFFF',

    physics: {
        defult: 'arcade',
        arcade: {
            gravity: {y : 0},
            debug: false
        }
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true // Enable DOM elements
    },

    scene: [
        PreloadWinter,
        WinterMazeScene
    ]  
};

export default config;