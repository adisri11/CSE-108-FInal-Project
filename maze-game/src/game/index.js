import Phaser from "phaser";
import MazeScene from "./scenes/MazeScene";

export const createGame = (parentId) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentId,
    width: 2500,
    height: 3000,
    physics: {
      default: "arcade",
      arcade: { debug: true }
    },
    scene: [MazeScene]
  });
};
