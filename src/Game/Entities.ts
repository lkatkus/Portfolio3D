import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./Game";

export class Entities {
  game: Game;
  group: THREE.Group;
  gltfLoader: GLTFLoader;
  textureLoader: THREE.TextureLoader;
  mixers: THREE.AnimationMixer[];
  actions: THREE.AnimationAction[];

  constructor(game: Game) {
    this.game = game;
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    this.group = this.initGroup();

    this.mixers = [];
    this.actions = [];

    this.initModels();
  }

  private initDebugger() {
    const { game, actions } = this;
    const { debug } = game;

    const folder = debug.gui.addFolder("Producer");
    const availableActions = actions.map((_, index) => index);

    const debugConfig = {
      currentAnimation: null,
    };

    folder
      .add(debugConfig, "currentAnimation", availableActions)
      .name("Active animation")
      .onChange((index: any) => {
        this.play(index, 2);
        debugConfig.currentAnimation = null;
      });
  }

  initGroup() {
    const { game } = this;
    const { scene } = game;

    const group = new THREE.Group();

    scene.currentScene.add(group);

    return group;
  }

  async initModels() {
    const { game, group, gltfLoader } = this;

    const loadedModels = await Promise.all([
      new Promise((resolve) => {
        gltfLoader.load("/models/IntroNoontendo.glb", (gltf) => {
          const group = gltf.scene;
          const model = group.children[0];

          model.castShadow = true;
          model.receiveShadow = true;

          const mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]);

          action.setLoop(THREE.LoopOnce, 0);
          action.clampWhenFinished = true;

          this.mixers.push(mixer);
          this.actions.push(action);

          resolve(model);
        });
      }),
      // Act 1
      new Promise((resolve) => {
        gltfLoader.load("/models/act-1/act-1-title.glb", (gltf) => {
          const group = gltf.scene;
          const model = group;

          model.position.copy(new THREE.Vector3(0, 18.5, 32));

          resolve(model);
        });
      }),
      new Promise((resolve) => {
        gltfLoader.load("/models/act-1/act-1-button-start.glb", (gltf) => {
          const group = gltf.scene;
          const model = group.children[0];

          model.position.copy(new THREE.Vector3(0, 16, 32));

          resolve(model);
        });
      }),
      new Promise((resolve) => {
        gltfLoader.load("/models/IntroIsland.glb", (gltf) => {
          const group = gltf.scene;
          const model = group.children[0];

          group.castShadow = true;
          group.receiveShadow = true;

          model.castShadow = true;
          model.receiveShadow = true;

          resolve(model);
        });
      }),
    ]);

    loadedModels.forEach((model: any) => {
      if (model) {
        group.add(model);
      }
    });

    this.initDebugger();

    game.director.setReady("producer");
  }

  update() {
    const { game, mixers } = this;
    const { clock } = game;

    mixers.forEach((mixer) => {
      // @TODO fix any
      const hasActiveActions = (mixer as any)._actions.some((action: any) =>
        action.isRunning()
      );

      if (hasActiveActions) {
        mixer.update(clock.deltaTime);
      }
    });
  }

  play(actionIndex: number, duration: number) {
    const { actions } = this;

    const action = actions[actionIndex];

    if (action) {
      action.setDuration(duration);
      action.play();
    }
  }
}
