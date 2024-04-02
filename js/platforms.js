import WebcamModule from "./webcam-module.js";
function createPlatforms(clusters, ground, config, canvas) {
    let platforms = new Group();
    let scaleFactor = 1;
    // platforms.img = ground;
    platforms.collider = "static";
    let {width, height} =  WebcamModule.getCanvasDimensions();
    let aspectRatioWebcam = width / height;
    let aspectRatioGame = config.width / config.height;
    console.log(aspectRatioGame)
    console.log(aspectRatioWebcam) 
    if (!clusters) {
      for (let x = 0; x < config.width * 3; x += 70) {
        createPlatform(x, random(0, config.height));
      }
    } else {
      for (let cluster of clusters) {
        console.log(cluster.normalizedHeight)
        createPlatform(
            platforms,   config,
          (cluster.normalizedMinX * canvas.width) / 100,
          (cluster.normalizedMinY * canvas.height / aspectRatioWebcam * aspectRatioGame) / 100,
          cluster.normalizedWidth  * canvas.width / 100,
          cluster.normalizedHeight * canvas.height /100,
          cluster.color
        );
      }
    }
    return platforms;
  }

  function createPlatform(platforms, config, x, y, w, h, color) {
    w = w * 5;
    h = h * 5;
    let newPosX = x + w/2;
    let newPosY = y + h/2;
    let platform = new platforms.Sprite(newPosX, newPosY, w , h);
    platform.color = `rgb(${color})`;
    // let scaleWidth = w / config.width;
    // let scaleHeight = h / config.height;
    // platform.scale.x = scaleWidth;
    // platform.scale.y = scaleHeight;
    // platform.scale.x = w;
    // platform.scale.y = h;
    // platform.scale.y = h;
    // platform.scale.y = h / (config.height / window.innerHeight);
  }

  

  export { createPlatforms };