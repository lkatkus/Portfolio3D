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

      game.director.handleMouseMove();
    });

    window.addEventListener("mousedown", () => {
      const { game } = this;

      game.director.handleTrigger();
    });
  }

  handleIntersects() {
    const { intersects, game } = this;

    if (intersects.length > 0) {
      document.getElementById("webglCanvas")!.classList.add("clickable");

      game.director.handleMouseEnter();
    } else {
      document.getElementById("webglCanvas")!.classList.remove("clickable");

      game.director.handleMouseLeave();
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
