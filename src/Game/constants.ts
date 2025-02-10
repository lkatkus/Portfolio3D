import * as THREE from "three";

export const CAMERA_POSITION = new THREE.Vector3(0, 0, 2);
export const OBJECT_BASE_POSITION = new THREE.Vector3(0, -1.5, -1);
export const OBJECT_FOCUS_POSITION = new THREE.Vector3(
  CAMERA_POSITION.x,
  CAMERA_POSITION.y - 1.25,
  CAMERA_POSITION.z - 1.25
);
