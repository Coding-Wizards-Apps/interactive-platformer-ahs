import WebcamModule from "./webcam-module.js";
function createPlatforms(clusters, config, canvas) {
  let platforms = new Group();
  platforms.collider = "static";

  let clusterColors = clusters.map((cluster) => cluster.color);
  const uniqueColors = Array.from(
    new Set(clusterColors.map(JSON.stringify)),
    JSON.parse
  );
  let platformTypes = [];
  const platformActionTypes = [
    { type: "bouncy", color: ["255", "0", "0"], stringColor: "red" },
    { type: "slow", color: ["0", "255", "0"], stringColor: "green" },
    { type: "temp", color: ["0", "0", "255"], stringColor: "blue" },
    { type: "bouncy", color: ["128", "0", "128"], stringColor: "purple" },

  ];
  for (let color of uniqueColors) {
    let platform = new platforms.Group();
    let platformType = platformActionTypes.find((type) => {
      return color.toString() === type.color.toString();
    });
    
    platform.originalColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    platform.type = platformType ? platformType : "normal";
    platform.color = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    platformTypes.push(platform);
  }
  let { width, height } = WebcamModule.getCanvasDimensions();
  let aspectRatioWebcam = width / height;
  let aspectRatioGame = config.width / config.height;
  if (!clusters) {
    for (let x = 0; x < config.width * 3; x += 70) {
      createPlatform(x, random(0, config.height));
    }
  } else {
    for (let cluster of clusters) {
      let platformType = platformTypes.find((type) => {
        return (
          type.color ===
          `rgb(${cluster.color[0]}, ${cluster.color[1]}, ${cluster.color[2]})`
        );
      });
      console.log(platformType.type);
      createPlatform(
        platformType,
        config,
        (cluster.normalizedMinX * canvas.width) / 100,
        (((cluster.normalizedMinY * canvas.height) / aspectRatioWebcam) *
          aspectRatioGame) /
          100,
        (cluster.normalizedWidth * canvas.width) / 100,
        (cluster.normalizedHeight * canvas.height) / 100,
        cluster.color
      );
    }
  }
  return platforms;
}

function createPlatform(platformType, config, x, y, w, h, color) {
  w = w * 5;
  h = h * 5;
  let newPosX = x + w / 2;
  let newPosY = y + h / 2;

  let platform = new platformType.Sprite(newPosX, newPosY, w, h);
}

function slowPlatformAction(platform) {
  platform.action = true
  let originalY = platform.y;
  let direction = 1;
  let speed = 1;
  let bounceDistance = 10;

  let intervalId = setInterval(() => {
    platform.y += speed * direction;
    bounceDistance -= speed;

    if (bounceDistance <= 0) {
      direction *= -1;
      bounceDistance = 10;
    }
    if (ceil(platform.y) === ceil(originalY)) {
      clearInterval(intervalId);
      platform.action = false
    }
  }, 10);
  platform.intervalId = intervalId;
}

function bouncyPlatformAction(platform) {}

function tempPlatformAction(platform) {
  platform.collider = "none";
  platform.color = "rgba(0, 0, 0, 0)";
}

function resetPlatform(platform) {
  platform.collider = "static";
  platform.color = platform.originalColor;
  if (platform.intervalId) {
    clearInterval(platform.intervalId);
  }
}

export {
  createPlatforms,
  slowPlatformAction,
  bouncyPlatformAction,
  tempPlatformAction,
  resetPlatform,
};
