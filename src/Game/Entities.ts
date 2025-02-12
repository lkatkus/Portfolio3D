import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./Game";
import { OBJECT_BASE_POSITION } from "./constants";

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
    const { game, group, gltfLoader } = this;

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

      game.director.init();
    });
  }

  update() {
    //
  }
}
