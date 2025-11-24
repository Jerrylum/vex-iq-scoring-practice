import * as THREE from "three";
import { Scene } from "./Scene.js";
import {
  BluePin,
  OrangePin,
  RedPin,
  Resources,
} from "./Element.js";
import {
  StandoffGoalBeamPlacedCase,
  StandoffGoalOneColumnCase,
  StandoffGoalOnlyBeamPlacedCase
} from "./structure/StandoffGoalStructure.js";
import { StandoffGoalStructure } from "./structure/StandoffGoalStructure.js";
import { generateRandomFloorGoalStructureCase, generateRandomStandoffGoalStructureCase } from "./Generator.js";
import { FloorGoalStructure, FloorGoalWithColumnsCase } from "./structure/FloorGoalStructure.js";

let currentScene: Scene | null = null;

async function generateNewScenario(scene: Scene) {

  // Add game objects to the scene
  // Add two red pins
  // await scene.addPin(
  //   "red",
  //   new THREE.Vector3(50, 0, 50),
  //   new THREE.Euler(0, 0, 0)
  // );

  // await scene.addPin(
  //   "red",
  //   new THREE.Vector3(140 + 12 * 25.4, 0, 50),
  //   new THREE.Euler(0, 0, 0)
  // );

  // Add one blue pin
  // await scene.addPin(
  //   "blue",
  //   new THREE.Vector3(-50, 0, 50),
  //   new THREE.Euler(0, 0, 90)
  // );

  // await scene.addPin(
  //   "blue",
  //   new THREE.Vector3(0, 74, 0),
  //   new THREE.Euler(0, 0, 0)
  // );

  // Add a beam (example)
  // await scene.addBeam(
  //   new THREE.Vector3(0, 74, 0),
  //   new THREE.Euler(0, 0, 0)
  // );


  const resources = new Resources();

  const c = generateRandomStandoffGoalStructureCase("hard");
  const s = new StandoffGoalStructure(c, Math.floor(Math.random() * 360));
  resources.use(s);
  await s.visualize(scene);

  const c2 = generateRandomFloorGoalStructureCase("hard");
  const s2 = new FloorGoalStructure(c2, Math.floor(Math.random() * 1000000000));
  resources.use(s2);
  await s2.visualize(scene);



  console.log("All game objects added successfully");
}

async function reloadScenario() {
  if (!currentScene) return;

  const reloadButton = document.getElementById("reload-button") as HTMLButtonElement;
  if (reloadButton) {
    reloadButton.disabled = true;
    reloadButton.textContent = "Loading...";
  }

  try {
    // Clear existing game objects
    currentScene.clearGameObjects();
    console.log("Cleared game objects, loading new scenario...");

    // Load new scenario
    await generateNewScenario(currentScene);

    console.log("New scenario loaded successfully");
  } catch (error) {
    console.error("Failed to reload scenario:", error);
  } finally {
    if (reloadButton) {
      reloadButton.disabled = false;
      reloadButton.textContent = "New Scenario";
    }
  }
}

// Initialize the scene when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Create the scene instance
    currentScene = new Scene("container");

    // Initialize scene (loads field and preloads all models)
    await currentScene.initialize();

    // Load initial scenario
    await generateNewScenario(currentScene);

    // Setup reload button
    const reloadButton = document.getElementById("reload-button");
    if (reloadButton) {
      reloadButton.addEventListener("click", reloadScenario);
    }
  } catch (error) {
    console.error("Failed to initialize scene:", error);
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
      loadingElement.textContent = "Failed to load scene";
      loadingElement.style.color = "#ff4444";
    }
  }
});
