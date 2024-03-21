let config = {
  width: 1200,
  height: 1000,
};

// Define variables
let player;
let platforms = [];
let enemies = [];
let bullets = [];
let cursors;
let playerDirection = 1;
let door;
let startTime = Date.now();
const playerSpeed = 2.5;
function preload() {
  // Load assets like images and spritesheets
  sky = loadImage('assets/sky.png');
  ground = loadImage('assets/platform.png');
  dude = loadImage('assets/1x/standing.png');
  doorImg = loadImage('assets/door.png');
}

async function setup() {
  createCanvas(config.width, config.height);
  world.gravity.y = 10;

  floor = new Sprite();
  floor.y = config.height - 5;
  floor.w = config.width;
  floor.h = 5;
  floor.collider = 'static';
  player = new Sprite(50, 50, 40, 350);
  player.scale = .25;
  player.img = dude;
  player.bounciness = 0.5;
  // player.collider = 'dynamic';
  player.rotationLock = true;
  image(sky, 0, 0, config.width, config.height);

  platforms = new Group();
  platforms.img = ground;
  platforms.collider = 'static';

  // for (let x = 0; x < config.width; x += 50) {
  //   let platform = new platforms.Sprite();
  //   platform.x = x;
  //   platform.y = config.height - 100;
  //   platforms.add(platform);
  // }

  for (let x = 0; x < config.width * 3; x += 70) {
    platform = new platforms.Sprite();
    platform.x = x;
    platform.y = random(0, config.height);
  }

  for (let i = 0; i < 5; i++) {
    let enemy = createSprite(12 + i * 140, 0);
    enemy.velocity.y = random(0.4, 0.8);
    enemies.push(enemy);
  }

  door = createSprite(config.width / 2, 0);
  door.img = doorImg;
  door.collider = 'static';
  door.scale.x = 4.5;
}

function draw() {
  clear();
  // Player movement logic
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    // LEFT_ARROW or 'A' key
    playerDirection = -1;
    player.velocity.x = playerDirection * playerSpeed;
    player.scale.x = -0.25;
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    // RIGHT_ARROW or 'D' key
    playerDirection = 1;
    player.velocity.x = playerDirection * playerSpeed;
    player.scale.x = 0.25;
  } else {
    player.velocity.x = 0;
  }

  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && (player.collide(platforms) || player.collide(floor))) {
    // UP_ARROW or 'W' key
    player.velocity.y = -11;
  }

  // Additional check to prevent continuous jumping
  if (!keyIsDown(UP_ARROW) && !keyIsDown(87) && player.velocity.y < 0) {
    // UP_ARROW or 'W' key
    // Apply a higher force upwards to make the jump higher
    player.velocity.y += 1;
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

  // Check for collision between player and enemies
  for (let i = 0; i < enemies.length; i++) {
    if (player.collide(enemies[i])) {
      resetGame();
      break;
    }
  }

  // Check for collision between player and enemies
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    if (!enemy.framesRemaining) {
      enemy.framesRemaining = Math.floor(Math.random() * 10) + 50;
      enemy.directionX = Math.random() < 0.5 ? -1 : 1;
      enemy.speed = 1; // Adjust the speed as needed
    }
    enemy.framesRemaining--;

    // Add a small delay between each movement update
    if (enemy.framesRemaining % 10 === 0) {
      enemy.velocity.x = enemy.directionX * enemy.speed;
    }
  }

  // Check for collision between player and door
  if (player.collide(door)) {
    // Stop the game
    noLoop();

    // Calculate highscore based on seconds used to reach the top
    let endTime = Date.now();
    let highscore = Math.floor((endTime - startTime) / 1000); // startTime should be defined when the game starts

    console.log(`Highscore: ${highscore} seconds`);
  }
  camera.y = player.y;
  // end of draw
}

function resetGame() {
  // Reset player position
  player.position.x = config.width / 2;
  player.position.y = config.height / 2;

  // Reset enemy positions
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].position.x = 12 + i * 140;
    enemies[i].position.y = 0;
  }

  // Remove all bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].remove();
  }
}

function keyPressed() {
  if (keyCode === 32) {
    shootBullet();
  }
}

function shootBullet() {
  // Create a bullet at the player's position
  let bullet = createSprite(player.position.x + playerDirection * 10, player.position.y - 10);
  // bullet.setSpeed(1000, 1000);
  bullet.velocity.x = playerDirection * 50;
  bullet.life = 50;
  bullets.push(bullet);
}
