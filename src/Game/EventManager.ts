import * as THREE from "three";
import type { Game } from "./Game";
import { Event, EventConfig } from "./Event";
import { EVENTS_CONFIG } from "./EventManager.constants";

export class EventManager {
  game: Game;
  helpersGroup: THREE.Group;
  events: Event[];

  constructor(game: Game) {
    this.game = game;

    this.events = this.initEvents();
    this.helpersGroup = this.initHelpersGroup();

    this.initHelpers();
    this.initDebugger();
  }

  private initHelpersGroup() {
    const { game } = this;
    const { scene } = game;

    const group = new THREE.Group();
    group.visible = false;

    scene.currentScene.add(group);

    return group;
  }

  initEvents() {
    const { game } = this;

    const events: Event[] = EVENTS_CONFIG.map(
      (config: EventConfig) => new Event(config)
    );

    game.director.setReady("eventManager");

    return events;
  }

  toggleHelpers() {
    if (!this.helpersGroup.visible) {
      this.helpersGroup.visible = true;
    } else {
      this.helpersGroup.visible = false;
    }
  }

  private initDebugger() {
    const { game, helpersGroup } = this;
    const { debug } = game;

    const folder = debug.gui.addFolder("EventManager").close();

    const debugConfig = {
      toggleTrackHelpers: this.toggleHelpers.bind(this),
    };

    folder.add(debugConfig, "toggleTrackHelpers");

    if (game.debug.isEnabled) {
      helpersGroup.visible = true;
    }
  }

  initHelpers() {
    const { game, helpersGroup, events } = this;

    events.forEach((event) => {
      const geometry = new THREE.SphereGeometry(event.triggerRadius);
      const material = new THREE.MeshBasicMaterial({
        color: event?.debugColor || "red",
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.copy(event.origin);
      helpersGroup.add(mesh);
    });

    game.scene.currentScene.add(helpersGroup);
  }

  update() {
    const { game } = this;

    this.events.forEach((event) => event.check(game));
  }
}
