import React, { useEffect } from "react";
import Phaser from "phaser";
import PreloadScene from "../phaser/scenes/PreloadScene";
import WinterMazeScene from "../phaser/scenes/WinterMazeScene";

const Game = () => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1280,   // Canvas size (not maze size)
      height: 800,   // Canvas size (not maze size)
      parent: "phaser-game",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [PreloadScene, WinterMazeScene]
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div 
      id="phaser-game" 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#1a1a2e'
      }}
    ></div>
  );
};

export default Game;