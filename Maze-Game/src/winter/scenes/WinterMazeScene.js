import Phaser from 'phaser';
import { api } from "../../services/api";

export default class WinterMazeScene extends Phaser.Scene {
  constructor() {
    super('WinterMazeScene');
    this.selectedCharacter = "jack_o_lantern"; // default
    this.sceneReady = false; // Flag to track if create() has finished
  }

  async create() {
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

    console.log("Attempting to create player with texture:", this.selectedCharacter);
    console.log("Available textures:", this.textures.list);
    console.log("Does texture exist?", this.textures.exists(this.selectedCharacter));

    if (!this.textures.exists(this.selectedCharacter)) {
      console.warn(`Texture '${this.selectedCharacter}' not found! Available:`, this.textures.list);
      console.warn("Using fallback: jack_o_lantern");
      this.selectedCharacter = "jack_o_lantern";
    }

    this.player = this.physics.add.sprite(startX, startY, this.selectedCharacter);
    this.player.setDisplaySize(64, 64);
    this.player.body.setSize(40, 40);
    this.player.setCollideWorldBounds(true);
    console.log("Player created at:", this.player.x, this.player.y, "with character:", this.selectedCharacter);

    this.physics.add.collider(this.player, wallLayer);

    // Riddles
    this.riddles = this.physics.add.group();
    const riddleData = [
      { question: "I'm bought to eat but never eaten. What am I?", answer: "plate" },
      { question: "I'm a fruit that's also a day on the calendar. What am I?", answer: "date" },
      { question: "I'm famous as a company and known for the letter 'i'.", answer: "apple" },
      { question: "I'm a container without hinges, lock, or key, yet a golden treasure lies inside me. What am I?", answer: "egg" },
      { question: "I am the only food that truly lasts forever. What am I?", answer: "honey" }
    ];

    this.placeRiddlesRandomly(map, wallLayer, riddleData);
    this.physics.add.overlap(this.player, this.riddles, this.triggerRiddle, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

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

    this.sceneReady = true; // Mark scene as ready
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

  async handleFinish() {
    // Stop player movement
    if (this.finishTriggered) return;
    this.finishTriggered = true;

    this.player.body.setVelocity(0);
    this.player.active = false;
    this.physics.pause();

    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Dark transparent background
    const overlay = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.6);
    overlay.setScrollFactor(0);

    // Popup box
    const box = this.add.rectangle(centerX, centerY, 500, 300, 0xffffff);
    box.setScrollFactor(0);

    // Score text
    const scoreText = this.add.text(
      centerX,
      centerY - 60,
      `Your Score: ${this.score}`,
      { fontSize: '40px', fill: '#000' }
    );
    scoreText.setOrigin(0.5);
    scoreText.setScrollFactor(0);

    // Replay button
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
        await api.completeMaze('winter', this.score);
        console.log(`Saved ${this.score} tokens!`);
      } catch (err) {
        console.error('Failed to save tokens:', err);
      }


      // Reset all scene state
      this.finishTriggered = false;
      this.sceneReady = false;
      this.currentRiddle = null;

      this.scene.restart(); // Restart Winter Maze
    });

    // Exit/Store button
    // Exit/Store button
    const exit = this.add.text(
      centerX,
      centerY + 80,
      "Store",
      { fontSize: '32px', fill: '#000', backgroundColor: '#ddd', padding: 12 }
    );
    exit.setOrigin(0.5);
    exit.setInteractive({ useHandCursor: true }); // FIXED: removed extra ()
    exit.setScrollFactor(0);

    exit.on('pointerdown', async () => {
      console.log("Store button clicked");
      try {
        // Save tokens to backend before exiting
        await api.completeMaze('winter', this.score);
        console.log(`Saved ${this.score} tokens!`);
      } catch (err) {
        console.error('Failed to save tokens:', err);
      }
      window.mazeGameEvent = 'exit';
      // this.game.destroy(true);

      await new Promise(resolve => setTimeout(resolve, 100));
    });
  }

  update() {
    // Guard: don't run update until scene is fully created
    if (!this.sceneReady || !this.player) return;

    const speed = 200;
    const body = this.player.body;

    body.setVelocity(0);

    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    if (this.cursors.right.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown) body.setVelocityY(-speed);
    if (this.cursors.down.isDown) body.setVelocityY(speed);
  }
}


