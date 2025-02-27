import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import type { Game } from "./Game";

const CONFIG = {
  sizeMultiplier: 1,
  strength: 0.75,
  radius: 1,
  threshold: 0.85,
  transition: 1,
};

export class Renderer {
  game: Game;
  renderer: THREE.WebGLRenderer;

  constructor(game: Game) {
    const { width, height } = game.screen;

    const renderer = this.initRenderer(width, height);

    this.game = game;
    this.renderer = renderer;

    this.initDebugger();
  }

  initControls() {
    const { game } = this;
    const { operator } = game;

    const canvas: any = document.querySelector("#webglCanvas")!;
    const controls = new OrbitControls(operator.current.camera, canvas);

    return controls;
  }

  initRenderer(width: number, height: number) {
    const canvas = document.querySelector("#webglCanvas")!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

    renderer.setSize(
      width * CONFIG.sizeMultiplier,
      height * CONFIG.sizeMultiplier,
      false
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    return renderer;
  }

  initComposer(renderer: THREE.WebGLRenderer) {
    const composer = new EffectComposer(renderer);

    return composer;
  }

  initDebugger() {
    const { game } = this;
    const { debug } = game;

    const folder = debug.gui.addFolder("Renderer");
    const resolutionFolder = folder.addFolder("Resolution");

    resolutionFolder
      .add(CONFIG, "sizeMultiplier")
      .min(0.1)
      .max(1)
      .step(0.1)
      .onFinishChange(() => {
        const { game, renderer } = this;
        const { width, height } = game.screen;

        renderer.setSize(
          width * CONFIG.sizeMultiplier,
          height * CONFIG.sizeMultiplier,
          false
        );
      });
  }

  update() {
    const { game, renderer } = this;
    const { screen } = game;

    renderer.setSize(
      screen.width * CONFIG.sizeMultiplier,
      screen.height * CONFIG.sizeMultiplier,
      false
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render() {
    const { game, renderer } = this;
    const { scene, operator } = game;

    renderer.render(scene.currentScene, operator.current.camera);
  }
}
