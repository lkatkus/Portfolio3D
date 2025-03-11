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

  constructor(game: Game) {
    this.game = game;
    this.gltfLoader = new GLTFLoader();

    this.cameras = this.initCameras();
    this.helpersGroup = this.initHelpersGroup();
    this.currentCamera = this.initCurrentCamera();
    this.controls = this.initControls();

    this.tracks = [];

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
      } else {
        canvas.classList.add("controlled");
        this.controls.enabled = true;
      }
    }
  }

  private initDebugger() {
    const { game, cameras } = this;
    const { debug } = game;

    const folder = debug.gui.addFolder("Operator").close();
    const availableCameras = cameras.map((_, index) => index);

    const debugConfig = {
      currentCamera: 0,
      toggleTrackHelpers: this.toggleHelpers.bind(this),
      toggleControls: this.toggleControls.bind(this),
    };

    folder
      .add(debugConfig, "currentCamera", availableCameras)
      .name("Active Camera")
      .onChange((index: any) => {
        this.currentCamera = cameras[index];
      });

    folder.add(debugConfig, "toggleControls");
    folder.add(debugConfig, "toggleTrackHelpers");
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

  move(
    trackIndex: number,
    duration: number,
    reverse: boolean = false,
    repeat: boolean = false,
    cb?: () => void
  ) {
    const { tracks, currentCamera } = this;

    const track = tracks[trackIndex];

    if (track) {
      const camera = currentCamera.camera;
      const positionCurve = track[0].curve;
      const targetCurve = track[1].curve;
      const progress = { t: reverse ? 1 : 0 };

      gsap.to(progress, {
        t: reverse ? 0 : 1,
        repeat: repeat ? -1 : 0,
        ease: "none",
        duration,
        onUpdate: () => {
          const positionOnTrack = positionCurve.getPoint(progress.t);
          const targetOnTrack = targetCurve.getPoint(progress.t);

          camera.lookAt(targetOnTrack);
          camera.position.copy(positionOnTrack);
        },
        onComplete: () => {
          cb && cb();
        },
      });
    } else {
      // @TODO maybe throw or call cb?
    }
  }

  update() {
    const { game, controls } = this;
    const { clock } = game;

    if (controls && controls.enabled) {
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
