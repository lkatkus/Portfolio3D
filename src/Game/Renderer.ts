import * as THREE from "three";
import type { Game } from "./Game";

const SIZE_MULTIPLIER = 1;

export class Renderer {
  game: Game;
  renderer: THREE.WebGLRenderer;

  constructor(game: Game) {
    const { width, height } = game.screen;

    const canvas = document.querySelector("#webglCanvas")!;
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(width * SIZE_MULTIPLIER, height * SIZE_MULTIPLIER, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.game = game;
    this.renderer = renderer;
  }

  update() {
    const { game, renderer } = this;
    const { screen } = game;

    renderer.setSize(
      screen.width * SIZE_MULTIPLIER,
      screen.height * SIZE_MULTIPLIER,
      false
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render() {
    const { game, renderer } = this;
    const { scene, camera } = game;

    renderer.render(scene.currentScene, camera.currentCamera);
  }
}
