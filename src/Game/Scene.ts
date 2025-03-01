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

    this.currentScene.background = new THREE.Color("#87cefa"); // Sky blue

    // this.createBackground();
  }

  createBackground() {
    const { game } = this;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_topColor: { value: new THREE.Color(GRADIENT_TOP_COLOR) },
        u_bottomColor: { value: new THREE.Color(GRADIENT_BOTTOM_COLOR) },
        u_gridColor: { value: new THREE.Color(GRADIENT_BOTTOM_COLOR) },
        u_gridSize: { value: 13.0 },
        u_lineWidth: { value: 0.0075 },
        u_aspect: { value: game.screen.aspectRatio },
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
            uniform vec3 u_gridColor;
            uniform float u_gridSize;
            uniform float u_lineWidth;
            uniform float u_aspect;

            varying vec2 vUV;

            void main() {
                // Gradient background
                float t = vUV.y;
                vec3 color = mix(u_bottomColor, u_topColor, t);

                // Adjust UV for aspect ratio and center the grid
                vec2 gridUV = vUV;
                gridUV.x *= u_aspect; // Keep square aspect
                gridUV -= 0.5; // Center grid both horizontally and vertically

                // Grid calculations
                float gridX = abs(mod(gridUV.x * u_gridSize + 0.5, 1.0) - 0.5);
                float gridY = abs(mod(gridUV.y * u_gridSize + 0.5, 1.0) - 0.5);
                float lineX = step(gridX, u_lineWidth);
                float lineY = step(gridY, u_lineWidth);
                float grid = max(lineX, lineY);

                // Blend grid over background
                color = mix(color, u_gridColor, grid);

                gl_FragColor = vec4(color, 1.0);
            }
        `,
      depthWrite: false,
    });

    const backgroundPlane = new THREE.Mesh(geometry, material);
    backgroundPlane.frustumCulled = false;

    this.currentScene.add(backgroundPlane);

    window.addEventListener("resize", () => {
      material.uniforms.u_aspect.value = window.innerWidth / window.innerHeight;
    });
  }
}
