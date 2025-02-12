import { OBJECT_BASE_POSITION, OBJECT_FOCUS_POSITION } from "./constants";
import gsap from "gsap";
import type { Game } from "./Game";

enum Scenes {
  "Intro" = "Intro",
  "TurnAround" = "TurnAround",
  "FocusIn" = "FocusIn",
  "FocusOut" = "FocusOut",
  "StartPlay" = "StartPlay",
  "Play" = "Play",
}

export class Director {
  game: Game;
  timeout: number | null;
  currentScene: Scenes | null;

  constructor(game: Game) {
    this.game = game;
    this.timeout = null;
    this.currentScene = null;
  }

  init() {
    this.currentScene = Scenes.Intro;
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
    const { game, timeout } = this;
    const { entities } = game;
    const { group } = entities;

    if (timeout === null) {
      this.timeout = 1;

      this.reset();

      gsap.to(group.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        onComplete: () => {
          this.timeout = null;
          this.currentScene = Scenes.TurnAround;
        },
      });
    }
  }

  turnaround() {
    const { game } = this;
    const { clock, entities } = game;
    const { group } = entities;

    const geometry = group.children[0];
    const rotationDiff = (Math.PI / 2) * clock.deltaTime;

    geometry.rotation.y += rotationDiff;
    geometry.rotation.y = geometry.rotation.y % (Math.PI * 2);
  }

  focusIn() {
    const { game } = this;
    const { entities } = game;
    const { group } = entities;

    const geometry = group.children[0];
    const timeline = gsap.timeline();
    const tweenDuration = 0.3;

    timeline
      .to(geometry.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: tweenDuration,
      })
      .to(
        geometry.position,
        {
          x: OBJECT_FOCUS_POSITION.x,
          y: OBJECT_FOCUS_POSITION.y,
          z: OBJECT_FOCUS_POSITION.z,
          duration: tweenDuration,
        },
        "<"
      );
  }

  focusOut() {
    const { game } = this;
    const { entities } = game;
    const { group } = entities;

    const geometry = group.children[0];
    const timeline = gsap.timeline();
    const tweenDuration = 0.3;

    timeline
      .to(geometry.position, {
        x: OBJECT_BASE_POSITION.x,
        y: OBJECT_BASE_POSITION.y,
        z: OBJECT_BASE_POSITION.z,
        duration: tweenDuration,
      })
      .to(
        geometry.rotation,
        {
          x: 0,
          y: 0,
          z: 0,
          duration: tweenDuration,
          onComplete: () => {
            this.currentScene = Scenes.TurnAround;
          },
        },
        "<"
      );
  }

  start() {
    const { game, timeout } = this;
    const { entities } = game;
    const { group } = entities;

    if (timeout === null) {
      this.timeout = 1;

      gsap.to(group.position, {
        z: 2,
        duration: 0.5,
        onComplete: () => {
          this.timeout = null;
          this.currentScene = Scenes.Play;
        },
      });
    }
  }

  play() {
    this.currentScene = Scenes.Intro;
  }

  update() {
    switch (this.currentScene) {
      case Scenes.Intro:
        return this.intro();
      case Scenes.TurnAround:
        return this.turnaround();
      case Scenes.FocusIn:
        return this.focusIn();
      case Scenes.FocusOut:
        return this.focusOut();
      case Scenes.StartPlay:
        return this.start();
      case Scenes.Play:
        return this.play();

      default:
        break;
    }
  }

  handleTrigger() {
    const { game, currentScene } = this;
    const { rayCaster } = game;

    if (currentScene === Scenes.TurnAround) {
      const isTargetBody = rayCaster.intersects.some(
        ({ object }) => object.name === "targetBody"
      );

      if (isTargetBody) {
        this.currentScene = Scenes.FocusIn;
      }
    }
    if (currentScene === Scenes.FocusIn) {
      const isTargetScreen = rayCaster.intersects.some(
        ({ object }) => object.name === "baseScreen"
      );

      if (isTargetScreen) {
        this.currentScene = Scenes.StartPlay;
      } else {
        this.currentScene = Scenes.FocusOut;
      }
    }
  }

  handleMouseEnter() {
    //
  }

  handleMouseLeave() {
    //
  }
}
