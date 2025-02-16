import * as THREE from "three";
import type { Game } from "./Game";

export class Lights {
  game: Game;

  constructor(game: Game) {
    const { scene } = game;

    const ambientLight = new THREE.AmbientLight("#ffffff", 2);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 2);

    directionalLight.position.set(10, 10, 10);

    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024 * 2;
    directionalLight.shadow.mapSize.height = 1024 * 2;
    directionalLight.shadow.radius = 10;
    directionalLight.shadow.intensity = 0.2;

    // directionalLight.shadow.camera.far = 6;
    // directionalLight.shadow.camera.left = -2;
    // directionalLight.shadow.camera.right = 2;
    // directionalLight.shadow.camera.top = 2;
    // directionalLight.shadow.camera.bottom = -2;

    scene.currentScene.add(ambientLight, directionalLight);

    this.game = game;
  }
}
