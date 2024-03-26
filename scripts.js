import Game from "./game-module.js";

import WebcamModule from "./webcam-module.js";

function updateValue(inputId, variableName) {
  const newValue = parseFloat(document.getElementById(inputId).value);
  WebcamModule.updateValue(variableName, newValue);
  // window[variableName] = newValue;
  console.log(`Updated ${variableName}:`, newValue);
}
let gameStarted = false;
function preload() {
  Game.preload();
  WebcamModule.preload();
}

async function setup() {
  WebcamModule.setup();
  startColorPalette();
}

function startColorPalette() {
  let checkboxes = document.querySelectorAll(
    'input[type="checkbox"][name="color"]'
  );
  let selectedColors = [];
  checkboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      let color = checkbox.value.split(",");
      selectedColors.push(color);
    }
  });
  WebcamModule.updateColorPalette(selectedColors);
  console.log(selectedColors); // You can see the selected colors array in the console
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

function initializeOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "none";
  return overlay;
}

function initializeCloseButton() {
  const closeButton = document.getElementById("closeButton");
  closeButton.addEventListener("click", function () {
    overlay.style.display = "none";
  });
  return closeButton;
}

function initializeInputElements() {
  const inputElements = document.querySelectorAll("input");
  inputElements.forEach((inputElement) => {
    inputElement.addEventListener("input", function (event) {
      const inputId = event.target.id;
      const variableName = event.target.getAttribute("data-letiable-name");
      updateValue(inputId, variableName);
    });
  });
}

function initializePlayButton() {
  const playButton = document.querySelector("#playButton");
  if (playButton) {
    playButton.addEventListener("click", function () {
      console.log("Play button clicked");
      playButton.style.display = "none";

      WebcamModule.stopWebcam();
      Game.setup(WebcamModule.getClusters());
      gameStarted = true;
    });
  } else {
    console.error("Play button not found in the DOM");
  }
}

function initializeColorSelector() {
  let selectedColors = [];

  let checkboxes = document.querySelectorAll(
    'input[type="checkbox"][name="color"]'
  );
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      selectedColors = [];
      checkboxes.forEach(function (cb) {
        if (cb.checked) {
          let color = cb.value.split(",");
          selectedColors.push(color);
        }
      });
      console.log(selectedColors); // You can see the selected colors array in the console
      WebcamModule.updateColorPalette(selectedColors);
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const overlay = initializeOverlay();
  const closeButton = initializeCloseButton();
  initializeInputElements();
  initializePlayButton();
  initializeColorSelector();
  overlay.style.display = "block";
});
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
// Wait for the DOM to load
