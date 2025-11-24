import * as THREE from "three";

export abstract class GameObject {
  protected container: THREE.Group;
  protected model: THREE.Group;

  constructor(model: THREE.Group, name: string) {
    this.model = model;
    this.container = new THREE.Group();
    this.container.name = name;
    this.container.add(this.model);
  }

  public getObject(): THREE.Group {
    return this.container;
  }

  public setPosition(position: THREE.Vector3): void {
    this.container.position.copy(position);
  }

  public setRotation(rotation: THREE.Euler): void {
    this.container.rotation.copy(rotation);
  }

  public getPosition(): THREE.Vector3 {
    return this.container.position.clone();
  }

  public getRotation(): THREE.Euler {
    return this.container.rotation.clone();
  }
}

export class Pin extends GameObject {
  constructor(model: THREE.Group, color: string, instanceId: number) {
    super(model, `${color}Pin_${instanceId}`);
    this.prepareModel();
  }

  private prepareModel(): void {
    // Rotate the model to correct orientation
    this.model.rotation.x = -Math.PI / 2;

    // Calculate bounding box after rotation
    const box = new THREE.Box3().setFromObject(this.model);
    const rotatedCenter = new THREE.Vector3();
    box.getCenter(rotatedCenter);

    // Center horizontally and place bottom on ground
    this.model.position.x = -rotatedCenter.x;
    this.model.position.y = -box.min.y;
    this.model.position.z = -rotatedCenter.z;
  }
}

export class Beam extends GameObject {
  constructor(model: THREE.Group, instanceId: number) {
    super(model, `Beam_${instanceId}`);
    this.prepareModel();
  }

  private prepareModel(): void {
    // Rotate the model to correct orientation
    this.model.rotation.x = -Math.PI / 2;

    // Calculate bounding box after rotation
    const box = new THREE.Box3().setFromObject(this.model);
    const rotatedCenter = new THREE.Vector3();
    box.getCenter(rotatedCenter);

    // Center horizontally and place bottom on ground
    this.model.position.x = -rotatedCenter.x;
    this.model.position.y = -box.min.y;
    this.model.position.z = -rotatedCenter.z;
  }
}

export class Field extends GameObject {
  constructor(model: THREE.Group) {
    super(model, "Field");
    this.prepareModel();
  }

  private prepareModel(): void {
    // Field doesn't need rotation, just center it
    const box = new THREE.Box3().setFromObject(this.model);
    const center = new THREE.Vector3();
    box.getCenter(center);

    this.model.position.x = -center.x;
    this.model.position.y = -center.y;
    this.model.position.z = -center.z;
  }
}

