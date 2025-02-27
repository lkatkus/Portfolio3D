import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./Game";
import {
  OBJECT_BASE_POSITION,
  PLACEHOLDER_POSITION,
  PLACEHOLDER_POSITION_MOBILE,
} from "./constants";

export class Entities {
  game: Game;
  group: THREE.Group;
  paths: THREE.CatmullRomCurve3[];
  gltfLoader: GLTFLoader;
  textureLoader: THREE.TextureLoader;

  constructor(game: Game) {
    this.game = game;
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    this.group = this.initGroup();
    this.paths = [];

    this.initModels();
  }

  initGroup() {
    const { game } = this;
    const { scene } = game;

    const group = new THREE.Group();

    scene.currentScene.add(group);

    return group;
  }

  async initModels() {
    const { game, group, gltfLoader, textureLoader } = this;

    const matcap = textureLoader.load("/textures/matcaps/toxicGreen.png");
    matcap.colorSpace = THREE.SRGBColorSpace;

    const emissiveMap = textureLoader.load("/textures/bodyScreenTextureBw.png");
    emissiveMap.flipY = false;
    emissiveMap.minFilter = THREE.NearestFilter;
    emissiveMap.magFilter = THREE.NearestFilter;

    const loadedModels = await Promise.all([
      new Promise((resolve) => {
        gltfLoader.load("/models/DerpBoy.glb", (gltf) => {
          const model = gltf.scene;

          model.children.forEach((child) => {
            if (child.name.includes("target") || child.name.includes("light")) {
              child.visible = false;
            } else {
              if (child.name === "baseScreen") {
                (child as any).material.blending = THREE.NormalBlending;
                (child as any).material.emissiveIntensity = 3.8;
                (child as any).material.emissiveMap = emissiveMap;
                (child as any).material.emissive = new THREE.Color("green");
              }

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

          resolve(model);
        });
      }),
      new Promise((resolve) => {
        gltfLoader.load("/models/ComingSoon.glb", (gltf) => {
          const group = gltf.scene;
          const model = group.children[0];

          (model as any).material = new THREE.MeshMatcapMaterial({
            matcap: matcap,
          });

          const focusPosition = game.isPortrait()
            ? PLACEHOLDER_POSITION_MOBILE
            : PLACEHOLDER_POSITION;

          model.position.copy(focusPosition);

          resolve(model);
        });
      }),
      new Promise((resolve) => {
        gltfLoader.load("/models/PathObject.glb", (gltf) => {
          const model: any = gltf.scene.getObjectByName("testPath")!;

          const positions = model.geometry.attributes.position.array;
          const curvePoints = [];

          // Extract points from the vertex positions
          for (let i = 0; i < positions.length; i += 3) {
            curvePoints.push(
              new THREE.Vector3(
                positions[i],
                positions[i + 1],
                positions[i + 2]
              )
            );
          }

          // Create a smooth path using Catmull-Rom curve
          const curve = new THREE.CatmullRomCurve3(curvePoints);

          // Optional: Visualize the path
          const curveGeometry = new THREE.TubeGeometry(
            curve,
            100,
            0.1,
            8,
            false
          );
          const curveMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true,
          });
          const curveMesh = new THREE.Mesh(curveGeometry, curveMaterial);

          this.paths.push(curve);

          resolve(curveMesh);
        });
      }),
    ]);

    loadedModels.forEach((model: any) => {
      if (model) {
        group.add(model);
      }
    });

    game.director.init();
  }

  update() {
    //
  }
}
