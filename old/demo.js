let video;
let canvas;
let ctx;


function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    canvas = document.getElementById('defaultCanvas0');
    ctx = canvas.getContext('2d');
}

function draw() {
    image(video, 0, 0, width, height);
    // ctx.drawImage(video.elt, 0, 0, width, height);
    let colorPalette = [
        [255, 0, 0], // red
        [0, 0, 255], // blue
        [0, 255, 0], // green
        [255, 255, 0], // yellow
        [128, 0, 128], // purple
        [255, 165, 0] // orange
    ];

    let imgData = ctx.getImageData(0, 0, width, height);
    let data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        let closestColor = colorPalette.reduce((a, b) => {
            return euclideanDistance([data[i], data[i+1], data[i+2]], a) < euclideanDistance([data[i], data[i+1], data[i+2]], b) ? a : b;
        });

        data[i] = closestColor[0]; // red
        data[i + 1] = closestColor[1]; // green
        data[i + 2] = closestColor[2]; // blue
    }

    ctx.putImageData(imgData, 0, 0);
}

function euclideanDistance(rgb1, rgb2) {
  let squareSum = 0;
  for (let i = 0; i < 3; i++) {
      squareSum += Math.pow(rgb1[i] - rgb2[i], 2);
  }
  return Math.sqrt(squareSum);
}

function categorizeShape(cluster) {
  const pixels = cluster.pixels;
  const minX = Math.min(...pixels.map(p => p.coordX));
  const minY = Math.min(...pixels.map(p => p.coordY));
  const maxX = Math.max(...pixels.map(p => p.coordX));
  const maxY = Math.max(...pixels.map(p => p.coordY));

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  if (width === 1 && height === 4) {
      return "I-shaped";
  } else if (width === 2 && height === 3) {
      return "J-shaped";
  } else if (width === 2 && height === 3 && pixels.find(p => p.coordX === minX + 1 && p.coordY === minY)) {
      return "L-shaped";
  } else if (width === 3 && height === 2) {
      return "H-shaped";
  } else {
      return "Unknown";
  }
}