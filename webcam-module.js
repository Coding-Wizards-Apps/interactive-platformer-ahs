const WebcamModule = (() => {
  let video;
  let canvas;
  const factor = 15;
  let originalPixelW = 640 * 2;
  let originalPixelH = 480 * 2;
  let newWidth = originalPixelW / factor;
  let newHeight = originalPixelH / factor;
  const images = [];
  let lowerThreshold = 1 * factor;
  let upperThreshold = 10 * factor;
  const displayVideo = true;
  let clusters = [];
  function setup() {
    canvas = createCanvas(newWidth * factor, newHeight * factor);
    video = createCapture(VIDEO);
    video.size(newWidth, newHeight);
    video.hide();
    canvas.parent("canvasPlay"); // Set parent to canvas1
  }

  function preload() {
    for (let i = 1; i <= 11; i++) {
      if (i < 10) {
        images[i] = loadImage(`./images/Tileset_0${i}.png`);
      } else {
        images[i] = loadImage(`./images/Tileset_${i}.png`);
      }
    }
  }

  function draw() {
    clear();
    clusters = [];
    video.loadPixels();
    let pixels = video.pixels;

    // loadPixels();
    // Function to check if two pixels are neighbors

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
      let coordY = Math.floor(y / newWidth);

      let addedToCluster = false;
      // Check if the color is white or black
      if (
        (color[0] === 0 && color[1] === 0 && color[2] === 0) ||
        (color[0] === 255 && color[1] === 255 && color[2] === 255)
      ) {
        continue;
      }

      // Check if the pixel can be added to an existing cluster
      for (let cluster of clusters) {
        if (
          cluster.color[0] === color[0] &&
          cluster.color[1] === color[1] &&
          cluster.color[2] === color[2]
        ) {
          // Check if the pixel is a neighbor of any pixel in the cluster
          for (let pixel of cluster.pixels) {
            if (areNeighbors(pixel, { coordX, coordY })) {
              cluster.pixels.push({ coordX, coordY });
              addedToCluster = true;
              break;
            }
          }
          if (addedToCluster) break;
        }
      }

      // If the pixel couldn't be added to any existing cluster, create a new cluster
      if (!addedToCluster) {
        clusters.push({ color, pixels: [{ coordX, coordY }] });
      }
    }
    if (displayVideo) {
      image(video, 0, 0, width, (width * video.height) / video.width);
      for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];
        let a = pixels[i + 3];
        // let x = (i / 4) % newWidth ;
        // let y = Math.floor((i / 4) / newWidth);
        let x = (i / 4) % video.width;
        let y = Math.floor(i / 4 / video.width);
        fill(r, g, b, 40);
        noStroke();
        rect(x * factor, y * factor, factor, factor);
      }
    }
    // draw pixels on the screen
    clusters = clusters.filter(
      ({ pixels }) =>
        pixels.length > lowerThreshold && pixels.length < upperThreshold
    );
    for (let cluster of clusters) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      cluster.pixels.forEach((point) => {
        minX = Math.min(minX, point.coordX);
        minY = Math.min(minY, point.coordY);
        maxX = Math.max(maxX, point.coordX);
        maxY = Math.max(maxY, point.coordY);
      });

      const width = maxX - minX + 1;
      const height = maxY - minY + 1;

      fill(cluster.color[0], cluster.color[1], cluster.color[2], 50);

      cluster.shape = categorizeShape(cluster);
      let x = cluster.pixels[0].coordX;
      let y = cluster.pixels[0].coordY;
      let img;

      if (cluster.shape === "I-shaped") {
        img = images[1];
        fill(255, 0, 0, 100);
      } else if (cluster.shape === "J-shaped") {
        img = images[2];
        fill(0, 255, 0, 100);
      } else if (cluster.shape === "L-shaped") {
        img = images[3];
        fill(0, 0, 255, 100);
      } else if (cluster.shape === "H-shaped") {
        img = images[4];
        fill(255, 255, 0, 100);
      } else if (cluster.shape === "Rectangle-shaped") {
        img = images[5];
        fill(255, 0, 255, 100);
      } else if (cluster.shape === "_-shaped") {
        img = images[6];
        fill(0, 255, 255, 100);
      } else {
        img = images[7];
        fill(255, 255, 255, 100);
      }
      tint(255, 100);
      image(img, x * factor, y * factor, width * factor, height * factor);
      tint(255, 255);
    }

    // Normalize the coordinates of the pixels inside the clusters
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
    [0, 0, 0], // black
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

  function categorizeShape(cluster) {
    const pixels = cluster.pixels;
    const minX = Math.min(...pixels.map((p) => p.coordX));
    const minY = Math.min(...pixels.map((p) => p.coordY));
    const maxX = Math.max(...pixels.map((p) => p.coordX));
    const maxY = Math.max(...pixels.map((p) => p.coordY));

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    if (width === 1 && height === 4) {
      return "I-shaped";
    } else if (width === 2 && height === 3) {
      return "J-shaped";
    } else if (
      width === 2 &&
      height === 3 &&
      pixels.find((p) => p.coordX === minX + 1 && p.coordY === minY)
    ) {
      return "L-shaped";
    } else if (width === 3 && height === 2) {
      return "H-shaped";
    } else if (width >= 2 && height >= 2 && width === height) {
      return "Rectangle-shaped";
    } else if (width >= 2 && height === 1) {
      return "_-shaped";
    } else {
      return "Unknown";
    }
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
