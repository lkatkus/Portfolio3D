import gsap from "gsap";
import * as THREE from "three";

const CAMERA_POSITION = new THREE.Vector3(0, 0, 2);
const OBJECT_BASE_POSITION = new THREE.Vector3(0, 0, 0);
const OBJECT_FOCUS_POSITION = new THREE.Vector3(
  CAMERA_POSITION.x,
  CAMERA_POSITION.y - 0.5,
  CAMERA_POSITION.z - 1
);

export class Game {
  previousTime: number;

  screen: { width: number; height: number };
  mouse: THREE.Vector2;
  clock: THREE.Clock;
  scene: THREE.Scene;
  lights: (THREE.AmbientLight | THREE.DirectionalLight)[];
  renderer: THREE.WebGLRenderer;
  rayCaster: THREE.Raycaster;
  camera: THREE.PerspectiveCamera;
  geometry: THREE.Mesh;
  intersects: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[];

  testing: boolean;
  testingProgress: boolean;
  testingCompleted: boolean;
  testingPrevRotation: THREE.Euler | null;
  testingMultiplier: number;

  constructor() {
    this.previousTime = 0;

    this.clock = this.initClock();
    this.screen = this.initScreen();
    this.mouse = new THREE.Vector2(-1, 1);
    this.scene = this.initScene();
    this.lights = this.initLights();
    this.renderer = this.initRenderer();
    this.rayCaster = this.initRayCaster();
    this.camera = this.initCamera();
    this.geometry = this.initGeometry();

    this.initListeners();

    this.intersects = [];

    this.testing = false;
    this.testingProgress = false;
    this.testingCompleted = false;
    this.testingPrevRotation = null;
    this.testingMultiplier = 1.2;
  }

  initClock() {
    const clock = new THREE.Clock();

    return clock;
  }

  initScreen() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  initListeners() {
    const { screen, mouse, camera, renderer } = this;

    window.addEventListener("resize", () => {
      const updatedScreen = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      camera.aspect = updatedScreen.width / updatedScreen.height;
      camera.updateProjectionMatrix();

      renderer.setSize(updatedScreen.width, updatedScreen.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.screen = updatedScreen;
    });

    window.addEventListener("mousemove", (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const x = (mouseX / screen.width) * 2 - 1;
      const y = -((mouseY / screen.height) * 2 - 1);

      mouse.set(x, y);
    });

    window.addEventListener("mousedown", () => {
      const { intersects } = this;

      if (this.intersects.length > 0) {
        const currentIntersect = intersects[0];
        const currentIntersectObject = currentIntersect.object;

        if (currentIntersectObject.name === "gameBoy") {
          if (!this.testingProgress) {
            if (this.testing && this.testingCompleted) {
              this.testing = false;
              this.testingProgress = true;
            } else {
              this.testing = true;
              this.testingCompleted = false;
            }
          }
        }
      }
    });
  }

  initScene() {
    const scene = new THREE.Scene();

    return scene;
  }

  initLights() {
    const { scene } = this;

    const ambientLight = new THREE.AmbientLight("#ffffff", 2);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
    directionalLight.position.set(1, 0.25, 0);

    scene.add(ambientLight, directionalLight);

    return [ambientLight, directionalLight];
  }

  initRenderer() {
    const { width, height } = this.screen;

    const canvas = document.querySelector("#webglCanvas")!;
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(width, height);

    return renderer;
  }

  initRayCaster() {
    const rayCaster = new THREE.Raycaster();

    return rayCaster;
  }

  initCamera() {
    const { width, height } = this.screen;

    const camera = new THREE.PerspectiveCamera(75, width / height);

    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    return camera;
  }

  initGeometry() {
    const { scene } = this;

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 0.3),
      new THREE.MeshStandardMaterial({ color: "#ffffff" })
    );

    cube.position.copy(OBJECT_BASE_POSITION);
    cube.name = "gameBoy";

    scene.add(cube);

    return cube;
  }

  updateGeometry(_elapsedTime: number, deltaTime: number) {
    const {
      camera,
      geometry,
      testing,
      testingCompleted,
      testingProgress,
      testingPrevRotation,
    } = this;

    if (testing) {
      if (!testingCompleted && !testingProgress) {
        this.testingProgress = true;
        this.testingPrevRotation = geometry.rotation.clone();

        const timeline = gsap.timeline();
        const tweenDuration = 1;

        timeline
          .to(geometry.rotation, {
            x: camera.rotation.x,
            y: camera.rotation.y,
            z: camera.rotation.z,
            duration: tweenDuration,
          })
          .to(
            geometry.position,
            {
              x: OBJECT_FOCUS_POSITION.x,
              y: OBJECT_FOCUS_POSITION.y,
              z: OBJECT_FOCUS_POSITION.z,
              duration: tweenDuration,
              onComplete: () => {
                this.testingCompleted = true;
                this.testingProgress = false;
              },
            },
            "<"
          );
      }
    } else {
      if (testingProgress) {
        if (testingCompleted && testingPrevRotation) {
          this.testingProgress = true;
          this.testingCompleted = false;

          const timeline = gsap.timeline();
          const tweenDuration = 1;

          timeline
            .to(geometry.position, {
              x: OBJECT_BASE_POSITION.x,
              y: OBJECT_BASE_POSITION.y,
              z: OBJECT_BASE_POSITION.z,
              duration: tweenDuration,
            })
            .to(
              geometry.rotation,
              {
                x: testingPrevRotation.x,
                y: testingPrevRotation.y,
                z: testingPrevRotation.z,
                duration: tweenDuration,
                onComplete: () => {
                  this.testingProgress = false;
                  this.testingPrevRotation = null;
                },
              },
              "<"
            );
        }
      } else {
        const rotationDiff = (Math.PI / 2) * deltaTime;

        geometry.rotation.y += rotationDiff * this.testingMultiplier;
        geometry.rotation.y = geometry.rotation.y % Math.PI;

        // geometry.position.y = Math.sin(elapsedTime) * 0.25;
        // geometry.rotation.x = Math.sin(elapsedTime) * 0.25;
      }
    }
  }

  handleIntersects() {
    const { intersects, testingMultiplier } = this;

    if (intersects.length > 0 && testingMultiplier !== 0.5) {
      this.testingMultiplier = 0.2;
    } else if (intersects.length === 0 && testingMultiplier !== 1) {
      this.testingMultiplier = 1;
    }
  }

  updateIntersects() {
    const { rayCaster, mouse, camera, geometry } = this;

    rayCaster.setFromCamera(mouse, camera);

    const objects = [geometry];
    this.intersects = rayCaster.intersectObjects(objects);

    this.handleIntersects();
  }

  update(elapsedTime: number, deltaTime: number) {
    this.updateGeometry(elapsedTime, deltaTime);
  }

  draw() {
    const { renderer, scene, camera } = this;

    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.previousTime;

    this.previousTime = elapsedTime;

    this.updateIntersects();
    this.update(elapsedTime, deltaTime);

    renderer.render(scene, camera);

    window.requestAnimationFrame(this.draw.bind(this));
  }

  start() {
    window.requestAnimationFrame(() => {
      this.draw();
    });
  }
}
