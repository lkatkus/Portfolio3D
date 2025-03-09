import { OBJECT_BASE_POSITION } from "./constants";
import type { Game } from "./Game";

const CONFIG = {
  rotationMultiplier: 1,
};

enum Scenes {
  "Intro" = "Intro",
  "Start" = "Start",
  "TurnAround" = "TurnAround",
}

export class Director {
  game: Game;
  timeout: number | null;
  currentScene: Scenes | null;
  status: { operator: boolean; producer: boolean; scenographer: boolean };

  constructor(game: Game) {
    this.game = game;
    this.timeout = null;
    this.currentScene = null;
    this.status = { operator: false, producer: false, scenographer: false };

    this.initDebugger();
  }

  init() {
    const loaderEl = document.getElementById("loader")!;
    loaderEl.classList.add("hidden");

    this.game.operator.initTrack(0);
    this.currentScene = Scenes.Intro;
  }

  initDebugger() {
    const { game } = this;
    const { debug } = game;

    const folder = debug.gui.addFolder("Director").close();

    folder.add(CONFIG, "rotationMultiplier").min(0).max(2).step(0.01);
  }

  setReady(target: "operator" | "producer" | "scenographer") {
    this.status[target] = true;

    this.checkReady();
  }

  checkReady() {
    if (Object.values(this.status).every((value) => value === true)) {
      this.init();
    }
  }

  reset() {
    const { game } = this;
    const { entities } = game;
    const { group } = entities;

    const geometry = group.children[0];

    group.position.set(0, 5, 0);
    geometry.position.copy(OBJECT_BASE_POSITION);
  }

  intro() {
    //
  }

  turnaround() {
    const { game } = this;
    const { clock, entities } = game;
    const { group } = entities;

    const geometry = group.children[0];
    const rotationDiff = Math.PI * clock.deltaTime;

    geometry.rotation.y += rotationDiff * CONFIG.rotationMultiplier;
    geometry.rotation.y = geometry.rotation.y % (Math.PI * 2);

    const time = clock.elapsedTime;
    const wobbleAmount = 0.1;
    const wobbleSpeed = 3;

    geometry.rotation.x = wobbleAmount * Math.sin(time * wobbleSpeed);
    geometry.rotation.z = wobbleAmount * Math.cos(time * wobbleSpeed);
  }

  start() {
    const { game, timeout } = this;
    const { operator, entities } = game;

    if (timeout === null) {
      this.timeout = 1;

      operator.move(0, 3, false, false, () => {
        this.timeout = null;
        this.currentScene = Scenes.TurnAround;

        entities.group.children.forEach((child) => {
          if (["act-1-title", "act-1-button-start"].includes(child.name)) {
            child.visible = false;
          }
        });

        entities.play(0);

        setTimeout(() => {
          operator.move(1, 30, false, true);
        }, 4000);
      });
    }
  }

  update() {
    switch (this.currentScene) {
      case Scenes.Intro:
        return this.intro();
      case Scenes.Start:
        return this.start();
      case Scenes.TurnAround:
        return this.turnaround();

      default:
        break;
    }
  }

  handleTrigger() {
    const { game, currentScene } = this;
    const { rayCaster } = game;

    const hasIntersects = rayCaster.intersects.length > 0;

    if (!hasIntersects) {
      return;
    }

    if (currentScene === Scenes.Intro) {
      const intersect = rayCaster.intersects[0];

      const isTargetButtonStart =
        intersect.object.parent!.name === "act-1-button-start";

      if (isTargetButtonStart) {
        this.currentScene = Scenes.Start;
      }
    }
  }

  handleMouseMove() {
    //
  }

  handleMouseEnter() {
    //
  }

  handleMouseLeave() {
    //
  }
}
