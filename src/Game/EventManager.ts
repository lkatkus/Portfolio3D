import * as THREE from "three";
import type { Game } from "./Game";
import { Event, EventConfig } from "./Event";
import { EVENTS_CONFIG } from "./EventManager.constants";

export class EventManager {
  game: Game;
  events: Event[];

  constructor(game: Game) {
    this.game = game;

    this.events = this.initEvents();

    this.initDebug();
  }

  initEvents() {
    const { game } = this;

    const events: Event[] = EVENTS_CONFIG.map(
      (config: EventConfig) => new Event(config)
    );

    game.director.setReady("eventManager");

    return events;
  }

  initDebug() {
    const { game, events } = this;

    const group = new THREE.Group();

    events.forEach((event) => {
      const geometry = new THREE.SphereGeometry(event.triggerRadius);
      const material = new THREE.MeshBasicMaterial({
        color: "red",
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.copy(event.origin);
      group.add(mesh);
    });

    game.scene.currentScene.add(group);
  }

  update() {
    const { game } = this;

    this.events.forEach((event) => event.check(game));
  }
}
