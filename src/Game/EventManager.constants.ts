import * as THREE from "three";
import type { Game } from "./Game";
import { DIRECTIONS, EventConfig } from "./Event";

const TRIGGER_OFFSET = 7;

export const EVENTS_CONFIG: EventConfig[] = [
  {
    id: "camera-switch-1",
    origin: new THREE.Vector3(-10, 0, -18),
    triggerRadius: TRIGGER_OFFSET,
    onStart: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        (direction === DIRECTIONS.South || direction === DIRECTIONS.East) &&
        operator.targetOffsetDirection === "se"
      ) {
        operator.updateTargetOffset(1);
      } else if (
        (direction === DIRECTIONS.West || direction === DIRECTIONS.North) &&
        operator.targetOffsetDirection === "ne"
      ) {
        operator.updateTargetOffset(-1);
      }
    },
    onFinish: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        (direction === DIRECTIONS.South || direction === DIRECTIONS.East) &&
        operator.targetOffsetDirection === "ne"
      ) {
        operator.updateTargetOffset(-1);
      } else if (
        (direction === DIRECTIONS.West || direction === DIRECTIONS.North) &&
        operator.targetOffsetDirection === "se"
      ) {
        operator.updateTargetOffset(1);
      }
    },
    onUpdate: (_game: Game) => {},
  },
  {
    id: "camera-switch-2",
    origin: new THREE.Vector3(-54, 3, -18),
    triggerRadius: TRIGGER_OFFSET,
    onStart: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        direction === DIRECTIONS.East &&
        operator.targetOffsetDirection === "ne"
      ) {
        operator.updateTargetOffset(1);
      } else if (
        direction === DIRECTIONS.South &&
        operator.targetOffsetDirection === "nw"
      ) {
        operator.updateTargetOffset(-1);
      }
    },
    onFinish: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        direction === DIRECTIONS.East &&
        operator.targetOffsetDirection === "nw"
      ) {
        operator.updateTargetOffset(-1);
      } else if (
        direction === DIRECTIONS.South &&
        operator.targetOffsetDirection === "ne"
      ) {
        operator.updateTargetOffset(1);
      }
    },
    onUpdate: (_game: Game) => {},
  },
  {
    id: "camera-switch-3",
    origin: new THREE.Vector3(-52, 3, 22),
    triggerRadius: TRIGGER_OFFSET,
    onStart: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        direction === DIRECTIONS.North &&
        operator.targetOffsetDirection === "nw"
      ) {
        operator.updateTargetOffset(1);
      } else if (
        direction === DIRECTIONS.East &&
        operator.targetOffsetDirection === "sw"
      ) {
        operator.updateTargetOffset(-1);
      }
    },
    onFinish: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        direction === DIRECTIONS.North &&
        operator.targetOffsetDirection === "sw"
      ) {
        operator.updateTargetOffset(-1);
      } else if (
        direction === DIRECTIONS.East &&
        operator.targetOffsetDirection === "nw"
      ) {
        operator.updateTargetOffset(1);
      }
    },
    onUpdate: (_game: Game) => {},
  },
  {
    id: "camera-switch-4",
    origin: new THREE.Vector3(-18, 6, 22),
    triggerRadius: TRIGGER_OFFSET,
    onStart: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        direction === DIRECTIONS.West &&
        operator.targetOffsetDirection === "sw"
      ) {
        operator.updateTargetOffset(1);
      } else if (
        direction === DIRECTIONS.North &&
        operator.targetOffsetDirection === "se"
      ) {
        operator.updateTargetOffset(-1);
      }
    },
    onFinish: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        direction === DIRECTIONS.West &&
        operator.targetOffsetDirection === "se"
      ) {
        operator.updateTargetOffset(-1);
      } else if (
        direction === DIRECTIONS.North &&
        operator.targetOffsetDirection === "sw"
      ) {
        operator.updateTargetOffset(1);
      }
    },
    onUpdate: (_game: Game) => {},
  },
];
