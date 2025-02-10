import gsap from "gsap";
import * as THREE from "three";
import type { Game } from "./Game";
import { OBJECT_BASE_POSITION, OBJECT_FOCUS_POSITION } from "./constants";

export class Entities {
  game: Game;
  geometry: THREE.Mesh;

  constructor(game: Game) {
    this.game = game;
    this.geometry = this.initEntities();
  }

  initEntities() {
    const { game } = this;
    const { scene } = game;

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 0.3),
      new THREE.MeshStandardMaterial({ color: "#ffffff" })
    );

    cube.position.copy(OBJECT_BASE_POSITION);
    cube.name = "gameBoy";

    scene.currentScene.add(cube);

    return cube;
  }

  update() {
    const { game, geometry } = this;
    const { clock } = game;

    const tweenDuration = 0.3;

    if (game.testing) {
      if (!game.testingCompleted && !game.testingProgress) {
        game.testingProgress = true;
        game.testingPrevRotation = geometry.rotation.clone();

        const timeline = gsap.timeline();

        timeline
          .to(geometry.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: tweenDuration,
          })
          .to(
            geometry.position,
            {
              x: OBJECT_FOCUS_POSITION.x,
              y: OBJECT_FOCUS_POSITION.y,
              z: OBJECT_FOCUS_POSITION.z,
              duration: tweenDuration,
              onComplete: () => {
                game.testingCompleted = true;
                game.testingProgress = false;
              },
            },
            "<"
          );
      }
    } else {
      if (game.testingProgress) {
        if (game.testingCompleted && game.testingPrevRotation) {
          game.testingProgress = true;
          game.testingCompleted = false;

          const timeline = gsap.timeline();

          timeline
            .to(geometry.position, {
              x: OBJECT_BASE_POSITION.x,
              y: OBJECT_BASE_POSITION.y,
              z: OBJECT_BASE_POSITION.z,
              duration: tweenDuration,
            })
            .to(
              geometry.rotation,
              {
                x: game.testingPrevRotation.x,
                y: game.testingPrevRotation.y,
                z: game.testingPrevRotation.z,
                duration: tweenDuration,
                onComplete: () => {
                  game.testingProgress = false;
                  game.testingPrevRotation = null;
                },
              },
              "<"
            );
        }
      } else {
        const rotationDiff = (Math.PI / 2) * clock.deltaTime;

        geometry.rotation.y += rotationDiff * game.testingMultiplier;
        geometry.rotation.y = geometry.rotation.y % Math.PI;

        // geometry.position.y = Math.sin(elapsedTime) * 0.25;
        // geometry.rotation.x = Math.sin(elapsedTime) * 0.25;
      }
    }
  }
}
