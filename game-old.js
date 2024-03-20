// Define game configuration


let config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 400,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

// Create a new Phaser game instance
let game = new Phaser.Game(config);

let bullets; // Global variable to store bullets

function preload() {
  // Load assets like images and spritesheets
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  // Create the background
  this.add.image(400, 300, "sky");

  // Create platforms
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  // Add more ground tiles to create a whole floor
  for (let x = 0; x < config.width; x += 70) {
    platforms.create(x, config.height - 20, "ground");
  }

  // Create the player
  player = this.physics.add.sprite(200, 50, "dude");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // Create enemies
  enemies = this.physics.add.group({
    key: "enemy",
    repeat: 5,
    setXY: { x: 12, y: 0, stepX: 140 },
  });

  enemies.children.iterate(function (child) {
    //  Give each enemy a slightly different bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  // Collide the player and enemies with the platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(enemies, platforms);

  // Collide the player with the enemies
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // Create player animations
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  // Define cursors for player movement
  cursors = this.input.keyboard.createCursorKeys();

  // Create bullets group
  bullets = this.physics.add.group();

  // Register spacebar key for shooting
  this.input.keyboard.on("keydown-SPACE", shootBullet);
}

function shootBullet() {
  // Create a bullet at the player's position
  var bullet = bullets.create(player.x, player.y - 10, "bullet");
  bullet.setVelocityX(400); // Set bullet velocity to move upwards
}

function update() {
  // Player movement logic
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }

  // Additional check to prevent continuous jumping
  if (!cursors.up.isDown && player.body.velocity.y < 0) {
    // Apply a slight force upwards to make the jump feel more natural
    player.setAccelerationY(100);
  }
  // Check for collision between bullets and enemies
  this.physics.overlap(bullets, enemies, destroyEnemy, null, this);
}

function destroyEnemy(bullet, enemy) {
  // Remove bullet and enemy upon collision
  bullet.destroy();
  enemy.destroy();
}

function hitEnemy(player, enemy) {
  // Reset the player's position
  player.setX(100);
  player.setY(450);
  player.setVelocity(0);
}
