document
.getElementById("lowerThresholdFactor")
.addEventListener("input", function () {
  document.getElementById("lowerThresholdFactorValue").textContent =
    this.value;
});
document
.getElementById("upperThresholdFactor")
.addEventListener("input", function () {
  document.getElementById("upperThresholdFactorValue").textContent =
    this.value;
});
document
.getElementById("maxEucledianDistance")
.addEventListener("input", function () {
  document.getElementById("maxEucledianDistanceValue").textContent =
    this.value;
});
document
.getElementById("whiteFactor")
.addEventListener("input", function () {
  document.getElementById("whiteFactorValue").textContent = this.value;
});
window.addEventListener("DOMContentLoaded", (event) => {
let configSliders = localStorage.getItem("configSliders");
if (configSliders) {
  configSliders = JSON.parse(configSliders);
  document.getElementById("lowerThresholdFactor").value =
    configSliders.lowerThresholdFactor || 0.1;
  document.getElementById("lowerThresholdFactorValue").textContent =
    configSliders.lowerThresholdFactor || 0.1;
  document.getElementById("upperThresholdFactor").value =
    configSliders.upperThresholdFactor || 3;
  document.getElementById("upperThresholdFactorValue").textContent =
    configSliders.upperThresholdFactor || 3;
  document.getElementById("maxEucledianDistance").value =
    configSliders.maxEucledianDistance || 250;
  document.getElementById("maxEucledianDistanceValue").textContent =
    configSliders.maxEucledianDistance || 250;
  document.getElementById("whiteFactor").value =
    configSliders.whiteFactor || 1.5;
  document.getElementById("whiteFactorValue").textContent =
    configSliders.whiteFactor || 1.5;
}
});