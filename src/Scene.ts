import * as THREE from "three";
import { Renderer } from "./Renderer.js";
import { ModelLoader } from "./ModelLoader.js";
import { PinObject, BeamObject, Field, GameObject } from "./GameObject.js";

export type PinColor = "red" | "blue" | "orange";

export class Scene {
  private renderer: Renderer;
  private modelLoader: ModelLoader;
  private field: Field | null = null;
  private gameObjects: GameObject[] = [];
  private pinCounter: Map<PinColor, number> = new Map([
    ["red", 0],
    ["blue", 0],
    ["orange", 0],
  ]);
  private beamCounter: number = 0;

  constructor(containerId: string) {
    this.renderer = new Renderer(containerId);
    this.modelLoader = new ModelLoader();
  }

  public async initialize(): Promise<void> {
    // Load the field
    await this.loadField();

    // Pre-load all game object models
    await this.preloadGameObjects();

    // Hide loading message
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
      loadingElement.style.display = "none";
    }

    console.log("Scene initialized successfully");
  }

  private async loadField(): Promise<void> {
    const fieldModel = await this.modelLoader.loadModel(
      "/static/VIQRC-MixAndMatch-H2H-_-FieldOnly2.obj",
      "/static/VIQRC-MixAndMatch-H2H-_-FieldOnly2.mtl",
      "Field"
    );

    this.field = new Field(fieldModel);
    this.renderer.scene.add(this.field.getObject());

    // Setup camera based on field size
    const box = new THREE.Box3().setFromObject(this.field.getObject());
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.5;

    this.renderer.setCameraView(
      new THREE.Vector3(distance, distance * 0.5, distance),
      new THREE.Vector3(0, 0, 0)
    );

    // Update camera planes
    this.renderer.camera.near = maxDim * 0.01;
    this.renderer.camera.far = maxDim * 10;
    this.renderer.camera.updateProjectionMatrix();

    console.log("Field loaded");
  }

  private async preloadGameObjects(): Promise<void> {
    // Pre-load all pin models
    await Promise.all([
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_RedPin.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_RedPin.mtl",
        "RedPin"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_BluePin.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_BluePin.mtl",
        "BluePin"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_OrangePin.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_OrangePin.mtl",
        "OrangePin"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Beam.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Beam.mtl",
        "Beam"
      ),
    ]);

    console.log("All game object models preloaded");
  }

  public async addPin(
    color: PinColor,
    position: THREE.Vector3,
    rotation: THREE.Euler = new THREE.Euler(0, 0, 0)
  ): Promise<PinObject> {
    // Get the appropriate model path
    const colorMap = {
      red: "RedPin",
      blue: "BluePin",
      orange: "OrangePin",
    };

    const modelName = colorMap[color];
    const objPath = `/static/VIQRC-MixAndMatch-H2H-_-GameObjects_${modelName}.obj`;
    const mtlPath = `/static/VIQRC-MixAndMatch-H2H-_-GameObjects_${modelName}.mtl`;

    // Load model (will use cache if already loaded)
    const model = await this.modelLoader.loadModel(objPath, mtlPath, modelName);

    // Create pin instance
    const instanceId = this.pinCounter.get(color)!;
    this.pinCounter.set(color, instanceId + 1);

    const pin = new PinObject(model, color, instanceId);
    // reverse x and z
    pin.setPosition(position);
    pin.setRotation(rotation);

    this.renderer.scene.add(pin.getObject());
    this.gameObjects.push(pin);

    console.log(`Added ${color} pin at`, position);
    return pin;
  }

  public async addBeam(
    position: THREE.Vector3,
    rotation: THREE.Euler = new THREE.Euler(0, 0, 0)
  ): Promise<BeamObject> {
    // Load beam model (will use cache if already loaded)
    const model = await this.modelLoader.loadModel(
      "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Beam.obj",
      "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Beam.mtl",
      "Beam"
    );

    // Create beam instance
    const beam = new BeamObject(model, this.beamCounter);
    this.beamCounter++;

    beam.setPosition(position);
    beam.setRotation(rotation);

    this.renderer.scene.add(beam.getObject());
    this.gameObjects.push(beam);

    console.log("Added beam at", position);
    return beam;
  }

  public removeGameObject(gameObject: GameObject): void {
    this.renderer.scene.remove(gameObject.getObject());
    const index = this.gameObjects.indexOf(gameObject);
    if (index > -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  public clearGameObjects(): void {
    this.gameObjects.forEach((obj) => {
      this.renderer.scene.remove(obj.getObject());
    });
    this.gameObjects = [];
    this.pinCounter.set("red", 0);
    this.pinCounter.set("blue", 0);
    this.pinCounter.set("orange", 0);
    this.beamCounter = 0;
  }

  public getGameObjects(): GameObject[] {
    return [...this.gameObjects];
  }
}

