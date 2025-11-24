import * as THREE from "three";
import { Scene } from "./Scene.js";

// Initialize the scene when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Create the scene instance
    const scene = new Scene("container");

    // Initialize scene (loads field and preloads all models)
    await scene.initialize();

    // Add game objects to the scene
    // Add two red pins
    await scene.addPin(
      "red",
      new THREE.Vector3(50, 0, 50),
      new THREE.Euler(0, 0, 0)
    );

    await scene.addPin(
      "red",
      new THREE.Vector3(140 + 12 * 25.4, 0, 50),
      new THREE.Euler(0, 0, 0)
    );

    // Add one blue pin
    await scene.addPin(
      "blue",
      new THREE.Vector3(-50, 0, 50),
      new THREE.Euler(0, 0, 90)
    );

    // Add a beam (example)
    // await scene.addBeam(
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Euler(0, 0, 0)
    // );

    console.log("All game objects added successfully");
  } catch (error) {
    console.error("Failed to initialize scene:", error);
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
      loadingElement.textContent = "Failed to load scene";
      loadingElement.style.color = "#ff4444";
    }
  }
});
