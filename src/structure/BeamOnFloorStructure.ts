import * as THREE from "three";
import { Structure, Element, Pin } from "../Element";
import type { Scene } from "../Scene";
import { mulberry32 } from "../utils";

export class BeamOnFloorStructure extends Structure {
  public readonly theCase: BeamOnFloorCase;
  public readonly randomSeed: number;

  constructor(theCase: BeamOnFloorCase, randomSeed: number) {
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

export abstract class BeamOnFloorCase {
  public abstract getElements(): Element[];
  public abstract visualize(
    scene: Scene,
    structure: BeamOnFloorStructure
  ): Promise<void>;
}

export class JustBeamOnFloorCase extends BeamOnFloorCase {
  public getElements(): Element[] {
    return [];
  }
  public async visualize(
    scene: Scene,
    structure: BeamOnFloorStructure
  ): Promise<void> {
    const random = mulberry32(structure.randomSeed);
    const rotate = random() * 360;
    await scene.addBeam(
      new THREE.Vector3(0, -114, 600),
      new THREE.Euler(0, rotate, 0)
    );
    return Promise.resolve();
  }
}

export class BeamWithColumnsCase extends BeamOnFloorCase {
  private readonly bottomColumn: Pin[];
  private readonly topLeftColumn: Pin[];
  private readonly topRightColumn: Pin[];

  constructor(
    bottomColumn: Pin[],
    topLeftColumn: Pin[],
    topRightColumn: Pin[]
  ) {
    super();
    this.bottomColumn = bottomColumn;
    this.topLeftColumn = topLeftColumn;
    this.topRightColumn = topRightColumn;
  }

  public getElements(): Element[] {
    return [
      ...this.bottomColumn,
      ...this.topLeftColumn,
      ...this.topRightColumn,
    ];
  }
  public async visualize(
    scene: Scene,
    structure: BeamOnFloorStructure
  ): Promise<void> {
    const random = mulberry32(structure.randomSeed);
    const rotate = random() * 360;
    const dx = random() * 400 - 200;
    const dz = random() * 400 - 200;

    let y = -114;
    for (const pin of this.bottomColumn) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(dx, y, 600 + dz),
        new THREE.Euler(0, 0, 0)
      );
      y += 60;
    }

    await scene.addBeam(
      new THREE.Vector3(dx, y, 600 + dz),
      new THREE.Euler(0, rotate, 0)
    );
    y += 110;

    if (this.bottomColumn.length === 0) {
      y += 4;
    }

    let y2 = y;
    for (const pin of this.topLeftColumn) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(
          dx + 64 * Math.cos(rotate),
          y2,
          600 + dz + -64 * Math.sin(rotate)
        ),
        new THREE.Euler(0, 0, -Math.PI)
      );
      y2 += 60;
    }

    y2 = y;
    for (const pin of this.topRightColumn) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(
          dx + -64 * Math.cos(rotate),
          y2,
          600 + dz + 64 * Math.sin(rotate)
        ),
        new THREE.Euler(0, 0, Math.PI)
      );
      y2 += 60;
    }
  }
}

export class BeamWithTwoBottomColumnsCase extends BeamOnFloorCase {
  private readonly bottomColumn1: Pin[];
  private readonly bottomColumn2: Pin[];
  private readonly topColumn: Pin[];

  constructor(bottomColumn1: Pin[], bottomColumn2: Pin[], topColumn: Pin[]) {
    super();
    this.bottomColumn1 = bottomColumn1;
    this.bottomColumn2 = bottomColumn2;
    this.topColumn = topColumn;
  }

  public getElements(): Element[] {
    return [...this.bottomColumn1, ...this.bottomColumn2, ...this.topColumn];
  }
  public async visualize(
    scene: Scene,
    structure: BeamOnFloorStructure
  ): Promise<void> {
    const random = mulberry32(structure.randomSeed);
    const rotate = random() * 360;
    const dx = random() * 400 - 200;
    const dz = random() * 400 - 200;

    let y = -114;
    for (const pin of this.bottomColumn1) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(
          dx + 64 * Math.cos(rotate),
          y,
          600 + dz + -64 * Math.sin(rotate)
        ),
        new THREE.Euler(0, 0, 0)
      );
      y += 60;
    }

    y = -114;
    for (const pin of this.bottomColumn2) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(
          dx - 64 * Math.cos(rotate),
          y,
          600 + dz + 64 * Math.sin(rotate)
        ),
        new THREE.Euler(0, 0, 0)
      );
      y += 60;
    }

    await scene.addBeam(
      new THREE.Vector3(dx, y, 600 + dz),
      new THREE.Euler(0, rotate, 0)
    );
    y += 110;

    for (const pin of this.topColumn) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(dx, y, 600 + dz),
        new THREE.Euler(0, 0, -Math.PI)
      );
      y += 60;
    }
  }
}
