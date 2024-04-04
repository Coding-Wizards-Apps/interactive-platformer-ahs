import {
  createPlatforms,
  slowPlatformAction,
  tempPlatformAction,
  resetPlatform,
} from "./platforms.js";

const Game = (() => {
  let playOnline = false;
  let enemyFactor = 0.5;
  let initialPoints = 500;
  let platformFactor = .25;
  let currentPoints = initialPoints;
  let smallFactor = 0.5;
  let config = {
    width: window.innerWidth * smallFactor,
    height: playOnline ? window.innerHeight * 1.1 : window.innerHeight * 1 *smallFactor,
  };

  // Variables related to player
  let player = null;
  let playerDirection = 1;
  let playerSpeed = 2.5;
  let playerImage = null;
  let playerJumpVelocity = -5;

  // Variables related to goal
  let goal = null;
  let goalImage = null;

  // Variables related to time
  let startTime;

  // Variables related to environment
  let backgroundImage = null;
  let ground = null;

  // Variables related to game elements
  let bulletInstances = [];
  let platforms = [];
  let enemies = [];
  let bullets = [];

  // Variables related to scoring and display
  let highScore = 0;
  let scoreText = null;
  let enemyImage = null;
  let bulletImg = null;

  let clusterList = null;

  function preload() {
    backgroundImage = loadImage("assets/Background.png");
    // ground = loadImage("assets/platform.png");
    playerImage = loadImage("assets/Player.png");
    goalImage = loadImage("assets/Goal.png");
    // bulletImg = loadImage("assets/dentures.png");
    enemyImage = loadImage("assets/Enemy.png");
  }

  function setup(clusters) {
    clusterList = clusters;
    startTime = Date.now();
    let canvas = createCanvas(config.width, config.height);
    canvas.parent("canvasPlay"); // Set parent to canvas1
    setupWorld();
    createFloor();
    createBorders();
    createPlayer();
    platforms = createPlatforms(clusters, config, canvas);
    createGoal();
    // create some enemies at random positions
    createEnemies(platforms);
    bullets = new Group();
    // bullets.img = bulletImg;
    bullets.scale = 0.1;
    for (let i = 0; i < enemies.length; i++) {
      for (let j = i + 1; j < enemies.length; j++) {
        if (enemies[i].overlap(enemies[j])) {
          // Handle overlap between enemies[i] and enemies[j]
        }
      }
    }

    // document
    //   .querySelector("#defaultCanvas0")
    //   .style.setProperty("width", `${config.width}px`, "important");
    // document
    //   .querySelector("#defaultCanvas0")
    //   .style.setProperty("height", `${config.height}px`, "important");

    drawBackground(255);
    stroke(255);
    clusters.forEach((cluster) => {
      switch (cluster.metadata.type) {
        case "bouncy":
          currentPoints -= 20 * platformFactor;
          break;
        case "temp":
          currentPoints -= 4 * platformFactor;
          break;
        case "slow":
          currentPoints -= 7 * platformFactor;
          break;
        default:
          break;
      }
    });
  }

  function draw() {
    fill(0, 15);
    rect(0, 0, config.width, config.height);
    drawBackground(30);
    updateEnemyMovement();
    handlePlayerMovement();
    // checkBulletEnemyCollision();
    checkPlatformCollision();
    checkPlayerGoalCollision();
    updateHighScore();
    if (playOnline) {
      adjustCameraPosition();
    }

    if (player.velocity.y > 20) {
      player.velocity.y = 0;
    }
    displayHighScore();
  }

  function createEnemies(platforms) {
    for (let i = 0; i < platforms.length; i++) {
      let platform = platforms[i];
      if (Math.random() < enemyFactor) {
        createEnemy(platform);
      }
    }
  }

  function checkPlatformCollision() {
    for (let i = 0; i < platforms.length; i++) {
      let platform = platforms[i];
      if (player.collide(platform)) {
        platform.lastTouched = Date.now();
        if (platform.type === "bouncy") {
          player.velocity.y = -10;
          if (!platform.action) {
            slowPlatformAction(platform);
          }
        } else if (platform.type === "slow") {
          player.velocity.x = playerDirection * 1;
          console.log("platform.action", platform.action);
        } else if (platform.type === "temp") {
          setTimeout(() => {
            platform.color = "green";
            tempPlatformAction(platform);
          }, 1000);
          platform.color = "blue";
        } else if (platform.type === "slippery") {
          player.velocity.x = playerDirection * 3;
        }
      }
    }
    platforms.forEach((platform) => {
      if (platform.lastTouched) {
        if (Date.now() - platform.lastTouched > 3000) {
          resetPlatform(platform);
          delete platform.lastTouched;
        }
      }
    });
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
    if (
      player.position.x < 0 ||
      player.position.x > config.width ||
      player.position.y > config.height
    ) {
      resetGame();
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

  function checkPlayerEnemyCollision(enemy) {
    if (player.collide(enemy)) {
      resetGame();
      return true;
    }
  }

  function updateEnemyMovement() {
    for (let i = 0; i < enemies.length; i++) {
      let enemy = enemies[i];
      if (!enemy.framesRemaining) {
        // console.log("enemy", enemy);
        enemy.framesRemaining = Math.floor(Math.random() * 10) + 150;
        let platformUnderneath = platforms.find(
          (platform) =>
            platform.y > enemy.position.y && platform.y - enemy.position.y < 60
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
      checkPlayerEnemyCollision(enemy);
    }
  }

  function checkPlayerGoalCollision() {
    if (player.collide(goal)) {
      noLoop();
      let endTime = Date.now();
      let highscore = currentPoints - Math.floor((endTime - startTime) / 1000);
      saveHighScore(highscore);
      displayHighScores(highScore);
    }
  }

  function updateHighScore() {
    let currentTime = Math.floor((Date.now() - startTime) / 1000);

    highScore = currentPoints - currentTime;

    if (highScore < 0) {
      highScore = 0;
      window.location.reload();
    }
    scoreText = `Highscore: ${highScore}s`;
  }

  function displayHighScore() {
    fill(255);
    textSize(32 * smallFactor);
    text(scoreText, 50, 50);
  }

  function displayHighScores(highScore) {
    let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    let highscoreElement = document.querySelector("#highscores");
    let personalHighscoreElement = document.querySelector("#highscore");
    let highScoreList = document.querySelector("#highscore-list");
    highScoreList.innerHTML = "";
    personalHighscoreElement.innerText = `Your score: ${highScore}s`;
    for (let i = 0; i < highScores.length; i++) {
      let li = document.createElement("li");
      li.innerText = `${highScores[i].name}: ${highScores[i].score}s`;
      highScoreList.appendChild(li);
    }
    highscoreElement.style.display = "block";
  }
  function saveHighScore(highscore) {
    let playerName = "Player" + Math.floor(Math.random() * 1000);
    if (playerName != null) {
      let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
      let newScore = { name: playerName, score: highscore };
      highScores.push(newScore);
      highScores.sort((a, b) => b.score - a.score);
      highScores.splice(5); // Keep only top 5 scores
      localStorage.setItem("highScores", JSON.stringify(highScores));
    }
  }
  function adjustCameraPosition() {
    camera.y = player.y;
  }

  function resetGame() {
    // Reset player position
    resetPlayer();
    // Reset enemy positions
    resetEnemies(platforms);
    // startTime = Date.now();
    // highScore = 0;
    // Reset platforms
    for (let i = 0; i < platforms.length; i++) {
      resetPlatform(platforms[i]);
    }
    // Remove allbullets
    for (let i = bulletInstances.length - 1; i >= 0; i--) {
      bulletInstances[i].remove();
    }
  }

  function resetPlayer() {
    player.position.x = 50;
    player.position.y = config.height - 50;
    player.velocity.x = 0;
    player.velocity.y = 0;
  }

  function resetEnemies(platforms) {
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].remove();
    }
    createEnemies(platforms);
  }

  function shootBullet() {
    // Create a bullet at the player's position
    let bullet = new bullets.Sprite(
      player.position.x + playerDirection * 10,
      player.position.y - 10
    );

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
    floor.collider = "static";
  }

  function createBorders() {
    let leftBorder = new Sprite();
    leftBorder.x = -5;
    leftBorder.y = config.height / 2;
    leftBorder.w = 5;
    leftBorder.h = config.height;
    leftBorder.collider = "static";

    let rightBorder = new Sprite();
    rightBorder.x = config.width + 5;
    rightBorder.y = config.height / 2;
    rightBorder.w = 5;
    rightBorder.h = config.height;
    rightBorder.collider = "static";
  }

  function createPlayer() {
    player = new Sprite(50, 50, 125, 125);
    player.scale = 0.25;
    player.img = playerImage;
    player.bounciness = 2;
    player.rotationLock = false;
    player.y = config.height - 50;
  }

  function createEnemy(platform) {
    let x = platform.x;
    let y = platform.y;
    let enemy = createSprite(x, y - 100);
    enemy.diameter = 50;
    enemy.img = enemyImage;
    enemy.scale = 0.15;
    enemy.rotationLock = true;
    enemy.bounciness = 1;
    enemy.originalX = x;
    enemy.originalY = y;
    enemy.platform = platform;
    enemies.push(enemy);
  }

  function createGoal() {
    goal = createSprite(config.width - 30, 25);
    goal.img = goalImage;
    goal.collider = "static";
    goal.scale = 0.5 * smallFactor;
    goal.color = "red";
  }

  function drawBackground(opacity = 255) {
    tint(255, opacity);
    image(backgroundImage, 0, 0, config.width, config.height);
    tint(255, 255);
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
