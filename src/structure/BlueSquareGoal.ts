import * as THREE from "three";
import { Structure, Element, Pin } from "../Element";
import type { Scene } from "../Scene";
import { mulberry32 } from "../utils";

export class BlueSquareGoal extends Structure {
  public readonly theCase: BlueSquareGoalCase;
  public readonly randomSeed: number;

  constructor(theCase: BlueSquareGoalCase, randomSeed: number) {
    super();
    this.theCase = theCase;
    this.randomSeed = randomSeed;
  }

  public getElements(): Element[] {
    return this.theCase.getElements();
  }

  public visualize(scene: Scene): Promise<void> {
    return this.theCase.visualize(scene, this);
  }
}

export abstract class BlueSquareGoalCase {
  public abstract getElements(): Element[];
  public abstract visualize(
    scene: Scene,
    structure: BlueSquareGoal
  ): Promise<void>;
}

export class BlueSquareGoalEmptyCase extends BlueSquareGoalCase {
  public getElements(): Element[] {
    return [];
  }
  public visualize(scene: Scene): Promise<void> {
    return Promise.resolve();
  }
}

export class BlueSquareGoalWithOneColumnCase extends BlueSquareGoalCase {
  private readonly column: Pin[];

  constructor(column: Pin[]) {
    super();
    if (column.length === 0) {
      throw new Error("Column must have at least 1 pin");
    }
    this.column = column;
  }

  public getElements(): Element[] {
    return [...this.column];
  }

  public async visualize(
    scene: Scene,
    structure: BlueSquareGoal
  ): Promise<void> {
    let y = -114;

    const random = mulberry32(structure.randomSeed);
    const dx = random() * 10;
    const dz = random() * 10;

    for (const pin of this.column) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(-880 + dx, y, 1180 + dz),
        new THREE.Euler(0, 90, 0)
      );
      y += 60;
    }
    return Promise.resolve();
  }
}
