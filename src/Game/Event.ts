import * as THREE from "three";
import type { Game } from "./Game";

export enum DIRECTIONS {
  South = "South",
  West = "West",
  East = "East",
  North = "North",
}

export type EventConfig = {
  id: string;
  origin: THREE.Vector3;
  triggerRadius: number;
  onStart: (game: Game, direction: DIRECTIONS) => void;
  onUpdate: (game: Game) => void;
  onFinish: (game: Game, direction: DIRECTIONS) => void;
};

export class Event {
  id: string;
  origin: THREE.Vector3;
  triggerRadius: number;

  isActive: boolean;

  constructor({
    id,
    origin,
    triggerRadius,
    onStart,
    onFinish,
    onUpdate,
  }: EventConfig) {
    this.id = id;
    this.origin = origin;
    this.triggerRadius = triggerRadius;

    this.isActive = false;

    this.onStart = onStart;
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
  }

  onStart(_game: Game, _direction: DIRECTIONS) {
    //
  }

  onUpdate(_game: Game) {
    //
  }

  onFinish(_game: Game, _direction: DIRECTIONS) {
    //
  }

  activate() {}

  getDirectionLabel(direction: THREE.Vector3) {
    if (Math.abs(direction.x) > Math.abs(direction.z)) {
      return direction.x > 0 ? DIRECTIONS.East : DIRECTIONS.West; // More movement in X → East/West
    } else {
      return direction.z > 0 ? DIRECTIONS.South : DIRECTIONS.North; // More movement in Z → North/South
    }
  }

  getEntryDirection(playerPosition: THREE.Vector3) {
    const { origin } = this;

    const entryDirection = new THREE.Vector3()
      .subVectors(playerPosition, origin)
      .normalize();

    return this.getDirectionLabel(entryDirection);
  }

  check(game: Game) {
    const { origin, triggerRadius } = this;

    const playerPosition = game.player.group.position;
    const distToEvent = playerPosition.distanceTo(origin);

    if (!this.isActive && distToEvent < triggerRadius) {
      this.isActive = true;

      const entryDirection = this.getEntryDirection(playerPosition);

      this.onStart(game, entryDirection);
    } else if (this.isActive && distToEvent > triggerRadius) {
      this.isActive = false;

      const exitDirection = this.getEntryDirection(playerPosition);

      this.onFinish(game, exitDirection);
    }

    if (this.isActive) {
      this.onUpdate(game);
    }
  }
}
