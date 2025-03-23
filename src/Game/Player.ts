import * as THREE from "three";
import { Entity } from "./Entity";
import type { Game } from "./Game";
import { CollisionCaster } from "./CollisionCaster";

const INITIAL_FORWARD = new THREE.Vector3(-1, 0, 0);

export class Player extends Entity {
  game: Game;
  isControlled: boolean;
  orientation: THREE.Vector3;
  rotationSpeed: number;
  moveSpeed: number;
  keysPressed: Set<string>;

  collisionCaster: CollisionCaster;

  constructor(game: Game) {
    super("player", "/models/act-0-cube.glb");

    this.game = game;
    this.isControlled = false;
    this.orientation = INITIAL_FORWARD.clone();

    this.rotationSpeed = 0.05;
    this.moveSpeed = 10;

    this.keysPressed = new Set();

    this.load = this.load.bind(this);

    this.init();
    this.initControls();

    this.collisionCaster = this.initCollisionCaster();
  }

  async init() {
    const { load, game } = this;
    const { scene } = game;

    await load((model) => {
      model.position.y += 1;
      model.scale.setScalar(0.5);
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

  initCollisionCaster() {
    const { group, orientation } = this;

    const playerPosition = group.position.clone();
    const playerDirection = orientation.clone();

    playerPosition.y += 1;

    return new CollisionCaster(this, playerPosition, playerDirection);
  }

  enableControls() {
    this.isControlled = true;
  }

  disableControls() {
    this.isControlled = false;
    this.keysPressed.clear();
  }

  updateOrientation() {
    const forward = INITIAL_FORWARD.clone();

    forward.applyQuaternion(this.group.quaternion);
    this.orientation.copy(forward);
  }

  update() {
    const { game, collisionCaster } = this;
    const { clock } = game;
    const deltaTime = clock.deltaTime;

    collisionCaster.update();

    const collisions = collisionCaster.checkCollisions();
    const groundOffsetVector = collisionCaster.checkGround();

    if (groundOffsetVector) {
      this.group.position.add(groundOffsetVector);
    } else {
      this.group.position.add(new THREE.Vector3(0, -0.1, 0));
    }

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

      if (this.keysPressed.has("ArrowUp") && !collisions.up) {
        moveVector.normalize().multiplyScalar(this.moveSpeed * 2 * deltaTime);

        this.group.position.add(moveVector);
      }

      if (this.keysPressed.has("ArrowDown") && !collisions.down) {
        moveVector.negate();
        moveVector.normalize().multiplyScalar(this.moveSpeed * 2 * deltaTime);

        this.group.position.add(moveVector);
      }
    }

    // Handle horizontal movement
    if (this.keysPressed.has("w") || this.keysPressed.has("s")) {
      const moveVector = new THREE.Vector3();

      if (this.keysPressed.has("w") && !collisions.front) {
        moveVector.add(this.orientation);
        moveVector.normalize().multiplyScalar(this.moveSpeed * deltaTime);

        this.group.position.add(moveVector);
      }

      if (this.keysPressed.has("s") && !collisions.back) {
        moveVector.add(this.orientation.clone().negate());
        moveVector.normalize().multiplyScalar(this.moveSpeed * deltaTime);

        this.group.position.add(moveVector);
      }
    }
  }
}
