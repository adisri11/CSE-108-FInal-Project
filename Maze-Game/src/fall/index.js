import Phaser from "phaser";
import FallMazeScene from "./scenes/FallMazeScene";

export const createGame = (parentId) => {
  console.log("Creating game with parent:", parentId);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentId,
    width: 2500,
    height: 3000,
    physics: {
      default: "arcade",
      arcade: { debug: true }
    },
    dom: {
        createContainer: true // Enable DOM elements
    },
    scene: [FallMazeScene]
  });
  
  return game;
};
