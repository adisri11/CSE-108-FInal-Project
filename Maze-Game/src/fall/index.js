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
  
  // Add error listeners
  // game.events.on('error', (error) => {
  //   console.error("Game error:", error);
  // });
  
  // Listen for scene events
  // game.scene.events.on('boot', (scene) => {
  //   console.log("Scene booted:", scene);
  // });
  
  // game.scene.events.on('start', (scene) => {
  //   console.log("Scene started:", scene);
  // });
  
  // console.log("Game created:", game);
  // console.log("Scene manager scenes:", game.scene.scenes);
  
  // Explicitly start the scene if it's not already
  // setTimeout(() => {
  //   console.log("Current scenes after delay:", game.scene.scenes);
  //   if (game.scene.scenes.length === 0) {
  //     console.log("Starting MazeScene explicitly...");
  //     game.scene.start('MazeScene');
  //   }
  // }, 100);
  
  return game;
};


// import Phaser from "phaser";
// import FallMazeScene from "./scenes/FallMazeScene";

// export const createGame = (parentId) => {
//   console.log("Creating game with parent:", parentId);
  
//   const game = new Phaser.Game({
//     type: Phaser.AUTO,
//     parent: parentId,
//     width: 1200,  // Larger viewport for better visibility
//     height: 900,
//     physics: {
//       default: "arcade",
//       arcade: { 
//         debug: false,  // Set to true to see collision boxes
//         gravity: { y: 0 }
//       }
//     },
//     dom: {
//       createContainer: true
//     },
//     scene: [FallMazeScene],
//     backgroundColor: '#2d1810'  // Dark brown background
//   });
  
//   // Debug logging
//   game.events.on('ready', () => {
//     console.log("Game ready");
//     console.log("Active scenes:", game.scene.scenes.map(s => s.scene.key));
//   });
  
//   return game;
// };
