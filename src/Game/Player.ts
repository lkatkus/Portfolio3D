import * as THREE from "three";
import { Entity } from "./Entity";
import type { Game } from "./Game";

export class Player extends Entity {
  game: Game;
  isControlled: boolean;
  orientation: THREE.Vector3;
  movementDirection: THREE.Vector3;
  rotationSpeed: number;
  moveSpeed: number;
  keysPressed: Set<string>;

  constructor(game: Game) {
    super("player", "/models/act-1/act-1-button-start.glb");

    this.game = game;
    this.isControlled = false;
    this.orientation = new THREE.Vector3(0, 0, -1); // Correct forward direction
    this.movementDirection = new THREE.Vector3();

    this.rotationSpeed = 0.05;
    this.moveSpeed = 10;

    this.keysPressed = new Set();

    this.load = this.load.bind(this);

    this.init();
    this.initControls();
    this.initDebug();
  }

  async init() {
    const { load, game } = this;
    const { scene } = game;

    await load((model) => {
      model.position.y += 1;
    });

    scene.currentScene.add(this.group);

    game.director.setReady("player");
  }

  handleKeyDown(e: KeyboardEvent) {
    if (this.isControlled) {
      this.keysPressed.add(e.key);
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keysPressed.delete(e.key);
  }

  initControls() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  enableControls() {
    this.isControlled = true;
  }

  disableControls() {
    this.isControlled = false;
    this.keysPressed.clear();
  }

  updateOrientation() {
    const forward = new THREE.Vector3(0, 0, -1);

    forward.applyQuaternion(this.group.quaternion);
    this.orientation.copy(forward);
  }

  update() {
    const { clock } = this.game;
    const deltaTime = clock.deltaTime;

    // Handle rotation
    if (this.keysPressed.has("a") || this.keysPressed.has("d")) {
      this.updateOrientation();

      if (this.keysPressed.has("a")) {
        this.group.rotateY(this.rotationSpeed);
      }

      if (this.keysPressed.has("d")) {
        this.group.rotateY(-this.rotationSpeed);
      }
    }

    // Handle elevation
    if (this.keysPressed.has("ArrowUp") || this.keysPressed.has("ArrowDown")) {
      const moveVector = new THREE.Vector3(0, 1, 0);

      if (this.keysPressed.has("ArrowDown")) {
        moveVector.negate();
      }

      moveVector.normalize().multiplyScalar(this.moveSpeed * deltaTime);

      this.group.position.add(moveVector);
    }

    // Handle movement
    if (this.keysPressed.has("w") || this.keysPressed.has("s")) {
      const moveVector = new THREE.Vector3();

      if (this.keysPressed.has("w")) {
        moveVector.add(this.orientation.clone().negate());
      }

      if (this.keysPressed.has("s")) {
        moveVector.add(this.orientation);
      }

      moveVector.normalize().multiplyScalar(this.moveSpeed * deltaTime);

      this.group.position.add(moveVector);
    }
  }
}
