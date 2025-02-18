import * as THREE from "three";
import type { Game } from "./Game";

export class RayCaster {
  game: Game;
  rayCaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  intersects: THREE.Intersection[];
  isHovering: boolean;

  constructor(game: Game) {
    this.game = game;
    this.rayCaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1, 1);
    this.intersects = [];
    this.isHovering = false;

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
    const { game, intersects, isHovering } = this;

    const canvas = document.getElementById("webglCanvas")!;

    if (intersects.length > 0) {
      if (!canvas.classList.contains("clickable")) {
        canvas.classList.add("clickable");
      }

      if (!isHovering) {
        this.isHovering = true;

        game.director.handleMouseEnter();
      }
    } else {
      if (canvas.classList.contains("clickable")) {
        canvas.classList.remove("clickable");
      }

      if (isHovering) {
        this.isHovering = false;

        game.director.handleMouseLeave();
      }
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
