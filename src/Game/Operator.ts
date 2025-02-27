import * as THREE from "three";
import type { Game } from "./Game";
import {
  CAMERA_GAME_POSITION,
  CAMERA_POSITION,
  OBJECT_BASE_POSITION,
  PLACEHOLDER_POSITION,
} from "./constants";
import { Camera } from "./Camera";

export class Operator {
  game: Game;
  cameras: Camera[];
  current: Camera;

  constructor(game: Game) {
    this.game = game;
    this.cameras = this.initCameras();
    this.current = this.initCurrentCamera();

    this.initDebugger();
  }

  initCameras() {
    const { game } = this;
    const { aspectRatio } = game.screen;

    const config: {
      fov: number;
      aspectRatio: number;
      position: THREE.Vector3;
      target: THREE.Vector3;
    }[] = [
      {
        fov: 50,
        aspectRatio,
        position: CAMERA_POSITION,
        target: OBJECT_BASE_POSITION,
      },
      {
        fov: 75,
        aspectRatio,
        position: CAMERA_GAME_POSITION,
        target: PLACEHOLDER_POSITION,
      },
    ];

    const cameras = config.map(
      ({ fov, aspectRatio, position, target }) =>
        new Camera(fov, aspectRatio, position, target)
    );

    return cameras;
  }

  initCurrentCamera() {
    const { cameras } = this;

    return cameras[0];
  }

  initDebugger() {
    const { game, cameras } = this;
    const { debug } = game;

    const folder = debug.gui.addFolder("Operator");
    const availableCameras = cameras.map((_, index) => index);

    folder
      .add({ currentCamera: 0 }, "currentCamera", availableCameras)
      .name("Active Camera")
      .onChange((index: any) => {
        this.current = cameras[index];
      });
  }

  loadPaths() {
    //
  }

  update() {
    const { game, cameras } = this;
    const { screen } = game;

    cameras.forEach((camera) => {
      camera.update(screen.aspectRatio);
    });
  }
}
