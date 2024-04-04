import WebcamModule from "./webcam-module.js";
import Game from "./game-module.js";
import colors from "./colors.js";

let gameStarted = false;

// Function to create checkboxes based on JSON data
function createColorCheckboxes() {
  // Fetch the JSON data
  let colorSelectionDiv = document.getElementById("colorSelection");
  let defaultColors = [];
  // Loop through the JSON data and create checkboxes
  colors.colors.forEach((color) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = color.id;
    checkbox.name = "color";
    checkbox.value = color.rgbColor;
    checkbox.setAttribute("data-string-color", color.name);
    if (color.default) {
      checkbox.checked = true;
      let defaultColor = color.rgbColor.split(",");
      defaultColors.push(defaultColor);
    }
    const label = document.createElement("label");
    label.htmlFor = color.id;
    label.textContent = color.name;

    const div = document.createElement("div");

    div.appendChild(checkbox);
    div.appendChild(label);
    // Add event listener to each checkbox
    checkbox.addEventListener("change", colorCheckboxChanged);
    colorSelectionDiv.appendChild(div);
  });
  colorCheckboxChanged();
}

function colorCheckboxChanged() {
  let selectedColors = [];
  document
    .querySelectorAll('input[type="checkbox"]:checked')
    .forEach(function (cb) {
      let rgbColor = cb.value.split(",");
      let name = cb.getAttribute("data-string-color");
      selectedColors.push({
        rgbColor,
        name,
      });
    });
  // Assuming you have a WebcamModule with an updateColorPalette function
  WebcamModule.updateColorPalette(selectedColors);
}

function initializeCloseButton() {
  const closeButton = document.getElementById("closeButton");
  closeButton.addEventListener("click", function () {
    overlay.style.display = "none";
  });
  return closeButton;
}

async function initializeInputElements() {
  await createColorCheckboxes();
  const inputElements = document.querySelectorAll("input");
  inputElements.forEach((inputElement) => {
    inputElement.addEventListener("input", function (event) {
      const inputId = event.target.id;
      const variableName = event.target.getAttribute("data-variable-name");
      updateValue(inputId, variableName);
    });
  });
}

function playButtonClicked() {
  console.log("Play button clicked");
  playButton.style.display = "none";

  if (!gameStarted) {
    WebcamModule.stopWebcam();
    Game.setup(WebcamModule.getClusters());
  } else {
    Game.resetGame();
  }
  gameStarted = true;
}

function initializePlayButton() {
  const playButton = document.querySelector("#playButton");
  if (playButton) {
    playButton.addEventListener("click", playButtonClicked);
  } else {
    console.error("Play button not found in the DOM");
  }
}

function updateValue(inputId, variableName) {
  const newValue = parseFloat(document.getElementById(inputId).value);
  WebcamModule.updateValue(variableName, newValue);
  // window[variableName] = newValue;
  console.log(`Updated ${variableName}:`, newValue);
  // Store all the values from the UI in a localStorage element "uiConfig"
  updateLocalStorageUIConfig();
}

function updateLocalStorageUIConfig() {
  let uiConfig = {};
  const inputElements = document.querySelectorAll("input");
  inputElements.forEach((inputElement) => {
    const variableName = inputElement.getAttribute("data-variable-name");
    const value = parseFloat(inputElement.value);
    uiConfig[variableName] = value;
  });
  const colorCheckboxes = document.querySelectorAll(
    'input[name="color"]:checked'
  );
  colorCheckboxes.forEach((checkbox) => {
    const colorValue = checkbox.value;
    uiConfig[checkbox.id] = colorValue;
  });
  localStorage.setItem("uiConfig", JSON.stringify(uiConfig));
}

function loadLocalStorageUIConfig() {
  let uiConfig = JSON.parse(localStorage.getItem("uiConfig"));
  if (uiConfig) {
    console.log("Loaded UI config from localStorage:", uiConfig);
    const inputElements = document.querySelectorAll("input");
    inputElements.forEach((inputElement) => {
      const variableName = inputElement.getAttribute("data-variable-name");
      if (uiConfig[variableName]) {
        inputElement.value = uiConfig[variableName];
        console.log(`Updated ${variableName}:`, uiConfig[variableName]);
        const correspondingTextElement = document.querySelector(
          `#${variableName}Value`
        );
        if (correspondingTextElement) {
          correspondingTextElement.textContent = uiConfig[variableName];
        }
        WebcamModule.updateValue(variableName, uiConfig[variableName]);
      }
    });
    const colorCheckboxes = document.querySelectorAll('input[name="color"]');
    colorCheckboxes.forEach((checkbox) => {
      if (uiConfig[checkbox.id]) {
        checkbox.checked = true;
      }
    });
  }
}

// Call the function to create checkboxes
export {
  createColorCheckboxes,
  initializeCloseButton,
  initializeInputElements,
  initializePlayButton,
  gameStarted,
  playButtonClicked,
  loadLocalStorageUIConfig,
};
