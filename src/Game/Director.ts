import * as THREE from "three";
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
        true,
        [0, { duration: 2 }],
        [3, { duration: 2 }],
        [2, { duration: 2 }],
        [1, { duration: 2 }]
      );
    }
  }

  async start() {
    const { game, timeout } = this;
    const { player, operator, entities } = game;

    if (timeout === null) {
      this.timeout = 1;

      const trainEntity = entities.getEntityByName("train");

      // Prepare
      {
        trainEntity.group.position.set(0, 0, -200);
        player.group.position.set(6, 0, -200);
        player.play(0);
      }

      // Play
      {
        await operator.move(0, 2, false);

        this.clearMenu();

        player.move(new THREE.Vector3(6, 0, 0), 2);

        await trainEntity.move(new THREE.Vector3(0, 0, 0), 2);
        await trainEntity.play(3, false, 2);

        operator.setTarget(player);

        player.play(3);
        await player.move(new THREE.Vector3(0, 0, 0), 1);

        trainEntity.playSequence(false, [2], [1]);
        await player.play(2, false);
      }

      // Finish
      {
        this.timeout = null;
        this.currentScene = Scenes.Explore;

        player.enableControls();
        trainEntity.playSequence(
          true,
          [0, { duration: 2 }],
          [3, { duration: 2 }],
          [2, { duration: 2 }],
          [1, { duration: 2 }]
        );
      }
    }
  }

  initFlowerGirl() {
    const { game } = this;
    const { entities } = game;

    const flowerGirlEntity = entities.getEntityByName("flower-girl");

    flowerGirlEntity.group.position.copy(new THREE.Vector3(-20, 0, -18));

    flowerGirlEntity.play(0);
    flowerGirlEntity.setTargets(
      [
        new THREE.Vector3(-20, 0, -18),
        new THREE.Vector3(-40, 0, -18),
        new THREE.Vector3(-44, 3, -18),
        new THREE.Vector3(-54, 3, -18),
        new THREE.Vector3(-54, 3, 22),
        new THREE.Vector3(-43, 3, 22),
        new THREE.Vector3(-40, 6, 22),
        new THREE.Vector3(-29, 6, 22),
      ],
      0,
      1
    );
  }

  startDebug() {
    const { game } = this;
    const { player, operator } = game;

    // player.group.position.set(-35, 6, -18);
    // // player.group.position.set(-52, 4, 6);
    // // player.group.position.set(-25, -3, 30);

    player.enableControls();
    operator.setTarget(player);

    this.initFlowerGirl();
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

      this.initFlowerGirl();

      if (isTargetButtonStart) {
        if (game.debug.isEnabled) {
          this.startDebug();
        } else {
          this.currentScene = Scenes.Start;
        }
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
