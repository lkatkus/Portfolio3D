import * as THREE from "three";

const getWaterfallMaterial = (
  scaleX: number,
  scaleY: number,
  withBase = false
) => {
  const floatScaleX = scaleX.toFixed(1);
  const floatScaleY = scaleY.toFixed(1);

  const waterfallMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      time: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normalize(normal);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      uniform float time;

      varying vec2 vUv;
      varying vec3 vNormal;

      // Pseudo-random hash function
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      // Color palette with three colors
      vec3 palette(float t) {
        if (t < 0.5) {
          return vec3(0.2, 0.6, 0.9);  // mid blue (base)
        } else if (t < 0.8) {
          return vec3(0.6, 0.8, 0.95);  // light blue
        } else {
          return vec3(0.9, 0.95, 1.0);  // softer white shimmer (not fully white)
        }
      }

      void main() {
        vec2 uv = vUv;

        float t = floor(time * 10.0) / 10.0;

        // Per-column offset
        float offset = hash(vec2(floor(vUv.x * ${floatScaleX}), 0.0)) * 0.12;

        // Vertical scroll
        float scroll = mod(uv.y * ${floatScaleY} + offset + t * 0.5, 1.0);

        // Base color
        vec3 baseColor = palette(scroll);

        // Foam logic (pixelated and animated)
        vec2 pixelatedUV = floor(vUv * ${floatScaleX}) / ${floatScaleX};

        // Foam regions (top and bottom)
        float foamTop1 = step(0.90, pixelatedUV.y);
        float foamBottom1 = step(pixelatedUV.y, 0.1);

        float foamTop2 = step(0.85, pixelatedUV.y);
        float foamBottom2 = step(pixelatedUV.y, 0.15);
        float foamNoise2 = step(0.25, hash(floor(pixelatedUV * 40.0 + t * 3.0)));

        float foamTop3 = step(0.8, pixelatedUV.y);
        float foamBottom3 = step(pixelatedUV.y, 0.2);
        float foamNoise3 = step(0.5, hash(floor(pixelatedUV * 40.0 + t * 3.0)));

        float foamTop4 = step(0.7, pixelatedUV.y);
        float foamBottom4 = step(pixelatedUV.y, 0.3);
        float foamNoise4 = step(0.8, hash(floor(pixelatedUV * 40.0 + t * 3.0)));

        float foamMaskTop = foamTop1 + foamTop2 * foamNoise2 + foamTop3 * foamNoise3 + foamTop4 * foamNoise4;
        float foamMaskBottom = foamBottom1 + foamBottom2 * foamNoise2 + foamBottom3 * foamNoise3;

        float foamMask = foamMaskTop + foamMaskBottom;

        // Foam color (white)
        vec3 foamColor = vec3(1.0);

        // Final mix
        vec3 finalColor = mix(baseColor, foamColor, foamMask);
        
        ${
          withBase
            ? `
            gl_FragColor = vec4(finalColor, 1.0);
            `
            : `
            if (vNormal.y > 0.5) {
              gl_FragColor = vec4(finalColor, 1.0);
            } else {
              gl_FragColor = vec4(finalColor, 1.0 - foamMaskBottom);
            }
          `
        }
      }
    `,
  });

  return waterfallMaterial;
};

const getWaterfallBaseMaterial = (scaleX: number) => {
  const floatScaleX = scaleX.toFixed(1);

  const waterfallMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      time: { value: 0.0 },
    },
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

      // Pseudo-random hash function
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      // Color palette with three colors
      vec3 palette(float t) {
        if (t < 0.4) {
          return vec3(0.2, 0.6, 0.9);  // mid blue (base)
        } else if (t < 0.7) {
          return vec3(0.6, 0.9, 1.0);  // light blue
        } else {
          return vec3(0.9, 1.0, 1.0);  // white shimmer
        }
      }

      void main() {
        float t = floor(time * 10.0) / 10.0;

        // Base color
        vec3 baseColor = palette(0.2);

        // Foam logic (pixelated and animated)
        vec2 pixelatedUV = floor(vUv * ${floatScaleX}) / ${floatScaleX};

        // Foam regions (top and bottom)
        float foamTop1 = step(0.85, pixelatedUV.y);
        float foamXMask1= step(1.0 / 6.0 * 1.0, vUv.x) * step(vUv.x, 1.0 / 6.0 * 5.0);
        foamTop1 *= foamXMask1;
        
        float foamTop2 = step(0.8, pixelatedUV.y);
        float foamNoise2 = step(0.4, hash(floor(pixelatedUV * 40.0 + t * 3.0)));
        float foamXMask2= step(1.0 / 6.0 * 0.75, vUv.x) * step(vUv.x, 1.0 / 6.0 * 5.75);
        foamTop2 *= foamXMask2;
        
        float foamTop3 = step(0.6, pixelatedUV.y);
        float foamNoise3 = step(0.8, hash(floor(pixelatedUV * 40.0 + t * 3.0)));

        // Add animated pixel noise to foam
        float foamMask = foamTop1 + foamTop2 * foamNoise2 + foamTop3 * foamNoise3;

        // Mask the foam effect to only affect between uv.x 0.25 and uv.x 0.75

        // Combine foam mask with X-axis range condition
        // foamMask *= foamXMask;

        // Foam color (white)
        vec3 foamColor = vec3(1.0);

        // Final mix
        vec3 finalColor = mix(baseColor, foamColor, foamMask * 0.5);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });

  return waterfallMaterial;
};

export const ENTITIES_CONFIG: [
  string,
  string,
  ((model: THREE.Group) => void)?
][] = [
  [
    "flower-girl",
    "/models/msja-flowerGirl-0406.glb",
    (model) => {
      model.scale.setScalar(1.1);
    },
  ],
  [
    "gameTitle",
    "/models/act-1/act-1-title.glb",
    (model) => {
      model.position.copy(new THREE.Vector3(-5, 3.6, 70));
    },
  ],
  [
    "gameStartButton",
    "/models/act-1/act-1-button-start.glb",
    (model) => {
      model.position.copy(new THREE.Vector3(-5, 1.25, 70));
    },
  ],
  [
    "gameStartButton",
    "/models/act-1/act-1-button-demo.glb",
    (model) => {
      model.position.copy(new THREE.Vector3(-5, 0.75, 70));
    },
  ],
  ["train", "/models/act-1/act-1-train-1.glb"],
  ["world", "/models/act-1/act-1-world.glb"],
  [
    "jsLogo",
    "/models/act-1/act-1-logo.glb",
    (model) => {
      model.position.copy(new THREE.Vector3(-32.5, 16, 4));
    },
  ],
  [
    "waterfall-1",
    "/models/act-1/world-waterfall-1.glb",
    (model) => {
      (model.children[0] as THREE.Mesh).material = getWaterfallMaterial(
        24,
        1,
        true
      );
    },
  ],
  [
    "waterfall-1-base",
    "/models/act-1/world-waterfall-1-base.glb",
    (model) => {
      (model.children[0] as THREE.Mesh).material = getWaterfallBaseMaterial(24);
    },
  ],
  [
    "waterfall-2",
    "/models/act-1/world-waterfall-2.glb",
    (model) => {
      (model.children[0] as THREE.Mesh).material = getWaterfallMaterial(32, 2);
    },
  ],
  [
    "waterfall-3",
    "/models/act-1/world-waterfall-3.glb",
    (model) => {
      (model.children[0] as THREE.Mesh).material = getWaterfallMaterial(32, 2);
    },
  ],
];
