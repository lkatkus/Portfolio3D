import * as THREE from "three";
import type { Game } from "./Game";
import { CAMERA_POSITION } from "./constants";

export class Camera {
  game: Game;
  currentCamera: THREE.PerspectiveCamera;

  constructor(game: Game) {
    const { width, height } = game.screen;

    const camera = new THREE.PerspectiveCamera(75, width / height);

    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.game = game;
    this.currentCamera = camera;
  }

  update() {
    const { game, currentCamera } = this;
    const { screen } = game;

    currentCamera.aspect = screen.width / screen.height;
    currentCamera.updateProjectionMatrix();
  }
}
