import Phaser, { Physics } from 'phaser';

import PreloadScene from './scenes/PreloadScene'
import WinterMazeScene from './scenes/WinterMazeScene'

const config = {
    type: Phaser.AUTO,
    width: 70,
    height: 50,
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

    scene: [
        PreloadScene,
        WinterMazeScene
    ]  
};

export default config;