import * as THREE from "three";
import type { Game } from "./Game";
import {
  CAMERA_GAME_POSITION,
  CAMERA_POSITION,
  OBJECT_BASE_POSITION,
  PLACEHOLDER_POSITION,
} from "./constants";

export class Camera {
  game: Game;
  cameras: THREE.PerspectiveCamera[];
  currentCamera: THREE.PerspectiveCamera;

  constructor(game: Game) {
    const { width, height } = game.screen;

    const camera = new THREE.PerspectiveCamera(50, width / height);

    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(OBJECT_BASE_POSITION);

    const cameraGame = new THREE.PerspectiveCamera(75, width / height);

    cameraGame.position.copy(CAMERA_GAME_POSITION);
    cameraGame.lookAt(PLACEHOLDER_POSITION);

    this.game = game;
    this.cameras = [camera, cameraGame];
    this.currentCamera = camera;
  }

  update() {
    const { game, cameras } = this;
    const { screen } = game;

    cameras.forEach((camera) => {
      camera.aspect = screen.width / screen.height;
      camera.updateProjectionMatrix();
    });
  }
}
