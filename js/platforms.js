import WebcamModule from './webcam-module.js';
function createPlatforms(clusters, ground, config, canvas) {
  let platforms = new Group();
  let clusterColors = clusters.map((cluster) => cluster.color);
  const uniqueColors = Array.from(
    new Set(clusterColors.map(JSON.stringify)),
    JSON.parse
  );
  let platformTypes = [];
  const platformActionTypes = [
    { type: 'bouncy', color: ['255', '0', '0'], stringColor: 'red' },
    { type: 'slow', color: ['0', '255', '0'], stringColor: 'green' },
    { type: 'temp', color: ['0', '0', '255'], stringColor: 'blue' },
  ];
  for (let color of uniqueColors) {
    let platform = new platforms.Group();
    let platformType = platformActionTypes.find((type) => {
      return color.toString() === type.color.toString();
    });
    platform.type = platformType.type;
    platform.color = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    platformTypes.push(platform);
  }
  // platforms.img = ground;
  platforms.collider = 'static';
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

export { createPlatforms };
