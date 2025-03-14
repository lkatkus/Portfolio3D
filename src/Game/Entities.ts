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

  private initDebugger() {}

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
        gltfLoader.load("/models/act-1/act-1-logo.glb", (gltf) => {
          const group = gltf.scene;
          const model = group.children[0];

          model.position.copy(new THREE.Vector3(-32.5, 16, 4));

          resolve(model);
        });
      }),
      //
      new Promise((resolve) => {
        gltfLoader.load("/models/act-1/act-1-title.glb", (gltf) => {
          const group = gltf.scene;
          const model = group.children[0];

          model.rotation.y = Math.PI / 2;
          model.position.copy(new THREE.Vector3(-5, 3.5, 70));

          resolve(model);
        });
      }),
      new Promise((resolve) => {
        gltfLoader.load("/models/act-1/act-1-button-start.glb", (gltf) => {
          const group = gltf.scene;
          const model = group.children[0];

          model.rotation.y = Math.PI / 2;
          model.position.copy(new THREE.Vector3(-5, 1, 70));

          resolve(model);
        });
      }),
      new Promise((resolve) => {
        gltfLoader.load("/models/act-1/act-1-world.glb", (gltf) => {
          const group = gltf.scene;

          resolve(group);
        });
      }),
      new Promise((resolve) => {
        gltfLoader.load("/models/act-1/act-1-train-1.glb", (gltf) => {
          const group = gltf.scene;
          const model = group.children[0];

          const mixer = new THREE.AnimationMixer(model);
          this.mixers.push(mixer);

          this.actions.push(
            mixer.clipAction(gltf.animations[0]),
            mixer.clipAction(gltf.animations[1]),
            mixer.clipAction(gltf.animations[2]),
            mixer.clipAction(gltf.animations[3])
          );

          resolve(model);
        });
      }),
      // new Promise((resolve) => {
      //   gltfLoader.load("/models/act-1/act-1-bus-1.glb", (gltf) => {
      //     const group = gltf.scene;
      //     const model = group.children[0];

      //     const mixer = new THREE.AnimationMixer(model);
      //     this.mixers.push(mixer);

      //     const action = mixer.clipAction(gltf.animations[1]);
      //     action.play();

      //     resolve(model);
      //   });
      // }),
      // new Promise((resolve) => {
      //   gltfLoader.load("/models/act-1/act-1-bus-2.glb", (gltf) => {
      //     const group = gltf.scene;
      //     const model = group.children[0];

      //     const mixer = new THREE.AnimationMixer(model);
      //     this.mixers.push(mixer);

      //     const action = mixer.clipAction(gltf.animations[1]);
      //     action.play();

      //     resolve(model);
      //   });
      // }),
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

  play(actionIndex: number, shouldLoop = true, duration?: number) {
    const { actions } = this;

    actions.forEach((action) => action.stop());

    const action = actions[actionIndex];
    if (action) {
      if (duration) {
        action.setDuration(duration);
      }

      if (!shouldLoop) {
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
      }

      action.play();
    }
  }

  playSequence(
    steps: [number, { duration?: number; cb?: () => void }?][],
    shouldLoop = false
  ) {
    const { mixers } = this;

    const mixer = mixers[0];

    let currentStepIndex = 0;
    let currentStepAction = steps[currentStepIndex];

    const playNext = (actionIndex: number) => {
      const currentStepConfig = currentStepAction[1];
      const currentStepDuration = currentStepConfig?.duration;

      if (actionIndex !== undefined) {
        this.play(actionIndex, false, currentStepDuration);
      }
    };

    const onFinish = () => {
      const currentStepConfig = currentStepAction[1];
      const currentStepCallback = currentStepConfig?.cb;

      if (currentStepCallback) {
        currentStepCallback();
      }

      currentStepIndex += 1;
      currentStepAction = steps[currentStepIndex];

      const isLastStep = currentStepIndex > steps.length - 1;

      if (currentStepAction) {
        playNext(currentStepAction[0]);
      } else if (isLastStep && shouldLoop) {
        currentStepIndex = 0;
        currentStepAction = steps[currentStepIndex];

        playNext(currentStepAction[0]);
      } else {
        mixer.removeEventListener("finished", onFinish);
      }
    };

    mixer.addEventListener("finished", onFinish);

    playNext(currentStepAction[0]);
  }
}
