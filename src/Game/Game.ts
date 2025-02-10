import * as THREE from "three";

export class Game {
  previousTime: number;

  screen: { width: number; height: number };
  clock: THREE.Clock;
  scene: THREE.Scene;
  lights: (THREE.AmbientLight | THREE.DirectionalLight)[];
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  geometry: THREE.Mesh;

  constructor() {
    this.previousTime = 0;

    this.clock = this.initClock();
    this.screen = this.initScreen();
    this.scene = this.initScene();
    this.lights = this.initLights();
    this.renderer = this.initRenderer();
    this.camera = this.initCamera();
    this.geometry = this.initGeometry();

    this.initListeners();
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
    const { camera, renderer } = this;

    window.addEventListener("resize", () => {
      const updatedScreen = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Update camera
      camera.aspect = updatedScreen.width / updatedScreen.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(updatedScreen.width, updatedScreen.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.screen = updatedScreen;
    });
  }

  initScene() {
    const scene = new THREE.Scene();

    return scene;
  }

  initLights() {
    const { scene } = this;

    const ambientLight = new THREE.AmbientLight("#ffffff", 1);
    const directionalLight = new THREE.DirectionalLight("#ffffff", 0.9);
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

  initCamera() {
    const { width, height } = this.screen;

    const camera = new THREE.PerspectiveCamera(75, width / height);

    camera.position.x = 2;
    camera.position.y = 1;
    camera.position.z = 2;

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    return camera;
  }

  initGeometry() {
    const { scene } = this;

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: "#ffffff" })
    );

    scene.add(cube);

    return cube;
  }

  updateGeometry(deltaTime: number) {
    const { geometry } = this;

    geometry.rotation.y += 0.3 * deltaTime;
  }

  update(deltaTime: number) {
    this.updateGeometry(deltaTime);
  }

  draw() {
    const { renderer, scene, camera } = this;

    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.previousTime;

    this.previousTime = elapsedTime;

    this.update(deltaTime);

    renderer.render(scene, camera);

    window.requestAnimationFrame(this.draw.bind(this));
  }

  start() {
    window.requestAnimationFrame(() => {
      this.draw();
    });
  }
}
