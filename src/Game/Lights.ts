import * as THREE from "three";
import type { Game } from "./Game";

export class Lights {
  game: Game;

  constructor(game: Game) {
    const { scene } = game;

    const ambientLight = new THREE.AmbientLight("#ffffff", 2);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
    directionalLight.position.set(10, 10, 10);

    scene.currentScene.add(ambientLight, directionalLight);

    this.game = game;
  }
}
