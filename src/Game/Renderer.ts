import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import type { Game } from "./Game";

const CONFIG = {
  sizeMultiplier: 1,
  strength: 0.75,
  radius: 1,
  threshold: 0.85,
};

export class Renderer {
  game: Game;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;

  constructor(game: Game) {
    const { width, height } = game.screen;

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

    const composer = new EffectComposer(renderer);
    composer.addPass(
      new RenderPass(game.scene.currentScene, game.camera.currentCamera)
    );
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(width, height),
        CONFIG.strength,
        CONFIG.radius,
        CONFIG.threshold
      )
    );

    this.game = game;
    this.renderer = renderer;
    this.composer = composer;

    this.initDebugger();
  }

  initDebugger() {
    const { game } = this;
    const { debug } = game;

    const folder = debug.gui.addFolder("Renderer");
    const resolutionFolder = folder.addFolder("Resolution");
    const bloomFolder = folder.addFolder("Bloom");

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

    bloomFolder
      .add(CONFIG, "strength")
      .min(0)
      .max(5)
      .step(0.01)
      .onFinishChange(this.updateComposer.bind(this));
    bloomFolder
      .add(CONFIG, "radius")
      .min(0)
      .max(5)
      .step(0.01)
      .onFinishChange(this.updateComposer.bind(this));
    bloomFolder
      .add(CONFIG, "threshold")
      .min(0)
      .max(1)
      .step(0.01)
      .onFinishChange(this.updateComposer.bind(this));
  }

  updateComposer() {
    const { game, composer } = this;
    const { width, height } = game.screen;

    composer.passes = [];

    composer.addPass(
      new RenderPass(game.scene.currentScene, game.camera.currentCamera)
    );

    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(width, height),
        CONFIG.strength,
        CONFIG.radius,
        CONFIG.threshold
      )
    );
  }

  update() {
    const { game, renderer, composer } = this;
    const { screen } = game;

    renderer.setSize(
      screen.width * CONFIG.sizeMultiplier,
      screen.height * CONFIG.sizeMultiplier,
      false
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    composer.setSize(screen.width, screen.height);
  }

  render() {
    this.composer.render();
  }
}
