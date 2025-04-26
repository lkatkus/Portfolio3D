import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./Game";
import gsap from "gsap";

const INITIAL_FORWARD = new THREE.Vector3(-1, 0, 0);

// type Target = { x: number; z: number };

export class Entity {
  game: Game;
  name: string;
  src: string;
  group: THREE.Group;
  gltfLoader: GLTFLoader;
  mixer: THREE.AnimationMixer;
  actions: THREE.AnimationAction[];
  currentActionIndex: number | null;

  orientation: THREE.Vector3;

  targets?: THREE.Vector3[];
  nextTarget: number | null;
  nextTargetDirection?: number;

  constructor(game: Game, name: string, src: string) {
    this.game = game;
    this.name = name;
    this.src = src;
    this.group = new THREE.Group();
    this.gltfLoader = new GLTFLoader();
    this.mixer = new THREE.AnimationMixer(this.group);
    this.actions = [];
    this.currentActionIndex = null;

    this.orientation = INITIAL_FORWARD.clone();

    this.nextTarget = null;
  }

  load = (onBeforeAdd?: (model: THREE.Group) => void): Promise<Entity> => {
    const { src, gltfLoader, mixer } = this;

    return new Promise((resolve) => {
      gltfLoader.load(src, (gltf) => {
        const modelData = gltf.scene;
        const modelAnimationData = gltf.animations || [];

        modelData.name = this.name;

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
  };

  play(actionIndex: number, shouldLoop = true, duration?: number) {
    return new Promise<void>((res) => {
      const { mixer, actions, currentActionIndex } = this;

      if (actions.length === 0 || actionIndex === currentActionIndex) {
        return;
      }

      this.currentActionIndex = actionIndex;

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

      const onFinish = () => {
        mixer.removeEventListener("finished", onFinish);

        res();
      };

      mixer.addEventListener("finished", onFinish);
    });
  }

  playSequence(
    shouldLoop = false,
    ...steps: [number, { duration?: number; cb?: () => void }?][]
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

  setTargets(
    targets: THREE.Vector3[],
    startIndex: number,
    nextTargetDirection: 1 | -1
  ) {
    this.targets = targets;
    this.nextTarget = startIndex;
    this.nextTargetDirection = nextTargetDirection;
  }

  updatePosition() {
    if (
      !this.targets ||
      this.nextTarget === null ||
      !this.nextTargetDirection
    ) {
      return;
    }

    const position = this.group.position;
    const target = this.targets[this.nextTarget];

    const direction = new THREE.Vector3().subVectors(target, position);
    const distance = direction.length();

    if (distance < 0.1) {
      let nx = new THREE.Vector3();

      const updatedTarget = this.nextTarget + this.nextTargetDirection;

      if (updatedTarget > this.targets.length - 1 || updatedTarget < 0) {
        this.nextTargetDirection = -this.nextTargetDirection;

        nx = this.targets[this.nextTarget + this.nextTargetDirection];
      } else {
        this.nextTarget = updatedTarget;

        nx = this.targets[this.nextTarget];
      }

      this.orientation = new THREE.Vector3().subVectors(nx, target).normalize();

      this.updateOrientation();
    } else {
      // Normalize the direction vector and apply movement
      direction.normalize();

      const speed = 0.05; // Adjust the speed as necessary
      position.add(direction.multiplyScalar(speed)); // Move the entity toward the target
    }
  }

  updateOrientation() {
    const rotation = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(this.orientation.x, 0, this.orientation.z)
    );

    this.group.rotation.setFromQuaternion(rotation);
  }

  update() {
    const { name, mixer, game, group } = this;
    const { clock } = game;

    // @TODO fix any
    const hasActiveActions = (mixer as any)._actions.some((action: any) =>
      action.isRunning()
    );

    if (hasActiveActions) {
      mixer.update(clock.deltaTime);
    }

    if (name.includes("waterfall")) {
      const mesh = group.children[0].children[0] as THREE.Mesh;

      (mesh.material as THREE.ShaderMaterial).uniforms.time.value =
        performance.now() / 1000;
    }

    this.updatePosition();
  }

  move(newPosition: THREE.Vector3, duration: number) {
    const { group } = this;

    return new Promise<void>((res) => {
      gsap.to(group.position, {
        duration,
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        onComplete: () => {
          res();
        },
      });
    });
  }
}
