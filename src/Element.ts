import type { PinColor, Scene } from "./Scene";

export abstract class Element {
  public robot1Contacted = false;
  public robot2Contacted = false;
}

export abstract class Pin extends Element {
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

export abstract class Structure {
  public abstract getElements(): Element[];

  public abstract visualize(scene: Scene): Promise<void>;
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
