import * as THREE from "three";
import type { Game } from "./Game";

const GRADIENT_TOP_COLOR = "#ededed";
const GRADIENT_BOTTOM_COLOR = "#d1d1d1";

export class Scene {
  game: Game;
  currentScene: THREE.Scene;

  constructor(game: Game) {
    const scene = new THREE.Scene();

    this.game = game;
    this.currentScene = scene;

    this.createBackground();
    this.createGridLines();
  }

  createBackground() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_topColor: { value: new THREE.Color(GRADIENT_TOP_COLOR) },
        u_bottomColor: { value: new THREE.Color(GRADIENT_BOTTOM_COLOR) },
      },
      vertexShader: `
            varying vec2 vUV;

            void main() {
                vUV = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
      fragmentShader: `
            uniform vec3 u_topColor;
            uniform vec3 u_bottomColor;

            varying vec2 vUV;

            void main() {
                float t = vUV.y;
                vec3 color = mix(u_bottomColor, u_topColor, t);
                gl_FragColor = vec4(color, 1.0);
            }
        `,
      depthWrite: false,
    });

    const backgroundPlane = new THREE.Mesh(geometry, material);
    this.currentScene.add(backgroundPlane);
  }

  createGridLines() {
    const rows = 50;
    const cols = 50;
    const spacing = 0.5;
    const positions = [];

    for (let y = -rows / 2; y <= rows / 2; y++) {
      for (let x = -cols / 2; x < cols / 2; x++) {
        positions.push(x * spacing, y * spacing, -5);
        positions.push((x + 1) * spacing, y * spacing, -5);
      }
    }

    for (let x = -cols / 2; x <= cols / 2; x++) {
      for (let y = -rows / 2; y < rows / 2; y++) {
        positions.push(x * spacing, y * spacing, -5);
        positions.push(x * spacing, (y + 1) * spacing, -5);
      }
    }

    const material = new THREE.LineBasicMaterial({
      color: GRADIENT_BOTTOM_COLOR,
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    this.currentScene.add(new THREE.LineSegments(geometry, material));
  }
}
