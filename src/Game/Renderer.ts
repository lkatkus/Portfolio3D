import * as THREE from "three";
import { RenderTransitionPass } from "three/addons/postprocessing/RenderTransitionPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import type { Game } from "./Game";
import gsap from "gsap";

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
  composer: EffectComposer;

  transitioning: boolean;
  transitionProgress: number;

  constructor(game: Game) {
    const { width, height } = game.screen;

    const renderer = this.initRenderer(width, height);
    const composer = this.initComposer(renderer);

    this.game = game;
    this.renderer = renderer;
    this.composer = composer;

    this.transitioning = false;
    this.transitionProgress = 1;

    this.initPasses();
    this.initDebugger();
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

  initPasses() {
    const { game, composer } = this;
    const { width, height } = game.screen;

    composer.addPass(
      new RenderPass(game.scene.currentScene, game.camera.currentCamera)
    );

    const renderTransitionPass = new RenderTransitionPass(
      game.scene.currentScene,
      game.camera.currentCamera,
      game.scene.currentScene,
      game.camera.cameras[1]
    );

    renderTransitionPass.setTransition(1);

    this.composer.addPass(renderTransitionPass);

    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(width, height),
        CONFIG.strength,
        CONFIG.radius,
        CONFIG.threshold
      )
    );
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

  initTransition() {
    const renderTransitionPass: any = this.composer.passes[1];

    gsap.to(CONFIG, {
      transition: 0,
      duration: 0.5,
      onUpdate: () => {
        renderTransitionPass.setTransition(CONFIG.transition);
      },
    });
  }
}
