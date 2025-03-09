import * as THREE from "three";
import type { Game } from "./Game";

export class Scene {
  game: Game;
  currentScene: THREE.Scene;

  constructor(game: Game) {
    const scene = new THREE.Scene();

    this.game = game;
    this.currentScene = scene;

    this.currentScene.background = new THREE.Color("#87cefa"); // Sky blue

    this.createBackground();
  }

  createBackground() {
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: `
            varying vec2 vUv;

            void main() {
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectionPosition = projectionMatrix * viewPosition;

                gl_Position = projectionPosition;
                vUv = uv;
            }
        `,
      fragmentShader: `
            varying vec2 vUv;

            void main() {
              float gridSize = 100.0;

              float barsX = step(0.99, mod(vUv.x * gridSize, 1.0));
              float barsY = step(0.99, mod(vUv.y * gridSize, 1.0));
              
              float barsAlpha = 1.0 - distance(vUv, vec2(0.5)) * 1.75;
              float barsColor = barsX + barsY;

              gl_FragColor = vec4(vec3(barsColor), barsColor * barsAlpha);
            }
        `,
    });

    const backgroundPlane = new THREE.Mesh(geometry, material);

    backgroundPlane.position.y = -20;
    backgroundPlane.position.x = -30;
    backgroundPlane.position.z = -5;
    backgroundPlane.rotation.x = -Math.PI / 2;

    this.currentScene.add(backgroundPlane);
  }
}
