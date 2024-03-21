import Game from "./game-module.js";

import WebcamModule from "./webcam-module.js";
let gameStarted = false;
let game = new Game();
function preload() {
  game.preload();
  WebcamModule.preload();
}

function setup() {
  WebcamModule.setup();
}

function draw() {
  if (gameStarted) {
    game.draw();
  } else {
    WebcamModule.draw();
  }
}
function keyPressed() {
  if (keyCode === 32) {
    game.shootBullet();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const playButton = document.querySelector("#playButton");
  if (playButton) {
    playButton.addEventListener("click", function () {
      // Add your play button logic here
      console.log("Play button clicked");
      playButton.style.display = "none";
      WebcamModule.stopWebcam();  
      game.setup(WebcamModule.getClusters());
      gameStarted = true;
    });
  } else {
    console.error("Play button not found in the DOM");
  }
});
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
