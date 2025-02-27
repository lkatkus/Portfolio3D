import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./Game";
import { CAMERA_POSITION, OBJECT_BASE_POSITION } from "./constants";
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
    position: new THREE.Vector3(5, 5, 5),
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

  tracks: [Track, Track][];

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

    const config: { position: string; target: string; src: string }[] = [
      {
        position: "placeholderPositionPath",
        target: "placeholderTargetPath",
        src: "/models/PathObject.glb",
      },
    ];

    const loadedTracks: [Track, Track][] = await Promise.all(
      config.map<Promise<[Track, Track]>>(
        ({ position, target, src }) =>
          new Promise((resolve) => {
            gltfLoader.load(src, (gltf) => {
              const positionModel: any = gltf.scene.getObjectByName(position)!;
              const targetModel: any = gltf.scene.getObjectByName(target)!;

              const positionTrack = new Track(positionModel);
              const targetTrack = new Track(targetModel);

              resolve([positionTrack, targetTrack]);
            });
          })
      )
    );

    this.tracks = loadedTracks;

    loadedTracks.forEach(([positionTrack, targetTrack]) => {
      helpersGroup.add(positionTrack.mesh);
      helpersGroup.add(targetTrack.mesh);
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

  move(
    trackIndex: number,
    duration: number,
    reverse: boolean = false,
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

  track(duration: number, start: THREE.Vector3, end: THREE.Vector3) {
    const { currentCamera } = this;

    const progress = { t: 0 };
    const camera = currentCamera.camera;

    gsap.to(progress, {
      t: 1,
      duration,
      onUpdate: () => {
        const currentTarget = new THREE.Vector3().lerpVectors(
          start,
          end,
          progress.t
        );

        camera.lookAt(currentTarget);
      },
    });
  }

  update() {
    const { game, cameras } = this;
    const { screen } = game;

    cameras.forEach((camera) => {
      camera.update(screen.aspectRatio);
    });
  }
}
