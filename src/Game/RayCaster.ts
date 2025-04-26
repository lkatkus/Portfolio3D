import * as THREE from "three";
import gsap from "gsap";
import type { Game } from "./Game";

const INTERACTIVE_ITEMS = ["gameStartButton", "gameDemoButton"];

export class RayCaster {
  game: Game;
  rayCaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  intersects: THREE.Intersection[];
  isDisabled: boolean;
  isHovering: boolean;
  hoverTarget: THREE.Object3D | null;

  constructor(game: Game) {
    this.game = game;
    this.rayCaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1, 1);
    this.intersects = [];
    this.isDisabled = false;
    this.isHovering = false;
    this.hoverTarget = null;

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
      this.hoverTarget = intersects[0].object.parent;

      if (
        this.hoverTarget &&
        INTERACTIVE_ITEMS.includes(this.hoverTarget.name)
      ) {
        canvas.classList.add("clickable");

        if (!isHovering) {
          this.isHovering = true;

          game.director.handleMouseEnter();

          gsap.to(this.hoverTarget.scale, {
            x: 1.1,
            y: 1.1,
            z: 1.1,
            duration: 0.3,
            yoyo: true,
            repeat: -1,
          });
        }
      }
    } else {
      if (this.hoverTarget) {
        if (isHovering) {
          canvas.classList.remove("clickable");

          gsap.killTweensOf(this.hoverTarget.scale);
          gsap.to(this.hoverTarget.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.3,
          });

          this.isHovering = false;
          this.hoverTarget = null;
          game.director.handleMouseLeave();
        }
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
    const { operator, entities } = game;

    if (!isDisabled) {
      rayCaster.setFromCamera(mouse, operator.currentCamera.camera);

      const objects = [entities.group];

      this.intersects = rayCaster.intersectObjects(objects);

      this.handleIntersects();
    }
  }
}
