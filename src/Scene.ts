import * as THREE from "three";
import { Renderer } from "./Renderer.js";
import { ModelLoader } from "./ModelLoader.js";
import {
  PinObject,
  BeamObject,
  Field,
  GameObject,
  FloorObject,
  WallObject,
} from "./GameObject.js";

export type PinColor = "red" | "blue" | "orange";

export class Scene {
  private renderer: Renderer;
  private modelLoader: ModelLoader;
  private field: Field | null = null;
  private fieldObjects: GameObject[] = [];
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
    // Pre-load all game object models
    await this.preloadGameObjects();

    // Load the field
    await this.loadField();

    // Hide loading message
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
      loadingElement.style.display = "none";
    }

    console.log("Scene initialized successfully");
  }

  private async loadField(): Promise<void> {
    const ft = 12 * 25.4;
    const ox = -2.5 * ft;
    const oz = -3.5 * ft;
    for (let x = 0; x < 6; x++) {
      for (let z = 0; z < 8; z++) {
        this.addFloor(new THREE.Vector3(ox + x * ft, -120, oz + z * ft));
      }
    }

    this.addWall(
      new THREE.Vector3(ox + 0.5 * ft, -126, oz - 0.5 * ft - 16),
      180
    );
    this.addWall(
      new THREE.Vector3(ox + 1.5 * ft, -126, oz - 0.5 * ft - 16),
      180
    );
    this.addWall(
      new THREE.Vector3(ox + 2.5 * ft, -126, oz - 0.5 * ft - 16),
      180
    );
    this.addWall(
      new THREE.Vector3(ox + 3.5 * ft, -126, oz - 0.5 * ft - 16),
      180
    );
    this.addWall(
      new THREE.Vector3(ox + 4.5 * ft, -126, oz - 0.5 * ft - 16),
      180
    );

    this.addWall(new THREE.Vector3(ox + 0.5 * ft, -126, oz + 7.5 * ft + 16), 0);
    this.addWall(new THREE.Vector3(ox + 1.5 * ft, -126, oz + 7.5 * ft + 16), 0);
    this.addWall(new THREE.Vector3(ox + 2.5 * ft, -126, oz + 7.5 * ft + 16), 0);
    this.addWall(new THREE.Vector3(ox + 3.5 * ft, -126, oz + 7.5 * ft + 16), 0);
    this.addWall(new THREE.Vector3(ox + 4.5 * ft, -126, oz + 7.5 * ft + 16), 0);

    this.addWall(
      new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 6.5 * ft),
      90
    );
    this.addWall(
      new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 5.5 * ft),
      90
    );
    this.addWall(
      new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 4.5 * ft),
      90
    );
    this.addWall(
      new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 3.5 * ft),
      90
    );
    this.addWall(
      new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 2.5 * ft),
      90
    );
    this.addWall(
      new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 1.5 * ft),
      90
    );
    this.addWall(
      new THREE.Vector3(ox + 5.5 * ft + 16, -126, oz + 0.5 * ft),
      90
    );

    this.addWall(
      new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 6.5 * ft ),
      270
    );
    this.addWall(
      new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 5.5 * ft ),
      270
    );
    this.addWall(
      new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 4.5 * ft ),
      270
    );
    this.addWall(
      new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 3.5 * ft ),
      270
    );
    this.addWall(
      new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 2.5 * ft ),
      270
    );
    this.addWall(
      new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 1.5 * ft ),
      270
    );
    this.addWall(
      new THREE.Vector3(ox - 0.5 * ft - 16, -126, oz + 0.5 * ft ),
      270
    );

    const maxDim = 1600;

    this.renderer.setCameraView(
      new THREE.Vector3(1600, 1600, 0),
      new THREE.Vector3(0, 0, 0)
    )

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
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Pin.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorRed.mtl",
        "RedPin"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Pin.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorBlue.mtl",
        "BluePin"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Pin.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorOrange.mtl",
        "OrangePin"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Beam.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-Common.mtl",
        "Beam"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Corner.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-Common.mtl",
        "Corner"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Floor.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-Common.mtl",
        "Floor"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_FloorGoalSheet.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-Common.mtl",
        "FloorGoalSheet"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_LoadZone.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorRed.mtl",
        "LoadZone Red"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_LoadZone.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorBlue.mtl",
        "LoadZone Blue"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_SquareGoal.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorRed.mtl",
        "SquareGoal Red"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_SquareGoal.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorBlue.mtl",
        "SquareGoal Blue"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_StandoffGoal.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-Common.mtl",
        "StandoffGoal"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_StartingPinSupport.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorRed.mtl",
        "StartingPinSupport Red"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_StartingPinSupport.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorBlue.mtl",
        "StartingPinSupport Blue"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_TriangleGoal.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorRed.mtl",
        "TriangleGoal Red"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_TriangleGoal.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-ColorBlue.mtl",
        "TriangleGoal Blue"
      ),
      this.modelLoader.loadModel(
        "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Wall.obj",
        "/static/VIQRC-MixAndMatch-H2H-_-Common.mtl",
        "Wall"
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

    const colorName = {
      red: "Red",
      blue: "Blue",
      orange: "Orange",
    };

    const modelName = colorMap[color];
    const objPath = `/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Pin.obj`;
    const mtlPath = `/static/VIQRC-MixAndMatch-H2H-_-Color${colorName[color]}.mtl`;

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
      "/static/VIQRC-MixAndMatch-H2H-_-Common.mtl",
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

  public async addFloor(position: THREE.Vector3) {
    const model = await this.modelLoader.loadModel(
      "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Floor.obj",
      "/static/VIQRC-MixAndMatch-H2H-_-Common.mtl",
      "Floor"
    );

    const floor = new FloorObject(model);
    floor.setPosition(position);
    floor.setRotation(new THREE.Euler(0, 0, 0));

    this.renderer.scene.add(floor.getObject());
    this.fieldObjects.push(floor);

    console.log("Added floor at", position);
    return floor;
  }

  public async addWall(position: THREE.Vector3, rotation: number) {
    const model = await this.modelLoader.loadModel(
      "/static/VIQRC-MixAndMatch-H2H-_-GameObjects_Wall.obj",
      "/static/VIQRC-MixAndMatch-H2H-_-Common.mtl",
      "Wall"
    );
    const wall = new WallObject(model);
    wall.setPosition(position);
    wall.setRotation(new THREE.Euler(0, (rotation * Math.PI) / 180, 0));

    this.renderer.scene.add(wall.getObject());
    this.fieldObjects.push(wall);
    console.log("Added wall at", position);
    return wall;
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
