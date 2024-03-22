const WebcamModule = (() => {
  let video;
  let canvas;
  const scaleDownFactor = 15;
  let originalPixelW = 640 * 2;
  let originalPixelH = 480 * 2;
  let newWidth = originalPixelW / scaleDownFactor;
  let newHeight = originalPixelH / scaleDownFactor;
  const images = [];
  let lowerThreshold = 1 * scaleDownFactor;
  let upperThreshold = 10 * scaleDownFactor;
  const displayVideo = true;
  let clusters = [];
  let grabVideo = true;
  async function setup() {
    canvas = createCanvas(newWidth * scaleDownFactor, newHeight * scaleDownFactor);
    if (grabVideo) {
      video = createCapture(VIDEO);
    } else {
      // video =  await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    }
    video.size(newWidth, newHeight);
    video.hide();
    canvas.parent("canvasPlay"); // Set parent to canvas1
  }

  function preload() {
    for (let i = 1; i <= 6; i++) {
      if (i < 10) {
        images[i] = loadImage(`./assets/tiles/Asset ${i}.png`);
      } else {
        images[i] = loadImage(`./assets/tiles/Tileset_${i}.png`);
      }
    }
  }

  function draw() {
    clear();
    clusters = [];
    video.loadPixels();
    let pixels = video.pixels;
  
    processPixels(pixels);
    
    if (displayVideo) {
      displayProcessedVideo(pixels);
    }
    
    filterClusters();
    drawClusterShapes();
    
    normalizeClusterCoordinates();
  }
  
  function processPixels(pixels) {
    for (let y = 0; y < pixels.length; y++) {
      let index = y * 4;
      let r = pixels[index];
      let g = pixels[index + 1];
      let b = pixels[index + 2];
      let closestColor = findClosestColor([r, g, b]);
  
      pixels[index] = closestColor[0];
      pixels[index + 1] = closestColor[1];
      pixels[index + 2] = closestColor[2];
  
      let color = [closestColor[0], closestColor[1], closestColor[2]];
      let coordX = (y % newWidth);
      let coordY = Math.round(y / newWidth);
      let addedToCluster = false;
      
      if (colorIsBlackOrWhite(color)) {
        continue;
      }
  
      updateClusters(color, coordX, coordY, addedToCluster);
    }
  }
  
  function colorIsBlackOrWhite(color) {
    return (
      (color[0] === 0 && color[1] === 0 && color[2] === 0) ||
      (color[0] === 255 && color[1] === 255 && color[2] === 255)
    );
  }
  
  function updateClusters(color, coordX, coordY, addedToCluster) {
    for (let cluster of clusters) {
      if (clusterHasSameColor(cluster, color)) {
        addedToCluster = addPixelToCluster(cluster, coordX, coordY);
        if (addedToCluster) break;
      }
    }
  
    if (!addedToCluster) {
      clusters.push({ color, pixels: [{ coordX, coordY }] });
    }
  }
  
  function clusterHasSameColor(cluster, color) {
    return (
      cluster.color[0] === color[0] &&
      cluster.color[1] === color[1] &&
      cluster.color[2] === color[2]
    );
  }
  
  function addPixelToCluster(cluster, coordX, coordY) {
    for (let pixel of cluster.pixels) {
      if (areNeighbors(pixel, { coordX, coordY })) {
        cluster.pixels.push({ coordX, coordY });
        return true;
      }
    }
    return false;
  }
  
  function displayProcessedVideo(pixels) {
    image(video, 0, 0, width, (width * video.height) / video.width);
    for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];
      let a = pixels[i + 3];
      let x = (i / 4) % video.width;
      let y = Math.round(i / 4 / video.width);
      fill(r, g, b, 40);
      noStroke();
      rect(x * scaleDownFactor, y * scaleDownFactor, scaleDownFactor, scaleDownFactor);
    }
  }
  
  function filterClusters() {
    clusters = clusters.filter(
      ({ pixels }) =>
        pixels.length > lowerThreshold && pixels.length < upperThreshold
    );
  }
  
  function drawClusterShapes() {
    for (let cluster of clusters) {
      fill(cluster.color[0], cluster.color[1], cluster.color[2], 50);
  
      cluster = addCustomProperties(cluster);
      let img;
  
      if (cluster.shape === "I-shaped") {
        img = images[1];
      } else if (cluster.shape === "J-shaped") {
        img = images[2];
      } else if (cluster.shape === "L-shaped") {
        img = images[3];
      } else if (cluster.shape === "H-shaped") {
        img = images[4];
      } else if (cluster.shape === "Rectangle-shaped") {
        img = images[5];
      } else if (cluster.shape === "_-shaped") {
        img = images[6];
      } else {
        img = images[5];
      }
      tint(cluster.color[0], cluster.color[1], cluster.color[2]);
      stroke(255, 255, 255, 255);
      rect(cluster.minX * scaleDownFactor, cluster.minY * scaleDownFactor, cluster.width * scaleDownFactor, cluster.height * scaleDownFactor);
      tint(255,255)
    }
  }
  
  function normalizeClusterCoordinates() {
    for (let cluster of clusters) {
      cluster.pixels = cluster.pixels.map(pixel => {
        return {
          coordX: (pixel.coordX / newWidth) * 100,
          coordY: (pixel.coordY / newHeight) * 100
        };
      });
    }
  }
  

  function findClosestColor(targetColor) {
    let closestColor = colorPalette.reduce((a, b) => {
      return euclideanDistance(targetColor, a) <
        euclideanDistance(targetColor, b)
        ? a
        : b;
    });
    return closestColor;
  }

  function euclideanDistance(color1, color2) {
    let sum = 0;
    for (let i = 0; i < 3; i++) {
      sum += Math.pow(color1[i] - color2[i], 2);
    }
    return Math.sqrt(sum);
  }

  let colorPalette = [
    // [0, 0, 0], // black
    [255, 0, 0], // red
    [0, 0, 255], // blue
    [0, 255, 0], // green
    // [255, 255, 0], // yellow
    // [128, 0, 128], // purple
    // [255, 165, 0], // orange
    [255, 255, 255], // white
    // [255, 192, 203], // pink
    // [0, 255, 255], // cyan
  ];

  function areNeighbors(pixelA, pixelB) {
    const dx = Math.abs(pixelA.coordX - pixelB.coordX);
    const dy = Math.abs(pixelA.coordY - pixelB.coordY);
    return dx <= 1 && dy <= 1;
  }

  function addCustomProperties(cluster) {
    const pixels = cluster.pixels;
    const minX = Math.min(...pixels.map((p) => p.coordX));
    const minY = Math.min(...pixels.map((p) => p.coordY));
    const maxX = Math.max(...pixels.map((p) => p.coordX));
    const maxY = Math.max(...pixels.map((p) => p.coordY));

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    

    if (width === 1 && height === 4) {
      cluster.shape = "I-shaped";
    } else if (width === 2 && height === 3) {
      cluster.shape = "J-shaped";
    } else if (
      width === 2 &&
      height === 3 &&
      pixels.find((p) => p.coordX === minX + 1 && p.coordY === minY)
    ) {
      cluster.shape = "L-shaped";
    } else if (width === 3 && height === 2) {
      cluster.shape = "H-shaped";
    } else if (width >= 2 && height >= 2 && width === height) {
      cluster.shape = "Rectangle-shaped";
    } else if (width >= 2 && height === 1) {
      cluster.shape = "_-shaped";
    } else {
      cluster.shape = "Unknown";
    }

    cluster = { ...cluster, minX, minY, maxX, maxY, width, height}

    return cluster;
  }

  function getClusters() {
    return clusters;
  }

  // Public methods here...
  return {
    setup,
    preload,
    draw,
    getClusters,
    stopWebcam: () => {
      video.stop();
      video.remove();
    },
  };
})();

export default WebcamModule;
