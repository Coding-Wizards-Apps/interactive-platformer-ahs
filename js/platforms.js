import WebcamModule from "./webcam-module.js";
function createPlatforms(clusters, config, canvas) {
  let platforms = new Group();
  platforms.collider = "static";

  const uniqueClusters = getUniqueMetadataObjects(clusters);

  let platformTypes = [];

  for (let cluster of uniqueClusters) {
    console.log(cluster)
    let platform = new platforms.Group();    
    platform.originalColor = `rgb(${cluster.rgbColor})`;
    platform.type = cluster.type ? cluster.type : "normal";
    platform.color = `rgb(${cluster.rgbColor})`;
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
      let platformType = platformTypes.find((platformTypeElement) => {
        return (
          platformTypeElement.type === cluster.metadata.type
        );
      });
      createPlatform(
        platformType ? platformType : platforms,
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

// Function to get unique metadata objects
function getUniqueMetadataObjects(array) {
  const uniqueMetadata = new Set();
  for (const obj of array) {
    uniqueMetadata.add(JSON.stringify(obj.metadata));
  }
  return Array.from(uniqueMetadata).map(metadata => JSON.parse(metadata));
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
