import * as THREE from "three";
import type { Game } from "./Game";

export class RayCaster {
  game: Game;
  rayCaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  intersects: THREE.Intersection[];
  isDisabled: boolean;
  isHovering: boolean;

  constructor(game: Game) {
    this.game = game;
    this.rayCaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1, 1);
    this.intersects = [];
    this.isDisabled = false;
    this.isHovering = false;

    this.initListeners();
  }

  initListeners() {
    window.addEventListener("mousemove", (e) => {
      const { game, mouse, isDisabled } = this;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const x = (mouseX / game.screen.width) * 2 - 1;
      const y = -((mouseY / game.screen.height) * 2 - 1);

      mouse.set(x, y);

      if (!isDisabled) {
        game.director.handleMouseMove();
      }
    });

    window.addEventListener("mousedown", () => {
      const { game, isDisabled } = this;

      if (!isDisabled) {
        game.director.handleTrigger();
      }
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

  disable() {
    this.isDisabled = true;

    const canvas = document.getElementById("webglCanvas")!;

    if (canvas.classList.contains("clickable")) {
      canvas.classList.remove("clickable");
    }
  }

  update() {
    const { rayCaster, mouse, game, isDisabled } = this;
    const { camera, entities } = game;

    if (!isDisabled) {
      rayCaster.setFromCamera(mouse, camera.currentCamera);

      const objects = [entities.group];

      this.intersects = rayCaster.intersectObjects(objects);

      this.handleIntersects();
    }
  }
}
