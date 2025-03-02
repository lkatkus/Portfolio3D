import * as THREE from "three";

export const INITIAL_CAMERA_INDEX = 0;
export const CAMERA_TRACKS_CONFIG: THREE.Vector3[][][] = [
  [
    [new THREE.Vector3(0, 75, 55), new THREE.Vector3(3, 14, 25)],
    [new THREE.Vector3(0, 75, 45), new THREE.Vector3(0, 5, 0)],
  ],
  [
    [
      new THREE.Vector3(3, 14, 25),
      new THREE.Vector3(3, 14, -35),
      new THREE.Vector3(-70, 23, -35),
      new THREE.Vector3(-70, 28, 24),
      new THREE.Vector3(-13, 45, 10),
      new THREE.Vector3(-13, 45, -16),
      new THREE.Vector3(-40, 45, -16),
      new THREE.Vector3(-40, 45, 10),
      new THREE.Vector3(3, 14, 25),
    ],
    [
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(-10, 10, -20),
      new THREE.Vector3(-58, 16, -17),
      new THREE.Vector3(-58, 16, -3),
      new THREE.Vector3(-39, 25, 7),
      new THREE.Vector3(-25, 38, -3),
      new THREE.Vector3(-28, 38, -3),
      new THREE.Vector3(0, 5, 0),
    ],
  ],
];
