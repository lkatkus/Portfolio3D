import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MapControls } from "three/addons/controls/MapControls.js";
import type { Game } from "./Game";
import { CAMERA_POSITION, OBJECT_BASE_POSITION } from "./constants";
import { Camera } from "./Camera";
import { Track } from "./Track";
import gsap from "gsap";
import {
  INITIAL_CAMERA_INDEX,
  CAMERA_TRACKS_CONFIG,
} from "./Operator.constants";
import { Entity } from "./Entity";

const getCamerasConfig = (
  aspectRatio: number
): {
  fov: number;
  aspectRatio: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
}[] => [
  {
    fov: 35,
    aspectRatio,
    position: CAMERA_POSITION,
    target: OBJECT_BASE_POSITION,
  },
  {
    fov: 75,
    aspectRatio,
    position: new THREE.Vector3(20, 20, -20),
    target: OBJECT_BASE_POSITION,
  },
];

export class Operator {
  game: Game;
  gltfLoader: GLTFLoader;
  controls: MapControls;

  helpersGroup: THREE.Group;

  cameras: Camera[];
  currentCamera: Camera;

  tracks: [Track, Track][];

  isTransitioning: boolean;

  target?: Entity;
  prevTarget?: Entity;
  targetOffset: THREE.Vector3;
  targetOffsetTarget: THREE.Vector3;
  targetOffsetDirection: "sw" | "nw" | "ne" | "se";

  constructor(game: Game) {
    this.game = game;
    this.gltfLoader = new GLTFLoader();

    this.isTransitioning = false;

    this.cameras = this.initCameras();
    this.helpersGroup = this.initHelpersGroup();
    this.currentCamera = this.initCurrentCamera();
    this.controls = this.initControls();

    this.tracks = [];

    this.targetOffsetDirection = "se";
    this.targetOffset = new THREE.Vector3(0, 0, 0);
    this.targetOffsetTarget = new THREE.Vector3(10, 10, 10);

    this.initTracks();
    this.initDebugger();
  }

  private initHelpersGroup() {
    const { game } = this;
    const { scene } = game;

    const group = new THREE.Group();
    group.visible = false;

    scene.currentScene.add(group);

    return group;
  }

  private initCameras() {
    const { game } = this;
    const { aspectRatio } = game.screen;

    const config = getCamerasConfig(aspectRatio);
    const cameras = config.map(
      ({ fov, aspectRatio, position, target }) =>
        new Camera(fov, aspectRatio, position, target)
    );

    return cameras;
  }

  private initCurrentCamera() {
    const { cameras } = this;

    return cameras[INITIAL_CAMERA_INDEX];
  }

  private async initTracks() {
    const { game, helpersGroup } = this;

    const loadedTracks: [Track, Track][] = CAMERA_TRACKS_CONFIG.map((track) => {
      const positionTrackPoints = track[0];
      const targetTrackPoints = track[1];

      const positionTrack = new Track(positionTrackPoints);
      const targetTrack = new Track(targetTrackPoints);

      return [positionTrack, targetTrack];
    });

    this.tracks = loadedTracks;

    loadedTracks.forEach(([positionTrack, targetTrack]) => {
      helpersGroup.add(positionTrack.mesh);
      helpersGroup.add(targetTrack.mesh);
    });

    game.director.setReady("operator");
  }

  initControls() {
    const { currentCamera } = this;

    const canvas: any = document.querySelector("#webglCanvas")!;
    const controls = new MapControls(currentCamera.camera, canvas);

    controls.enabled = false;

    return controls;
  }

  toggleHelpers() {
    if (!this.helpersGroup.visible) {
      this.helpersGroup.visible = true;
    } else {
      this.helpersGroup.visible = false;
    }
  }

  toggleControls() {
    if (this.controls) {
      const canvas: any = document.querySelector("#webglCanvas")!;

      if (this.controls.enabled) {
        canvas.classList.remove("controlled");
        this.controls.enabled = false;

        if (this.prevTarget) {
          this.target = this.prevTarget;
          this.prevTarget = undefined;
        }
      } else {
        canvas.classList.add("controlled");
        this.controls.enabled = true;

        if (this.target) {
          this.prevTarget = this.target;
          this.target = undefined;
        }
      }
    }
  }

  toggleTargetOffset() {
    if (this.target) {
      this.updateTargetOffset(1);
    }
  }

  private initDebugger() {
    const { game, cameras } = this;
    const { debug } = game;

    const folder = debug.gui.addFolder("Operator").close();
    const availableCameras = cameras.map((_, index) => index);

    const debugConfig = {
      currentCamera: 0,
      toggleControls: this.toggleControls.bind(this),
      toggleTrackHelpers: this.toggleHelpers.bind(this),
      toggleTargetOffset: this.toggleTargetOffset.bind(this),
    };

    folder
      .add(debugConfig, "currentCamera", availableCameras)
      .name("Active Camera")
      .onChange((index: any) => {
        this.currentCamera = cameras[index];
      });

    folder.add(debugConfig, "toggleControls");
    folder.add(debugConfig, "toggleTrackHelpers");
    folder.add(debugConfig, "toggleTargetOffset");
  }

  initTrack(trackIndex: number) {
    const { tracks, currentCamera } = this;

    const track = tracks[trackIndex];

    if (track) {
      const camera = currentCamera.camera;
      const positionCurve = track[0].curve;
      const targetCurve = track[1].curve;
      const positionOnTrack = positionCurve.getPoint(0);
      const targetOnTrack = targetCurve.getPoint(0);

      camera.position.copy(positionOnTrack);
      camera.lookAt(targetOnTrack);
    }
  }

  move(trackIndex: number, duration: number, repeat = false, cb?: () => void) {
    return new Promise<void>((res) => {
      const { tracks, currentCamera } = this;

      const track = tracks[trackIndex];

      if (track) {
        const camera = currentCamera.camera;
        const positionCurve = track[0].curve;
        const targetCurve = track[1].curve;
        const progress = { t: 0 };

        gsap.to(progress, {
          t: 1,
          repeat: repeat ? -1 : 0,
          ease: "none",
          duration,
          onUpdate: () => {
            const t = Math.min(progress.t, 1);

            const positionOnTrack = positionCurve.getPoint(t);
            const targetOnTrack = targetCurve.getPoint(t);

            camera.lookAt(targetOnTrack);
            camera.position.copy(positionOnTrack);
          },
          onComplete: () => {
            const lastPositionPoint =
              positionCurve.points[positionCurve.points.length - 1];
            const lastTargetPoint =
              targetCurve.points[targetCurve.points.length - 1];

            camera.lookAt(lastTargetPoint);
            camera.position.copy(lastPositionPoint);

            cb && cb();

            res();
          },
        });
      } else {
        // @TODO maybe throw or call cb?
      }
    });
  }

  setTarget(entity: Entity) {
    this.isTransitioning = true;
    this.targetOffset = this.currentCamera.camera.position.clone();

    this.target = entity;
  }

  updateTargetOffset(direction: -1 | 1) {
    const rotation = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      (Math.PI / 2) * direction
    );

    this.isTransitioning = true;
    this.targetOffsetTarget = this.targetOffset
      .clone()
      .applyQuaternion(rotation);

    // Normalize the target offset vector
    const normalizedOffset = this.targetOffsetTarget.clone().normalize();

    // Determine the direction based on normalized vector
    if (normalizedOffset.x > 0 && normalizedOffset.z > 0) {
      this.targetOffsetDirection = "se";
    } else if (normalizedOffset.x < 0 && normalizedOffset.z > 0) {
      this.targetOffsetDirection = "sw";
    } else if (normalizedOffset.x > 0 && normalizedOffset.z < 0) {
      this.targetOffsetDirection = "ne";
    } else {
      this.targetOffsetDirection = "nw";
    }
  }

  smoothUpdate() {
    if (this.isTransitioning) {
      this.targetOffset.lerp(this.targetOffsetTarget, 0.075); // Adjust speed multiplier

      if (this.targetOffset.distanceTo(this.targetOffsetTarget) < 0.01) {
        this.targetOffset.copy(this.targetOffsetTarget);
        this.isTransitioning = false;
      }
    }
  }

  trackTarget() {
    const { target, targetOffset, currentCamera } = this;
    const { camera } = currentCamera;

    if (target) {
      this.smoothUpdate();

      const entityPosition = target.group.position;
      const targetWorldPosition = entityPosition.clone().add(targetOffset);

      camera.position.copy(targetWorldPosition);
      camera.lookAt(entityPosition);
    }
  }

  update() {
    const { game, controls, target } = this;
    const { clock } = game;

    if (target) {
      this.trackTarget();
    } else if (controls && controls.enabled) {
      controls.update(clock.deltaTime);
    }
  }

  updateCameras() {
    const { game, cameras } = this;
    const { screen } = game;

    cameras.forEach((camera) => {
      camera.update(screen.aspectRatio);
    });
  }
}
