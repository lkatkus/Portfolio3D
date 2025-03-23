import { OBJECT_BASE_POSITION } from "./constants";
import type { Game } from "./Game";

const CONFIG = {
  rotationMultiplier: 1,
};

enum Scenes {
  "Intro" = "Intro",
  "Demo" = "Demo",
  "Start" = "Start",
  "Explore" = "Explore",
}

export class Director {
  game: Game;
  timeout: number | null;
  currentScene: Scenes | null;
  status: {
    player: boolean;
    operator: boolean;
    producer: boolean;
    scenographer: boolean;
    eventManager: boolean;
  };

  constructor(game: Game) {
    this.game = game;
    this.timeout = null;
    this.currentScene = null;
    this.status = {
      player: false,
      operator: false,
      producer: false,
      scenographer: false,
      eventManager: false,
    };

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

  setReady(
    target: "player" | "operator" | "producer" | "scenographer" | "eventManager"
  ) {
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

  clearMenu() {
    const { game } = this;
    const { entities } = game;

    entities.entities.forEach((entity) => {
      if (["gameTitle", "gameStartButton"].includes(entity.name)) {
        entity.group.visible = false;
      }
    });
  }

  intro() {
    //
  }

  demo() {
    const { game, timeout } = this;
    const { operator, entities } = game;

    if (timeout === null) {
      this.timeout = 1;

      operator.move(0, 3, false, () => {
        this.clearMenu();
        this.timeout = null;
        this.currentScene = Scenes.Explore;

        operator.move(1, 30, true);
      });

      const trainEntity = entities.getEntityByName("train");

      trainEntity.playSequence(
        [
          [0, { duration: 2 }],
          [3, { duration: 2 }],
          [2, { duration: 2 }],
          [1, { duration: 2 }],
        ],
        true
      );
    }
  }

  start() {
    const { game, timeout } = this;
    const { player, operator, entities } = game;

    if (timeout === null) {
      this.timeout = 1;

      operator.move(0, 3, false, () => {
        this.clearMenu();
      });

      const trainEntity = entities.getEntityByName("train");

      trainEntity.playSequence([
        [0, { duration: 4 }],
        [3, { duration: 2 }],
        [2, { duration: 2 }],
        [
          1,
          {
            duration: 2,
            cb: () => {
              this.timeout = null;
              this.currentScene = Scenes.Explore;

              player.enableControls();
              operator.setTarget(player);

              trainEntity.playSequence(
                [
                  [0, { duration: 2 }],
                  [3, { duration: 2 }],
                  [2, { duration: 2 }],
                  [1, { duration: 2 }],
                ],
                true
              );
            },
          },
        ],
      ]);
    }
  }

  explore() {
    // @TODO create an animation
    const { game } = this;
    const { clock, entities } = game;

    const jsLogo = entities.getEntityByName("jsLogo");
    const geometry = jsLogo.group.children[0];
    const rotationDiff = Math.PI * clock.deltaTime;

    geometry.rotation.y += rotationDiff * CONFIG.rotationMultiplier;
    geometry.rotation.y = geometry.rotation.y % (Math.PI * 2);

    const time = clock.elapsedTime;
    const wobbleAmount = 0.1;
    const wobbleSpeed = 3;

    geometry.rotation.x = wobbleAmount * Math.sin(time * wobbleSpeed);
    geometry.rotation.z = wobbleAmount * Math.cos(time * wobbleSpeed);
  }

  update() {
    switch (this.currentScene) {
      case Scenes.Intro:
        return this.intro();
      case Scenes.Demo:
        return this.demo();
      case Scenes.Start:
        return this.start();
      case Scenes.Explore:
        return this.explore();

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
      const isTargetButtonDemo =
        intersect.object.parent!.name === "act-1-button-demo";

      if (isTargetButtonStart) {
        this.currentScene = Scenes.Start;
      }
      if (isTargetButtonDemo) {
        this.currentScene = Scenes.Demo;
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
