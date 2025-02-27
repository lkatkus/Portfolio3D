import * as THREE from "three";

export class Camera {
  camera: THREE.PerspectiveCamera;

  constructor(
    fov: number,
    aspectRatio: number,
    position: THREE.Vector3,
    target: THREE.Vector3
  ) {
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio);

    camera.position.copy(position);
    camera.lookAt(target);

    this.camera = camera;
  }

  update(aspectRatio: number) {
    const { camera } = this;

    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
  }
}
