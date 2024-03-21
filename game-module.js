export default class Game {
  constructor() {
    this.config = {
      width: 1200,
      height: 1000,
    };

    this.player = null;
    this.platforms = [];
    this.enemies = [];
    this.bullets = [];
    this.cursors = null;
    this.playerDirection = 1;
    this.door = null;
    this.startTime = Date.now();
    this.playerSpeed = 2.5;
    this.sky = null;
    this.ground = null;
    this.dude = null;
    this.doorImg = null;
    this.platform = null;
  }

  preload() {
    this.sky = loadImage("assets/sky.png");
    this.ground = loadImage("assets/platform.png");
    this.dude = loadImage("assets/1x/standing.png");
    this.doorImg = loadImage("assets/door.png");
  }

  async setup(clusters) {
    createCanvas(this.config.width, this.config.height);
    world.gravity.y = 10;
    console.log("clusters", clusters);
    floor = new Sprite();
    floor.y = this.config.height - 5;
    floor.w = this.config.width;
    floor.h = 5;
    floor.collider = "static";
    this.player = new Sprite(50, 50, 40, 350);
    this.player.scale = 0.25;
    this.player.img = this.dude;
    this.player.bounciness = 0.5;
    // player.collider = 'dynamic';
    this.player.rotationLock = true;
    image(this.sky, 0, 0, this.config.width, this.config.height);

    this.platforms = new Group();
    this.platforms.img = this.ground;
    this.platforms.collider = "static";

    if(!clusters){

    for (let x = 0; x < this.config.width * 3; x += 70) {
      let platform = new this.platforms.Sprite();
      platform.x = x;
      platform.y = random(0, this.config.height);
    }
  } else {
    for (let cluster of clusters) {
      let platform = new this.platforms.Sprite();
      platform.x = cluster.pixels[0].coordX * 10;
      platform.y = cluster.pixels[0].coordY * 10;
    }
  }


    for (let i = 0; i < 5; i++) {
      let enemy = createSprite(12 + i * 140, 0);
      enemy.velocity.y = random(0.4, 0.8);
      this.enemies.push(enemy);
    }

    this.door = createSprite(this.config.width / 2, 0);
    this.door.img = this.doorImg;
    this.door.collider = "static";
    this.door.scale.x = 4.5;
  }

  draw() {
    clear();
    // Player movement logic
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      // LEFT_ARROW or 'A' key
      this.playerDirection = -1;
      this.player.velocity.x = this.playerDirection * this.playerSpeed;
      this.player.scale.x = -0.25;
    } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      // RIGHT_ARROW or 'D' key
      this.playerDirection = 1;
      this.player.velocity.x = this.playerDirection * this.playerSpeed;
      this.player.scale.x = 0.25;
    } else {
      this.player.velocity.x = 0;
    }

    if (
      (keyIsDown(UP_ARROW) || keyIsDown(87)) &&
      (this.player.collide(this.platforms) || this.player.collide(floor))
    ) {
      // UP_ARROW or 'W' key
      this.player.velocity.y = -11;
    }

    // Additional check to prevent continuous jumping
    if (!keyIsDown(UP_ARROW) && !keyIsDown(87) && this.player.velocity.y < 0) {
      // UP_ARROW or 'W' key
      // Apply a higher force upwards to make the jump higher
      this.player.velocity.y += 1;
    }

    // Check for collision betweenthis.bullets and enemies
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        if (this.bullets[i].overlap(this.enemies[j])) {
          this.bullets[i].remove();
          this.enemies[j].remove();
        }
      }
    }

    // Check for collision between player and enemies
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.player.collide(this.enemies[i])) {
        this.resetGame();
        break;
      }
    }

    // Check for collision between player and enemies
    for (let i = 0; i < this.enemies.length; i++) {
      let enemy = this.enemies[i];
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
    if (this.player.collide(this.door)) {
      // Stop the game
      noLoop();

      // Calculate highscore based on seconds used to reach the top
      let endTime = Date.now();
      let highscore = Math.floor((endTime - startTime) / 1000); // startTime should be defined when the game starts

      console.log(`Highscore: ${highscore} seconds`);
    }
    camera.y = this.player.y;
    // end of draw
  }

  resetGame() {
    // Reset player position
    this.player.position.x = this.config.width / 2;
    this.player.position.y = this.config.height / 2;

    // Reset enemy positions
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].position.x = 12 + i * 140;
      this.enemies[i].position.y = 0;
    }

    // Remove allthis.bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].remove();
    }
  }

  

  shootBullet() {
    // Create a bullet at the player's position
    let bullet = createSprite(
      this.player.position.x + this.playerDirection * 10,
      this.player.position.y - 10
    );
    // bullet.setSpeed(1000, 1000);
    bullet.velocity.x = this.playerDirection * 50;
    bullet.life = 50;
    this.bullets.push(bullet);
  }
}
