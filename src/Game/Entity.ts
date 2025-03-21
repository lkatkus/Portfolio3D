import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Entity {
  name: string;
  src: string;
  group: THREE.Group;
  gltfLoader: GLTFLoader;
  mixer: THREE.AnimationMixer;
  actions: THREE.AnimationAction[];

  constructor(name: string, src: string) {
    this.name = name;
    this.src = src;
    this.group = new THREE.Group();
    this.gltfLoader = new GLTFLoader();
    this.mixer = new THREE.AnimationMixer(this.group);
    this.actions = [];

    // this.initDebug();
  }

  initDebug() {
    const axesHelper = new THREE.AxesHelper(2);

    this.group.add(axesHelper);
  }

  load(onBeforeAdd?: (model: THREE.Group) => void): Promise<Entity> {
    const { src, gltfLoader, mixer } = this;

    return new Promise((resolve) => {
      gltfLoader.load(src, (gltf) => {
        const modelData = gltf.scene;
        const modelAnimationData = gltf.animations || [];

        modelAnimationData.forEach((animation) => {
          this.actions.push(mixer.clipAction(animation));
        });

        if (onBeforeAdd) {
          onBeforeAdd(modelData);
        }

        this.group.add(modelData);

        resolve(this);
      });
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
    const { mixer } = this;

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
