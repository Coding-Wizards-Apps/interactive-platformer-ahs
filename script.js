let video;
let canvas;
let ctx;
const factor = 40;
let newWidth = 640/factor;
let newHeight = 480/factor;
const images = []
let lowerThreshold = 15;
let upperThreshold = 999999999999;
function setup() {
  canvas = createCanvas(newWidth, newHeight);
  video = createCapture(VIDEO);
  video.size(newWidth, newHeight);
  video.hide();
  // saturation(300)
}



function preload(){
  for (let i = 1; i <= 3; i++) {
    images[i] = loadImage(`./images/Tileset_0${i}.png`);
  }
}

function draw() {
  image(video, 0, 0, newWidth, newHeight);
  loadPixels();
  let clusters = [];
  for (let y = 0; y < pixels.length; y++) {
      let index = (y) * 4;
      let r = pixels[index];
      let g = pixels[index + 1];
      let b = pixels[index + 2];
      let closestColor = findClosestColor([r, g, b]);
      
      pixels[index] = closestColor[0];
      pixels[index + 1] = closestColor[1];
      pixels[index + 2] = closestColor[2];
      let clusterFound = false;
      let color = [closestColor[0],closestColor[1],closestColor[2]]
      let coordX = y % newWidth;
      let coordY = Math.floor(y / newWidth);
      for (let cluster of clusters) {
        if (cluster.color[0] === color[0] && cluster.color[1] === color[1] && cluster.color[2] === color[2]) {
          cluster.pixels.push({coordX, coordY});
          clusterFound = true;
          break;
        }
      }
      if (!clusterFound) {
        clusters.push({color, pixels: [{coordX, coordY}]});
      }
    }
  updatePixels();

  
  console.log(clusters);
  for (let cluster of clusters) {
    let x = cluster.pixels[0].coordX;
    let y = cluster.pixels[0].coordY;
    let width = cluster.pixels.reduce((max, p) => Math.max(max, p.x), x) - x;
    let height = cluster.pixels.reduce((max, p) => Math.max(max, p.y), y) - y;
    console.log(cluster.pixels[0].coordX, max)
    fill(cluster.color[0], cluster.color[1], cluster.color[2],50);
    
    if (width > lowerThreshold && height > lowerThreshold && width < upperThreshold && height < upperThreshold) {
      let img;
      if (width < 100) {
        img = images[1];
          console.log("Tileset1")
      } else if (width < 200) {
        img = images[2];
      } else {
        img = images[3];
      }
      // image(img, x, y, width, height);
      noFill(); 
      stroke(255, 0, 0);
      strokeWeight(1)
      rect(x, y, width, height);
    } else {
      // rect(x, y, width, height);
    }
  }
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
  [128, 0, 128], // purple
  [255, 165, 0], // orange
  [255, 255, 255], // white
  [255, 192, 203], // pink
  [0, 255, 255], // cyan
];
