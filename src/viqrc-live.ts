import { Scene } from "./Scene.js";
import { generateSmartScenario, type Difficulty } from "./SmartGenerator.js";

let currentScene: Scene | null = null;
let currentDifficulty: Difficulty = "hard";

async function generateNewScenario(scene: Scene) {
  console.log(`\n=== Generating new scenario (difficulty: ${currentDifficulty}) ===`);
  
  // Generate all structures with smart resource management
  const structures = generateSmartScenario(currentDifficulty);

  // Visualize all structures
  for (const structure of structures) {
    try {
      await structure.visualize(scene);
    } catch (error) {
      console.error("Failed to visualize structure:", error);
    }
  }

  console.log(`\n=== Scenario generation complete: ${structures.length} structures created ===\n`);
}

async function reloadScenario() {
  if (!currentScene) return;

  const reloadButton = document.getElementById(
    "reload-button"
  ) as HTMLButtonElement;
  const difficultySelect = document.getElementById(
    "difficulty-select"
  ) as HTMLSelectElement;

  if (reloadButton) {
    reloadButton.disabled = true;
    reloadButton.textContent = "Loading...";
  }
  if (difficultySelect) {
    difficultySelect.disabled = true;
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
    if (difficultySelect) {
      difficultySelect.disabled = false;
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

    // Setup difficulty selector
    const difficultySelect = document.getElementById("difficulty-select") as HTMLSelectElement;
    if (difficultySelect) {
      difficultySelect.addEventListener("change", (event) => {
        const target = event.target as HTMLSelectElement;
        currentDifficulty = target.value as Difficulty;
        console.log(`Difficulty changed to: ${currentDifficulty}`);
      });
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
