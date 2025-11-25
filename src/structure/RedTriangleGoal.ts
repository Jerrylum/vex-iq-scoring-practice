import * as THREE from "three";
import { Structure, Element, Pin } from "../Element";
import type { Scene } from "../Scene";
import { mulberry32 } from "../utils";

export class RedTriangleGoal extends Structure {
  public readonly theCase: RedTriangleGoalCase;
  public readonly randomSeed: number;

  constructor(theCase: RedTriangleGoalCase, randomSeed: number) {
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

export abstract class RedTriangleGoalCase {
  public abstract getElements(): Element[];
  public abstract visualize(
    scene: Scene,
    structure: RedTriangleGoal
  ): Promise<void>;
}

export class RedTriangleGoalEmptyCase extends RedTriangleGoalCase {
  public getElements(): Element[] {
    return [];
  }
  public visualize(scene: Scene): Promise<void> {
    return Promise.resolve();
  }
}

export class RedTriangleGoalWithColumnsCase extends RedTriangleGoalCase {
  private readonly column1: Pin[];
  private readonly column2: Pin[];
  private readonly column3: Pin[];

  constructor(column1: Pin[], column2: Pin[], column3: Pin[]) {
    super();
    if (column1.length === 0 && column2.length === 0 && column3.length === 0) {
      throw new Error("Columns must have at least 1 pin");
    }
    this.column1 = column1;
    this.column2 = column2;
    this.column3 = column3;
  }

  public getElements(): Element[] {
    return [...this.column1, ...this.column2, ...this.column3];
  }

  public async visualize(
    scene: Scene,
    structure: RedTriangleGoal
  ): Promise<void> {
    const random = mulberry32(structure.randomSeed);
    const dx = random() * 10;
    const dz = random() * 10;

    let y = -114;
    for (const pin of this.column1) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(880 + dx, y, 1180 + dz),
        new THREE.Euler(0, 0, 0)
      );
      y += 60;
    }

    y = -114;
    for (const pin of this.column2) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(790 + dx, y, 1180 + dz),
        new THREE.Euler(0, 0, 0)
      );
      y += 60;
    }

    y = -114;
    for (const pin of this.column3) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(880 + dx, y, 1090 + dz),
        new THREE.Euler(0, 0, 0)
      );
      y += 60;
    }
  }
}
