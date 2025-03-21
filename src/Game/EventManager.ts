import * as THREE from "three";
import type { Game } from "./Game";
import { DIRECTIONS, Event, EventConfig } from "./Event";

const EVENTS_CONFIG: EventConfig[] = [
  {
    id: "camera-switch-1",
    origin: new THREE.Vector3(-10, 0, -18),
    onStart: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        (direction === DIRECTIONS.South || direction === DIRECTIONS.East) &&
        operator.targetOffsetDirection === "sw"
      ) {
        operator.updateTargetOffset(1);
      } else if (
        (direction === DIRECTIONS.West || direction === DIRECTIONS.North) &&
        operator.targetOffsetDirection === "se"
      ) {
        operator.updateTargetOffset(-1);
      }
    },
    onUpdate: (_game: Game) => {},
    onFinish: (game: Game, direction: DIRECTIONS) => {
      const { operator } = game;

      if (
        (direction === DIRECTIONS.South || direction === DIRECTIONS.East) &&
        operator.targetOffsetDirection === "se"
      ) {
        operator.updateTargetOffset(-1);
      } else if (
        (direction === DIRECTIONS.West || direction === DIRECTIONS.North) &&
        operator.targetOffsetDirection === "sw"
      ) {
        operator.updateTargetOffset(1);
      }
    },
  },
];

export class EventManager {
  game: Game;
  events: Event[];

  constructor(game: Game) {
    this.game = game;

    this.events = this.initEvents();
  }

  initEvents() {
    const { game } = this;

    const events: Event[] = EVENTS_CONFIG.map(
      (config: EventConfig) => new Event(config)
    );

    game.director.setReady("eventManager");

    return events;
  }

  update() {
    const { game } = this;

    this.events.forEach((event) => event.check(game));
  }
}
