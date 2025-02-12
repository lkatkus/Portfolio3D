import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./Game";
import { OBJECT_BASE_POSITION, OBJECT_FOCUS_POSITION } from "./constants";

export class Entities {
  game: Game;
  group: THREE.Group;
  gltfLoader: GLTFLoader;
  textureLoader: THREE.TextureLoader;

  constructor(game: Game) {
    this.game = game;
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    this.group = this.initGroup();

    this.initModels();
  }

  initGroup() {
    const { game } = this;
    const { scene } = game;

    const group = new THREE.Group();

    scene.currentScene.add(group);

    return group;
  }

  initModels() {
    const { group, textureLoader, gltfLoader } = this;

    const bodyMatcap = textureLoader.load("/textures/body.png");
    bodyMatcap.colorSpace = THREE.SRGBColorSpace;

    gltfLoader.load("/models/DerpBoy.glb", (gltf) => {
      const model = gltf.scene;

      model.children.forEach((child) => {
        if (child.name === "targetBody") {
          child.visible = false;
        } else {
          if ((child as any).isGroup) {
            child.children.map((c) => {
              c.castShadow = true;
              c.receiveShadow = true;
            });
          }

          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      model.position.copy(OBJECT_BASE_POSITION);

      group.add(model);
    });
  }

  update() {
    const { game, group } = this;
    const { clock } = game;

    const geometry = group.children[0];

    if (!geometry) {
      return;
    }

    const tweenDuration = 0.3;

    if (game.testing) {
      if (!game.testingCompleted && !game.testingProgress) {
        game.testingProgress = true;
        game.testingPrevRotation = geometry.rotation.clone();

        const timeline = gsap.timeline();

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
              onComplete: () => {
                game.testingCompleted = true;
                game.testingProgress = false;
              },
            },
            "<"
          );
      }
    } else {
      if (game.testingProgress) {
        if (game.testingCompleted && game.testingPrevRotation) {
          game.testingProgress = true;
          game.testingCompleted = false;

          const timeline = gsap.timeline();

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
                x: game.testingPrevRotation.x,
                y: game.testingPrevRotation.y,
                z: game.testingPrevRotation.z,
                duration: tweenDuration,
                onComplete: () => {
                  game.testingProgress = false;
                  game.testingPrevRotation = null;
                },
              },
              "<"
            );
        }
      } else {
        const rotationDiff = (Math.PI / 2) * clock.deltaTime;

        geometry.rotation.y += rotationDiff * game.testingMultiplier;
        geometry.rotation.y = geometry.rotation.y % (Math.PI * 2);

        // geometry.position.y = Math.sin(clock.elapsedTime * 2) * 0.25;
        // geometry.rotation.x = Math.sin(clock.elapsedTime * 2) * 0.25;
      }
    }
  }
}
