import Game from "./game-module.js";

import WebcamModule from "./webcam-module.js";
let gameStarted = false;
function preload() {
  Game.preload();
  WebcamModule.preload();
}

async function setup() {
  WebcamModule.setup();
}

function draw() {
  if (gameStarted) {
    Game.draw();
  } else {
    WebcamModule.draw();
  }
}
function keyPressed() {
  if (keyCode === 32) {
    Game.shootBullet();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Get the overlay and close button elements
  const overlay = document.getElementById("overlay");
  const closeButton = document.getElementById("closeButton");

  // Hide the overlay by default
  overlay.style.display = "none";

  // Add click event listener to the close button
  closeButton.addEventListener("click", function() {
      // Hide the overlay when the close button is clicked
      overlay.style.display = "none";

      // Start the scripts here
      // Add your script code here
  });

  // Show the overlay initially
  overlay.style.display = "block";
  const playButton = document.querySelector("#playButton");
  if (playButton) {
    playButton.addEventListener("click", function () {
      // Add your play button logic here
      console.log("Play button clicked");
      playButton.style.display = "none";
      
      WebcamModule.stopWebcam();  
      Game.setup(WebcamModule.getClusters());
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
// Wait for the DOM to load
