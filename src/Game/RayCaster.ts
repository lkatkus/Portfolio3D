import * as THREE from "three";
import type { Game } from "./Game";

export class RayCaster {
  game: Game;
  mouse: THREE.Vector2;
  rayCaster: THREE.Raycaster;
  intersects: THREE.Intersection[];

  constructor(game: Game) {
    this.game = game;
    this.intersects = [];
    this.mouse = new THREE.Vector2(-1, 1);
    this.rayCaster = new THREE.Raycaster();

    this.initListeners();
  }

  initListeners() {
    const { game, mouse } = this;

    window.addEventListener("mousemove", (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const x = (mouseX / game.screen.width) * 2 - 1;
      const y = -((mouseY / game.screen.height) * 2 - 1);

      mouse.set(x, y);
    });

    window.addEventListener("mousedown", () => {
      const { intersects } = this;

      if (this.intersects.length > 0) {
        const currentIntersect = intersects[0];
        const currentIntersectObject = currentIntersect.object;

        // @TODO check how to handle loaded model mesh name
        if (currentIntersectObject.name === "LOD3spShape") {
          if (!game.testingProgress) {
            if (game.testing && game.testingCompleted) {
              game.testing = false;
              game.testingProgress = true;
            } else {
              game.testing = true;
              game.testingCompleted = false;
            }
          }
        }
      }
    });
  }

  handleIntersects() {
    const { intersects, game } = this;

    if (intersects.length > 0 && game.testingMultiplier !== 0.2) {
      document.getElementById("webglCanvas")!.classList.add("clickable");

      game.testingMultiplier = 0.2;
    } else if (intersects.length === 0 && game.testingMultiplier !== 1) {
      document.getElementById("webglCanvas")!.classList.remove("clickable");

      game.testingMultiplier = 1;
    }
  }

  update() {
    const { rayCaster, mouse, game } = this;
    const { camera, entities } = game;

    rayCaster.setFromCamera(mouse, camera.currentCamera);

    const objects = [entities.group];

    this.intersects = rayCaster.intersectObjects(objects);

    this.handleIntersects();
  }
}
