import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ModelViewer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private container: HTMLElement;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a2a2a);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(100, 100, 100);

    // Initialize renderer with standard settings
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Initialize OrbitControls for mouse camera control
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 2000;
    this.controls.maxPolarAngle = Math.PI;

    // Add lights
    this.setupLights();

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());

    // Start render loop
    this.animate();
  }

  private setupLights(): void {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Fill lights for better model visibility
    const light1 = new THREE.DirectionalLight(0xffffff, 0.4);
    light1.position.set(-100, 50, -50);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.3);
    light2.position.set(0, -50, 100);
    this.scene.add(light2);
  }

  public async loadOBJWithoutMTL(objPath: string): Promise<void> {
    const objLoader = new OBJLoader();

    return new Promise((resolve, reject) => {
      objLoader.load(
        objPath,
        (object) => {
          let meshCount = 0;
          
          // Apply default material to all meshes
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              meshCount++;
              child.material = new THREE.MeshPhongMaterial({
                color: 0x00aa88,
                shininess: 100,
                side: THREE.DoubleSide,
              });
              child.castShadow = true;
              child.receiveShadow = true;
              
              if (child.geometry) {
                child.geometry.computeBoundingBox();
                child.geometry.computeVertexNormals();
              }
            }
          });

          if (meshCount === 0) {
            reject(new Error("No meshes found in OBJ file"));
            return;
          }

          this.scene.add(object);

          const box = new THREE.Box3().setFromObject(object);
          const center = new THREE.Vector3();
          const size = new THREE.Vector3();
          box.getCenter(center);
          box.getSize(size);

          object.position.x = -center.x;
          object.position.y = -center.y;
          object.position.z = -center.z;
          // No rotation applied

          const maxDim = Math.max(size.x, size.y, size.z);
          const distance = maxDim * 1.5;

          this.camera.position.set(distance, distance * 0.5, distance);
          this.camera.lookAt(0, 0, 0);

          this.camera.near = maxDim * 0.01;
          this.camera.far = maxDim * 10;
          this.camera.updateProjectionMatrix();

          this.controls.target.set(0, 0, 0);
          this.controls.update();

          const loadingElement = document.getElementById("loading");
          if (loadingElement) {
            loadingElement.style.display = "none";
          }

          console.log("Model loaded successfully");
          resolve();
        },
        (progress) => {
          if (progress.total > 0) {
            const percent = (progress.loaded / progress.total) * 100;
            const loadingElement = document.getElementById("loading");
            if (loadingElement) {
              loadingElement.textContent = `Loading model... ${percent.toFixed(0)}%`;
            }
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  public async loadOBJ(objPath: string, mtlPath: string): Promise<void> {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    return new Promise((resolve, reject) => {
      // First load the MTL file
      mtlLoader.load(
        mtlPath,
        (materials) => {
          materials.preload();
          objLoader.setMaterials(materials);
          
          // Now load the OBJ file
          objLoader.load(
            objPath,
            (object) => {
              let meshCount = 0;
              
              // Enable shadows for all meshes and compute bounding boxes
              object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  meshCount++;
                  child.castShadow = true;
                  child.receiveShadow = true;
                  
                  if (child.geometry) {
                    child.geometry.computeBoundingBox();
                    child.geometry.computeVertexNormals();
                  }
                }
              });

              // If no meshes found, reject
              if (meshCount === 0) {
                reject(new Error("OBJ file contains no meshes"));
                return;
              }

              this.scene.add(object);

              const box = new THREE.Box3().setFromObject(object);
              const center = new THREE.Vector3();
              const size = new THREE.Vector3();
              box.getCenter(center);
              box.getSize(size);

              // If size is 0, reject
              if (size.x === 0 || size.y === 0 || size.z === 0) {
                reject(new Error("Model has zero size"));
                return;
              }

              // Center the model
              object.position.x = -center.x;
              object.position.y = -center.y;
              object.position.z = -center.z;
              // No rotation applied

              const maxDim = Math.max(size.x, size.y, size.z);
              const distance = maxDim * 1.5;

              this.camera.position.set(distance, distance * 0.5, distance);
              this.camera.lookAt(0, 0, 0);

              this.camera.near = maxDim * 0.01;
              this.camera.far = maxDim * 10;
              this.camera.updateProjectionMatrix();

              this.controls.target.set(0, 0, 0);
              this.controls.update();

              const loadingElement = document.getElementById("loading");
              if (loadingElement) {
                loadingElement.style.display = "none";
              }

              console.log("Model loaded successfully with materials");
              resolve();
            },
            (progress) => {
              if (progress.total > 0) {
                const percent = (progress.loaded / progress.total) * 100;
                const loadingElement = document.getElementById("loading");
                if (loadingElement) {
                  loadingElement.textContent = `Loading model... ${percent.toFixed(0)}%`;
                }
              }
            },
            (error) => {
              reject(error);
            }
          );
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    
    // Update controls (handles damping)
    this.controls.update();
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the viewer when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  const viewer = new ModelViewer("container");

  // Try loading OBJ with MTL first
  try {
    await viewer.loadOBJ(
      "/static/VIQRC-MixAndMatch-H2H-_-FieldOnly2.obj",
      "/static/VIQRC-MixAndMatch-H2H-_-FieldOnly2.mtl"
    );
  } catch (objMtlError) {
    // Try loading OBJ without MTL as fallback
    try {
      await viewer.loadOBJWithoutMTL("/static/VIQRC-MixAndMatch-H2H-_-FieldOnly2.obj");
    } catch (objError) {
      console.error("Failed to load model:", objError);
      const loadingElement = document.getElementById("loading");
      if (loadingElement) {
        loadingElement.textContent = "Failed to load model";
        loadingElement.style.color = "#ff4444";
      }
    }
  }
});
