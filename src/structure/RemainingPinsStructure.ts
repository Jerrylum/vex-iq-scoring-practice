import * as THREE from "three";
import { Structure, Element, Pin, OrangePin } from "../Element";
import type { Scene } from "../Scene";

export class RemainingPinsStructure extends Structure {
  public readonly theCase: RemainingPinsCase;

  constructor(theCase: RemainingPinsCase) {
    super();
    this.theCase = theCase;
  }

  public getElements(): Element[] {
    return this.theCase.getElements();
  }

  public visualize(scene: Scene): Promise<void> {
    return this.theCase.visualize(scene, this);
  }
}

export class RemainingPinsCase {
  constructor(private readonly orangePins: OrangePin[]) {}

  public getElements(): Element[] {
    return [...this.orangePins];
  }

  public async visualize(
    scene: Scene,
    structure: RemainingPinsStructure
  ): Promise<void> {
    if (this.orangePins.length === 0) {
      return; // No pins to visualize
    }

    const basePosition = new THREE.Vector3(600, -114, 0);
    const pinSpacing = 100;

    // Calculate starting position to center the pins
    const totalWidth = (this.orangePins.length - 1) * pinSpacing;
    const startZ = -totalWidth / 2;

    for (let i = 0; i < this.orangePins.length; i++) {
      const pin = this.orangePins[i];
      if (!pin) continue;

      const zPosition = startZ + i * pinSpacing;

      await scene.addPin(
        pin.color,
        new THREE.Vector3(basePosition.x, basePosition.y, zPosition),
        new THREE.Euler(0, 0, 0)
      );
    }
  }
}

export function generateRemainingPinsCase(
  availableOrange: number
): RemainingPinsCase {
  const orangePins: OrangePin[] = [];

  for (let i = 0; i < availableOrange; i++) {
    orangePins.push(new OrangePin());
  }

  return new RemainingPinsCase(orangePins);
}
