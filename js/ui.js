import WebcamModule from "./webcam-module.js";
import Game from "./game-module.js";
let gameStarted = false;

// Function to create checkboxes based on JSON data
async function createColorCheckboxes() {
  // Fetch the JSON data
  let colorSelectionDiv = document.getElementById("colorSelection");
  let defaultColors = [];
  fetch("colors.json")
    .then((response) => response.json())
    .then((colors) => {
      // Loop through the JSON data and create checkboxes
      colors.colors.forEach((color) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = color.id;
        checkbox.name = "color";
        checkbox.value = color.value;
        if (color.default) {
          checkbox.checked = true;
          let defaultColor = color.value.split(",");
          defaultColors.push(defaultColor);
        }
        const label = document.createElement("label");
        label.htmlFor = color.id;
        label.textContent = color.name;

        const div = document.createElement("div");

        div.appendChild(checkbox);
        div.appendChild(label);
        // Add event listener to each checkbox
        checkbox.addEventListener("change", function () {
          let selectedColors = [];
          document
            .querySelectorAll('input[type="checkbox"]:checked')
            .forEach(function (cb) {
              let color = cb.value.split(",");
              selectedColors.push(color);
            });
          console.log(selectedColors); // You can see the selected colors array in the console
          // Assuming you have a WebcamModule with an updateColorPalette function
          WebcamModule.updateColorPalette(selectedColors);
        });
        colorSelectionDiv.appendChild(div);
      });
    })
    .catch((error) => console.error("Error:", error));
    WebcamModule.updateColorPalette(defaultColors);
    console.log("Default colors:", defaultColors);
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

      WebcamModule.stopWebcam();
      if(!gameStarted){
      Game.setup(WebcamModule.getClusters());
      }
      gameStarted = true;
}

function initializePlayButton() {
  const playButton = document.querySelector("#playButton");
  if (playButton) {
    playButton.addEventListener("click", playButtonClicked  );
  } else {
    console.error("Play button not found in the DOM");
  }
}

function updateValue(inputId, variableName) {
  const newValue = parseFloat(document.getElementById(inputId).value);
  WebcamModule.updateValue(variableName, newValue);
  // window[variableName] = newValue;
  console.log(`Updated ${variableName}:`, newValue);
}

// Call the function to create checkboxes
export {
  createColorCheckboxes,
  initializeCloseButton,
  initializeInputElements,
  initializePlayButton,
  gameStarted,
  playButtonClicked
};
