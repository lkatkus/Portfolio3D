import * as THREE from "three";
import {
  OBJECT_BASE_POSITION,
  OBJECT_FOCUS_POSITION,
  OBJECT_FOCUS_POSITION_MOBILE,
  OBJECT_LINK_POSITION,
  OBJECT_LINK_POSITION_MOBILE,
} from "./constants";
import gsap from "gsap";
import type { Game } from "./Game";

enum Scenes {
  "Intro" = "Intro",
  "TurnAround" = "TurnAround",
  "FocusIn" = "FocusIn",
  "FocusOut" = "FocusOut",
  "FocusLink" = "FocusLink",
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

    const time = clock.elapsedTime;
    const wobbleAmount = 0.1;
    const wobbleSpeed = 3;

    geometry.rotation.x = wobbleAmount * Math.sin(time * wobbleSpeed);
    geometry.rotation.z = wobbleAmount * Math.cos(time * wobbleSpeed);
  }

  focusIn() {
    const { game, timeout } = this;
    const { entities } = game;
    const { group } = entities;

    if (timeout === null) {
      const focusPosition = game.isPortrait()
        ? OBJECT_FOCUS_POSITION_MOBILE
        : OBJECT_FOCUS_POSITION;

      const tweenDuration = 0.3;
      const geometry = group.children[0];
      const timeline = gsap.timeline({
        defaults: {
          duration: tweenDuration,
          onComplete: () => {
            this.timeout = 1;
          },
        },
      });

      timeline
        .to(geometry.rotation, {
          x: 0,
          y: 0,
          z: 0,
        })
        .to(
          geometry.position,
          {
            x: focusPosition.x,
            y: focusPosition.y,
            z: focusPosition.z,
          },
          "<"
        );
    }
  }

  focusLink() {
    const { game, timeout } = this;
    const { entities } = game;
    const { group } = entities;

    if (timeout === null) {
      const focusPosition = game.isPortrait()
        ? OBJECT_LINK_POSITION_MOBILE
        : OBJECT_LINK_POSITION;

      const tweenDuration = 0.3;
      const geometry = group.children[0];
      const timeline = gsap.timeline({
        defaults: {
          duration: tweenDuration,
          onComplete: () => {
            this.timeout = 1;
          },
        },
      });

      timeline
        .to(geometry.rotation, {
          x: 0,
          y: Math.PI,
          z: 0,
        })
        .to(
          geometry.position,
          {
            x: focusPosition.x,
            y: focusPosition.y,
            z: focusPosition.z,
          },
          "<"
        );
    }
  }

  focusOut() {
    const { game } = this;
    const { entities } = game;
    const { group } = entities;

    const tweenDuration = 0.3;
    const geometry = group.children[0];
    const timeline = gsap.timeline({
      defaults: {
        duration: tweenDuration,
      },
    });

    timeline
      .to(geometry.position, {
        x: OBJECT_BASE_POSITION.x,
        y: OBJECT_BASE_POSITION.y,
        z: OBJECT_BASE_POSITION.z,
      })
      .to(
        geometry.rotation,
        {
          x: 0,
          y: 0,
          z: 0,
          onComplete: () => {
            this.timeout = null;
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

          // game.camera.currentCamera = game.camera.cameras[1];
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
      case Scenes.FocusLink:
        return this.focusLink();
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
      const intersect = rayCaster.intersects[0];

      const isTargetBody = intersect.object.name === "targetBody";
      const isTargetQr = intersect.object.name === "targetQr";

      if (isTargetQr) {
        this.currentScene = Scenes.FocusLink;
      } else if (isTargetBody) {
        this.currentScene = Scenes.FocusIn;
      }
    }

    if (currentScene === Scenes.FocusIn) {
      this.timeout = null;

      const isTargetScreen = rayCaster.intersects.some(
        ({ object }) => object.name === "baseScreen"
      );

      if (isTargetScreen) {
        this.currentScene = Scenes.StartPlay;
      } else {
        this.currentScene = Scenes.FocusOut;
      }
    }

    if (currentScene === Scenes.FocusLink) {
      this.currentScene = Scenes.FocusOut;
    }
  }

  handleMouseMove() {
    const { game, currentScene } = this;

    if (currentScene === Scenes.FocusIn) {
      const { entities, camera, rayCaster } = game;
      const { group } = entities;

      const mouse = rayCaster.mouse;
      const target = new THREE.Vector3(
        mouse.x * 0.05,
        mouse.y * 0.05,
        camera.currentCamera.position.z
      );

      group.lookAt(target);
    }
  }

  handleMouseEnter() {
    //
  }

  handleMouseLeave() {
    //
  }
}
