import * as THREE from "three";

export const CAMERA_POSITION = new THREE.Vector3(0, -1, 2);
export const CAMERA_GAME_POSITION = new THREE.Vector3(0, 3, 2);

export const PLACEHOLDER_POSITION = new THREE.Vector3(0, 3, 0);
export const PLACEHOLDER_POSITION_MOBILE = new THREE.Vector3(0, 3, -1);

export const OBJECT_BASE_POSITION = new THREE.Vector3(0, -1, -1);

export const OBJECT_FOCUS_POSITION = new THREE.Vector3(
  CAMERA_POSITION.x,
  CAMERA_POSITION.y - 0.45,
  CAMERA_POSITION.z - 1.5
);
export const OBJECT_FOCUS_POSITION_MOBILE = new THREE.Vector3(
  CAMERA_POSITION.x,
  CAMERA_POSITION.y,
  CAMERA_POSITION.z - 3
);

export const OBJECT_LINK_POSITION = new THREE.Vector3(
  CAMERA_POSITION.x,
  CAMERA_POSITION.y + 0.5,
  CAMERA_POSITION.z - 1
);
export const OBJECT_LINK_POSITION_MOBILE = new THREE.Vector3(
  CAMERA_POSITION.x,
  CAMERA_POSITION.y + 0.1,
  CAMERA_POSITION.z - 1.75
);
