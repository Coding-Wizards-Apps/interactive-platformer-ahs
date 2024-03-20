// Define game configuration
let config = {
    width: 1200,
    height: 400,
  };
  
  // Define variables
  let player;
  let platforms = [];
  let enemies = [];
  let bullets = [];
  let cursors;
  
  function preload() {
    // Load assets like images and spritesheets
    sky = loadImage("assets/sky.png");
    ground = loadImage("assets/platform.png");
    dude = loadImage("assets/dude.png");
  }
  
  function setup() {
    // Create a canvas
    createCanvas(config.width, config.height);
  
    // Create the background
    image(sky, 0, 0, config.width, config.height);
    ground = new Sprite();
    ground.img = loadImage("assets/platform.png");
    ground.scale = 2;
    // Create platforms
    platforms.push(ground);
  
    // Add more ground tiles to create a whole floor
    for (let x = 0; x < config.width; x += 70) {
        ground = new Sprite(x, config.height - 20);
    ground.img = loadImage("assets/platform.png");
    ground.scale = 2;
    }
    
    // Create the player
    player = createSprite(200, 50);
    player.addAnimation('normal', 'assets/dude.png');
    player.addImage("dude", dude);
    player.setCollider("rectangle", 0, 0, 32, 48);
    player.scale = 1.5;
  
    // Create enemies
    for (let i = 0; i < 5; i++) {
      let enemy = createSprite(12 + i * 140, 0);
      enemy.velocity.y = random(0.4, 0.8);
      enemies.push(enemy);
    }
  }
  
  function draw() {
    // Player movement logic
    if (keyIsDown(LEFT_ARROW)) {
      player.velocity.x = -160;
    } else if (keyIsDown(RIGHT_ARROW)) {
      player.velocity.x = 160;
    } else {
      player.velocity.x = 0;
    }
  
    if (keyIsDown(UP_ARROW) && player.collide(platforms)) {
      player.velocity.y = -330;
    }
  
    // Additional check to prevent continuous jumping
    if (!keyIsDown(UP_ARROW) && player.velocity.y < 0) {
      // Apply a slight force upwards to make the jump feel more natural
      player.addSpeed(100, 270);
    }
  
    // Check for collision between bullets and enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (bullets[i].overlap(enemies[j])) {
          bullets[i].remove();
          enemies[j].remove();
        }
      }
    }
  
    // Update sprites
    drawSprites();
  }
  
  function keyPressed() {
    if (keyCode === 32) {
      shootBullet();
    }
  }
  
  function shootBullet() {
    // Create a bullet at the player's position
    let bullet = createSprite(player.position.x, player.position.y - 10);
    bullet.setSpeed(10, 90);
    bullet.life = 50;
    bullets.push(bullet);
  }
  