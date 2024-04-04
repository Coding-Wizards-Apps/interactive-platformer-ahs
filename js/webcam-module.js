const WebcamModule = (() => {
  let video;
  let canvas;
  let black = [0, 0, 0];
  let whiteFactor = 1.1;
  let maxEuclideanDistance = 200;
  let white = [255 * whiteFactor, 255 * whiteFactor, 255 * whiteFactor];
  const scaleDownFactor = 20;

  let lowerThresholdFactor = 0.1;
  let upperThresholdFactor = 3;
  let originalPixelFactor = 2;
  let originalPixelW = 720 * originalPixelFactor;
  let originalPixelH = 480 * originalPixelFactor;
  let lowerThreshold = lowerThresholdFactor * scaleDownFactor;
  let upperThreshold = upperThresholdFactor * scaleDownFactor;

  let displayVideo = false;
  let displayClusters = true;
  let newWidth = originalPixelW / scaleDownFactor;
  let newHeight = originalPixelH / scaleDownFactor;
  let clusters = [];
  let grabVideo = true;

  let colorPalette = [];

  async function setup() {
    canvas = createCanvas(
      newWidth * scaleDownFactor,
      newHeight * scaleDownFactor
    );
    if (grabVideo) {
      video = createCapture(VIDEO);
    } else {
      // video =  await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    }
    video.size(newWidth, newHeight);
    video.hide();
    canvas.parent("canvasPlay"); // Set parent to canvas1
    document.addEventListener("keydown", (event) => {
      if (event.key === "u") {
        if (document.querySelector("#webcamUI").style.display === "block") {
          document.querySelector("#webcamUI").style.display = "none";
        } else {
          document.querySelector("#webcamUI").style.display = "block";
        }
      }
      if (event.key === "i") {
        if (document.querySelector(".overlay").style.display === "block") {
          document.querySelector(".overlay").style.display = "none";
        } else {
          document.querySelector(".overlay").style.display = "block";
        }
      }
      if (event.key === "v") {
        displayVideo = !displayVideo;
      }
      if (event.key === "c") {
        displayClusters = !displayClusters;
      }
      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${newHeight}px`;
    });
  }

  function preload() {}

  function getCanvasDimensions() {
    return { width: newWidth, height: newHeight };
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
    // normalizeClusterCoordinates();
    // update clusters
    clusters = clusters.map((cluster) => {
      return addCustomProperties(cluster);
    });
    if (displayClusters) {
      drawClusterShapes();
    }
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
      let coordX = y % newWidth;
      let coordY = Math.round(y / newWidth);
      let addedToCluster = false;
      // added euclidian distance to filter out colors that are too far from the palette
      if (
        colorIsBlackOrWhite(color) ||
        euclideanDistance(color, [r, g, b]) > maxEuclideanDistance ||
        colorIsBackground(color)
      ) {
        continue;
      }

      updateClusters(color, coordX, coordY, addedToCluster);
    }
  }

  function colorIsBackground(color) {
    const backgroundColor = colorPalette[1];
    return (
      color[0] === backgroundColor[0] &&
      color[1] === backgroundColor[1] &&
      color[2] === backgroundColor[2]
    );
  }

  function colorIsBlackOrWhite(color) {
    return (
      (color[0] === black[0] && color[1] === black[1] && black[2] === 0) ||
      (color[0] === white[0] && color[1] === white[1] && color[2] === white[2])
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
    // image(video, 0, 0, width, (width * video.height) / video.width);
    image(video, 0, 0, width, height);
    for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];
      // let a = pixels[i + 3];
      let x = (i / 4) % video.width;
      let y = Math.floor(i / 4 / video.width);
      fill(r, g, b, 100);
      noStroke();
      rect(
        x * scaleDownFactor,
        y * scaleDownFactor,
        scaleDownFactor,
        scaleDownFactor
      );
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
      fill(cluster.color[0], cluster.color[1], cluster.color[2], 20);
      tint(255, 2);
      stroke(0, 0, 0, 255);
      rect(
        cluster.minX * scaleDownFactor,
        cluster.minY * scaleDownFactor,
        cluster.pixelWidth * scaleDownFactor,
        cluster.pixelHeight * scaleDownFactor
      );
      tint(255, 255);
    }
  }

  function findClosestColor(targetColor) {
    if (colorPalette.length === 0) {
      return targetColor;
    }
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

  function areNeighbors(pixelA, pixelB) {
    const dx = Math.abs(pixelA.coordX - pixelB.coordX);
    const dy = Math.abs(pixelA.coordY - pixelB.coordY);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    return dx <= 1 && dy <= 1;
  }

  function addCustomProperties(cluster) {
    const pixels = cluster.pixels;
    const minX = Math.min(...pixels.map((p) => p.coordX));
    const minY = Math.min(...pixels.map((p) => p.coordY));
    const maxX = Math.max(...pixels.map((p) => p.coordX));
    const maxY = Math.max(...pixels.map((p) => p.coordY));

    const normalizedMinX = (minX / newWidth) * 100;
    const normalizedMinY = (minY / newHeight) * 100;
    const normalizedMaxX = (maxX / newWidth) * 100;
    const normalizedMaxY = (maxY / newHeight) * 100;
    const pixelWidth = maxX - minX + 1;
    const pixelHeight = maxY - minY + 1;
    const normalizedWidth = (pixelWidth / newWidth) * scaleDownFactor;
    const normalizedHeight = (pixelHeight / newHeight) * scaleDownFactor;


    cluster = {
      ...cluster,
      minX,
      minY,
      maxX,
      maxY,
      normalizedMinX,
      normalizedMinY,
      pixelWidth,
      pixelHeight,
      normalizedMaxX,
      normalizedMaxY,
      normalizedWidth,
      normalizedHeight,
    };

    return cluster;
  }

  function getClusters() {
    return clusters;
  }

  function updateValue(variableName, newValue) {
    switch (variableName) {
      case "lowerThresholdFactor":
        lowerThresholdFactor = newValue;
        lowerThreshold = lowerThresholdFactor * scaleDownFactor;
        break;
      case "upperThresholdFactor":
        upperThresholdFactor = newValue;
        upperThreshold = upperThresholdFactor * scaleDownFactor;
        break;
      case "originalPixelFactor":
        originalPixelFactor = newValue;
        originalPixelW = 640 * originalPixelFactor;
        originalPixelH = 480 * originalPixelFactor;
        // newWidth = originalPixelW / scaleDownFactor;
        // newHeight = originalPixelH / scaleDownFactor;
        break;
      case "maxEuclideanDistance":
        maxEuclideanDistance = newValue;
        break;
      case "whiteFactor":
        whiteFactor = newValue;
        white = [255 * whiteFactor, 255 * whiteFactor, 255 * whiteFactor];
        break;
      default:
        break;
    }
  }

  function updateColorPalette(newColorPalette) {
    if (
      Array.isArray(newColorPalette) &&
      newColorPalette.every(
        (color) => Array.isArray(color) && color.length === 3
      )
    ) {
      colorPalette = newColorPalette;
      console.log(`Updated colorPalette:`, colorPalette);
    } else {
      console.log(
        "Invalid color palette. It should be an array of arrays, each with 3 elements."
      );
    }
    colorPalette.unshift(black); // Add black at the start
    colorPalette.push(white); // Add white at the end
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
    updateValue,
    updateColorPalette,
    getCanvasDimensions,
  };
})();

export default WebcamModule;


