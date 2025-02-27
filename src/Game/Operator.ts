import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./Game";
import {
  CAMERA_GAME_POSITION,
  CAMERA_POSITION,
  OBJECT_BASE_POSITION,
  PLACEHOLDER_POSITION,
} from "./constants";
import { Camera } from "./Camera";
import { Track } from "./Track";
import gsap from "gsap";

const getCamerasConfig = (
  aspectRatio: number
): {
  fov: number;
  aspectRatio: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
}[] => [
  {
    fov: 50,
    aspectRatio,
    position: CAMERA_POSITION,
    target: OBJECT_BASE_POSITION,
  },
  {
    fov: 75,
    aspectRatio,
    position: CAMERA_GAME_POSITION,
    target: PLACEHOLDER_POSITION,
  },
  {
    fov: 75,
    aspectRatio,
    position: new THREE.Vector3(10, 10, 10),
    target: OBJECT_BASE_POSITION,
  },
];

export class Operator {
  game: Game;
  gltfLoader: GLTFLoader;

  showHelpersGroup: boolean;
  helpersGroup: THREE.Group;

  cameras: Camera[];
  currentCamera: Camera;

  tracks: Track[];

  constructor(game: Game) {
    this.game = game;
    this.gltfLoader = new GLTFLoader();

    this.showHelpersGroup = false;
    this.helpersGroup = this.initGroup();

    this.cameras = this.initCameras();
    this.currentCamera = this.initCurrentCamera();

    this.tracks = [];

    this.initTracks();
    this.initDebugger();
  }

  private initGroup() {
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

    return cameras[0];
  }

  private async initTracks() {
    const { game, helpersGroup, gltfLoader } = this;

    const config: { name: string; src: string }[] = [
      { name: "testPath", src: "/models/PathObject.glb" },
    ];

    const loadedTracks: Track[] = await Promise.all<Track>(
      config.map(
        ({ name, src }) =>
          new Promise((resolve) => {
            gltfLoader.load(src, (gltf) => {
              const model: any = gltf.scene.getObjectByName(name)!;
              const track = new Track(model);

              resolve(track);
            });
          })
      )
    );

    this.tracks = loadedTracks;

    loadedTracks.forEach((track) => {
      if (track.mesh) {
        helpersGroup.add(track.mesh);
      }
    });

    game.director.setReady("operator");
  }

  toggleHelpers() {
    if (!this.showHelpersGroup) {
      this.showHelpersGroup = true;
      this.helpersGroup.visible = true;
    } else {
      this.showHelpersGroup = false;
      this.helpersGroup.visible = false;
    }
  }

  private initDebugger() {
    const { game, cameras } = this;
    const { debug } = game;

    const folder = debug.gui.addFolder("Operator");
    const availableCameras = cameras.map((_, index) => index);

    const debugConfig = {
      currentCamera: 0,
      toggleTrackHelpers: this.toggleHelpers.bind(this),
    };

    folder
      .add(debugConfig, "currentCamera", availableCameras)
      .name("Active Camera")
      .onChange((index: any) => {
        this.currentCamera = cameras[index];
      });

    folder.add(debugConfig, "toggleTrackHelpers");
  }

  move(trackIndex: number, duration: number, cb: () => void) {
    const { tracks, currentCamera } = this;

    const track = tracks[trackIndex];

    if (track) {
      const progress = { t: 0 };
      const trackCurve = track.curve;
      const camera = currentCamera.camera;

      gsap.to(progress, {
        t: 1,
        duration,
        // repeat: -1,
        onUpdate: () => {
          const positionOnTrack = trackCurve.getPoint(progress.t);
          const directionOnTrack = trackCurve
            .getTangent(progress.t)
            .normalize();

          camera.position.copy(positionOnTrack);
          camera.lookAt(directionOnTrack);
        },
        onComplete: () => {
          cb();
        },
      });
    } else {
      // @TODO maybe throw or call cb?
    }
  }

  update() {
    const { game, cameras } = this;
    const { screen } = game;

    cameras.forEach((camera) => {
      camera.update(screen.aspectRatio);
    });
  }
}
