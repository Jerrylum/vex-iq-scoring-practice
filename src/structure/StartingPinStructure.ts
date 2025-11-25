import * as THREE from "three";
import { Structure, Element, Pin, BluePin, RedPin } from "../Element";
import type { Scene } from "../Scene";
import { mulberry32 } from "../utils";

export class StartingPinStructure extends Structure {
  public readonly theCase: StartingPinCase;

  constructor(theCase: StartingPinCase) {
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

export class StartingPinCase {
  private readonly redTopPin: Pin = new RedPin();
  private readonly redBottomPin: Pin = new RedPin();
  private readonly blueTopPin: Pin = new BluePin();
  private readonly blueBottomPin: Pin = new BluePin();

  constructor(
    private isRedTopCleared: boolean,
    private isRedBottomCleared: boolean,
    private isBlueTopCleared: boolean,
    private isBlueBottomCleared: boolean
  ) {}

  public getElements(): Element[] {
    const rtn: Element[] = [];
    if (!this.isRedTopCleared) {
      rtn.push(this.redTopPin);
    }
    if (!this.isRedBottomCleared) {
      rtn.push(this.redBottomPin);
    }
    if (!this.isBlueTopCleared) {
      rtn.push(this.blueTopPin);
    }
    if (!this.isBlueBottomCleared) {
      rtn.push(this.blueBottomPin);
    }
    return rtn;
  }

  public async visualize(
    scene: Scene,
    structure: StartingPinStructure
  ): Promise<void> {
    // return Promise.resolve();

    if (!this.isRedTopCleared) {
      await scene.addPin(
        this.redTopPin.color,
        new THREE.Vector3(-3 * 12 * 25.4, 0, 1.5 * 12 * 25.4),
        new THREE.Euler(0, 0, -45)
      );
    }

    if (!this.isBlueTopCleared) {
      await scene.addPin(
        this.blueTopPin.color,
        new THREE.Vector3(-3 * 12 * 25.4, 0, -1.5 * 12 * 25.4),
        new THREE.Euler(0, 0, -45)
      );
    }

    if (!this.isRedBottomCleared) {
      await scene.addPin(
        this.redBottomPin.color,
        new THREE.Vector3(3 * 12 * 25.4, 0, -0.5 * 12 * 25.4),
        new THREE.Euler(0, 0, 45)
      );
    }

    if (!this.isBlueBottomCleared) {
      await scene.addPin(
        this.blueBottomPin.color,
        new THREE.Vector3(3 * 12 * 25.4, 0, 0.5 * 12 * 25.4),
        new THREE.Euler(0, 0, 45)
      );
    }

    // TODO
  }
}
