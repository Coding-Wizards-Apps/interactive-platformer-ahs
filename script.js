let video;
let canvas;
let ctx;

function setup() {
  canvas = createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
}

function draw() {
  image(video, 0, 0, width, height);
  loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = (x + y * width) * 4;
      let r = pixels[index];
      let g = pixels[index + 1];
      let b = pixels[index + 2];
      let closestColor = findClosestColor([r, g, b]);
      pixels[index] = closestColor[0];
      pixels[index + 1] = closestColor[1];
      pixels[index + 2] = closestColor[2];
    }
  }
  updatePixels();
}

function findClosestColor(targetColor) {
  let closestColor = colorPalette.reduce((a, b) => {
    return euclideanDistance(targetColor, a) < euclideanDistance(targetColor, b)
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
  [255, 255, 0], // yellow
  // [128, 0, 128], // purple
  [255, 165, 0], // orange
  [255, 255, 255], // white
];
