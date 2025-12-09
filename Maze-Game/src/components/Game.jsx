import React, { useEffect } from "react";
import Phaser from "phaser";

// Winter scenes
import PreloadWinter from "../winter/scenes/PreloadWinter";
import WinterMazeScene from "../winter/scenes/WinterMazeScene";

// Fall scenes
import FallMazeScene from "../fall/scenes/FallMazeScene";

export default function Game() {
  useEffect(() => {
    // randomly choose a maze to start
    const startScene = Math.random() < 0.5 ? "PreloadFall" : "PreloadWinter";

    const config = {
      type: Phaser.AUTO,
      width: 2500,
      height: 3000,
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
      scene: [
        // Fall
        FallMazeScene,

        // Winter
        PreloadWinter,
        WinterMazeScene
      ]
    };

    const game = new Phaser.Game(config);

    // Start whichever maze was randomly selected
    game.scene.start(startScene);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div 
      id="phaser-game"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#1a1a2e"
      }}
    ></div>
  );
}
