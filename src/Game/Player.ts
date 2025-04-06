import * as THREE from "three";
import { Entity } from "./Entity";
import type { Game } from "./Game";
import { CollisionCaster } from "./CollisionCaster";

const INITIAL_FORWARD = new THREE.Vector3(-1, 0, 0);

export class Player extends Entity {
  game: Game;
  isControlled: boolean;
  rotationSpeed: number;
  moveSpeed: number;
  keysPressed: Set<string>;

  collisionCaster: CollisionCaster;

  constructor(game: Game) {
    super(game, "player", "/models/player.glb");

    this.game = game;
    this.isControlled = false;
    this.orientation = INITIAL_FORWARD.clone();

    this.moveSpeed = 10;
    this.rotationSpeed = 0.05;

    this.keysPressed = new Set();
    this.collisionCaster = this.initCollisionCaster();

    this.init();
    this.initControls();
    this.initDebugger();
  }

  async init() {
    const { load, game } = this;
    const { scene } = game;

    await load((model) => {
      model.scale.setScalar(0.65);
      model.rotation.y = -Math.PI / 2;
    });

    scene.currentScene.add(this.group);

    game.director.setReady("player");
  }

  initDebugger() {
    const {
      group: { position },
    } = this;

    const positionData = {
      x: position.x.toFixed(2),
      y: position.y.toFixed(2),
      z: position.z.toFixed(2),
    };

    const debugContainer = document.getElementById("playerDebugPosition")!;

    debugContainer.innerHTML = JSON.stringify(positionData, null, 2);
  }

  updateDebugger() {
    const {
      group: { position },
    } = this;

    const positionData = {
      x: position.x.toFixed(2),
      y: position.y.toFixed(2),
      z: position.z.toFixed(2),
    };

    const debugContainer = document.getElementById("playerDebugPosition")!;

    debugContainer.innerHTML = JSON.stringify(positionData, null, 2);
  }

  handleKeyDown(e: KeyboardEvent) {
    if (this.isControlled) {
      this.keysPressed.add(e.code);
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keysPressed.delete(e.code);
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
    const { isControlled, game, collisionCaster } = this;
    const { clock } = game;
    const deltaTime = clock.deltaTime;

    if (isControlled) {
      collisionCaster.update();

      const collisions = collisionCaster.checkCollisions();
      const groundOffsetVector = collisionCaster.checkGround();

      if (groundOffsetVector) {
        this.group.position.add(groundOffsetVector);
      } else {
        this.group.position.add(new THREE.Vector3(0, -0.1, 0));
      }

      let actionIndex = 1;

      // Handle rotation
      if (this.keysPressed.has("KeyA") || this.keysPressed.has("KeyD")) {
        this.updateOrientation();

        if (this.keysPressed.has("KeyA")) {
          actionIndex = 4;
          this.group.rotateY(this.rotationSpeed);
        }

        if (this.keysPressed.has("KeyD")) {
          actionIndex = 5;
          this.group.rotateY(-this.rotationSpeed);
        }
      }

      // Handle elevation
      if (
        this.keysPressed.has("ArrowUp") ||
        this.keysPressed.has("ArrowDown")
      ) {
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
      if (this.keysPressed.has("KeyW") || this.keysPressed.has("KeyS")) {
        const moveVector = new THREE.Vector3();

        if (this.keysPressed.has("KeyW") && !collisions.front) {
          actionIndex = 2;

          moveVector.add(this.orientation);
          moveVector.normalize().multiplyScalar(this.moveSpeed * deltaTime);

          this.group.position.add(moveVector);
        }

        if (this.keysPressed.has("KeyS") && !collisions.back) {
          actionIndex = 3;
          moveVector.add(this.orientation.clone().negate());
          moveVector.normalize().multiplyScalar(this.moveSpeed * deltaTime);

          this.group.position.add(moveVector);
        }
      }

      this.updateDebugger();
      this.play(actionIndex);
    }

    if (this.group.position.y < -15) {
      this.group.position.set(0, 0, 0);
    }

    super.update();
  }
}
