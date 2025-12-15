// import Phaser from "phaser";

// export default class FallMazeScene extends Phaser.Scene {
//   constructor() {
//     super("FallMazeScene");
//   }

//   preload() {
//     console.log("Preloading assets...");
//     // maze 
//     this.load.tilemapTiledJSON("maze", "assets/tilemaps/maze.tmj");

//     // darker tilest
//     this.load.image("Designer (3)", "assets/tilesets/Designer (3).png");

//     // lighter tileset
//     this.load.image("Designer (4)", "assets/tilesets/Designer (4).png");

//     // coins 
//     this.load.image("fall_coin", "assets/elements/fall_coin.png");

//     // charachter 
//     this.load.image("jack_o_lantern", "assets/elements/jack_o_lantern.png");

//     this.load.image("Riddles", "assets/elements/Riddles.png");

//     this.load.image("vendor", "assets/elements/vendor.png");
//     console.log("Assets preloaded");
//   }


//   create() {
//     console.log("Creating FallMazeScene...");
//     const map = this.make.tilemap({ key: "maze" });
//     console.log("Tilemap created:", map);

//     const tileset1 = map.addTilesetImage("Designer (3)", "Designer (3)");
//     const tileset2 = map.addTilesetImage("Designer (4)", "Designer (4)");

//     const layer1 = map.createLayer("Tile Layer 1", [tileset1, tileset2], 0, 0);
//     const layer2 = map.createLayer("Tile Layer 2", [tileset1, tileset2], 0, 0);


//     // Enable collision on layer 2
//     layer2.setCollisionByExclusion([-1]);

//     // Initialize score
//     this.score = 0;
//     this.scoreText = this.add.text(20, 20, 'Score: 0', {
//       fontSize: '32px',
//       fill: '#fff',
//       stroke: '#000',
//       strokeThickness: 4
//     });
//     this.scoreText.setScrollFactor(0); // Keep UI fixed to camera

//     // Create coins group
//     this.coins = this.physics.add.group();

//     this.coins = this.physics.add.group();

//     const NUM_COINS = 20;
//     const MIN_DISTANCE = 100;
//     const PLAYER_START = { x: 200, y: 100 };
//     const AVOID_PLAYER_RADIUS = 80;
//     const tileSize = map.tileWidth;

//     const isWallAt = (x, y) => {
//       return layer2.getTileAtWorldXY(x, y) !== null;
//     };

//     const tooCloseToExisting = (x, y) => {
//       const coins = this.coins.getChildren();
//       for (let c of coins) {
//         if (Phaser.Math.Distance.Between(x, y, c.x, c.y) < MIN_DISTANCE) {
//           return true;
//         }
//       }
//       return false;
//     };

//     for (let i = 0; i < NUM_COINS; i++) {
//       let x, y;
//       let attempts = 0;

//       do {
//         attempts++;

//         const tileX = Phaser.Math.Between(0, map.width - 1);
//         const tileY = Phaser.Math.Between(0, map.height - 1);

//         x = tileX * tileSize + tileSize / 2;
//         y = tileY * tileSize + tileSize / 2;

//         if (attempts > 2000) break; // avoid infinite loops
//       } while (
//         isWallAt(x, y) ||
//         tooCloseToExisting(x, y) ||
//         Phaser.Math.Distance.Between(x, y, PLAYER_START.x, PLAYER_START.y) < AVOID_PLAYER_RADIUS
//       );

//       const coin = this.coins.create(x, y, 'fall_coin');
//       this.setupCoin(coin);
//     }


//     // CREATE PLAYER FIRST
//     this.player = this.physics.add.sprite(200, 100, 'jack_o_lantern');
//     this.player.body.setCollideWorldBounds(true);

//     const finishLayer = map.getObjectLayer("FinishLine");
//     if (finishLayer && finishLayer.objects.length > 0) {
//       // Find the object with type "finish"
//       const finishObj = finishLayer.objects.find(obj => obj.properties?.some(p => p.name === "type" && p.value === "finish"));

//       if (finishObj) {
//         this.finishZone = this.physics.add.staticImage(
//           finishObj.x + finishObj.width / 2,
//           finishObj.y + finishObj.height / 2,
//           null
//         )
//           .setSize(finishObj.width, finishObj.height)
//           .setOrigin(0.5)
//           .setVisible(false);

//         this.physics.add.overlap(this.player, this.finishZone, () => {
//           this.handleFinish();
//         }, null, this);
//       }
//     }

//     // THEN ADD COLLIDER
//     if (layer2) {
//       this.physics.add.collider(this.player, layer2);
//     }

//     // Riddles 
//     this.riddles = this.physics.add.group();

//     // Define riddle data
//     const riddleData = [
//       { question: "I'm a room you can eat. What am I?", answer: "mushroom" },
//       { question: "What food has no beginning, middle, or end?", answer: "doughnut" },
//       { question: "I get chewed and chewed but never swallowed or eaten. I'm always thrown away. What am I?", answer: "chewing gum" },
//       { question: "What's the saddest fruit?", answer: "blueberry" },
//       { question: "I have eyes but cannot see. What am I?", answer: "potato" }
//     ];

//     // Place riddles randomly in walkable areas
//     this.placeRiddlesRandomly(map, layer2, riddleData);

//     this.physics.add.overlap(this.player, this.riddles, this.triggerRiddle, null, this);


//     // Coin collection
//     this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

//     const camera = this.cameras.main;

//     const mapWidth = map.widthInPixels;
//     const mapHeight = map.heightInPixels;

//     // Calculate zoom so the whole maze fits on screen
//     const zoomX = camera.width / mapWidth;
//     const zoomY = camera.height / mapHeight;
//     const finalZoom = Math.min(zoomX, zoomY);

//     camera.setZoom(finalZoom);
//     camera.setBounds(0, 0, mapWidth, mapHeight);
//     camera.centerOn(mapWidth / 2, mapHeight / 2);

//     // Also set physics world bounds to match the map
//     this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

//     // Center the camera on the map
//     camera.centerOn(mapWidth / 2, mapHeight / 2);

//     // Do NOT follow the player if you want the maze to stay still.
//     // (Player moves inside a fixed full-maze view)



//     this.cursors = this.input.keyboard.createCursorKeys();

//   }

//   placeRiddlesRandomly(map, collisionLayer, riddleData) {
//     const tileSize = map.tileWidth;
//     const mapWidth = map.widthInPixels;
//     const mapHeight = map.heightInPixels;
//     const placedPositions = [];
//     const minDistance = 100; // Minimum distance between riddles

//     riddleData.forEach(data => {
//       let attempts = 0;
//       let placed = false;

//       while (!placed && attempts < 200) {
//         // Generate random position aligned to tile grid
//         const tileX = Phaser.Math.Between(1, Math.floor(mapWidth / tileSize) - 1);
//         const tileY = Phaser.Math.Between(1, Math.floor(mapHeight / tileSize) - 1);
//         const x = tileX * tileSize + tileSize / 2;
//         const y = tileY * tileSize + tileSize / 2;

//         // Check if position is walkable (not colliding)
//         const tile = collisionLayer.getTileAtWorldXY(x, y);
//         const isWalkable = !tile || tile.index === -1 || !tile.collides;

//         // Check if position is far enough from other riddles
//         const isFarEnough = placedPositions.every(pos => {
//           const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
//           return distance >= minDistance;
//         });

//         // Check if position is far enough from player start
//         const farFromPlayer = Phaser.Math.Distance.Between(x, y, 200, 100) > 150;

//         if (isWalkable && isFarEnough && farFromPlayer) {
//           const riddle = this.riddles.create(x, y, "Riddles").setSize(32, 32);
//           riddle.question = data.question;
//           riddle.answer = data.answer;
//           placedPositions.push({ x, y });
//           placed = true;
//         }

//         attempts++;
//       }

//       if (!placed) {
//         console.warn("Could not place riddle after 200 attempts:", data.question);
//       }
//     });
//   }

//   triggerRiddle(player, riddle) {
//     // Prevent multiple triggers
//     if (this.currentRiddle) return;

//     this.currentRiddle = riddle;
//     this.physics.pause();

//     // Get camera properties
//     const cam = this.cameras.main;
//     const centerX = cam.width / 2 - 100;
//     const centerY = cam.height / 2;

//     // *** NEW: Get the final calculated zoom factor from the game state ***
//     // We assume the zoom factor is set in 'create' and remains constant.
//     // The camera's current zoom is the factor needed for DOM correction.
//     const cameraZoom = cam.zoom;

//     // Define Box Dimensions
//     const boxWidth = 950;
//     const boxHeight = 550;

//     // CENTER THE WHITE BOX ON THE CAMERA VIEW
//     const whiteBox = this.add.rectangle(centerX, centerY, boxWidth, boxHeight, 0xFFFFFF);
//     whiteBox.setScrollFactor(0);
//     whiteBox.setStrokeStyle(4, 0x000000);

//     // Define layout coordinates based on the centered box
//     const leftMarginX = centerX - boxWidth / 2 + 20;
//     const topMarginY = centerY - boxHeight / 2 + 40;

//     // Add image
//     const sideImage = this.add.image(leftMarginX + 200, topMarginY + 300, "vendor");
//     sideImage.setScrollFactor(0);
//     sideImage.setDisplaySize(400, 400);

//     // POSITION QUESTION TEXT
//     const questionTextX = leftMarginX + 200;
//     const questionText = this.add.text(
//       questionTextX,
//       topMarginY,
//       riddle.question || "No question found",
//       {
//         fontSize: "32px",
//         fill: "#000000",
//         align: "middle",
//         wordWrap: { width: boxWidth - 220 }
//       }
//     );
//     questionText.setScrollFactor(0);
//     questionText.setOrigin(0, 0);

//     // --- INPUT AREA ---

//     const inputAreaY = topMarginY + 200;

//     // "Your Answer:" label
//     const promptText = this.add.text(
//       leftMarginX + 570,
//       inputAreaY + 30,
//       "Your Answer:",
//       {
//         fontSize: "38px",
//         fill: "#000000"
//       }
//     );
//     promptText.setScrollFactor(0);
//     promptText.setOrigin(0, 0);

//     // Input field DOM element dimensions
//     const inputWidth = 350;
//     const inputHeight = 46;

//     // Calculate position in Phaser's world coordinates (relative to camera center)
//     const inputFieldX = leftMarginX + inputWidth / 2;
//     const inputFieldY = inputAreaY - 300;

//     // *** NEW: Apply reverse scale transformation to the DOM object ***
//     // This scales the DOM element up so that when the camera zoom scales it down, 
//     // it ends up appearing at the correct size.

//     const inputField = this.add.dom(inputFieldX + 1000, inputFieldY + 700)
//       .createFromHTML(`
//         <input
//           type="text" 
//           id="answerInput" 
//           style="
//             width: ${inputWidth}px;
//             padding: 12px;
//             font-size: 20px;
//             border: 2px solid #000;
//             border-radius: 5px;

//           "
//           autofocus
//         />
//       `);
//     inputField.setScrollFactor(0);


//     // Submit button (positioning remains the same, as it's a Phaser object)
//     const submitBtn = this.add.text(
//       leftMarginX + 610,
//       inputFieldY + inputHeight / 2 + 460,
//       "Submit",
//       {
//         fontSize: "44px",
//         fill: "#fff",
//         backgroundColor: "#4CAF50",
//         padding: { x: 20, y: 8 }
//       }
//     );
//     submitBtn.setScrollFactor(0);
//     submitBtn.setOrigin(0, 0);

//     submitBtn.setInteractive({ useHandCursor: true });

//     // Handle submission
//     const handleSubmit = () => {
//       // ... rest of the submit logic
//       const userAnswer = inputField.getChildByID("answerInput").value.trim().toLowerCase();
//       const correctAnswer = riddle.answer.toLowerCase();

//       // Clear the white box content
//       whiteBox.destroy();
//       questionText.destroy();
//       sideImage.destroy();
//       promptText.destroy();
//       inputField.destroy();
//       submitBtn.destroy();

//       // Show result in a new simple box - using camera-centered coordinates
//       const resultBox = this.add.rectangle(centerX, centerY, 600, 200, 0xFFFFFF);
//       resultBox.setScrollFactor(0);
//       resultBox.setStrokeStyle(4, 0x000000);

//       let resultText;
//       if (userAnswer === correctAnswer) {
//         resultText = this.add.text(
//           centerX,
//           centerY,
//           "✓ Correct!\n+50 points",
//           {
//             fontSize: "36px",
//             fill: "#00AA00",
//             align: "center"
//           }
//         );

//         // Remove the riddle from the game
//         riddle.destroy();

//         // Add bonus points
//         this.score += 50;
//         this.scoreText.setText('Score: ' + this.score);
//       } else {
//         resultText = this.add.text(
//           centerX,
//           centerY,
//           `✗ Wrong!\n\nCorrect answer: ${riddle.answer}`,
//           {
//             fontSize: "32px",
//             fill: "#CC0000",
//             align: "center"
//           }
//         );

//         // Still remove riddle even if wrong
//         riddle.destroy();
//       }

//       resultText.setScrollFactor(0);
//       resultText.setOrigin(0.5);

//       // Clean up after 2 seconds
//       this.time.delayedCall(2000, () => {
//         resultBox.destroy();
//         resultText.destroy();

//         this.currentRiddle = null;
//         this.physics.resume();
//       });
//     };

//     // Enter key handler
//     this.input.keyboard.once("keydown-ENTER", handleSubmit);

//     // Click handler for submit button
//     submitBtn.on("pointerdown", handleSubmit);
//   }



//   setupCoin(coin) {
//     // Add smooth rotation tween
//     this.tweens.add({
//       targets: coin,
//       angle: 360,
//       duration: 2000,
//       repeat: -1,
//       ease: 'Linear'
//     });

//     // Optional: Add floating effect
//     this.tweens.add({
//       targets: coin,
//       y: coin.y - 10,
//       duration: 1000,
//       yoyo: true,
//       repeat: -1,
//       ease: 'Sine.easeInOut'
//     });
//   }

//   collectCoin(player, coin) {
//     coin.disableBody(true, true);
//     this.score += 10;
//     this.scoreText.setText('Score: ' + this.score);

//     // Optional: Add collection sound
//     // this.sound.play('coinSound');
//   }

//   handleFinish() {
//     // Stop player movement
//     this.player.body.setVelocity(0);
//     this.player.active = false;

//     const { width, height } = this.cameras.main;

//     // Dark transparent background
//     const overlay = this.add.rectangle(
//       this.cameras.main.worldView.x + width / 2,
//       this.cameras.main.worldView.y + height / 2,
//       width,
//       height,
//       0x000000,
//       0.6
//     );
//     overlay.setScrollFactor(0);

//     // Popup box
//     const box = this.add.rectangle(
//       this.cameras.main.worldView.x + width / 2,
//       this.cameras.main.worldView.y + height / 2,
//       500,
//       300,
//       0xffffff,
//     );
//     box.setScrollFactor(0);

//     // Score text
//     const scoreText = this.add.text(
//       this.cameras.main.worldView.x + width / 2,
//       this.cameras.main.worldView.y + height / 2 - 60,
//       `Your Score: ${this.score}`,
//       { fontSize: '40px', fill: '#000' }
//     );
//     scoreText.setOrigin(0.5);
//     scoreText.setScrollFactor(0);

//     // Replay button
//     const replay = this.add.text(
//       this.cameras.main.worldView.x + width / 2,
//       this.cameras.main.worldView.y + height / 2 + 10,
//       "Replay",
//       { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
//     );
//     replay.setOrigin(0.5);
//     replay.setInteractive();
//     replay.setScrollFactor(0);

//     replay.on('pointerdown', () => {
//       this.scene.start("FallMazeScene"); // restart this same maze
//     });

//     // Return to home button
//     const exit = this.add.text(
//       this.cameras.main.worldView.x + width / 2,
//       this.cameras.main.worldView.y + height / 2 + 80,
//       "Exit",
//       { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
//     );
//     exit.setOrigin(0.5);
//     exit.setInteractive();
//     exit.setScrollFactor(0);

//     exit.on('pointerdown', () => {
//       // Emit event to parent (React) to handle navigation
//       window.mazeGameEvent = 'exit';
//       this.game.destroy(true);
//     });
//   }

//   update() {
//     // Don't allow movement if riddle is active
//     if (this.currentRiddle) return;

//     const speed = 200;
//     const body = this.player.body;
//     body.setVelocity(0);

//     if (this.cursors.left.isDown) body.setVelocityX(-speed);
//     if (this.cursors.right.isDown) body.setVelocityX(speed);
//     if (this.cursors.up.isDown) body.setVelocityY(-speed);
//     if (this.cursors.down.isDown) body.setVelocityY(speed);

//   }
// }

import Phaser from "phaser";

export default class FallMazeScene extends Phaser.Scene {
  constructor() {
    super("FallMazeScene");
  }

  create() {
    console.log("=== CREATE STARTED ===");

    const map = this.make.tilemap({ key: "maze" });
    console.log("Map dimensions:", map.width, "x", map.height, "tiles");
    console.log("Map pixel size:", map.widthInPixels, "x", map.heightInPixels);

    const tileset1 = map.addTilesetImage("Designer (3)", "Designer (3)");
    const tileset2 = map.addTilesetImage("Designer (4)", "Designer (4)");

    console.log("Tilesets loaded:", tileset1 ? "Yes" : "No", tileset2 ? "Yes" : "No");

    const layer1 = map.createLayer("Tile Layer 1", [tileset1, tileset2], 0, 0);
    const layer2 = map.createLayer("Tile Layer 2", [tileset1, tileset2], 0, 0);

    console.log("Layers created:", layer1 ? "Yes" : "No", layer2 ? "Yes" : "No");

    // Enable collision on layer 2
    layer2.setCollisionByExclusion([-1]);

    // Initialize score with larger text
    this.score = 0;
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '48px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 6
    });
    this.scoreText.setScrollFactor(0);

    // Create coins
    this.coins = this.physics.add.group();
    const NUM_COINS = 20;
    const MIN_DISTANCE = 100;
    const PLAYER_START = { x: 200, y: 100 };
    const AVOID_PLAYER_RADIUS = 80;
    const tileSize = map.tileWidth;

    const isWallAt = (x, y) => {
      return layer2.getTileAtWorldXY(x, y) !== null;
    };

    const tooCloseToExisting = (x, y) => {
      const coins = this.coins.getChildren();
      for (let c of coins) {
        if (Phaser.Math.Distance.Between(x, y, c.x, c.y) < MIN_DISTANCE) {
          return true;
        }
      }
      return false;
    };

    for (let i = 0; i < NUM_COINS; i++) {
      let x, y;
      let attempts = 0;

      do {
        attempts++;
        const tileX = Phaser.Math.Between(0, map.width - 1);
        const tileY = Phaser.Math.Between(0, map.height - 1);
        x = tileX * tileSize + tileSize / 2;
        y = tileY * tileSize + tileSize / 2;
        if (attempts > 2000) break;
      } while (
        isWallAt(x, y) ||
        tooCloseToExisting(x, y) ||
        Phaser.Math.Distance.Between(x, y, PLAYER_START.x, PLAYER_START.y) < AVOID_PLAYER_RADIUS
      );

      const coin = this.coins.create(x, y, 'fall_coin');
      this.setupCoin(coin);
    }

    // Create player - BIGGER and more visible
    this.player = this.physics.add.sprite(200, 100, 'jack_o_lantern');
    this.player.setDisplaySize(64, 64); // Even bigger
    this.player.body.setSize(40, 40);
    this.player.body.setCollideWorldBounds(true);
    console.log("Player created at:", this.player.x, this.player.y);

    // Finish zone
    const finishLayer = map.getObjectLayer("FinishLine");
    if (finishLayer && finishLayer.objects.length > 0) {
      const finishObj = finishLayer.objects.find(obj =>
        obj.properties?.some(p => p.name === "type" && p.value === "finish")
      );

      if (finishObj) {
        this.finishZone = this.physics.add.staticImage(
          finishObj.x + finishObj.width / 2,
          finishObj.y + finishObj.height / 2,
          null
        )
          .setSize(finishObj.width, finishObj.height)
          .setOrigin(0.5)
          .setVisible(false);

        this.physics.add.overlap(this.player, this.finishZone, () => {
          this.handleFinish();
        }, null, this);
      }
    }

    // Add collider
    this.physics.add.collider(this.player, layer2);

    // Riddles
    this.riddles = this.physics.add.group();
    const riddleData = [
      { question: "I'm a room you can eat. What am I?", answer: "mushroom" },
      { question: "What food has no beginning, middle, or end?", answer: "doughnut" },
      { question: "I get chewed and chewed but never swallowed or eaten. I'm always thrown away. What am I?", answer: "chewing gum" },
      { question: "What's the saddest fruit?", answer: "blueberry" },
      { question: "I have eyes but cannot see. What am I?", answer: "potato" }
    ];

    this.placeRiddlesRandomly(map, layer2, riddleData);
    this.physics.add.overlap(this.player, this.riddles, this.triggerRiddle, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // CAMERA SETUP - THE KEY PART
    const camera = this.cameras.main;

    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;

    // Calculate zoom so the entire map fits on screen
    const zoomX = camera.width / mapWidth;
    const zoomY = camera.height / mapHeight;
    const finalZoom = Math.min(zoomX, zoomY);

    camera.setZoom(finalZoom);
    camera.setBounds(0, 0, mapWidth, mapHeight);
    camera.centerOn(mapWidth / 2, mapHeight / 2);


    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cursors = this.input.keyboard.createCursorKeys();

    console.log("=== SCENE CREATED SUCCESSFULLY ===");
  }

  placeRiddlesRandomly(map, collisionLayer, riddleData) {
    const tileSize = map.tileWidth;
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;
    const placedPositions = [];
    const minDistance = 100;

    riddleData.forEach(data => {
      let attempts = 0;
      let placed = false;

      while (!placed && attempts < 200) {
        const tileX = Phaser.Math.Between(1, Math.floor(mapWidth / tileSize) - 1);
        const tileY = Phaser.Math.Between(1, Math.floor(mapHeight / tileSize) - 1);
        const x = tileX * tileSize + tileSize / 2;
        const y = tileY * tileSize + tileSize / 2;

        const tile = collisionLayer.getTileAtWorldXY(x, y);
        const isWalkable = !tile || tile.index === -1 || !tile.collides;

        const isFarEnough = placedPositions.every(pos => {
          const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          return distance >= minDistance;
        });

        const farFromPlayer = Phaser.Math.Distance.Between(x, y, 200, 100) > 150;

        if (isWalkable && isFarEnough && farFromPlayer) {
          const riddle = this.riddles.create(x, y, "Riddles").setSize(32, 32);
          riddle.question = data.question;
          riddle.answer = data.answer;
          placedPositions.push({ x, y });
          placed = true;
        }

        attempts++;
      }

      if (!placed) {
        console.warn("Could not place riddle:", data.question);
      }
    });
  }

  triggerRiddle(player, riddle) {
    if (this.currentRiddle) return;

    this.currentRiddle = riddle;
    this.physics.pause();

    const cam = this.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;

    const boxWidth = 700;
    const boxHeight = 400;

    const whiteBox = this.add.rectangle(centerX, centerY, boxWidth, boxHeight, 0xFFFFFF);
    whiteBox.setScrollFactor(0);
    whiteBox.setStrokeStyle(4, 0x000000);

    const questionText = this.add.text(
      centerX,
      centerY - 120,
      riddle.question || "No question found",
      {
        fontSize: "24px",
        fill: "#000000",
        align: "center",
        wordWrap: { width: boxWidth - 40 }
      }
    );
    questionText.setScrollFactor(0);
    questionText.setOrigin(0.5);

    const inputField = this.add.dom(centerX, centerY - 20)
      .createFromHTML(`
        <input
          type="text" 
          id="answerInput" 
          style="
            width: 300px;
            padding: 10px;
            font-size: 18px;
            border: 2px solid #000;
            border-radius: 5px;
          "
          autofocus
        />
      `);
    inputField.setScrollFactor(0);

    const submitBtn = this.add.text(
      centerX,
      centerY + 60,
      "Submit",
      {
        fontSize: "32px",
        fill: "#fff",
        backgroundColor: "#4CAF50",
        padding: { x: 20, y: 10 }
      }
    );
    submitBtn.setScrollFactor(0);
    submitBtn.setOrigin(0.5);
    submitBtn.setInteractive({ useHandCursor: true });

    const handleSubmit = () => {
      const userAnswer = inputField.getChildByID("answerInput").value.trim().toLowerCase();
      const correctAnswer = riddle.answer.toLowerCase();

      whiteBox.destroy();
      questionText.destroy();
      inputField.destroy();
      submitBtn.destroy();

      const resultBox = this.add.rectangle(centerX, centerY, 500, 200, 0xFFFFFF);
      resultBox.setScrollFactor(0);
      resultBox.setStrokeStyle(4, 0x000000);

      let resultText;
      if (userAnswer === correctAnswer) {
        resultText = this.add.text(
          centerX,
          centerY,
          "✓ Correct!\n+50 points",
          {
            fontSize: "32px",
            fill: "#00AA00",
            align: "center"
          }
        );
        riddle.destroy();
        this.score += 50;
        this.scoreText.setText('Score: ' + this.score);
      } else {
        resultText = this.add.text(
          centerX,
          centerY,
          `✗ Wrong!\n\nCorrect answer: ${riddle.answer}`,
          {
            fontSize: "28px",
            fill: "#CC0000",
            align: "center"
          }
        );
        riddle.destroy();
      }

      resultText.setScrollFactor(0);
      resultText.setOrigin(0.5);

      this.time.delayedCall(2000, () => {
        resultBox.destroy();
        resultText.destroy();
        this.currentRiddle = null;
        this.physics.resume();
      });
    };

    this.input.keyboard.once("keydown-ENTER", handleSubmit);
    submitBtn.on("pointerdown", handleSubmit);
  }

  setupCoin(coin) {
    this.tweens.add({
      targets: coin,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });

    this.tweens.add({
      targets: coin,
      y: coin.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  handleFinish() {
    this.player.body.setVelocity(0);
    this.player.active = false;

    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    const overlay = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.6);
    overlay.setScrollFactor(0);

    const box = this.add.rectangle(centerX, centerY, 500, 300, 0xffffff);
    box.setScrollFactor(0);

    const scoreText = this.add.text(
      centerX,
      centerY - 60,
      `Your Score: ${this.score}`,
      { fontSize: '40px', fill: '#000' }
    );
    scoreText.setOrigin(0.5);
    scoreText.setScrollFactor(0);

    const replay = this.add.text(
      centerX,
      centerY + 10,
      "Replay",
      { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
    );
    replay.setOrigin(0.5);
    replay.setInteractive();
    replay.setScrollFactor(0);

    replay.on('pointerdown', () => {
      this.scene.restart();
    });

    const exit = this.add.text(
      centerX,
      centerY + 80,
      "Exit",
      { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
    );
    exit.setOrigin(0.5);
    exit.setInteractive();
    exit.setScrollFactor(0);

    exit.on('pointerdown', () => {
      window.mazeGameEvent = 'exit';
      this.game.destroy(true);
    });
  }

  update() {
    if (this.currentRiddle) return;

    const speed = 200;
    const body = this.player.body;
    body.setVelocity(0);

    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    if (this.cursors.right.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown) body.setVelocityY(-speed);
    if (this.cursors.down.isDown) body.setVelocityY(speed);
  }
}