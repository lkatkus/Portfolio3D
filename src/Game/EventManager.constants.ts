import * as THREE from "three";
import type { Game } from "./Game";
import { DIRECTIONS, EventConfig } from "./Event";

const TRIGGER_OFFSET = 7;
const TRIGGER_OFFSET_SMALL = 4;

const CAMERA_EVENT: EventConfig[] = [
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
  },
  {
    id: "camera-switch-5",
    origin: new THREE.Vector3(-20, 9, 4),
    triggerRadius: TRIGGER_OFFSET_SMALL,
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
  },
];

const WORLD_EVENTS: EventConfig[] = [
  {
    id: "world-event-1-intro",
    origin: new THREE.Vector3(-9, 0, 0),
    triggerRadius: 5,
    debugColor: "blue",
    onStart: (_game: Game) => {
      console.log("Whoo... What is this place?");
    },
  },
  {
    id: "world-event-2-arch",
    origin: new THREE.Vector3(-20, 0, -18),
    triggerRadius: 5,
    debugColor: "blue",
    onStart: (_game: Game) => {
      console.log(
        "I think that someone has told me that architects make great developers."
      );
    },
  },
  {
    id: "world-event-3-portfolio",
    origin: new THREE.Vector3(-54, 3, -18),
    triggerRadius: 5,
    debugColor: "blue",
    onStart: (_game: Game) => {
      console.log(
        "Hmmm... Not too bad! I think that I should come back later."
      );
    },
  },
  {
    id: "world-event-4-github",
    origin: new THREE.Vector3(-52, 3, 22),
    triggerRadius: 5,
    debugColor: "blue",
    onStart: (_game: Game) => {
      console.log(
        `"In case of fire - git add -A, git commit -m "FIRE!", git push origin HEAD --force"`
      );
    },
  },
  {
    id: "world-event-5-other",
    origin: new THREE.Vector3(-30, 6, 20),
    triggerRadius: 5,
    debugColor: "blue",
    onStart: (_game: Game) => {
      console.log(
        "Autocad, Archicad, 3DS MAX, Photoshop, Illustrator, Nikon, Aperture, Bokeh and etc. Lots of fancy words, huh?"
      );
    },
  },
  {
    id: "world-event-6-js",
    origin: new THREE.Vector3(-32, 15, 4),
    triggerRadius: 5,
    debugColor: "blue",
    onStart: (_game: Game) => {
      console.log(
        "That thing looks interesting...? It seems to be REACTing to something."
      );
    },
  },
  {
    id: "world-event-7-plumber",
    origin: new THREE.Vector3(-33, -3, 29),
    triggerRadius: 5,
    debugColor: "blue",
    onStart: (_game: Game) => {
      console.log("I think, that you need a plumber for that...");
    },
  },
];

export const EVENTS_CONFIG: EventConfig[] = [...CAMERA_EVENT, ...WORLD_EVENTS];
