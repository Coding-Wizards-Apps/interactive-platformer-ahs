const Game = (() => {
  let config = {
    width: window.innerWidth,

    height: window.innerHeight,
  };

  // Variables related to player
  let player = null;
  let playerDirection = 1;
  let playerSpeed = 2.5;
  let playerImg = null;
  let playerJumpVelocity = -15;

  // Variables related to door
  let door = null;
  let doorImg = null;

  // Variables related to time
  let startTime;

  // Variables related to environment
  let sky = null;
  let ground = null;

  // Variables related to game elements
  let bulletInstances = [];
  let platforms = [];
  let enemies = [];
  let bullets = [];

  // Variables related to scoring and display
  let highScore = 0;
  let scoreText = null;
  let enemyImg = null;
  let bulletImg = null;

  let clusterList = null;

  function updateHighScore() {
    let currentTime = Math.floor((Date.now() - startTime) / 1000);
    if (currentTime > highScore) {
      highScore = currentTime;
    }
    scoreText = `High Score: ${highScore}s`;
  }

  function displayHighScore() {
    fill(255);
    textSize(32);
    text(scoreText, config.width - 300, 50);
  }
  function preload() {
    sky = loadImage('assets/sky.png');
    ground = loadImage('assets/platform.png');
    playerImg = loadImage('assets/Colorful_Super_ball.png');
    doorImg = loadImage('assets/door.png');
    bulletImg = loadImage('assets/dentures.png');
    enemyImg = loadImage('assets/monster.png');
  }

  function setup(clusters) {
    clusterList = clusters;
    startTime = Date.now();
    createCanvas(config.width, config.height);
    setupWorld();
    createFloor();
    createBorders();
    createPlayer();
    createPlatforms(clusters);
    createDoor();
    drawBackground();
    bullets = new Group();
    bullets.img = bulletImg;
    bullets.scale = 0.1;
    for (let i = 0; i < enemies.length; i++) {
      for (let j = i + 1; j < enemies.length; j++) {
        if (enemies[i].overlap(enemies[j])) {
          // Handle overlap between enemies[i] and enemies[j]
        }
      }
    }
    document.querySelector('#defaultCanvas0').style.width = `${config.width}px`;
    document.querySelector(
      '#defaultCanvas0'
    ).style.height = `${config.height}px`;
    document
      .querySelector('#defaultCanvas0')
      .style.setProperty('width', `${config.width}px`, 'important');
    document
      .querySelector('#defaultCanvas0')
      .style.setProperty('height', `${config.height}px`, 'important');
  }

  function draw() {
    clear();
    handlePlayerMovement();
    checkBulletEnemyCollision();
    checkPlayerEnemyCollision();
    updateEnemyMovement();
    checkPlayerDoorCollision();
    updateHighScore();
    displayHighScore();
    adjustCameraPosition();
    console.log(player.velocity);

    if (player.velocity.y > 20) {
      player.velocity.y = 0;
    }
  }

  function handlePlayerMovement() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      movePlayer(-1, -0.25);
    } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      movePlayer(1, 0.25);
    } else {
      player.velocity.x = 0;
    }

    if (
      (keyIsDown(UP_ARROW) || keyIsDown(87)) &&
      (player.collide(platforms) || player.collide(floor))
    ) {
      player.velocity.y = playerJumpVelocity;
    }

    if (!keyIsDown(UP_ARROW) && !keyIsDown(87) && player.velocity.y < 0) {
      player.velocity.y += 1;
    }
  }

  function movePlayer(direction, scaleX) {
    playerDirection = direction;
    player.velocity.x = playerDirection * playerSpeed;
    player.scale.x = scaleX;
  }

  function checkBulletEnemyCollision() {
    for (let i = bulletInstances.length - 1; i >= 0; i--) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (bulletInstances[i].overlap(enemies[j])) {
          bulletInstances[i].remove();
          enemies[j].remove();
        }
      }
    }
  }

  function checkPlayerEnemyCollision() {
    for (let i = 0; i < enemies.length; i++) {
      if (player.collide(enemies[i])) {
        resetGame();
        break;
      }
    }
  }

  // function updateEnemyMovement() {
  //   for (let i = 0; i < enemies.length; i++) {
  //     let enemy = enemies[i];
  //     if (!enemy.framesRemaining) {
  //       enemy.framesRemaining = Math.floor(Math.random() * 10) + 50;
  //       enemy.directionX = Math.random() < 0.5 ? -1 : 1;
  //       enemy.speed = 1; // Adjust the speed as needed
  //     }
  //     enemy.framesRemaining--;

  //     if (enemy.framesRemaining % 10 === 0) {
  //       enemy.velocity.x = enemy.directionX * enemy.speed;
  //     }
  //   }
  // }
  function updateEnemyMovement() {
    for (let i = 0; i < enemies.length; i++) {
      let enemy = enemies[i];
      if (!enemy.framesRemaining) {
        console.log('enemy', enemy);
        enemy.framesRemaining = Math.floor(Math.random() * 10) + 150;

        let platformUnderneath = platforms.find(
          (p) =>
            p.position.y > enemy.position.y &&
            p.position.y - enemy.position.y < 60
        );
        if (platformUnderneath) {
          enemy.directionX = Math.random() < 0.5 ? -0.5 : 0.5;
          enemy.speed = 0; // Starting speed is 0
          enemy.acceleration = 0.02; // Adjust the acceleration as needed
          enemy.maxSpeed = 1.5; // Adjust the maximum speed as needed
          enemy.jumpProbability = 0.01; // Adjust the jump probability as needed
        } else {
          enemy.directionX = 0.1;
        }
      }
      enemy.framesRemaining--;

      // Apply acceleration
      if (enemy.speed < enemy.maxSpeed) {
        enemy.speed += enemy.acceleration;
      }

      // Apply velocity
      enemy.velocity.x = enemy.directionX * enemy.speed;

      // Simulate friction or air resistance
      enemy.velocity.x *= 0.99; // Adjust the friction factor as needed

      // Jump randomly if touching the floor or platforms
      if (
        Math.random() < enemy.jumpProbability &&
        (enemy.collide(platforms) || enemy.collide(floor))
      ) {
        enemy.velocity.y = -10; // Adjust the jump velocity as needed
      }
    }
  }

  function checkPlayerDoorCollision() {
    if (player.collide(door)) {
      noLoop();
      let endTime = Date.now();
      let highscore = Math.floor((endTime - startTime) / 1000);
      let highScoreElement = document.querySelector('#highscore');
      highScoreElement.innerText = `High Score: ${highscore}s`;
      highScoreElement.style.display = 'block';
    }
  }

  function adjustCameraPosition() {
    camera.y = player.y;
  }

  function resetGame() {
    // Reset player position
    player.position.x = config.width / 2;
    player.position.y = config.height - 50;

    // Reset enemy positions
    for (let i = 0; i < enemies.length; i++) {
      let cluster = clusterList[Math.floor(Math.random() * clusterList.length)];
      enemies[i].position.x = (cluster.pixels[0].coordX * config.width) / 100;
      enemies[i].position.y =
        (cluster.pixels[0].coordY * config.height) / 100 - 20;
    }

    // Remove allbullets
    for (let i = bulletInstances.length - 1; i >= 0; i--) {
      bulletInstances[i].remove();
    }
  }

  function shootBullet() {
    // Create a bullet at the player's position
    let bullet = new bullets.Sprite(
      player.position.x + playerDirection * 10,
      player.position.y - 10
    );
    // let bullet = createSprite(
    //   player.position.x + playerDirection * 10,
    //   player.position.y - 10
    // );
    // bullet.setSpeed(1000, 1000);
    bullet.scale *= playerDirection;

    bullet.velocity.x = playerDirection * 10;
    bullet.life = 50;
    bulletInstances.push(bullet);
  }

  function setupWorld() {
    world.gravity.y = 10;
  }

  function createFloor() {
    floor = new Sprite();
    floor.y = config.height - 5;
    floor.w = config.width;
    floor.h = 5;
    floor.collider = 'static';
  }

  function createBorders() {
    let leftBorder = new Sprite();
    leftBorder.x = -5;
    leftBorder.y = config.height / 2;
    leftBorder.w = 5;
    leftBorder.h = config.height;
    leftBorder.collider = 'static';

    let rightBorder = new Sprite();
    rightBorder.x = config.width + 5;
    rightBorder.y = config.height / 2;
    rightBorder.w = 5;
    rightBorder.h = config.height;
    rightBorder.collider = 'static';
  }

  function createPlayer() {
    player = new Sprite(50, 50, 125, 125);
    player.scale = 0.25;
    player.img = playerImg;
    player.bounciness = 2;
    player.rotationLock = false;
    player.y = config.height - 50;
  }

  function createPlatforms(clusters) {
    platforms = new Group();
    platforms.img = ground;
    platforms.collider = 'static';

    if (!clusters) {
      for (let x = 0; x < config.width * 3; x += 70) {
        createPlatform(x, random(0, config.height));
      }
    } else {
      for (let cluster of clusters) {
        console.log(cluster);
        createPlatform(
          (cluster.normalizedMinX * config.width) / 100,
          (cluster.normalizedMinY * config.height) / 100 - 100,
          cluster.width,
          cluster.height
        );
      }
    }
  }

  function createPlatform(x, y, w, h) {
    let platform = new platforms.Sprite(x, y);
    platform.scale.x = w;
    platform.scale.y = h / (config.height / window.innerHeight);
    if (Math.random() > 0.5) {
      createEnemy(x, y);
    }
  }

  function createEnemy(x, y) {
    let enemy = createSprite(x, y + 20);
    enemy.img = enemyImg;
    enemy.scale = 0.25;
    // enemy.position.x = x;
    // enemy.position.y = y+20;
    // enemy.velocity.y = random(0.4, 0.8);
    enemy.rotationLock = true;
    enemy.bounciness = 1;
    enemies.push(enemy);
  }

  function createDoor() {
    door = createSprite(config.width / 2, 0);
    door.img = doorImg;
    door.collider = 'static';
    door.scale.x = 4.5;
  }

  function drawBackground() {
    image(sky, 0, 0, config.width, config.height);
  }

  return {
    preload,
    setup,
    draw,
    resetGame,
    shootBullet,
  };
})();

export default Game;
