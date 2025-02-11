import * as THREE from "three";
import type { Game } from "./Game";

export class Renderer {
  game: Game;
  renderer: THREE.WebGLRenderer;

  constructor(game: Game) {
    const { width, height } = game.screen;

    const canvas = document.querySelector("#webglCanvas")!;
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.game = game;
    this.renderer = renderer;
  }

  update() {
    const { game, renderer } = this;
    const { screen } = game;

    renderer.setSize(screen.width, screen.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render() {
    const { game, renderer } = this;
    const { scene, camera } = game;

    renderer.render(scene.currentScene, camera.currentCamera);
  }
}
