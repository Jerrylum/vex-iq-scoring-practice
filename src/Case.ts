import type { PinColor, Scene } from "./Scene";
import * as THREE from "three";

export abstract class Element {
  public robot1Contacted = false;
  public robot2Contacted = false;
}

export class Pin extends Element {
  public readonly color: PinColor;

  constructor(color: PinColor) {
    super();
    this.color = color;
  }
}

export class RedPin extends Pin {
  constructor() {
    super("red");
  }
}

export class BluePin extends Pin {
  constructor() {
    super("blue");
  }
}

export class OrangePin extends Pin {
  constructor() {
    super("orange");
  }
}

export class Beam extends Element {
  constructor() {
    super();
  }
}

export abstract class StandoffGoalCase {
  public abstract getBottomColumn(): Pin[] | null;
  public abstract getTopLeftColumn(): Pin[] | null;
  public abstract getTopRightColumn(): Pin[] | null;
  public abstract getBeam(): Beam | null;
  public abstract visualize(
    scene: Scene,
    structure: StandoffGoalStructure
  ): Promise<void>;
}

export class StandoffGoalEmptyCase extends StandoffGoalCase {
  public getBottomColumn(): Pin[] | null {
    return null;
  }

  public getTopLeftColumn(): Pin[] | null {
    return null;
  }

  public getTopRightColumn(): Pin[] | null {
    return null;
  }

  public getBeam(): Beam | null {
    return null;
  }

  public async visualize(
    scene: Scene,
    structure: StandoffGoalStructure
  ): Promise<void> {
    // do nothing
  }
}

export class StandoffGoalOnlyBeamPlacedCase extends StandoffGoalCase {
  private readonly beam: Beam = new Beam();

  public getBottomColumn(): Pin[] | null {
    return null;
  }

  public getTopLeftColumn(): Pin[] | null {
    return null;
  }

  public getTopRightColumn(): Pin[] | null {
    return null;
  }

  public getBeam(): Beam | null {
    return this.beam;
  }

  public async visualize(
    scene: Scene,
    structure: StandoffGoalStructure
  ): Promise<void> {
    await scene.addBeam(
      new THREE.Vector3(0, 74, 0),
      new THREE.Euler(0, (structure.rotation * Math.PI) / 180, 0)
    );
  }
}

export class StandoffGoalOneColumnCase extends StandoffGoalCase {
  private readonly column: Pin[];

  constructor(column: Pin[]) {
    super();
    if (column.length === 0) {
      throw new Error("Column must have at least 1 pin");
    }
    this.column = column;
  }

  public getBottomColumn(): Pin[] | null {
    return this.column;
  }

  public getTopLeftColumn(): Pin[] | null {
    return null;
  }

  public getTopRightColumn(): Pin[] | null {
    return null;
  }

  public getBeam(): Beam | null {
    return null;
  }

  public async visualize(
    scene: Scene,
    structure: StandoffGoalStructure
  ): Promise<void> {
    let y = 74;

    for (const pin of this.column) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(0, y, 0),
        new THREE.Euler(0, (structure.rotation * Math.PI) / 180, 0)
      );
      y += 60;
    }
  }
}

export class StandoffGoalBeamPlacedCase extends StandoffGoalCase {
  private readonly bottomColumn: Pin[];
  private readonly topLeftColumn: Pin[];
  private readonly topRightColumn: Pin[];
  private readonly beam: Beam = new Beam();

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

  public getBottomColumn(): Pin[] | null {
    return this.bottomColumn;
  }

  public getTopLeftColumn(): Pin[] | null {
    return this.topLeftColumn;
  }

  public getTopRightColumn(): Pin[] | null {
    return this.topRightColumn;
  }

  public getBeam(): Beam | null {
    return this.beam;
  }

  public async visualize(
    scene: Scene,
    structure: StandoffGoalStructure
  ): Promise<void> {
    // await this.bottomColumn.visualize(scene, structure);
    // await this.topLeftColumn.visualize(scene, structure);
    // await this.topRightColumn.visualize(scene, structure);
    // await this.beam.visualize(scene, structure);
    // TODO

    let y = 74;
    const rad = structure.rotation * Math.PI / 180;

    for (const pin of this.bottomColumn) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(0, y, 0),
        new THREE.Euler(0, 0, 0)
      );
      y += 60;
    }

    await scene.addBeam(
      new THREE.Vector3(0, y, 0),
      new THREE.Euler(0, rad, 0)
    );


    let y2 = y + 110;
    for (const pin of this.topLeftColumn) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(64 * Math.cos(rad), y2, -64 * Math.sin(rad)),
        new THREE.Euler(0, 0, -Math.PI)
      );
      y2 += 60;
    }

    y2 = y + 110;
    for (const pin of this.topRightColumn) {
      await scene.addPin(
        pin.color,
        new THREE.Vector3(-64 * Math.cos(rad), y2, 64 * Math.sin(rad)),
        new THREE.Euler(0, 0, Math.PI)
      );
      y2 += 60;
    }
  }
}

export abstract class Structure {
  public abstract getElements(): Element[];

  public abstract visualize(scene: Scene): Promise<void>;
}

export class StandoffGoalStructure extends Structure {
  public readonly theCase: StandoffGoalCase;
  public readonly rotation: number;

  constructor(theCase: StandoffGoalCase, rotation: number) {
    super();
    this.theCase = theCase;
    this.rotation = rotation;
  }

  public getElements(): Element[] {
    return [
      ...(this.theCase.getBottomColumn() ?? []),
      ...(this.theCase.getTopLeftColumn() ?? []),
      ...(this.theCase.getTopRightColumn() ?? []),
      ...(this.theCase.getBeam() ? [this.theCase.getBeam()!] : []),
    ];
  }

  public async visualize(scene: Scene): Promise<void> {
    await this.theCase.visualize(scene, this);
  }
}

export class Resources {
  public readonly redPinsMaxCount = 10;
  public readonly bluePinsMaxCount = 10;
  public readonly orangePinsMaxCount = 16;
  public readonly beamsMaxCount = 2;

  public use(structure: Structure): void {
    const elements = structure.getElements();
    let redPinsCount = 0;
    let bluePinsCount = 0;
    let orangePinsCount = 0;
    let beamsCount = 0;
    for (const element of elements) {
      if (element instanceof RedPin) {
        redPinsCount++;
        if (redPinsCount > this.redPinsMaxCount) {
          throw new Error("Red pins count exceeds max count");
        }
      }
      if (element instanceof BluePin) {
        bluePinsCount++;
        if (bluePinsCount > this.bluePinsMaxCount) {
          throw new Error("Blue pins count exceeds max count");
        }
      }
      if (element instanceof OrangePin) {
        orangePinsCount++;
        if (orangePinsCount > this.orangePinsMaxCount) {
          throw new Error("Orange pins count exceeds max count");
        }
      }
      if (element instanceof Beam) {
        beamsCount++;
        if (beamsCount > this.beamsMaxCount) {
          throw new Error("Beams count exceeds max count");
        }
      }
    }
    if (
      redPinsCount + bluePinsCount + orangePinsCount + beamsCount !==
      elements.length
    ) {
      throw new Error("Elements count does not match");
    }
  }
}
