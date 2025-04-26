import * as THREE from "three";
import type { Game } from "./Game";

const CONFIG = {
  internalScale: 0.75,
};

export class Renderer {
  game: Game;
  renderer: THREE.WebGLRenderer;
  renderTarget: THREE.WebGLRenderTarget;
  screenScene: THREE.Scene;
  screenCamera: THREE.OrthographicCamera;
  screenMaterial: THREE.MeshBasicMaterial;

  constructor(game: Game) {
    const { width, height } = game.screen;

    this.game = game;
    this.renderer = this.initRenderer(width, height);
    this.renderTarget = this.initRenderTarget(width, height);

    this.screenScene = new THREE.Scene();
    this.screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.screenMaterial = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
    });

    this.initScreenQuad();
    this.initDebugger();
  }

  initRenderer(width: number, height: number) {
    const canvas = document.querySelector("#webglCanvas")!;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
    });

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1);

    return renderer;
  }

  initRenderTarget(width: number, height: number) {
    return new THREE.WebGLRenderTarget(
      width * CONFIG.internalScale,
      height * CONFIG.internalScale,
      {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        generateMipmaps: false,
        depthBuffer: true,
      }
    );
  }

  initScreenQuad() {
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.screenMaterial
    );

    this.screenScene.add(quad);
  }

  initDebugger() {
    const folder = this.game.debug.gui.addFolder("Renderer").close();
    const resolutionFolder = folder.addFolder("Internal Resolution");

    resolutionFolder
      .add(CONFIG, "internalScale")
      .min(0.1)
      .max(1)
      .step(0.05)
      .onFinishChange(() => {
        this.updateRenderTarget();
      });
  }

  // Method for updating the renderer size and render target
  update() {
    const { width, height } = this.game.screen;

    // Update the renderer size
    this.renderer.setSize(width, height, false);

    // Update the render target size
    this.renderTarget.setSize(
      width * CONFIG.internalScale,
      height * CONFIG.internalScale
    );
  }

  updateRenderTarget() {
    const { width, height } = this.game.screen;

    this.renderTarget.setSize(
      width * CONFIG.internalScale,
      height * CONFIG.internalScale
    );
  }

  render() {
    const { renderer, renderTarget, screenScene, screenCamera } = this;
    const { scene, operator } = this.game;

    // Render the main scene into the internal low-res render target
    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(scene.currentScene, operator.currentCamera.camera);

    // Then render the screen quad with the render target's texture
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(screenScene, screenCamera);
  }
}
