import * as THREE from "three";

export const INITIAL_CAMERA_INDEX = 0;
export const CAMERA_TRACKS_CONFIG: THREE.Vector3[][][] = [
  [
    [new THREE.Vector3(4, 3, 70), new THREE.Vector3(15, 3, 0)],
    [new THREE.Vector3(-10, 3, 70), new THREE.Vector3(-10, 0, 0)],
  ],
  [
    [
      new THREE.Vector3(15, 3, 0),
      new THREE.Vector3(15, 3, -30),
      new THREE.Vector3(-63, 6, -30),
      new THREE.Vector3(-63, 6, 42),
      new THREE.Vector3(-12, 9, 42),
      new THREE.Vector3(-12, 18, -5),
      new THREE.Vector3(-63, 18, -5),
      new THREE.Vector3(-63, 18, 42),
      new THREE.Vector3(15, 3, 42),
      new THREE.Vector3(15, 3, 0),
    ],
    [
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(-10, 0, -18),
      new THREE.Vector3(-44, 3, -18),
      new THREE.Vector3(-54, 3, -18),
      new THREE.Vector3(-54, 3, 22),
      new THREE.Vector3(-40, 6, 22),
      new THREE.Vector3(-18, 6, 22),
      new THREE.Vector3(-18, 6, 10),
      new THREE.Vector3(-32, 15, 4),
      new THREE.Vector3(-54, 15, 4),
      new THREE.Vector3(-54, 15, 28),
      new THREE.Vector3(-10, 0, 28),
      new THREE.Vector3(-10, 0, 0),
    ],
  ],
];
