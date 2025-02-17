import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import type { Game } from "./Game";

const SIZE_MULTIPLIER = 1;

export class Renderer {
  game: Game;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;

  constructor(game: Game) {
    const { width, height } = game.screen;

    const canvas = document.querySelector("#webglCanvas")!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

    renderer.setSize(width * SIZE_MULTIPLIER, height * SIZE_MULTIPLIER, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.game = game;
    this.renderer = renderer;

    // Setup post-processing
    this.composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(
      game.scene.currentScene,
      game.camera.currentCamera
    );
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.75, // Strength
      1, // Radius
      0.85 // Threshold
    );
    this.composer.addPass(bloomPass);
  }

  update() {
    const { game, renderer, composer } = this;
    const { screen } = game;

    renderer.setSize(
      screen.width * SIZE_MULTIPLIER,
      screen.height * SIZE_MULTIPLIER,
      false
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    composer.setSize(screen.width, screen.height);
  }

  render() {
    this.composer.render();
  }
}
