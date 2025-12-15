import Phaser from 'phaser';

export default class WinterMazeScene extends Phaser.Scene {
  constructor() {
    super('WinterMazeScene');
  }

  create() {
    
    const map = this.make.tilemap({ key: 'winter_maze_map' });
    const tileset = map.addTilesetImage('winter_tiles');

    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    const wallLayer = map.createLayer('Walls', tileset, 0, 0);

    wallLayer.setCollisionByExclusion([-1]);

    this.physics.world.setBounds(
      0,
      0,
      groundLayer.width,   
      groundLayer.height  
    );

    const startX = 32;
    const startY = 272;

    this.coins = this.physics.add.group();

    this.coins = this.physics.add.group();

    const NUM_COINS = 20;               
    const MIN_DISTANCE = 100;            
    const PLAYER_START = { x: startX, y: startY };
    const AVOID_PLAYER_RADIUS = 80;     
    const tileSize = map.tileWidth;

    
    function isWallAt(x, y) {
      return wallLayer.getTileAtWorldXY(x, y) !== null;
    }

    function tooCloseToExisting(x, y) {
      const children = this.coins.getChildren();
      for (let i = 0; i < children.length; i++) {
        const other = children[i];
        if (Phaser.Math.Distance.Between(x, y, other.x, other.y) < MIN_DISTANCE) {
          return true;
        }
      }
      return false;
    }

    for (let i = 0; i < NUM_COINS; i++) {
      let x, y;
      let attempts = 0;

      do {
        attempts++;

        const tileX = Phaser.Math.Between(0, map.width - 1);
        const tileY = Phaser.Math.Between(0, map.height - 1);

        x = tileX * tileSize + tileSize / 2;
        y = tileY * tileSize + tileSize / 2;

        // if attempts explode, stop infinite loops
        if (attempts > 2000) break;

      } while (
          isWallAt(x, y) ||
          tooCloseToExisting.call(this, x, y) ||
          Phaser.Math.Distance.Between(x, y, PLAYER_START.x, PLAYER_START.y) < AVOID_PLAYER_RADIUS
      );

      const coin = this.coins.create(x, y, 'coin');
      this.setupCoin(coin);
    }


    this.player = this.physics.add.sprite(startX, startY, "player");
    this.player.setScale(0.05);   
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, wallLayer);

    this.riddles = this.physics.add.group();

    // Define riddle data
    const riddleData = [
      { question: "I'm a room you can eat. What am I?", answer: "mushroom" },
      { question: "What food has no beginning, middle, or end?", answer: "doughnut" },
      { question: "I get chewed and chewed but never swallowed or eaten. I'm always thrown away. What am I?", answer: "chewing gum" },
      { question: "What's the saddest fruit?", answer: "blueberry" },
      { question: "I have eyes but cannot see. What am I?", answer: "potato" }
    ];

    // Place riddles randomly in walkable areas
    this.placeRiddlesRandomly(map, groundLayer, riddleData);

    this.physics.add.overlap(this.player, this.riddles, this.triggerRiddle, null, this);

    // Coin collection overlap
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();

    const camera = this.cameras.main;

    const zoomX = camera.width / groundLayer.width;
    const zoomY = camera.height / groundLayer.height;
    const finalZoom = Math.min(zoomX, zoomY);

    camera.setZoom(finalZoom);

    camera.setBounds(0, 0, groundLayer.width, groundLayer.height);

    camera.centerOn(groundLayer.width / 2, groundLayer.height / 2);

    this.score = 0;
    this.scoreText = this.add.text(-620, -365, 'Score: 0', {
      fontSize: '36px',
      fill: '#f84',
      stroke: '#000',
      strokeThickness: 3
    });
    this.scoreText.setScrollFactor(0); 

    // --- FINISH ZONE ---
    const finishLayer = map.getObjectLayer("Finish");
    if (finishLayer && finishLayer.objects.length > 0) {
      const f = finishLayer.objects[0];

      this.finishZone = this.physics.add.staticImage(f.x, f.y, null)
        .setSize(f.width, f.height)
        .setOrigin(0)
        .setVisible(false);

      this.physics.add.overlap(this.player, this.finishZone, () => {
        this.handleFinish();
      });
    }

  }

  placeRiddlesRandomly(map, collisionLayer, riddleData) {
      const tileSize = map.tileWidth;
      const mapWidth = map.widthInPixels;
      const mapHeight = map.heightInPixels;
      const placedPositions = [];
      const minDistance = 100; // Minimum distance between riddles
  
      riddleData.forEach(data => {
        let attempts = 0;
        let placed = false;
  
        while (!placed && attempts < 200) {
          // Generate random position aligned to tile grid
          const tileX = Phaser.Math.Between(1, Math.floor(mapWidth / tileSize) - 1);
          const tileY = Phaser.Math.Between(1, Math.floor(mapHeight / tileSize) - 1);
          const x = tileX * tileSize + tileSize / 2;
          const y = tileY * tileSize + tileSize / 2;
  
          // Check if position is walkable (not colliding)
          const tile = collisionLayer.getTileAtWorldXY(x, y);
          const isWalkable = !tile || tile.index === -1 || !tile.collides;
  
          // Check if position is far enough from other riddles
          const isFarEnough = placedPositions.every(pos => {
            const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
            return distance >= minDistance;
          });
  
          // Check if position is far enough from player start
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
          console.warn("Could not place riddle after 200 attempts:", data.question);
        }
      });
    }
  
    triggerRiddle(player, riddle) {
      // Prevent multiple triggers
      if (this.currentRiddle) return;
  
      this.currentRiddle = riddle;
      this.physics.pause();
  
      // Get camera properties
      const cam = this.cameras.main;
      const centerX = cam.width / 2-100;
      const centerY = cam.height / 2;
  
      // *** NEW: Get the final calculated zoom factor from the game state ***
      // We assume the zoom factor is set in 'create' and remains constant.
      // The camera's current zoom is the factor needed for DOM correction.
      const cameraZoom = cam.zoom;
  
      // Define Box Dimensions
      const boxWidth = 950;
      const boxHeight = 550;
  
      // CENTER THE WHITE BOX ON THE CAMERA VIEW
      const whiteBox = this.add.rectangle(centerX, centerY, boxWidth, boxHeight, 0xFFFFFF);
      whiteBox.setScrollFactor(0);
      whiteBox.setStrokeStyle(4, 0x000000);
  
      // Define layout coordinates based on the centered box
      const leftMarginX = centerX - boxWidth / 2 + 20;
      const topMarginY = centerY - boxHeight / 2 + 40;
  
      // Add image
      const sideImage = this.add.image(leftMarginX + 200, topMarginY + 300, "vendor");
      sideImage.setScrollFactor(0);
      sideImage.setDisplaySize(400, 400);
  
      // POSITION QUESTION TEXT
      const questionTextX = leftMarginX + 200;
      const questionText = this.add.text(
        questionTextX,
        topMarginY,
        riddle.question || "No question found",
        {
          fontSize: "32px",
          fill: "#000000",
          align: "middle",
          wordWrap: { width: boxWidth - 220 }
        }
      );
      questionText.setScrollFactor(0);
      questionText.setOrigin(0, 0);
  
      // --- INPUT AREA ---
  
      const inputAreaY = topMarginY + 200;
  
      // "Your Answer:" label
      const promptText = this.add.text(
        leftMarginX + 570,
        inputAreaY + 30,
        "Your Answer:",
        {
          fontSize: "38px",
          fill: "#000000"
        }
      );
      promptText.setScrollFactor(0);
      promptText.setOrigin(0, 0);
  
      // Input field DOM element dimensions
      const inputWidth = 350;
      const inputHeight = 46;
  
      // Calculate position in Phaser's world coordinates (relative to camera center)
      const inputFieldX = leftMarginX + inputWidth / 2;
      const inputFieldY = inputAreaY - 300;
  
      // *** NEW: Apply reverse scale transformation to the DOM object ***
      // This scales the DOM element up so that when the camera zoom scales it down, 
      // it ends up appearing at the correct size.
  
      const inputField = this.add.dom(inputFieldX+1000, inputFieldY +700)
        .createFromHTML(`
          <input
            type="text" 
            id="answerInput" 
            style="
              width: ${inputWidth}px;
              padding: 12px;
              font-size: 20px;
              border: 2px solid #000;
              border-radius: 5px;
               
            "
            autofocus
          />
        `);
      inputField.setScrollFactor(0);
  
  
      // Submit button (positioning remains the same, as it's a Phaser object)
      const submitBtn = this.add.text(
        leftMarginX + 610,
        inputFieldY + inputHeight / 2 + 460,
        "Submit",
        {
          fontSize: "44px",
          fill: "#fff",
          backgroundColor: "#4CAF50",
          padding: { x: 20, y: 8 }
        }
      );
      submitBtn.setScrollFactor(0);
      submitBtn.setOrigin(0, 0);
  
      submitBtn.setInteractive({ useHandCursor: true });
  
      // Handle submission
      const handleSubmit = () => {
        // ... rest of the submit logic
        const userAnswer = inputField.getChildByID("answerInput").value.trim().toLowerCase();
        const correctAnswer = riddle.answer.toLowerCase();
  
        // Clear the white box content
        whiteBox.destroy();
        questionText.destroy();
        sideImage.destroy();
        promptText.destroy();
        inputField.destroy();
        submitBtn.destroy();
  
        // Show result in a new simple box - using camera-centered coordinates
        const resultBox = this.add.rectangle(centerX, centerY, 600, 200, 0xFFFFFF);
        resultBox.setScrollFactor(0);
        resultBox.setStrokeStyle(4, 0x000000);
  
        let resultText;
        if (userAnswer === correctAnswer) {
          resultText = this.add.text(
            centerX,
            centerY,
            "✓ Correct!\n+50 points",
            {
              fontSize: "36px",
              fill: "#00AA00",
              align: "center"
            }
          );
  
          // Remove the riddle from the game
          riddle.destroy();
  
          // Add bonus points
          this.score += 50;
          this.scoreText.setText('Score: ' + this.score);
        } else {
          resultText = this.add.text(
            centerX,
            centerY,
            `✗ Wrong!\n\nCorrect answer: ${riddle.answer}`,
            {
              fontSize: "32px",
              fill: "#CC0000",
              align: "center"
            }
          );
  
          // Still remove riddle even if wrong
          riddle.destroy();
        }
  
        resultText.setScrollFactor(0);
        resultText.setOrigin(0.5);
  
        // Clean up after 2 seconds
        this.time.delayedCall(2000, () => {
          resultBox.destroy();
          resultText.destroy();
  
          this.currentRiddle = null;
          this.physics.resume();
        });
      };
  
      // Enter key handler
      this.input.keyboard.once("keydown-ENTER", handleSubmit);
  
      // Click handler for submit button
      submitBtn.on("pointerdown", handleSubmit);
    }

  setupCoin(coin) {
    // Add smooth rotation tween
    this.tweens.add({
      targets: coin,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });

    // Optional: Add floating effect
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
    
    // Optional: Add collection sound
    // this.sound.play('coinSound');
  }

  handleFinish() {
    // Stop player movement
    this.player.body.setVelocity(0);
    this.player.active = false;
  
    const { width, height } = this.cameras.main;
  
    // Dark transparent background
    const overlay = this.add.rectangle(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2,
      width,
      height,
      0x000000,
      0.6
    );
    overlay.setScrollFactor(0);
  
    // Popup box
    const box = this.add.rectangle(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2,
      500,
      300,
      0xffffff,
    );
    box.setScrollFactor(0);
  
    // Score text
    const scoreText = this.add.text(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2 - 60,
      `Your Score: ${this.score}`,
      { fontSize: '40px', fill: '#000' }
    );
    scoreText.setOrigin(0.5);
    scoreText.setScrollFactor(0);
  
    // Replay button
    const replay = this.add.text(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2 + 10,
      "Replay",
      { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
    );
    replay.setOrigin(0.5);
    replay.setInteractive();
    replay.setScrollFactor(0);
  
    replay.on('pointerdown', () => {
      this.scene.start("FallMazeScene"); // restart this same maze
    });
  
    // Exit button
    const exit = this.add.text(
      this.cameras.main.worldView.x + width / 2,
      this.cameras.main.worldView.y + height / 2 + 80,
      "Exit",
      { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
    );
    exit.setOrigin(0.5);
    exit.setInteractive();
    exit.setScrollFactor(0);
  
    exit.on('pointerdown', () => {
      this.scene.start("MainMenu"); // or whatever your menu scene is called
    });
  }  

  update() {
    if (this.currentRiddle) return;

    const speed = 200;
    const body = this.player.body;

    body.setVelocity(0);

    if (this.cursors.left.isDown)  body.setVelocityX(-speed);
    if (this.cursors.right.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown)    body.setVelocityY(-speed);
    if (this.cursors.down.isDown)  body.setVelocityY(speed);
  }
}
