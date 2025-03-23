import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { Game } from "./Game";
import LAYOUT from "./config/level-1-layout.json";

export class Scenographer {
  game: Game;
  group: THREE.Group;
  gltfLoader: GLTFLoader;

  constructor(game: Game) {
    this.game = game;
    this.gltfLoader = new GLTFLoader();
    this.group = this.initGroup();

    this.initModels();
    // this.initHelpers();
  }

  initGroup() {
    const { game } = this;
    const { scene } = game;

    const group = new THREE.Group();

    scene.currentScene.add(group);

    return group;
  }

  initHelpers() {
    const { game } = this;
    const { scene } = game;

    const axesHelper = new THREE.AxesHelper(5);
    scene.currentScene.add(axesHelper);
  }

  async initModels() {
    const { game, group, gltfLoader } = this;

    const loadedModels = await Promise.all([
      new Promise((resolve) => {
        gltfLoader.load("/models/act-1/act-1-world-stairs.glb", (gltf) => {
          const modelData = gltf.scene;

          modelData.visible = false;

          resolve(modelData);
        });
      }),
      new Promise((resolve) => {
        gltfLoader.load("/models/act-0-cube.glb", (gltf) => {
          const group = gltf.scene;
          const model = group.children[0] as any;

          const count = LAYOUT.length;
          const geometry = model.geometry;
          const material = model.material;

          const instancedMesh = new THREE.InstancedMesh(
            geometry,
            material,
            count
          );

          const placeholder = new THREE.Object3D();
          const uvOffsets = new Float32Array(count);

          const textureRows = 448 / 16;
          const tileHeight = 1.0 / textureRows;

          LAYOUT.forEach((position, i) => {
            placeholder.position.set(position[0], position[1], position[2]);
            placeholder.rotation.y = position[3];
            placeholder.updateMatrix();
            instancedMesh.setMatrixAt(i, placeholder.matrix);

            const textureOffset = (position[4] % textureRows) * tileHeight;
            uvOffsets[i] = textureOffset;
          });

          instancedMesh.instanceMatrix.needsUpdate = true;

          geometry.setAttribute(
            "instanceUVOffset",
            new THREE.InstancedBufferAttribute(uvOffsets, 1)
          );

          material.onBeforeCompile = (shader: any) => {
            shader.vertexShader = shader.vertexShader.replace(
              `void main() {`,
              `
                attribute float instanceUVOffset;

                varying vec2 vUv;
                varying float vUVOffset;
                
                void main() {
              `
            );

            shader.vertexShader = shader.vertexShader.replace(
              `#include <uv_vertex>`,
              `
                #include <uv_vertex>
                vUv = uv;
                vUVOffset = instanceUVOffset;
              `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
              `void main() {`,
              `
                varying vec2 vUv;
                varying float vUVOffset;

                void main() {
              `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
              `#include <map_fragment>`,
              `
                vec2 offsetUvs = vMapUv;
                offsetUvs.y += vUVOffset;

                vec4 sampledDiffuseColor = texture2D(map, offsetUvs);
                
                diffuseColor *= sampledDiffuseColor;
              `
            );
          };

          resolve(instancedMesh);
        });
      }),
    ]);

    loadedModels.forEach((model: any) => {
      if (model) {
        group.add(model);
      }
    });

    game.director.setReady("scenographer");
  }
}
