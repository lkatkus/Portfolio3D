import * as THREE from "three";
import type { Player } from "./Player";

const frontTo = {
  back: (f: THREE.Vector3) => f.clone().negate(),
  left: (f: THREE.Vector3) => new THREE.Vector3(f.z, 0, -f.x),
  right: (f: THREE.Vector3) => new THREE.Vector3(-f.z, 0, f.x),
  up: (_f: THREE.Vector3) => new THREE.Vector3(0, 1, 0),
  down: (_f: THREE.Vector3) => new THREE.Vector3(0, -1, 0),
};

const colors = {
  front: "red",
  back: "green",
  left: "blue",
  right: "yellow",
  up: "magenta",
  down: "cyan",
};

export class CollisionCaster {
  player: Player;
  origin: THREE.Vector3;

  private front: THREE.Raycaster;
  private back: THREE.Raycaster;
  private left: THREE.Raycaster;
  private right: THREE.Raycaster;
  private up: THREE.Raycaster;
  private down: THREE.Raycaster;

  private debugArrows: Record<string, THREE.ArrowHelper> = {};

  constructor(
    player: Player,
    origin: THREE.Vector3,
    forwardDirection: THREE.Vector3
  ) {
    this.player = player;
    this.origin = origin;

    this.front = this.initRayCaster(forwardDirection, 0.75);
    this.back = this.initRayCaster(frontTo.back(forwardDirection), 0.75);
    this.left = this.initRayCaster(frontTo.left(forwardDirection));
    this.right = this.initRayCaster(frontTo.right(forwardDirection));
    this.up = this.initRayCaster(frontTo.up(forwardDirection));
    this.down = this.initRayCaster(frontTo.down(forwardDirection));

    this.initDebug();
  }

  initRayCaster(direction: THREE.Vector3, farMultiplier = 1) {
    const rayCaster = new THREE.Raycaster(
      this.origin.clone(),
      direction.clone().normalize(),
      0,
      1 * farMultiplier
    );

    return rayCaster;
  }

  initDebug() {
    const { group } = this.player;

    const directions = {
      front: this.front.ray.direction,
      back: this.back.ray.direction,
      left: this.left.ray.direction,
      right: this.right.ray.direction,
      up: this.up.ray.direction,
      down: this.down.ray.direction,
    };

    for (const key in directions) {
      const arrow = new THREE.ArrowHelper(
        directions[key as keyof typeof directions],
        this.origin,
        1,
        colors[key as keyof typeof colors]
      );

      group.add(arrow);

      this.debugArrows[key as keyof typeof this.debugArrows] = arrow;
    }
  }

  update() {
    const { player } = this;

    const playerPosition = player.group.position.clone();
    playerPosition.y += 1;

    this.origin.copy(playerPosition);

    const forwardDirection = this.player.orientation.clone().normalize();

    this.front.set(this.origin, forwardDirection);
    this.back.set(this.origin, frontTo.back(forwardDirection));
    this.left.set(this.origin, frontTo.left(forwardDirection));
    this.right.set(this.origin, frontTo.right(forwardDirection));
    this.up.set(this.origin, frontTo.up(forwardDirection));
    this.down.set(this.origin, frontTo.down(forwardDirection));
  }

  checkCollisions() {
    const sceneObjects = this.player.game.scenographer.group.children;

    return {
      front: this.front.intersectObjects(sceneObjects, true).length > 0,
      back: this.back.intersectObjects(sceneObjects, true).length > 0,
      left: this.left.intersectObjects(sceneObjects, true).length > 0,
      right: this.right.intersectObjects(sceneObjects, true).length > 0,
      up: this.up.intersectObjects(sceneObjects, true).length > 0,
      down: this.down.intersectObjects(sceneObjects, true).length > 0,
    };
  }

  checkGround() {
    const sceneObjects = this.player.game.scenographer.group.children;

    const intersections = this.down.intersectObjects(sceneObjects, true);

    if (intersections.length > 0) {
      const diff = this.player.group.position.y - intersections[0].point.y;

      if (Math.abs(diff) < 0.01) {
        return new THREE.Vector3(0, 0, 0);
      }

      return new THREE.Vector3(0, -diff, 0);
    }

    return null;
  }
}
