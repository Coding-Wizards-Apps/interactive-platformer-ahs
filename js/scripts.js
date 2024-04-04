import Game from "./game-module.js";

import WebcamModule from "./webcam-module.js";

import {
  gameStarted,
  initializeCloseButton,
  initializeInputElements,
  initializePlayButton,
  playButtonClicked,
  loadLocalStorageUIConfig,
} from "./ui.js";


 let facadeFont;
function preload() {
  Game.preload();
  WebcamModule.preload();
  facadeFont = loadFont('../assets/Facade-font-master/fonts/Facade-Est.otf'); 
}

async function setup() {
  WebcamModule.setup();
  textFont(facadeFont); 
}

function draw() {
  if (gameStarted) {
    Game.draw();
  } else {
    WebcamModule.draw();
  }
}

let keyPressTimeout = null;
function keyPressed() {
  if (key === 's') {
    if (keyIsDown(83)) { // 83 is the ASCII code for 's'
      if (!keyPressTimeout) {
        keyPressTimeout = setTimeout(() => {
          playButtonClicked();
          console.log("Play button clicked");
          keyPressTimeout = null;
        }, 1000);
      }
    } else {
      clearTimeout(keyPressTimeout);
      keyPressTimeout = null;
    }
  }
  if (key === 'r') {
    if (keyIsDown(82)) { // 82 is the ASCII code for 'r'
      Game.resetGame();
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const closeButton = initializeCloseButton();

  initializeInputElements();
  initializePlayButton();
  loadLocalStorageUIConfig();
  // overlay.style.display = "block";
  window.preload = preload;
  window.setup = setup;
  window.draw = draw;
  window.keyPressed = keyPressed;
});

