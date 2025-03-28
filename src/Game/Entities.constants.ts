import * as THREE from "three";

export const ENTITIES_CONFIG: [
  string,
  string,
  ((model: THREE.Group) => void)?
][] = [
  [
    "flower-girl",
    "/models/player.glb",
    (model) => {
      model.scale.setScalar(0.65);
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
];
