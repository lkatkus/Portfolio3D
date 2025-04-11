import * as THREE from "three";
import type { Game } from "./Game";

export class Scene {
  game: Game;
  currentScene: THREE.Scene;
  // waterfall: THREE.Mesh;

  constructor(game: Game) {
    const scene = new THREE.Scene();

    this.game = game;
    this.currentScene = scene;

    this.currentScene.background = new THREE.Color("#87cefa"); // Sky blue

    this.createBackground();
    // this.waterfall = this.createWaterFall();
  }

  createWaterFall() {
    const geometry = new THREE.PlaneGeometry(2, 4, 32, 64); // More segments = smoother distortion
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;

        uniform float time;
        varying vec2 vUv;

        //
        // Hash function for pseudo-random noise
        //

        //
        // Stylized banded palette
        //
        vec3 palette(float t) {
          if (t < 0.2) return vec3(0.1, 0.1, 0.6);      // dark blue
          if (t < 0.4) return vec3(0.2, 0.4, 0.8);      // mid blue
          if (t < 0.6) return vec3(0.4, 0.8, 1.0);      // light blue
          if (t < 0.8) return vec3(0.6, 1.0, 1.0);      // aqua
          return vec3(0.9, 1.0, 1.0);                   // white shimmer
        }

        float hash(vec2 p) {
          return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec2 res = vec2(2.0, 4.0); // pixel resolution (width x height)
          
          // Quantize to pixelated UVs
          vec2 pixelatedUV = floor(vUv * res) / res;

          // Step time for frame-by-frame look
          float frameTime = floor(time * 12.0) / 12.0;

          // Per-column offset (adds variety to scroll speed)
        float offset = hash(vec2(floor(vUv.x * res.x), 0.0)) * 0.2;

          // Horizontal ripple (sin wave)
          float wobble = sin((pixelatedUV.y + frameTime) * 20.0) * 0.05;
          pixelatedUV.x += wobble;

          // Scroll the UVs vertically with offset
          float scroll = mod(pixelatedUV.y + offset + frameTime * 0.5, 1.0);

          // Color based on vertical scroll (banded)
          vec3 color = palette(scroll);

          // // Occasional sparkle highlights
          // float sparkle = step(0.996, hash(floor(pixelatedUV * res + frameTime * 5.0)));
          // color += sparkle * vec3(1.0);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        time: { value: 0.0 },
        // add other uniforms like colors, textures, etc.
      },
      transparent: true,
      side: THREE.DoubleSide,
    });

    const backgroundPlane = new THREE.Mesh(geometry, material);

    backgroundPlane.position.set(-5, 3.5, 70);
    backgroundPlane.rotation.y = 3.14 / 2;

    this.currentScene.add(backgroundPlane);

    return backgroundPlane;
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

  update() {
    // const { waterfall } = this;
    // (waterfall.material as THREE.ShaderMaterial).uniforms.time.value =
    //   performance.now() / 1000;
  }
}
