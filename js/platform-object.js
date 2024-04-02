import WebcamModule from "./webcam-module.js";

class Platform {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = color;
  }

  display() {
    fill(this.color);
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.height);
  }
}

function createPlatforms(clusters, ground, config, canvas) {
  let platforms = [];
  let scaleFactor = 1;

  let { width, height } = WebcamModule.getCanvasDimensions();
  let aspectRatioWebcam = width / height;
  let aspectRatioGame = config.width / config.height;

  if (!clusters) {
    for (let x = 0; x < config.width * 3; x += 70) {
      platforms.push(createPlatform(x, random(0, config.height)));
    }
  } else {
    for (let cluster of clusters) {
      platforms.push(createPlatform(
        (cluster.normalizedMinX * canvas.width) / 100,
        (cluster.normalizedMinY * canvas.height / aspectRatioWebcam * aspectRatioGame) / 100,
        cluster.normalizedWidth * canvas.width / 100,
        cluster.normalizedHeight * canvas.height / 100,
        cluster.color
      ));
    }
  }

  return platforms;
}

function createPlatform(x, y, w, h, color) {
  w = w * 5;
  h = h * 5;
  let newPosX = x + w / 2;
  let newPosY = y + h / 2;
  return new Platform(newPosX, newPosY, w, h, `rgb(${color})`);
}

export { createPlatforms, Platform };
