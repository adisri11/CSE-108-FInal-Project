import Phaser from "phaser";
import { api } from "../../services/api";

export default class FallMazeScene extends Phaser.Scene {
  constructor() {
    super("FallMazeScene");
    this.selectedCharacter = "jack_o_lantern"; // default
    this.sceneReady = false; // Flag to track if create() has finished
  }

  async create() {
    console.log("=== CREATE STARTED ===");
    
    // Fetch the user's selected character from backend
    try {
      const userData = await api.getUser();
      console.log("Backend user data:", userData);
      this.selectedCharacter = userData.character || "jack_o_lantern";
      console.log("Selected character:", this.selectedCharacter);
    } catch (err) {
      console.error("Failed to fetch character, using default:", err);
      this.selectedCharacter = "jack_o_lantern";
    }

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
    this.scoreText = this.add.text(-620, -365, 'Score: 0', {
      fontSize: '36px',
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

    // Create player with selected character - THIS IS THE KEY CHANGE
    console.log("Attempting to create player with texture:", this.selectedCharacter);
    console.log("Available textures:", this.textures.list);
    console.log("Does texture exist?", this.textures.exists(this.selectedCharacter));
    
    if (!this.textures.exists(this.selectedCharacter)) {
      console.warn(`Texture '${this.selectedCharacter}' not found! Available:`, this.textures.list);
      console.warn("Using fallback: jack_o_lantern");
      this.selectedCharacter = "jack_o_lantern";
    }
    
    this.player = this.physics.add.sprite(200, 100, this.selectedCharacter);
    this.player.setDisplaySize(64, 64);
    this.player.body.setSize(40, 40);
    this.player.body.setCollideWorldBounds(true);
    console.log("Player created at:", this.player.x, this.player.y, "with character:", this.selectedCharacter);

    // ... rest of your create method stays the same ...
    
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
      { question: "I get chewed and chewed but never swallowed or eaten. I'm always thrown away. What am I?", answer: "gum" },
      { question: "What's the saddest fruit?", answer: "blueberry" },
      { question: "I have eyes but cannot see. What am I?", answer: "potato" }
    ];

    this.placeRiddlesRandomly(map, layer2, riddleData);
    this.physics.add.overlap(this.player, this.riddles, this.triggerRiddle, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // CAMERA SETUP
    const camera = this.cameras.main;
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;
    const zoomX = camera.width / mapWidth;
    const zoomY = camera.height / mapHeight;
    const finalZoom = Math.min(zoomX, zoomY);

    camera.setZoom(finalZoom);
    camera.setBounds(0, 0, mapWidth, mapHeight);
    camera.centerOn(mapWidth / 2, mapHeight / 2);

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.sceneReady = true; // Mark scene as ready
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
        fontSize: "30px",
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


  async handleFinish() {
    // Prevent multiple triggers
    if (this.finishTriggered) return;
    this.finishTriggered = true;
    
    this.player.body.setVelocity(0);
    this.player.active = false;
    this.physics.pause(); // Pause physics to prevent any movement

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
    replay.setInteractive({ useHandCursor: true });
    replay.setScrollFactor(0);

    replay.on('pointerdown', async () => {
      console.log("Replay button clicked");
      try {
        // Save tokens to backend when replaying
        await api.completeMaze('fall', this.score);
        console.log(`Saved ${this.score} tokens!`);
      } catch (err) {
        console.error('Failed to save tokens:', err);
      }
      
      // Reset all scene state
      this.finishTriggered = false;
      this.sceneReady = false;
      this.currentRiddle = null;
      
      // Restart the scene
      this.scene.restart();
    });
    
    // Exit button
    const exit = this.add.text(
      centerX,
      centerY + 80,
      "Store",
      { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
    );
    exit.setOrigin(0.5);
    exit.setInteractive({ useHandCursor: true });
    exit.setScrollFactor(0);

    exit.on('pointerdown', async () => {
      console.log("Store button clicked");
      try {
        // Save tokens to backend when exiting to store
        await api.completeMaze('fall', this.score);
        console.log(`Saved ${this.score} tokens!`);
      } catch (err) {
        console.error('Failed to save tokens:', err);
      }
      
      // Set the exit event flag
      window.mazeGameEvent = 'exit';
      console.log("Set mazeGameEvent to 'exit'");
      
      // Small delay to ensure the event is set before destruction
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  }

  update() {
    // Guard: don't run update until scene is fully created
    if (!this.sceneReady || !this.player) return;
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